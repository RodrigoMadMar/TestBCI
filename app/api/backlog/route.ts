import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { BacklogResult, BacklogItem, ReviewsAnalysisResult, TrendsAnalysisResult } from '@/lib/types';
import {
  saveAnalysis,
  getLatestAnalysis,
  isSupabaseConfigured,
  extractReviewsContext,
  extractTrendsContext,
} from '@/lib/supabase';

export const maxDuration = 60;

interface BacklogRequest {
  brief?: string;
}

function calculateRiceScore(reach: number, impact: number, confidence: number, effort: number): number {
  return Math.round((reach * impact * confidence) / effort);
}

// GET — devuelve el último backlog guardado
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ data: null, savedAt: null });
  }
  try {
    const record = await getLatestAnalysis<BacklogResult>('backlog');
    if (!record) return NextResponse.json({ data: null, savedAt: null });
    return NextResponse.json({ data: record.data, savedAt: record.created_at });
  } catch (e) {
    console.error('Backlog GET error:', e);
    return NextResponse.json({ data: null, savedAt: null });
  }
}

// POST — genera backlog con contexto del último escaneo de reviews y trends
export async function POST(request: Request) {
  try {
    const body: BacklogRequest = await request.json();
    const { brief } = body;

    // ── Cargar último análisis de reviews y trends desde Supabase ──────────
    let reviewsContext = '';
    let trendsContext = '';
    let reviewsSavedAt: string | null = null;
    let trendsSavedAt: string | null = null;

    if (isSupabaseConfigured()) {
      const [reviewsRecord, trendsRecord] = await Promise.all([
        getLatestAnalysis<ReviewsAnalysisResult>('reviews'),
        getLatestAnalysis<TrendsAnalysisResult>('trends'),
      ]);

      if (reviewsRecord) {
        reviewsContext = extractReviewsContext(reviewsRecord.data);
        reviewsSavedAt = reviewsRecord.created_at;
      }
      if (trendsRecord) {
        trendsContext = extractTrendsContext(trendsRecord.data);
        trendsSavedAt = trendsRecord.created_at;
      }
    }

    // ── Construir el contexto completo para Claude ──────────────────────────
    const sections: string[] = [];

    if (brief?.trim()) {
      sections.push(`BRIEF DEL PRODUCT OWNER:\n${brief.trim()}`);
    }

    if (reviewsContext) {
      sections.push(reviewsContext);
    }

    if (trendsContext) {
      sections.push(trendsContext);
    }

    const contextSection =
      sections.length > 0
        ? sections.join('\n\n')
        : 'Genera un backlog basado en el contexto general del ecosistema digital BCI.';

    const prompt = `Genera un backlog de producto priorizado para la App BCI Personas basado en el siguiente contexto real:

${contextSection}

INSTRUCCIÓN CLAVE: Las user stories DEBEN derivarse directamente de los datos de reviews y tendencias provistos arriba (problemas reales de usuarios, oportunidades de mercado detectadas, insights comparativos). No generes stories genéricas — cada una debe tener un origen claro en el contexto.

Crea exactamente 9 user stories (3 Now, 3 Next, 3 Later) con metodología RICE.

Devuelve ÚNICAMENTE un JSON válido con esta estructura (sin markdown):
{
  "items": [
    {
      "id": "story-1",
      "title": "Título corto y descriptivo",
      "userStory": "Como [tipo de usuario], quiero [acción específica], para [beneficio concreto]",
      "category": "UX",
      "acceptanceCriteria": [
        {"id": "ac-1-1", "description": "Criterio medible y específico 1"},
        {"id": "ac-1-2", "description": "Criterio medible y específico 2"},
        {"id": "ac-1-3", "description": "Criterio medible y específico 3"}
      ],
      "rice": {
        "reach": 8,
        "impact": 9,
        "confidence": 80,
        "effort": 3,
        "score": 240
      },
      "sprint": "Now"
    }
  ]
}

REGLAS:
- category: exactamente "UX", "Funcionalidad", "Estabilidad", "Growth" o "Compliance"
- sprint: exactamente "Now", "Next" o "Later"
- rice.reach: 1-10 | rice.impact: 1-10 | rice.confidence: 0-100 | rice.effort: 1-10
- rice.score = (reach × impact × confidence) / effort
- Now: mayor prioridad (score alto + impacto urgente en estabilidad o retención)
- Next: prioridad media (impacto alto pero mayor esfuerzo o menor urgencia)
- Later: estratégico (growth, compliance, features diferenciadores)
- Mínimo 1 story de Compliance (Open Finance/CMF) y 2 de UX basadas en problemas reales
- Los criterios de aceptación deben ser medibles (ej: tiempo, %, número)`;

    const claudeResponse = await callClaude(prompt, { maxTokens: 4000 });

    let parsed: { items: BacklogItem[] };
    try {
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      parsed = JSON.parse(jsonMatch[0]);

      parsed.items = parsed.items.map((item) => ({
        ...item,
        rice: {
          ...item.rice,
          score: calculateRiceScore(
            item.rice.reach,
            item.rice.impact,
            item.rice.confidence,
            item.rice.effort
          ),
        },
      }));
    } catch (e) {
      console.error('Backlog JSON parse failed:', e);
      parsed = {
        items: [
          {
            id: 'story-fallback-1',
            title: 'Corregir botones no responsivos post-actualización',
            userStory:
              'Como cliente de BCI, quiero que los botones de la app funcionen correctamente después de actualizar, para poder realizar mis operaciones bancarias sin interrupciones.',
            category: 'Estabilidad',
            acceptanceCriteria: [
              { id: 'ac-f-1', description: 'Todos los botones responden al primer toque en <200ms' },
              { id: 'ac-f-2', description: 'La app no se congela durante 60 segundos de uso continuo' },
              { id: 'ac-f-3', description: 'Crash rate menor al 0.5% en Google Play Console' },
            ],
            rice: { reach: 9, impact: 10, confidence: 95, effort: 4, score: 214 },
            sprint: 'Now',
          },
        ],
      };
    }

    const result: BacklogResult = {
      items: parsed.items,
      generatedAt: new Date().toISOString(),
    };

    // Guardar en Supabase
    if (isSupabaseConfigured()) {
      saveAnalysis('backlog', result).catch((e) =>
        console.warn('Supabase save failed (backlog):', e)
      );
    }

    return NextResponse.json({
      ...result,
      sources: {
        reviewsSavedAt,
        trendsSavedAt,
        hasBrief: !!brief?.trim(),
      },
    });
  } catch (error) {
    console.error('Backlog API error:', error);
    return NextResponse.json(
      { error: 'Error al generar backlog', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
