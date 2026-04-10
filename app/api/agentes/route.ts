import { NextResponse } from 'next/server';
import { callClaudeStream } from '@/lib/anthropic';
import { AgenticFlowInput, AgenticFlowResult } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const body: AgenticFlowInput = await request.json();
    const { useCase, tools, complexity } = body;

    const complexityDesc = {
      simple: '1 agente especializado con herramientas específicas',
      medium: '2-3 agentes coordinados con roles distintos',
      complex: 'sistema multi-agente orquestado con coordinador central',
    }[complexity];

    const prompt = `Diseña la arquitectura completa de un sistema agéntico para el siguiente caso de uso en Banco BCI Chile:

CASO DE USO: ${useCase}

HERRAMIENTAS DISPONIBLES: ${tools.join(', ')}
NIVEL DE COMPLEJIDAD: ${complexityDesc}

Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta (sin markdown, sin texto adicional):
{
  "systemName": "Nombre descriptivo del sistema agéntico",
  "problemDescription": "Descripción clara del problema que resuelve",
  "solutionDescription": "Descripción de cómo el sistema agéntico lo resuelve",
  "components": [
    {
      "name": "Nombre del agente",
      "role": "Rol específico que cumple este agente",
      "inputs": ["Input 1", "Input 2"],
      "outputs": ["Output 1", "Output 2"],
      "tools": ["Herramienta 1", "Herramienta 2"]
    }
  ],
  "dataFlow": [
    "Paso 1: descripción del flujo de datos",
    "Paso 2: ...",
    "Paso 3: ..."
  ],
  "humanInTheLoop": [
    {
      "step": "Nombre del paso",
      "reason": "Por qué se requiere intervención humana",
      "action": "Qué debe hacer el humano"
    }
  ],
  "guardrails": [
    {
      "rule": "Nombre de la regla",
      "description": "Descripción del guardrail y cómo se implementa"
    }
  ],
  "metrics": [
    {
      "kpi": "Nombre del KPI",
      "target": "Valor objetivo",
      "measurement": "Cómo se mide"
    }
  ],
  "mermaidDiagram": "flowchart TD\\n    A[Start] --> B[Agent]\\n    ...",
  "techStack": [
    "Next.js para el frontend",
    "Claude API para el procesamiento de lenguaje",
    "..."
  ],
  "implementationSize": "M",
  "implementationJustification": "Justificación del tamaño de implementación estimado"
}

REGLAS PARA EL DIAGRAMA MERMAID:
- Usar flowchart TD o LR
- Incluir todos los agentes, herramientas y puntos de intervención humana
- Usar subgraph para agrupar componentes relacionados
- Los nodos de Human-in-the-Loop deben tener estilo especial: style NodeId fill:#FF6B35,color:#fff
- Los nodos de agentes deben tener estilo: style NodeId fill:#0033A0,color:#fff
- El diagrama debe ser completo y reflejar el flujo real del sistema
- Usar IDs simples sin caracteres especiales (letras, números, guiones)
- Escapar correctamente los saltos de línea con \\n

REGLAS DE NEGOCIO:
- El sistema debe cumplir con regulaciones CMF y SBIF
- Incluir al menos 1 punto de Human-in-the-Loop para decisiones críticas
- Los guardrails deben incluir límites de autonomía, fallbacks y reglas de escalación
- implementationSize debe ser uno de: "S", "M", "L", "XL"
- El tech stack debe ser específico y justificado para el contexto bancario chileno`;

    // Stream response from Claude
    const stream = await callClaudeStream(prompt, { maxTokens: 5000 });

    // Collect full response and parse it
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              fullText += parsed.delta.text;
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }
    }

    // Parse Claude's JSON response
    let result: AgenticFlowResult;
    try {
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      result = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse Claude response:', e, fullText.slice(0, 500));
      // Return a meaningful fallback
      result = {
        systemName: `Agente: ${useCase.slice(0, 50)}`,
        problemDescription: useCase,
        solutionDescription: 'Sistema agéntico diseñado para automatizar el proceso descrito.',
        components: [
          {
            name: 'Agente Orquestador',
            role: 'Coordina el flujo de información y toma de decisiones',
            inputs: ['Solicitud del usuario', 'Contexto del sistema'],
            outputs: ['Respuesta procesada', 'Acciones ejecutadas'],
            tools: tools.slice(0, 3),
          },
        ],
        dataFlow: ['1. El usuario envía una solicitud', '2. El agente procesa y ejecuta acciones', '3. Se valida el resultado', '4. Se entrega respuesta'],
        humanInTheLoop: [{ step: 'Validación final', reason: 'Decisiones con impacto financiero requieren aprobación humana', action: 'El supervisor revisa y aprueba o rechaza la acción propuesta' }],
        guardrails: [{ rule: 'Límite de transacciones', description: 'El agente no puede ejecutar transacciones sobre UF 100 sin aprobación humana' }],
        metrics: [{ kpi: 'Tasa de resolución automática', target: '>70%', measurement: 'Casos resueltos sin intervención / Total de casos' }],
        mermaidDiagram: `flowchart TD\n    A[Usuario] --> B[Agente Orquestador]\n    B --> C{Requiere aprobación?}\n    C -->|Sí| D[Human in the Loop]\n    C -->|No| E[Ejecutar acción]\n    D --> E\n    E --> F[Respuesta al usuario]\n    style B fill:#0033A0,color:#fff\n    style D fill:#FF6B35,color:#fff`,
        techStack: ['Next.js 14 + App Router para el frontend', 'Claude API (claude-sonnet-4-20250514) para procesamiento', 'MCP servers para integración con herramientas'],
        implementationSize: 'M',
        implementationJustification: 'Complejidad media, requiere integración con sistemas bancarios existentes.',
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Agentes API error:', error);
    return NextResponse.json(
      { error: 'Error al diseñar flujo agéntico', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
