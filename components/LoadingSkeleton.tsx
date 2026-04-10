interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export default function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-4 bg-[#1E1E2E] rounded-md ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-[#12121A] border border-[#1E1E2E] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-[#1E1E2E] rounded w-1/3" />
        <div className="h-6 bg-[#1E1E2E] rounded-full w-24" />
      </div>
      <div className="h-8 bg-[#1E1E2E] rounded w-16" />
      <div className="space-y-2">
        <div className="h-3 bg-[#1E1E2E] rounded w-full" />
        <div className="h-3 bg-[#1E1E2E] rounded w-5/6" />
        <div className="h-3 bg-[#1E1E2E] rounded w-4/6" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-10 bg-[#1A1A2E] rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-[#12121A] rounded-lg border border-[#1E1E2E]" />
      ))}
    </div>
  );
}
