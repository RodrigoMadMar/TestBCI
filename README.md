# Copiloto BCI — Inteligencia de Producto

Agente de inteligencia de producto para la gerencia de canales digitales de **Banco BCI Chile**. Demo profesional construida con Next.js 16, Claude Sonnet 4.6 y Tailwind CSS.

## Módulos

| Módulo | Descripción |
|--------|-------------|
| **Feature Analyst** | Análisis de reviews de Google Play (BCI, Tenpo, Itaú) con health status y heatmap de incidencias |
| **Trends Analyst** | Tendencias de búsqueda en Chile, noticias fintech y oportunidades de producto |
| **Backlog Priorizado** | User stories con RICE score en vista Kanban + exportación CSV |
| **Flujos Agénticos** | Diseño de arquitecturas multi-agente con diagrama Mermaid y spec completa |

## Stack Técnico

- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript
- **Styling**: Tailwind CSS v4
- **IA**: Anthropic Claude Sonnet 4.6 (`claude-sonnet-4-20250514`)
- **Reviews**: API de Apify (con fallback hardcodeado)
- **Gráficos**: Recharts
- **Diagramas**: Mermaid (client-side)
- **Iconos**: Lucide React
- **Deploy**: Vercel

## Setup Local

### 1. Clonar y instalar

```bash
git clone <repo-url>
cd TestBCI
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...   # Tu API key de Anthropic
APIFY_TOKEN=apify_api_...            # Token de Apify (opcional, hay fallback)
```

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

### Opción 1: CLI de Vercel

```bash
npm install -g vercel
vercel
```

### Opción 2: GitHub Integration

1. Push a GitHub
2. Conectar repo en vercel.com
3. Configurar variables de entorno en Vercel Dashboard:
   - `ANTHROPIC_API_KEY`
   - `APIFY_TOKEN`

## Variables de entorno requeridas en Vercel

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `ANTHROPIC_API_KEY` | API key de Anthropic Claude | Sí |
| `APIFY_TOKEN` | Token de Apify para reviews | No (hay fallback) |

## Arquitectura

```
app/
├── layout.tsx              # Layout general con sidebar
├── page.tsx                # Dashboard home
├── reviews/page.tsx        # Feature Analyst
├── trends/page.tsx         # Trends Analyst
├── backlog/page.tsx        # Generador de Backlog RICE
├── agentes/page.tsx        # Diseñador de Flujos Agénticos
└── api/
    ├── reviews/route.ts    # API: análisis de reviews con Claude
    ├── trends/route.ts     # API: análisis de tendencias
    ├── backlog/route.ts    # API: generación de backlog
    └── agentes/route.ts    # API: diseño de flujo agéntico

components/
├── Sidebar.tsx             # Navegación lateral colapsable
├── HealthBadge.tsx         # Badge de health status
├── KanbanBoard.tsx         # Vista Kanban del backlog
├── MermaidDiagram.tsx      # Renderizador de diagramas Mermaid
├── ReviewCard.tsx          # Card de análisis de app
├── TrendChart.tsx          # Gráficos de tendencias (Recharts)
├── LoadingSkeleton.tsx     # Estados de carga animados
└── ExportButton.tsx        # Exportación CSV/Markdown

lib/
├── anthropic.ts            # Helper para llamadas a Claude API
├── bci-context.ts          # System prompt reutilizable
├── apify.ts                # Helper para API de Apify + fallback
├── trends.ts               # Datos de tendencias + fallback
└── types.ts                # TypeScript types
```

## Notas Técnicas

- **Fallback de Reviews**: Si Apify falla, usa 45 reviews hardcodeadas (15 por app) representativas del ecosistema bancario chileno.
- **Trends**: Usa Claude con contexto de conocimiento actualizado (compatible con Vercel serverless, sin Playwright).
- **Mermaid**: Renderizado client-side con `dynamic(() => import('mermaid'), { ssr: false })`.
- **Streaming**: El módulo de Agentes usa streaming de Claude API.
- **Timeout Vercel**: API routes con `maxDuration: 60` segundos en `vercel.json`.

## Modelo de IA

Todas las llamadas usan `claude-sonnet-4-20250514` (Claude Sonnet 4.6) con el system prompt de contexto BCI inyectado en cada llamada.

---

*Desarrollado para demo de entrevista de Product Owner — Gerencia Canales Digitales BCI Chile*
