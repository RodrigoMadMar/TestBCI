'use client';

import { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertCircle,
  LayoutGrid,
  Table2,
  Lightbulb,
  Database,
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import { BacklogResult, BacklogItem, BacklogCategory, RiceLabel, ReviewsAnalysisResult, TrendsAnalysisResult } from '@/lib/types';
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

interface Sources {
  reviewsSavedAt: string | null;
  trendsSavedAt: string | null;
  hasBrief: boolean;
}

function SourceBadge({ date, icon: Icon, label }: { date: string; icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0F] border border-emerald-500/20 rounded-lg">
      <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
      <Icon size={12} className="text-gray-400 flex-shrink-0" />
      <span className="text-xs text-gray-300">{label}</span>
      <span className="text-xs text-gray-600">·</span>
      <Clock size={10} className="text-gray-600 flex-shrink-0" />
      <span className="text-xs text-gray-600">
        {new Date(date).toLocaleString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

function MissingSourceBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg opacity-50">
      <XCircle size={12} className="text-gray-600 flex-shrink-0" />
      <span className="text-xs text-gray-500">{label} — sin escaneo</span>
    </div>
  );
}

function TableView({ items }: { items: BacklogItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1E1E2E]">
            {['Sprint', 'Título', 'Categoría', 'Reach', 'Impact', 'Conf%', 'Effort', 'Score', 'User Story'].map(
              (col) => (
                <th key={col} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-3">
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
              <tr key={item.id} className="border-b border-[#1E1E2E]/50 hover:bg-[#12121A] transition-colors">
                <td className={`py-3 px-3 font-semibold text-xs ${SPRINT_COLORS[item.sprint]}`}>{item.sprint}</td>
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
                <td className="py-3 px-3 text-center font-bold text-[#4D8EFF]">{item.rice.score}</td>
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
  const [sources, setSources] = useState<Sources | null>(null);
  const [availableSources, setAvailableSources] = useState<{
    reviews: string | null;
    trends: string | null;
  }>({ reviews: null, trends: null });
  // Datos completos de análisis para pasar al API cuando Supabase no está disponible
  const [cachedReviews, setCachedReviews] = useState<ReviewsAnalysisResult | null>(null);
  const [cachedTrends, setCachedTrendsData] = useState<TrendsAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState('');
  const [view, setView] = useState<'kanban' | 'table'>('kanban');

  // Carga: Supabase (via API) → localStorage → nada
  useEffect(() => {
    const getFromLocalStorage = (key: string) => {
      try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    };

    Promise.all([
      fetch('/api/backlog').then((r) => r.json()).catch(() => ({ data: null })),
      fetch('/api/reviews').then((r) => r.json()).catch(() => ({ data: null, savedAt: null })),
      fetch('/api/trends').then((r) => r.json()).catch(() => ({ data: null, savedAt: null })),
    ]).then(([backlog, reviewsApi, trendsApi]) => {
      if (backlog.data) setResult(backlog.data);

      // Reviews: Supabase o localStorage
      const reviewsSrc = (reviewsApi.data && reviewsApi.savedAt)
        ? reviewsApi
        : getFromLocalStorage('bci_reviews');
      if (reviewsSrc?.data) {
        setAvailableSources((prev) => ({ ...prev, reviews: reviewsSrc.savedAt }));
        setCachedReviews(reviewsSrc.data);
      }

      // Trends: Supabase o localStorage
      const trendsSrc = (trendsApi.data && trendsApi.savedAt)
        ? trendsApi
        : getFromLocalStorage('bci_trends');
      if (trendsSrc?.data) {
        setAvailableSources((prev) => ({ ...prev, trends: trendsSrc.savedAt }));
        setCachedTrendsData(trendsSrc.data);
      }
    }).finally(() => setLoadingInitial(false));
  }, []);

  const generateBacklog = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: brief.trim() || undefined,
          // Enviar datos directamente cuando Supabase no está configurado
          reviewsData: cachedReviews ?? undefined,
          trendsData: cachedTrends ?? undefined,
        }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const { sources: s, ...backlogResult } = data;
      setResult(backlogResult);
      setSources(s || null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const hasContext = availableSources.reviews || availableSources.trends;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Backlog Priorizado</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            User stories con RICE score — generado desde el último escaneo de Reviews y Trends
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

      {/* Context sources panel */}
      {!loadingInitial && (
        <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database size={14} className="text-[#4D8EFF]" />
            <h3 className="text-white text-sm font-medium">Contexto disponible en Supabase</h3>
            {hasContext && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                El backlog usará estos datos automáticamente
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSources.reviews ? (
              <SourceBadge date={availableSources.reviews} icon={Star} label="Reviews (BCI, Tenpo, Itaú)" />
            ) : (
              <MissingSourceBadge label="Reviews" />
            )}
            {availableSources.trends ? (
              <SourceBadge date={availableSources.trends} icon={TrendingUp} label="Trends & Noticias" />
            ) : (
              <MissingSourceBadge label="Trends" />
            )}
          </div>
          {!hasContext && (
            <p className="text-xs text-gray-600 mt-2">
              Ejecuta los módulos Feature Analyst y Trends Analyst para enriquecer el contexto del backlog.
            </p>
          )}
        </div>
      )}

      {/* Brief Input */}
      <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
        <div className="flex items-start gap-2 mb-3">
          <Lightbulb size={16} className="text-amber-400 mt-0.5" />
          <div>
            <h2 className="text-white text-sm font-medium">Brief adicional (opcional)</h2>
            <p className="text-gray-500 text-xs">
              Agrega foco específico. El backlog ya incorporará el contexto de reviews y trends automáticamente.
            </p>
          </div>
        </div>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Ej: Foco en mejorar el onboarding para usuarios jóvenes que migran desde Tenpo..."
          className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg p-3 text-sm text-gray-300 placeholder-gray-600 resize-none focus:outline-none focus:border-[#0033A0] transition-colors"
          rows={2}
        />
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={generateBacklog}
            disabled={loading || loadingInitial}
            className="flex items-center gap-2 px-4 py-2 bg-[#0033A0] hover:bg-[#0044CC] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all"
          >
            <Sparkles size={14} className={loading ? 'animate-pulse' : ''} />
            {loading ? 'Generando backlog...' : result ? 'Regenerar Backlog' : 'Generar Backlog'}
          </button>
          {loading && (
            <span className="text-xs text-gray-500">
              Claude está analizando el contexto de {[availableSources.reviews && 'reviews', availableSources.trends && 'trends'].filter(Boolean).join(' y ')}...
            </span>
          )}
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
      {(loading || (loadingInitial && !result)) && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((col) => (
              <div key={col} className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources used */}
      {sources && result && !loading && (
        <div className="flex flex-wrap gap-2 items-center text-xs">
          <span className="text-gray-500">Backlog generado con:</span>
          {sources.reviewsSavedAt && (
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ✓ Reviews del {new Date(sources.reviewsSavedAt).toLocaleDateString('es-CL')}
            </span>
          )}
          {sources.trendsSavedAt && (
            <span className="text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded-full border border-[#6366F1]/20">
              ✓ Trends del {new Date(sources.trendsSavedAt).toLocaleDateString('es-CL')}
            </span>
          )}
          {sources.hasBrief && (
            <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              ✓ Brief personalizado
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {result && !loading && !loadingInitial && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{result.items.length} user stories</span>
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
      {!result && !loading && !loadingInitial && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#059669]/20 flex items-center justify-center mb-4">
            <Sparkles size={28} className="text-[#059669]" />
          </div>
          <h3 className="text-white font-medium mb-2">Genera tu backlog priorizado</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            {hasContext
              ? 'Haz clic en "Generar Backlog" para crear user stories basadas en el contexto real de reviews y tendencias guardado en Supabase.'
              : 'Primero ejecuta el Feature Analyst y el Trends Analyst para obtener contexto real. Luego genera el backlog.'}
          </p>
        </div>
      )}
    </div>
  );
}
