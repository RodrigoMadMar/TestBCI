'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!chart || !ref.current) return;

    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#0033A0',
            primaryTextColor: '#E5E7EB',
            primaryBorderColor: '#1E3A8A',
            lineColor: '#4B5563',
            secondaryColor: '#1A1A2E',
            tertiaryColor: '#12121A',
            background: '#0A0A0F',
            mainBkg: '#12121A',
            nodeBorder: '#2563EB',
            clusterBkg: '#1A1A2E',
            titleColor: '#E5E7EB',
            edgeLabelBackground: '#1A1A2E',
            attributeBackgroundColorEven: '#12121A',
            attributeBackgroundColorOdd: '#1A1A2E',
          },
          flowchart: { useMaxWidth: true, htmlLabels: true },
          securityLevel: 'loose',
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          // Make SVG responsive
          const svgEl = ref.current.querySelector('svg');
          if (svgEl) {
            svgEl.setAttribute('width', '100%');
            svgEl.style.maxWidth = '100%';
          }
          setRendered(true);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error rendering diagram');
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <p className="text-red-400 text-sm font-medium mb-2">Error al renderizar el diagrama</p>
        <pre className="text-xs text-red-300/70 whitespace-pre-wrap">{error}</pre>
        <div className="mt-3 pt-3 border-t border-red-500/10">
          <p className="text-xs text-gray-500 mb-1">Código Mermaid:</p>
          <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono">{chart}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {!rendered && (
        <div className="flex items-center justify-center h-48 text-gray-500 text-sm animate-pulse">
          Renderizando diagrama...
        </div>
      )}
      <div
        ref={ref}
        className={`w-full overflow-auto transition-opacity duration-300 ${rendered ? 'opacity-100' : 'opacity-0 absolute'}`}
        style={{ minHeight: rendered ? undefined : 0 }}
      />
    </div>
  );
}
