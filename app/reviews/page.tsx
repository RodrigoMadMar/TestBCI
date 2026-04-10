'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, Info, Database, Clock } from 'lucide-react';
import { ReviewsAnalysisResult, AppAnalysis } from '@/lib/types';
import ReviewCard from '@/components/ReviewCard';
import { CardSkeleton } from '@/components/LoadingSkeleton';

const CATEGORIES = [
  'Estabilidad/Crashes',
  'UX/Navegación',
  'Funcionalidad Faltante',
  'Atención al Cliente',
  'Seguridad/Auth',
  'Rendimiento',
  'Cobros/Transparencia',
];

const APP_COLORS: Record<string, string> = {
  bci: '#0033A0',
  tenpo: '#7B2FBE',
  itau: '#F97316',
};

function CategoryHeatmap({ apps }: { apps: AppAnalysis[] }) {
  const getMaxCount = () => {
    let max = 0;
    for (const app of apps) {
      for (const cat of app.categories) {
        if (cat.count > max) max = cat.count;
      }
    }
    return max;
  };
  const maxCount = getMaxCount();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1E1E2E]">
            <th className="text-left text-gray-500 font-medium py-3 pr-4 text-xs w-40">Categoría</th>
            {apps.map((app) => (
              <th key={app.appId} className="text-center text-gray-400 font-medium py-3 px-4 text-xs">
                {app.appName.replace('App ', '').replace(' Personas', '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map((cat) => (
            <tr key={cat} className="border-b border-[#1E1E2E]/50 hover:bg-[#12121A] transition-colors">
              <td className="text-gray-400 text-xs py-2.5 pr-4">{cat}</td>
              {apps.map((app) => {
                const found = app.categories.find((c) => c.category === cat);
                const count = found?.count || 0;
                const intensity = maxCount > 0 ? count / maxCount : 0;
                const color = APP_COLORS[app.appId] || '#0033A0';
                return (
                  <td key={app.appId} className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-[#1E1E2E] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${intensity * 100}%`,
                            backgroundColor: color,
                            opacity: 0.3 + intensity * 0.7,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SavedBadge({ savedAt }: { savedAt: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
      <Database size={11} />
      <span>Guardado en Supabase</span>
      <span className="text-gray-600">·</span>
      <Clock size={11} className="text-gray-500" />
      <span className="text-gray-500">
        {new Date(savedAt).toLocaleString('es-CL', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        })}
      </span>
    </div>
  );
}

export default function ReviewsPage() {
  const [result, setResult] = useState<ReviewsAnalysisResult | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Cargar último análisis guardado al montar
  useEffect(() => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then(({ data, savedAt: sa }) => {
        if (data) {
          setResult(data);
          setSavedAt(sa);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingInitial(false));
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/reviews', { method: 'POST' });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setSavedAt(new Date().toISOString());
      setUsingFallback(data.usingFallback || false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getMaxCategoryCount = () => {
    if (!result) return 1;
    let max = 0;
    for (const app of result.apps) {
      for (const cat of app.categories) {
        if (cat.count > max) max = cat.count;
      }
    }
    return max || 1;
  };

  const isLoading = loading || loadingInitial;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Feature Analyst</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Análisis de reviews de Google Play — BCI Personas, Tenpo, Itaú Chile
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#0033A0] hover:bg-[#0044CC] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analizando...' : result ? 'Actualizar Análisis' : 'Ejecutar Análisis'}
        </button>
      </div>

      {/* Saved badge */}
      {savedAt && !loading && <SavedBadge savedAt={savedAt} />}

      {/* Fallback notice */}
      {usingFallback && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <span>
            Usando dataset de fallback (Apify no disponible). Los datos son representativos del ecosistema bancario chileno.
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeletons */}
      {isLoading && !result && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5 space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 bg-[#1E1E2E] rounded animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-3 gap-4">
            {result.apps.map((app) => (
              <ReviewCard key={app.appId} analysis={app} maxCount={getMaxCategoryCount()} />
            ))}
          </div>

          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 text-sm">Mapa de Incidencias por Categoría</h2>
            <CategoryHeatmap apps={result.apps} />
          </div>

          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4D8EFF] inline-block" />
              Insights Comparativos
            </h2>
            <ul className="space-y-3">
              {result.comparativeInsights.map((insight, idx) => (
                <li key={idx} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                  <span className="text-[#4D8EFF] font-bold mt-0.5 flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-600 text-right">
            Análisis ejecutado: {new Date(result.updatedAt).toLocaleString('es-CL')}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!result && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#0033A0]/20 flex items-center justify-center mb-4">
            <RefreshCw size={28} className="text-[#4D8EFF]" />
          </div>
          <h3 className="text-white font-medium mb-2">Listo para analizar</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Haz clic en &quot;Ejecutar Análisis&quot; para obtener insights de reviews de las 3 apps bancarias chilenas.
          </p>
        </div>
      )}
    </div>
  );
}
