'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus, Newspaper, Lightbulb, Database, Clock } from 'lucide-react';
import { TrendsAnalysisResult, ProductOpportunity } from '@/lib/types';
import { TrendLineChart, ShareOfSearchChart } from '@/components/TrendChart';
import { CardSkeleton } from '@/components/LoadingSkeleton';

const PRIORITY_STYLES = {
  Alta: 'bg-red-500/15 text-red-300 border-red-500/20',
  Media: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  Baja: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
};

const TREND_ICONS = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const TREND_COLORS = {
  up: 'text-emerald-400',
  down: 'text-red-400',
  stable: 'text-gray-400',
};

function OpportunityCard({ opp }: { opp: ProductOpportunity }) {
  return (
    <div className="flex gap-4 p-4 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg hover:border-[#2A2A3E] transition-all">
      <div className="flex-shrink-0">
        <Lightbulb size={16} className="text-amber-400 mt-0.5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-white text-sm font-medium">{opp.title}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[opp.priority]}`}>
            {opp.priority}
          </span>
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">{opp.description}</p>
        <p className="text-gray-600 text-xs mt-1">Fuente: {opp.source}</p>
      </div>
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

export default function TrendsPage() {
  const [result, setResult] = useState<TrendsAnalysisResult | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar último análisis: Supabase → localStorage → nada
  useEffect(() => {
    fetch('/api/trends')
      .then((r) => r.json())
      .then(({ data, savedAt: sa }) => {
        if (data) {
          setResult(data);
          setSavedAt(sa);
          return;
        }
        // Fallback: localStorage
        try {
          const stored = localStorage.getItem('bci_trends');
          if (stored) {
            const parsed = JSON.parse(stored);
            setResult(parsed.data);
            setSavedAt(parsed.savedAt);
          }
        } catch {}
      })
      .catch(() => {})
      .finally(() => setLoadingInitial(false));
  }, []);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trends', { method: 'POST' });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const now = new Date().toISOString();
      setResult(data);
      setSavedAt(now);
      // Guardar en localStorage como fallback cuando Supabase no está configurado
      try {
        localStorage.setItem('bci_trends', JSON.stringify({ data, savedAt: now }));
      } catch {}
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || loadingInitial;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trends Analyst</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Tendencias de búsqueda en Chile + noticias fintech + oportunidades de producto
          </p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analizando...' : result ? 'Actualizar' : 'Analizar Tendencias'}
        </button>
      </div>

      {/* Saved badge */}
      {savedAt && !loading && <SavedBadge savedAt={savedAt} />}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && !result && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5 h-48 animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-4 h-24 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary */}
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-3 text-sm">Resumen Ejecutivo</h2>
            <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4 text-sm">
                Interés de Búsqueda — Chile (últimas semanas)
              </h2>
              <TrendLineChart data={result.trendData} />
              <p className="text-xs text-gray-600 mt-2 text-center">
                Índice 0-100 (100 = punto máximo de búsqueda)
              </p>
            </div>

            <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
              <h2 className="text-white font-semibold mb-4 text-sm">
                Share of Search — Banca Digital Chile
              </h2>
              <ShareOfSearchChart data={result.shareOfSearch} />
              <div className="mt-3 space-y-1">
                {result.shareOfSearch.map((item) => {
                  const TrendIcon = TREND_ICONS[item.trend];
                  return (
                    <div key={item.brand} className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{item.brand}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-medium">{item.share}%</span>
                        <TrendIcon size={11} className={TREND_COLORS[item.trend]} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* News */}
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
              <Newspaper size={16} className="text-[#6366F1]" />
              Noticias Relevantes — Fintech Chile
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {result.news.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg hover:border-[#2A2A3E] transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-[#6366F1] font-medium">{item.source}</span>
                    <span className="text-xs text-gray-600">
                      {new Date(item.date).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h4 className="text-white text-sm font-medium mb-1.5 leading-snug">{item.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunities */}
          <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 text-sm flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-400" />
              Oportunidades de Producto Identificadas
            </h2>
            <div className="space-y-3">
              {result.opportunities.map((opp, idx) => (
                <OpportunityCard key={idx} opp={opp} />
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-600 text-right">
            Análisis generado: {new Date(result.updatedAt).toLocaleString('es-CL')}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!result && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#6366F1]/20 flex items-center justify-center mb-4">
            <TrendingUp size={28} className="text-[#6366F1]" />
          </div>
          <h3 className="text-white font-medium mb-2">Listo para analizar tendencias</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Haz clic en &quot;Analizar Tendencias&quot; para obtener el análisis de búsquedas, noticias y oportunidades de producto.
          </p>
        </div>
      )}
    </div>
  );
}
