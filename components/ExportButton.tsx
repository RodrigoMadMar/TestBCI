'use client';

import { Download } from 'lucide-react';
import { BacklogItem } from '@/lib/types';

interface ExportCSVProps {
  items: BacklogItem[];
  filename?: string;
}

export function ExportCSVButton({ items, filename = 'backlog-bci' }: ExportCSVProps) {
  const handleExport = () => {
    const headers = ['ID', 'Título', 'User Story', 'Categoría', 'Sprint', 'Reach', 'Impact', 'Confidence', 'Effort', 'RICE Score', 'Criterios de Aceptación'];
    const rows = items.map((item) => [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.userStory.replace(/"/g, '""')}"`,
      item.category,
      item.sprint,
      item.rice.reach,
      item.rice.impact,
      item.rice.confidence,
      item.rice.effort,
      item.rice.score.toFixed(0),
      `"${item.acceptanceCriteria.map((ac) => ac.description).join(' | ').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 border border-[#1E1E2E] rounded-lg hover:bg-[#1A1A2E] hover:text-white transition-all"
    >
      <Download size={14} />
      Exportar CSV
    </button>
  );
}

interface ExportMarkdownProps {
  content: string;
  filename?: string;
}

export function ExportMarkdownButton({ content, filename = 'flujo-agentes' }: ExportMarkdownProps) {
  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 border border-[#1E1E2E] rounded-lg hover:bg-[#1A1A2E] hover:text-white transition-all"
    >
      <Download size={14} />
      Exportar Markdown
    </button>
  );
}
