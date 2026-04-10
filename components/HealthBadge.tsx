import { HealthStatus } from '@/lib/types';

interface HealthBadgeProps {
  status: HealthStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<HealthStatus, { emoji: string; label: string; className: string }> = {
  healthy: {
    emoji: '🟢',
    label: 'Saludable',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  at_risk: {
    emoji: '🟡',
    label: 'En riesgo',
    className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  critical: {
    emoji: '🔴',
    label: 'Crítico',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
};

const sizeClass = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export default function HealthBadge({ status, showLabel = true, size = 'md' }: HealthBadgeProps) {
  const { emoji, label, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${className} ${sizeClass[size]}`}>
      <span>{emoji}</span>
      {showLabel && <span>{label}</span>}
    </span>
  );
}
