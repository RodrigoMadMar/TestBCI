import { NextResponse } from 'next/server';
import { callClaude } from '@/lib/anthropic';
import { BacklogResult, BacklogItem } from '@/lib/types';

interface BacklogRequest {
  brief?: string;
  reviewInsights?: string[];
  trendsInsights?: string[];
}

function calculateRiceScore(reach: number, impact: number, confidence: number, effort: number): number {
  return Math.round((reach * impact * confidence) / effort);
}

export async function POST(request: Request) {
  try {
    const body: BacklogRequest = await request.json();
    const { brief, reviewInsights = [], trendsInsights = [] } = body;

    const contextSection = [
      brief ? `BRIEF DEL PRODUCTO:\n${brief}` : '',
      reviewInsights.length > 0 ? `INSIGHTS DE REVIEWS:\n${reviewInsights.join('\n')}` : '',
      trendsInsights.length > 0 ? `INSIGHTS DE TENDENCIAS:\n${trendsInsights.join('\n')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const prompt = `Genera un backlog de producto priorizado para la App BCI Personas basado en el siguiente contexto:

${contextSection || 'Genera un backlog basado en el contexto general del ecosistema digital BCI.'}

Crea exactamente 9 user stories (3 por columna: Now, Next, Later) con la metodología RICE.

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta (sin markdown):
{
  "items": [
    {
      "id": "story-1",
      "title": "Título corto y descriptivo",
      "userStory": "Como [tipo de usuario], quiero [acción específica], para [beneficio concreto]",
      "category": "UX",
      "acceptanceCriteria": [
        {"id": "ac-1-1", "description": "Criterio de aceptación 1"},
        {"id": "ac-1-2", "description": "Criterio de aceptación 2"},
        {"id": "ac-1-3", "description": "Criterio de aceptación 3"}
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

REGLAS IMPORTANTES:
- category debe ser exactamente uno de: "UX", "Funcionalidad", "Estabilidad", "Growth", "Compliance"
- sprint debe ser exactamente: "Now", "Next", o "Later"
- rice.reach: 1-10 (cuántos usuarios impacta)
- rice.impact: 1-10 (cuánto impacta en el objetivo)
- rice.confidence: porcentaje 0-100
- rice.effort: 1-10 (esfuerzo relativo, más alto = más esfuerzo)
- rice.score = (reach * impact * confidence) / effort (calculado correctamente)
- Now: 3 stories de mayor prioridad (score más alto, impacto urgente)
- Next: 3 stories de prioridad media
- Later: 3 stories de menor urgencia pero importante estratégicamente
- Las user stories deben ser específicas para BCI y el contexto bancario chileno
- Incluir al menos 1 story de Compliance (regulación CMF/Fintech)
- Incluir al menos 2 stories de UX basadas en problemas reales
- Los criterios de aceptación deben ser medibles y específicos`;

    const claudeResponse = await callClaude(prompt, { maxTokens: 4000 });

    let parsed: { items: BacklogItem[] };
    try {
      const jsonMatch = claudeResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      parsed = JSON.parse(jsonMatch[0]);

      // Recalculate scores to ensure they're correct
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
      console.error('JSON parse failed:', e);
      // Provide a minimal fallback
      parsed = {
        items: [
          {
            id: 'story-fallback-1',
            title: 'Corregir botones no responsivos post-actualización',
            userStory: 'Como cliente de BCI, quiero que los botones de la app funcionen correctamente después de actualizar, para poder realizar mis operaciones bancarias sin interrupciones.',
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Backlog API error:', error);
    return NextResponse.json(
      { error: 'Error al generar backlog', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
