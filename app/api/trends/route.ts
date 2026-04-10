import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { FALLBACK_TREND_DATA, FALLBACK_SHARE_OF_SEARCH, FALLBACK_NEWS } from '@/lib/trends';
import { TrendsAnalysisResult } from '@/lib/types';

export async function POST() {
  try {
    // Use Claude to get current trends analysis (web_search mode)
    // For Vercel compatibility we skip Playwright and use Claude's knowledge + web search
    const trendsPrompt = `Analiza las tendencias actuales de banca digital en Chile para el período reciente (últimos 30 días aproximadamente).

Considera específicamente:
1. Tendencias de búsqueda de: Banco BCI, Banco de Chile, Santander Chile, Tenpo, MACH
2. Noticias recientes del ecosistema fintech chileno (de chocale.cl, df.cl, emol economía)
3. Lanzamientos de productos, cambios regulatorios, movimientos competitivos
4. Estimación de Share of Search entre las principales marcas bancarias

Devuelve ÚNICAMENTE un JSON válido con esta estructura (sin markdown):
{
  "trendData": [
    {"date": "2025-03-10", "bci": 72, "bancoDeChile": 85, "santander": 60, "tenpo": 48, "mach": 32},
    {"date": "2025-03-17", "bci": 68, "bancoDeChile": 80, "santander": 58, "tenpo": 52, "mach": 30},
    {"date": "2025-03-24", "bci": 75, "bancoDeChile": 82, "santander": 62, "tenpo": 55, "mach": 35},
    {"date": "2025-03-31", "bci": 80, "bancoDeChile": 88, "santander": 65, "tenpo": 58, "mach": 38},
    {"date": "2025-04-07", "bci": 78, "bancoDeChile": 86, "santander": 63, "tenpo": 60, "mach": 40}
  ],
  "shareOfSearch": [
    {"brand": "Banco de Chile", "share": 31, "trend": "stable"},
    {"brand": "BCI", "share": 26, "trend": "up"},
    {"brand": "Santander", "share": 21, "trend": "down"},
    {"brand": "Tenpo", "share": 14, "trend": "up"},
    {"brand": "MACH", "share": 8, "trend": "stable"}
  ],
  "news": [
    {
      "title": "Título noticia 1",
      "source": "Fuente",
      "date": "2025-04-05",
      "summary": "Resumen de la noticia relevante para banca digital Chile"
    }
  ],
  "opportunities": [
    {
      "title": "Oportunidad de producto 1",
      "description": "Descripción detallada de la oportunidad",
      "priority": "Alta",
      "source": "Tendencia/Noticia que la origina"
    }
  ],
  "summary": "Resumen ejecutivo de 2-3 párrafos sobre el estado del ecosistema digital bancario chileno"
}

IMPORTANTE: Los datos de trendData deben usar valores del 0-100 (como Google Trends). Incluye al menos 3 noticias relevantes y 3 oportunidades de producto. Las oportunidades deben estar directamente relacionadas con los insights de tendencias y noticias.`;

    let claudeResult: Partial<TrendsAnalysisResult> = {};

    try {
      const claudeResponse = await callClaude(trendsPrompt, { maxTokens: 3000 });
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        claudeResult = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.warn('Claude trends analysis failed:', e);
    }

    const result: TrendsAnalysisResult = {
      trendData: claudeResult.trendData || FALLBACK_TREND_DATA,
      shareOfSearch: claudeResult.shareOfSearch || FALLBACK_SHARE_OF_SEARCH,
      news: claudeResult.news || FALLBACK_NEWS,
      opportunities: claudeResult.opportunities || [
        {
          title: 'Pagos QR omnipresentes en comercios',
          description: 'Tenpo y MACH lideran pagos QR. BCI debe acelerar adopción de QR en su app para no perder market share en pagos cotidianos.',
          priority: 'Alta',
          source: 'Tendencia de mercado',
        },
        {
          title: 'Open Finance: API de datos de clientes',
          description: 'La nueva normativa CMF obliga a exponer APIs. BCI puede usar esto para ofrecer una vista financiera unificada y atraer clientes de otros bancos.',
          priority: 'Alta',
          source: 'Regulación CMF',
        },
        {
          title: 'Onboarding 100% digital sin sucursal',
          description: 'Tenpo demuestra que el onboarding en <5 min es posible. BCI Pyme y Personas deben eliminar pasos presenciales para adquirir nuevos segmentos.',
          priority: 'Media',
          source: 'Ventaja competitiva Tenpo',
        },
      ],
      summary: claudeResult.summary || 'El ecosistema bancario digital chileno está en plena transformación. Tenpo y MACH presionan con propuestas 100% digitales, mientras los bancos tradicionales luchan por mantener su base. BCI tiene una oportunidad única al combinar su escala con innovación digital.',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json(
      { error: 'Error al procesar tendencias', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to trigger analysis' });
}
