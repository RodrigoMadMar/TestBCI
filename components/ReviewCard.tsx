import { Star } from 'lucide-react';
import { AppAnalysis, CategoryCount } from '@/lib/types';
import HealthBadge from './HealthBadge';

interface ReviewCardProps {
  analysis: AppAnalysis;
  maxCount: number;
}

const APP_COLORS: Record<string, string> = {
  bci: '#0033A0',
  tenpo: '#7B2FBE',
  itau: '#F97316',
};

export default function ReviewCard({ analysis, maxCount }: ReviewCardProps) {
  const accentColor = APP_COLORS[analysis.appId] || '#0033A0';

  return (
    <div className="bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5 hover:border-[#2A2A3E] transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-base">{analysis.appName}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{analysis.packageId}</p>
        </div>
        <HealthBadge status={analysis.healthStatus} />
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < Math.round(analysis.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}
            />
          ))}
        </div>
        <span className="text-white font-bold text-lg">{analysis.rating.toFixed(1)}</span>
        <span className="text-gray-500 text-xs">/ 5.0</span>
      </div>

      <p className="text-gray-500 text-xs mb-4">{analysis.reviewCount} reviews analizadas</p>

      {/* Category bars */}
      <div className="space-y-2">
        {analysis.categories.slice(0, 5).map((cat: CategoryCount) => (
          <div key={cat.category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">{cat.category}</span>
              <span className="text-xs text-gray-500">{cat.count}</span>
            </div>
            <div className="h-1.5 bg-[#1E1E2E] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${maxCount > 0 ? (cat.count / maxCount) * 100 : 0}%`,
                  backgroundColor: accentColor,
                  opacity: 0.7 + (cat.count / maxCount) * 0.3,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Key insight */}
      {analysis.insights[0] && (
        <div className="mt-4 pt-4 border-t border-[#1E1E2E]">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="text-[#4D8EFF] font-medium">Insight: </span>
            {analysis.insights[0]}
          </p>
        </div>
      )}
    </div>
  );
}
