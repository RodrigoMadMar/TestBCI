'use client';

import { useState } from 'react';
import {
  Bot,
  AlertCircle,
  Sparkles,
  Users,
  Shield,
  BarChart2,
  Code2,
  ChevronDown,
  ChevronUp,
  Workflow,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { AgenticFlowResult, AgenticFlowInput, ComplexityLevel } from '@/lib/types';
import { ExportMarkdownButton } from '@/components/ExportButton';

const MermaidDiagram = dynamic(() => import('@/components/MermaidDiagram'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-32 text-gray-500 text-sm animate-pulse">
      Cargando renderizador de diagramas...
    </div>
  ),
});

const AVAILABLE_TOOLS = [
  'Jira',
  'Figma',
  'Notion',
  'Slack',
  'RRSS (Twitter/Instagram)',
  'CRM (Salesforce/HubSpot)',
  'Email',
  'WhatsApp',
  'Google Sheets',
  'Base de datos SQL',
  'API interna del banco',
  'Zapier/Make',
  'Confluence',
  'GitHub',
];

const COMPLEXITY_OPTIONS: { value: ComplexityLevel; label: string; desc: string }[] = [
  { value: 'simple', label: 'Simple', desc: '1 agente especializado' },
  { value: 'medium', label: 'Medio', desc: '2-3 agentes coordinados' },
  { value: 'complex', label: 'Complejo', desc: 'Multi-agente orquestado' },
];

const SIZE_COLORS: Record<string, string> = {
  S: 'bg-emerald-500/15 text-emerald-300',
  M: 'bg-blue-500/15 text-blue-300',
  L: 'bg-amber-500/15 text-amber-300',
  XL: 'bg-red-500/15 text-red-300',
};

function AgentCard({
  component,
}: {
  component: AgenticFlowResult['components'][0];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#12121A] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0033A0]/20 border border-[#0033A0]/30 flex items-center justify-center flex-shrink-0">
            <Bot size={14} className="text-[#4D8EFF]" />
          </div>
          <div className="text-left">
            <div className="text-white text-sm font-medium">{component.name}</div>
            <div className="text-gray-500 text-xs">{component.role}</div>
          </div>
        </div>
        {open ? (
          <ChevronUp size={14} className="text-gray-500" />
        ) : (
          <ChevronDown size={14} className="text-gray-500" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-[#1E1E2E] pt-3 grid grid-cols-3 gap-4 animate-fade-in">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Inputs</p>
            <ul className="space-y-1">
              {component.inputs.map((inp, i) => (
                <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                  <span className="text-blue-400">→</span> {inp}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Outputs</p>
            <ul className="space-y-1">
              {component.outputs.map((out, i) => (
                <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                  <span className="text-emerald-400">←</span> {out}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Herramientas</p>
            <div className="flex flex-wrap gap-1">
              {component.tools.map((tool, i) => (
                <span key={i} className="text-xs px-1.5 py-0.5 bg-[#1E1E2E] text-gray-400 rounded">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildMarkdown(result: AgenticFlowResult): string {
  return `# ${result.systemName}

## Descripción del Problema
${result.problemDescription}

## Solución Agéntica
${result.solutionDescription}

## Componentes del Sistema

${result.components
  .map(
    (c) => `### ${c.name}
**Rol:** ${c.role}

**Inputs:** ${c.inputs.join(', ')}

**Outputs:** ${c.outputs.join(', ')}

**Herramientas:** ${c.tools.join(', ')}
`
  )
  .join('\n')}

## Flujo de Datos

${result.dataFlow.map((step, i) => `${i + 1}. ${step}`).join('\n')}

## Human-in-the-Loop

${result.humanInTheLoop
  .map(
    (h) => `### ${h.step}
- **Razón:** ${h.reason}
- **Acción:** ${h.action}
`
  )
  .join('\n')}

## Guardrails

${result.guardrails.map((g) => `- **${g.rule}:** ${g.description}`).join('\n')}

## Métricas de Éxito

| KPI | Objetivo | Medición |
|-----|----------|----------|
${result.metrics.map((m) => `| ${m.kpi} | ${m.target} | ${m.measurement} |`).join('\n')}

## Diagrama Mermaid

\`\`\`mermaid
${result.mermaidDiagram}
\`\`\`

## Stack Tecnológico

${result.techStack.map((t) => `- ${t}`).join('\n')}

## Estimación de Implementación

**Tamaño:** ${result.implementationSize}

${result.implementationJustification}

---
*Generado por Copiloto BCI — Inteligencia de Producto*
`;
}

export default function AgentesPage() {
  const [result, setResult] = useState<AgenticFlowResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCase, setUseCase] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>(['Jira', 'Slack', 'API interna del banco']);
  const [complexity, setComplexity] = useState<ComplexityLevel>('medium');

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleSubmit = async () => {
    if (!useCase.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const body: AgenticFlowInput = { useCase, tools: selectedTools, complexity };
      const res = await fetch('/api/agentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-6">
        {/* Left panel — Form */}
        <div className="w-80 flex-shrink-0 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-white">Flujos Agénticos</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Diseña la arquitectura de un sistema agéntico con Claude
            </p>
          </div>

          {/* Use case textarea */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block">Caso de Uso</label>
            <textarea
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="Ej: Un agente que clasifique reclamos de clientes y pre-redacte respuestas personalizadas basadas en el historial..."
              className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-[#0033A0] transition-colors"
              rows={5}
            />
          </div>

          {/* Tools */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block">
              Herramientas disponibles ({selectedTools.length} seleccionadas)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TOOLS.map((tool) => (
                <button
                  key={tool}
                  onClick={() => toggleTool(tool)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    selectedTools.includes(tool)
                      ? 'bg-[#0033A0]/20 border-[#0033A0]/50 text-[#4D8EFF]'
                      : 'bg-[#12121A] border-[#1E1E2E] text-gray-500 hover:text-gray-300 hover:border-[#2A2A3E]'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-2 block">Complejidad</label>
            <div className="space-y-2">
              {COMPLEXITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setComplexity(opt.value)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all ${
                    complexity === opt.value
                      ? 'bg-[#0033A0]/15 border-[#0033A0]/40 text-white'
                      : 'bg-[#12121A] border-[#1E1E2E] text-gray-400 hover:border-[#2A2A3E]'
                  }`}
                >
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-xs text-gray-500">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !useCase.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all"
          >
            <Sparkles size={14} />
            {loading ? 'Diseñando flujo...' : 'Diseñar Flujo Agéntico'}
          </button>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right panel — Result */}
        <div className="flex-1 min-w-0">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/20 flex items-center justify-center">
                <Bot size={28} className="text-[#7C3AED] animate-pulse" />
              </div>
              <p className="text-gray-400 text-sm">Claude está diseñando el flujo agéntico...</p>
              <p className="text-gray-600 text-xs">Esto puede tomar 15-30 segundos</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5 animate-fade-in">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Workflow size={16} className="text-[#7C3AED]" />
                    <span className="text-[#7C3AED] text-xs font-medium">Sistema Agéntico</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold ${SIZE_COLORS[result.implementationSize]}`}
                    >
                      {result.implementationSize}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{result.systemName}</h2>
                  <p className="text-gray-400 text-sm mt-1">{result.solutionDescription}</p>
                </div>
                <ExportMarkdownButton
                  content={buildMarkdown(result)}
                  filename={result.systemName.toLowerCase().replace(/\s+/g, '-')}
                />
              </div>

              {/* Mermaid Diagram */}
              <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                  <Workflow size={14} className="text-[#7C3AED]" />
                  Diagrama del Flujo
                </h3>
                <div className="overflow-auto max-h-[500px]">
                  <MermaidDiagram chart={result.mermaidDiagram} />
                </div>
              </div>

              {/* Agents */}
              <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <Bot size={14} className="text-[#4D8EFF]" />
                  Componentes del Sistema ({result.components.length} agentes)
                </h3>
                <div className="space-y-2">
                  {result.components.map((comp, i) => (
                    <AgentCard key={i} component={comp} />
                  ))}
                </div>
              </div>

              {/* Data Flow */}
              <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-3">Flujo de Datos</h3>
                <ol className="space-y-2">
                  {result.dataFlow.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-300">
                      <span className="text-[#4D8EFF] font-bold flex-shrink-0 w-5 text-right">
                        {i + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* HITL + Guardrails + Metrics */}
              <div className="grid grid-cols-2 gap-4">
                {/* Human in the Loop */}
                <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Users size={14} className="text-orange-400" />
                    Human-in-the-Loop
                  </h3>
                  <div className="space-y-3">
                    {result.humanInTheLoop.map((h, i) => (
                      <div key={i} className="border-l-2 border-orange-500/40 pl-3">
                        <p className="text-orange-300 text-xs font-medium">{h.step}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{h.reason}</p>
                        <p className="text-gray-500 text-xs mt-0.5 italic">{h.action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guardrails */}
                <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
                  <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                    <Shield size={14} className="text-emerald-400" />
                    Guardrails
                  </h3>
                  <div className="space-y-3">
                    {result.guardrails.map((g, i) => (
                      <div key={i} className="border-l-2 border-emerald-500/40 pl-3">
                        <p className="text-emerald-300 text-xs font-medium">{g.rule}</p>
                        <p className="text-gray-400 text-xs mt-0.5">{g.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <BarChart2 size={14} className="text-blue-400" />
                  Métricas de Éxito
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1E1E2E]">
                        {['KPI', 'Objetivo', 'Medición'].map((h) => (
                          <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase py-2 pr-4">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.metrics.map((m, i) => (
                        <tr key={i} className="border-b border-[#1E1E2E]/50">
                          <td className="py-2.5 pr-4 text-white font-medium">{m.kpi}</td>
                          <td className="py-2.5 pr-4 text-[#4D8EFF] font-bold">{m.target}</td>
                          <td className="py-2.5 text-gray-400 text-xs">{m.measurement}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tech Stack + Size */}
              <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <Code2 size={14} className="text-purple-400" />
                  Stack Tecnológico Sugerido
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {result.techStack.map((t, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 bg-[#0A0A0F] border border-[#1E1E2E] text-gray-300 rounded-lg"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-[#1E1E2E]">
                  <span className="text-gray-500 text-xs">Estimación:</span>
                  <span
                    className={`text-sm font-bold px-3 py-1 rounded-full ${SIZE_COLORS[result.implementationSize]}`}
                  >
                    {result.implementationSize}
                  </span>
                  <span className="text-gray-400 text-xs">{result.implementationJustification}</span>
                </div>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="flex flex-col items-center justify-center py-24 text-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-[#7C3AED]/20 flex items-center justify-center mb-4">
                <Bot size={28} className="text-[#7C3AED]" />
              </div>
              <h3 className="text-white font-medium mb-2">Diseña tu flujo agéntico</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Describe el caso de uso, selecciona herramientas y complejidad. Claude generará la arquitectura completa con diagrama Mermaid.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
