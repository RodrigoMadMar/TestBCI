'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BacklogItem, BacklogCategory, RiceLabel } from '@/lib/types';

const CATEGORY_COLORS: Record<BacklogCategory, string> = {
  UX: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  Funcionalidad: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  Estabilidad: 'bg-red-500/15 text-red-300 border-red-500/20',
  Growth: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  Compliance: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
};

const COLUMN_CONFIG: Record<RiceLabel, { label: string; color: string; bg: string }> = {
  Now: { label: 'NOW', color: 'text-emerald-400', bg: 'border-emerald-500/30' },
  Next: { label: 'NEXT', color: 'text-blue-400', bg: 'border-blue-500/30' },
  Later: { label: 'LATER', color: 'text-gray-400', bg: 'border-gray-500/30' },
};

function BacklogCard({ item }: { item: BacklogItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg p-3.5 hover:border-[#2A2A3E] transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-white text-sm font-medium leading-snug flex-1">{item.title}</h4>
        <span className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 ${CATEGORY_COLORS[item.category]}`}>
          {item.category}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="text-xs text-gray-500">RICE</div>
        <div className="text-sm font-bold text-[#4D8EFF]">{item.rice.score.toFixed(0)}</div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full"
      >
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {expanded ? 'Ocultar detalle' : 'Ver detalle'}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#1E1E2E] space-y-3 animate-in fade-in duration-150">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">User Story</p>
            <p className="text-xs text-gray-300 leading-relaxed">{item.userStory}</p>
          </div>

          <div>
            <p className="text-xs text-gray-400 font-medium mb-1">Criterios de Aceptación</p>
            <ul className="space-y-1">
              {item.acceptanceCriteria.map((ac) => (
                <li key={ac.id} className="text-xs text-gray-300 flex gap-1.5">
                  <span className="text-[#4D8EFF] mt-0.5">•</span>
                  <span>{ac.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { label: 'Reach', value: item.rice.reach },
              { label: 'Impact', value: item.rice.impact },
              { label: 'Conf%', value: item.rice.confidence },
              { label: 'Effort', value: item.rice.effort },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#12121A] rounded p-1.5">
                <div className="text-[10px] text-gray-500 mb-0.5">{label}</div>
                <div className="text-xs font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface KanbanBoardProps {
  items: BacklogItem[];
}

export default function KanbanBoard({ items }: KanbanBoardProps) {
  const columns: RiceLabel[] = ['Now', 'Next', 'Later'];

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((sprint) => {
        const colItems = items.filter((i) => i.sprint === sprint);
        const cfg = COLUMN_CONFIG[sprint];
        return (
          <div key={sprint} className={`flex flex-col rounded-xl border ${cfg.bg} bg-[#0A0A0F]/50`}>
            <div className={`px-4 py-3 border-b border-[#1E1E2E] flex items-center justify-between`}>
              <h3 className={`font-bold text-sm tracking-wider ${cfg.color}`}>{cfg.label}</h3>
              <span className="text-xs text-gray-500 bg-[#1E1E2E] px-2 py-0.5 rounded-full">
                {colItems.length}
              </span>
            </div>
            <div className="p-3 flex-1 space-y-3 min-h-[200px]">
              {colItems.length === 0 ? (
                <div className="flex items-center justify-center h-24 text-gray-600 text-xs">
                  Sin items
                </div>
              ) : (
                colItems.map((item) => <BacklogCard key={item.id} item={item} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
