'use client';

import { useState } from 'react';
import { Sparkles, AlertCircle, LayoutGrid, Table2, Lightbulb } from 'lucide-react';
import { BacklogResult, BacklogItem, BacklogCategory, RiceLabel } from '@/lib/types';
import KanbanBoard from '@/components/KanbanBoard';
import { ExportCSVButton } from '@/components/ExportButton';
import { CardSkeleton } from '@/components/LoadingSkeleton';

const CATEGORY_COLORS: Record<BacklogCategory, string> = {
  UX: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  Funcionalidad: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  Estabilidad: 'bg-red-500/15 text-red-300 border-red-500/20',
  Growth: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Compliance: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
};

const SPRINT_COLORS: Record<RiceLabel, string> = {
  Now: 'text-emerald-400',
  Next: 'text-blue-400',
  Later: 'text-gray-400',
};

function TableView({ items }: { items: BacklogItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1E1E2E]">
            {['Sprint', 'Título', 'Categoría', 'Reach', 'Impact', 'Conf%', 'Effort', 'Score', 'User Story'].map(
              (col) => (
                <th
                  key={col}
                  className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-3"
                >
                  {col}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {items
            .sort((a, b) => b.rice.score - a.rice.score)
            .map((item) => (
              <tr
                key={item.id}
                className="border-b border-[#1E1E2E]/50 hover:bg-[#12121A] transition-colors"
              >
                <td className={`py-3 px-3 font-semibold text-xs ${SPRINT_COLORS[item.sprint]}`}>
                  {item.sprint}
                </td>
                <td className="py-3 px-3 text-white font-medium max-w-[180px]">
                  <span className="line-clamp-2">{item.title}</span>
                </td>
                <td className="py-3 px-3">
                  <span className={`text-xs px-2 py-0.5 rounded border ${CATEGORY_COLORS[item.category]}`}>
                    {item.category}
                  </span>
                </td>
                <td className="py-3 px-3 text-center text-gray-300">{item.rice.reach}</td>
                <td className="py-3 px-3 text-center text-gray-300">{item.rice.impact}</td>
                <td className="py-3 px-3 text-center text-gray-300">{item.rice.confidence}%</td>
                <td className="py-3 px-3 text-center text-gray-300">{item.rice.effort}</td>
                <td className="py-3 px-3 text-center font-bold text-[#4D8EFF]">
                  {item.rice.score}
                </td>
                <td className="py-3 px-3 text-gray-400 text-xs max-w-[300px]">
                  <span className="line-clamp-2">{item.userStory}</span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BacklogPage() {
  const [result, setResult] = useState<BacklogResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState('');
  const [view, setView] = useState<'kanban' | 'table'>('kanban');

  const generateBacklog = async (fromBrief = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: fromBrief ? brief : undefined,
          reviewInsights: [],
          trendsInsights: [],
        }),
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Backlog Priorizado</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            User stories con RICE score — vista Kanban y tabla exportable
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <>
              <div className="flex items-center border border-[#1E1E2E] rounded-lg overflow-hidden">
                <button
                  onClick={() => setView('kanban')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${view === 'kanban' ? 'bg-[#0033A0] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <LayoutGrid size={12} />
                  Kanban
                </button>
                <button
                  onClick={() => setView('table')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${view === 'table' ? 'bg-[#0033A0] text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Table2 size={12} />
                  Tabla
                </button>
              </div>
              <ExportCSVButton items={result.items} />
            </>
          )}
        </div>
      </div>

      {/* Brief Input */}
      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
        <div className="flex items-start gap-2 mb-3">
          <Lightbulb size={16} className="text-amber-400 mt-0.5" />
          <div>
            <h2 className="text-white text-sm font-medium">Brief de Producto (opcional)</h2>
            <p className="text-gray-500 text-xs">
              Describe el foco del backlog o deja vacío para generar desde el contexto BCI general
            </p>
          </div>
        </div>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Ej: Necesito mejorar el onboarding de la app BCI para usuarios jóvenes que migran desde Tenpo..."
          className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-[#0033A0] transition-colors"
          rows={3}
        />
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => generateBacklog(true)}
            disabled={loading || !brief.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#0033A0] hover:bg-[#0044CC] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all"
          >
            <Sparkles size={14} />
            {loading ? 'Generando...' : 'Generar desde Brief'}
          </button>
          <button
            onClick={() => generateBacklog(false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-[#1E1E2E] hover:bg-[#1A1A2E] disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-all"
          >
            <Sparkles size={14} />
            {loading ? 'Generando...' : 'Generar desde Insights BCI'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="space-y-4 animate-fade-in">
          {/* Stats bar */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{result.items.length} user stories generadas</span>
            <span>·</span>
            <span className="text-emerald-400">{result.items.filter((i) => i.sprint === 'Now').length} Now</span>
            <span>·</span>
            <span className="text-blue-400">{result.items.filter((i) => i.sprint === 'Next').length} Next</span>
            <span>·</span>
            <span className="text-gray-400">{result.items.filter((i) => i.sprint === 'Later').length} Later</span>
            <span>·</span>
            <span>Generado: {new Date(result.generatedAt).toLocaleString('es-CL')}</span>
          </div>

          {view === 'kanban' ? (
            <KanbanBoard items={result.items} />
          ) : (
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
              <TableView items={result.items} />
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#059669]/20 flex items-center justify-center mb-4">
            <Sparkles size={28} className="text-[#059669]" />
          </div>
          <h3 className="text-white font-medium mb-2">Genera tu backlog priorizado</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Escribe un brief o haz clic en &quot;Generar desde Insights BCI&quot; para crear user stories con priorización RICE automática.
          </p>
        </div>
      )}
    </div>
  );
}
