import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { fetchReviewsFromApify, FALLBACK_REVIEWS } from '@/lib/apify';
import { Review, AppAnalysis, ReviewsAnalysisResult, HealthStatus, AppId } from '@/lib/types';
import { saveAnalysis, getLatestAnalysis, isSupabaseConfigured } from '@/lib/supabase';

export const maxDuration = 60;

const CATEGORIES = [
  'Estabilidad/Crashes',
  'UX/Navegación',
  'Funcionalidad Faltante',
  'Atención al Cliente',
  'Seguridad/Auth',
  'Rendimiento',
  'Cobros/Transparencia',
];

const APP_CONFIGS: Record<AppId, { name: string; packageId: string }> = {
  bci: { name: 'App BCI Personas', packageId: 'cl.bci.app.personas' },
  tenpo: { name: 'Tenpo', packageId: 'cl.tenpo.app' },
  itau: { name: 'Itaú Chile', packageId: 'cl.itau.app' },
};

function determineHealthStatus(rating: number, criticalCount: number): HealthStatus {
  if (rating > 4.2 && criticalCount < 3) return 'healthy';
  if (rating >= 3.5) return 'at_risk';
  return 'critical';
}

// GET — devuelve el último análisis guardado en Supabase
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: null, savedAt: null });
  }
  try {
    const record = await getLatestAnalysis<ReviewsAnalysisResult>('reviews');
    if (!record) return NextResponse.json({ data: null, savedAt: null });
    return NextResponse.json({ data: record.data, savedAt: record.created_at });
  } catch (e) {
    console.error('Reviews GET error:', e);
    return NextResponse.json({ data: null, savedAt: null });
  }
}

// POST — ejecuta análisis con Apify + Claude y guarda en Supabase
export async function POST() {
  try {
    let reviews: Review[] = [];
    let usingFallback = false;

    try {
      reviews = await fetchReviewsFromApify();
      if (reviews.length < 10) throw new Error('Insufficient reviews');
    } catch (e) {
      console.warn('Apify fetch failed, using fallback:', e);
      reviews = FALLBACK_REVIEWS;
      usingFallback = true;
    }

    const reviewsByApp: Record<AppId, Review[]> = { bci: [], tenpo: [], itau: [] };
    for (const review of reviews) {
      if (review.app in reviewsByApp) reviewsByApp[review.app].push(review);
    }

    const reviewsText = Object.entries(reviewsByApp)
      .map(([appId, appReviews]) => {
        const cfg = APP_CONFIGS[appId as AppId];
        const avgRating =
          appReviews.length > 0
            ? appReviews.reduce((sum, r) => sum + r.rating, 0) / appReviews.length
            : 3.5;
        return `\n### ${cfg.name} (${cfg.packageId}) - Rating promedio: ${avgRating.toFixed(1)}\n${appReviews
          .slice(0, 20)
          .map((r) => `[${r.rating}★] ${r.text}`)
          .join('\n')}`;
      })
      .join('\n\n');

    const prompt = `Analiza las siguientes reviews de apps bancarias chilenas y devuelve un JSON estructurado con el análisis.

REVIEWS A ANALIZAR:
${reviewsText}

CATEGORÍAS DE CLASIFICACIÓN:
${CATEGORIES.join(', ')}

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta (sin markdown, sin texto adicional):
{
  "apps": [
    {
      "appId": "bci",
      "appName": "App BCI Personas",
      "packageId": "cl.bci.app.personas",
      "rating": 3.5,
      "reviewCount": 15,
      "healthStatus": "at_risk",
      "categories": [
        {"category": "Estabilidad/Crashes", "count": 5},
        {"category": "UX/Navegación", "count": 3},
        {"category": "Funcionalidad Faltante", "count": 2},
        {"category": "Atención al Cliente", "count": 2},
        {"category": "Seguridad/Auth", "count": 1},
        {"category": "Rendimiento", "count": 3},
        {"category": "Cobros/Transparencia", "count": 1}
      ],
      "insights": ["Insight accionable 1", "Insight accionable 2"]
    },
    {
      "appId": "tenpo", "appName": "Tenpo", "packageId": "cl.tenpo.app",
      "rating": 4.1, "reviewCount": 15, "healthStatus": "at_risk",
      "categories": [...], "insights": [...]
    },
    {
      "appId": "itau", "appName": "Itaú Chile", "packageId": "cl.itau.app",
      "rating": 3.0, "reviewCount": 15, "healthStatus": "critical",
      "categories": [...], "insights": [...]
    }
  ],
  "comparativeInsights": [
    "Insight comparativo 1", "Insight comparativo 2",
    "Oportunidad concreta para BCI 1", "Oportunidad concreta para BCI 2"
  ]
}

REGLAS:
- healthStatus: "healthy" (rating > 4.2), "at_risk" (3.5-4.2), "critical" (< 3.5)
- Insights específicos y accionables para el Product Owner de BCI
- Conteo de categorías refleja los problemas reales de las reviews
- Insights comparativos identifican oportunidades para BCI`;

    const claudeResponse = await callClaude(prompt, { maxTokens: 3000 });

    let parsed: { apps: AppAnalysis[]; comparativeInsights: string[] };
    try {
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      const apps: AppAnalysis[] = (Object.keys(reviewsByApp) as AppId[]).map((appId) => {
        const cfg = APP_CONFIGS[appId];
        const appReviews = reviewsByApp[appId];
        const avgRating =
          appReviews.length > 0
            ? appReviews.reduce((sum, r) => sum + r.rating, 0) / appReviews.length
            : 3.5;
        return {
          appId,
          appName: cfg.name,
          packageId: cfg.packageId,
          rating: parseFloat(avgRating.toFixed(1)),
          reviewCount: appReviews.length,
          healthStatus: determineHealthStatus(avgRating, 3),
          categories: CATEGORIES.map((cat) => ({ category: cat, count: 0 })),
          insights: ['Análisis temporalmente no disponible. Intente nuevamente.'],
        };
      });
      parsed = { apps, comparativeInsights: ['Insights no disponibles. Intente nuevamente.'] };
    }

    const result: ReviewsAnalysisResult = {
      ...parsed,
      updatedAt: new Date().toISOString(),
    };

    // Guardar en Supabase (sin bloquear la respuesta si falla)
    if (isSupabaseConfigured()) {
      saveAnalysis('reviews', result).catch((e) =>
        console.warn('Supabase save failed (reviews):', e)
      );
    }

    return NextResponse.json({ ...result, usingFallback });
  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json(
      { error: 'Error al procesar las reviews', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
