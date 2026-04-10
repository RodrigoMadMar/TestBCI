import { createClient } from '@supabase/supabase-js';
import type {
  ReviewsAnalysisResult,
  TrendsAnalysisResult,
  BacklogResult,
  AgenticFlowResult,
} from './types';

export type AnalysisType = 'reviews' | 'trends' | 'backlog' | 'agentes';

export interface AnalysisRecord<T = unknown> {
  id: string;
  type: AnalysisType;
  data: T;
  created_at: string;
}

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('SUPABASE env vars not set');
  return createClient(url, key);
}

export function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function saveAnalysis(type: AnalysisType, data: object): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('analyses').insert({ type, data });
  if (error) throw new Error(`Supabase save error: ${error.message}`);
}

export async function getLatestAnalysis<T>(
  type: AnalysisType
): Promise<AnalysisRecord<T> | null> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('analyses')
    .select('id, type, data, created_at')
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as AnalysisRecord<T>;
}

// ─── Context extraction for backlog generation ─────────────────────────────

export function extractReviewsContext(reviews: ReviewsAnalysisResult): string {
  const lines: string[] = [
    `=== ANÁLISIS DE REVIEWS (${new Date(reviews.updatedAt).toLocaleDateString('es-CL')}) ===`,
  ];

  for (const app of reviews.apps) {
    const statusEmoji = { healthy: '🟢', at_risk: '🟡', critical: '🔴' }[app.healthStatus];
    lines.push(`\n${statusEmoji} ${app.appName} — Rating ${app.rating}/5 (${app.reviewCount} reviews)`);

    const topCats = [...app.categories]
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((c) => `${c.category} (${c.count})`);
    lines.push(`  Principales problemas: ${topCats.join(', ')}`);
    app.insights.forEach((i) => lines.push(`  • ${i}`));
  }

  lines.push('\nInsights comparativos:');
  reviews.comparativeInsights.forEach((i) => lines.push(`  • ${i}`));

  return lines.join('\n');
}

export function extractTrendsContext(trends: TrendsAnalysisResult): string {
  const lines: string[] = [
    `=== ANÁLISIS DE TENDENCIAS (${new Date(trends.updatedAt).toLocaleDateString('es-CL')}) ===`,
    trends.summary,
    '\nShare of Search:',
  ];

  trends.shareOfSearch.forEach((s) => {
    const arrow = s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : '→';
    lines.push(`  • ${s.brand}: ${s.share}% ${arrow}`);
  });

  lines.push('\nOportunidades identificadas:');
  trends.opportunities.forEach((o) =>
    lines.push(`  • [${o.priority}] ${o.title}: ${o.description}`)
  );

  lines.push('\nNoticias clave:');
  trends.news.slice(0, 4).forEach((n) =>
    lines.push(`  • ${n.title} (${n.source}, ${n.date})`)
  );

  return lines.join('\n');
}

export type { ReviewsAnalysisResult, TrendsAnalysisResult, BacklogResult, AgenticFlowResult };
