'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { TrendDataPoint, ShareOfSearch } from '@/lib/types';

const COLORS = {
  bci: '#0033A0',
  bancoDeChile: '#E31837',
  santander: '#EC0000',
  tenpo: '#7B2FBE',
  mach: '#00A651',
};

const BRAND_LABELS: Record<string, string> = {
  bci: 'BCI',
  bancoDeChile: 'Banco de Chile',
  santander: 'Santander',
  tenpo: 'Tenpo',
  mach: 'MACH',
};

interface TrendLineChartProps {
  data: TrendDataPoint[];
}

export function TrendLineChart({ data }: TrendLineChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' }),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
        <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
        <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} domain={[0, 100]} />
        <Tooltip
          contentStyle={{ backgroundColor: '#12121A', border: '1px solid #1E1E2E', borderRadius: 8 }}
          labelStyle={{ color: '#E5E7EB' }}
          itemStyle={{ color: '#9CA3AF' }}
        />
        <Legend
          formatter={(value) => BRAND_LABELS[value] || value}
          wrapperStyle={{ fontSize: 12, color: '#9CA3AF' }}
        />
        {Object.entries(COLORS).map(([key, color]) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface ShareOfSearchChartProps {
  data: ShareOfSearch[];
}

const SOS_COLORS = ['#0033A0', '#3B82F6', '#6366F1', '#8B5CF6', '#A78BFA'];

export function ShareOfSearchChart({ data }: ShareOfSearchChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
        <YAxis dataKey="brand" type="category" tick={{ fill: '#9CA3AF', fontSize: 12 }} width={80} />
        <Tooltip
          contentStyle={{ backgroundColor: '#12121A', border: '1px solid #1E1E2E', borderRadius: 8 }}
          labelStyle={{ color: '#E5E7EB' }}
          formatter={(value) => [`${value}%`, 'Share']}
        />
        <Bar dataKey="share" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={SOS_COLORS[index % SOS_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
