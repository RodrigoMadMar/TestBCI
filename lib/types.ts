// =====================
// Review / Feature Analyst Types
// =====================

export interface Review {
  id: string;
  app: AppId;
  appName: string;
  rating: number;
  text: string;
  date: string;
  author?: string;
}

export type AppId = 'bci' | 'tenpo' | 'itau';

export type HealthStatus = 'healthy' | 'at_risk' | 'critical';

export interface CategoryCount {
  category: string;
  count: number;
}

export interface AppAnalysis {
  appId: AppId;
  appName: string;
  packageId: string;
  rating: number;
  reviewCount: number;
  healthStatus: HealthStatus;
  categories: CategoryCount[];
  insights: string[];
}

export interface ReviewsAnalysisResult {
  apps: AppAnalysis[];
  comparativeInsights: string[];
  updatedAt: string;
}

// =====================
// Trends Types
// =====================

export interface TrendDataPoint {
  date: string;
  bci: number;
  bancoDeChile: number;
  santander: number;
  tenpo: number;
  mach: number;
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  summary: string;
  url?: string;
}

export interface ProductOpportunity {
  title: string;
  description: string;
  priority: 'Alta' | 'Media' | 'Baja';
  source: string;
}

export interface ShareOfSearch {
  brand: string;
  share: number;
  trend: 'up' | 'down' | 'stable';
}

export interface TrendsAnalysisResult {
  trendData: TrendDataPoint[];
  shareOfSearch: ShareOfSearch[];
  news: NewsItem[];
  opportunities: ProductOpportunity[];
  summary: string;
  updatedAt: string;
}

// =====================
// Backlog Types
// =====================

export type RiceLabel = 'Now' | 'Next' | 'Later';
export type BacklogCategory = 'UX' | 'Funcionalidad' | 'Estabilidad' | 'Growth' | 'Compliance';

export interface AcceptanceCriteria {
  id: string;
  description: string;
}

export interface BacklogItem {
  id: string;
  title: string;
  userStory: string;
  category: BacklogCategory;
  acceptanceCriteria: AcceptanceCriteria[];
  rice: {
    reach: number;
    impact: number;
    confidence: number;
    effort: number;
    score: number;
  };
  sprint: RiceLabel;
}

export interface BacklogResult {
  items: BacklogItem[];
  generatedAt: string;
}

// =====================
// Agentic Flow Types
// =====================

export type ComplexityLevel = 'simple' | 'medium' | 'complex';

export interface AgentComponent {
  name: string;
  role: string;
  inputs: string[];
  outputs: string[];
  tools: string[];
}

export interface HumanInTheLoop {
  step: string;
  reason: string;
  action: string;
}

export interface Guardrail {
  rule: string;
  description: string;
}

export interface SuccessMetric {
  kpi: string;
  target: string;
  measurement: string;
}

export interface AgenticFlowResult {
  systemName: string;
  problemDescription: string;
  solutionDescription: string;
  components: AgentComponent[];
  dataFlow: string[];
  humanInTheLoop: HumanInTheLoop[];
  guardrails: Guardrail[];
  metrics: SuccessMetric[];
  mermaidDiagram: string;
  techStack: string[];
  implementationSize: 'S' | 'M' | 'L' | 'XL';
  implementationJustification: string;
}

export interface AgenticFlowInput {
  useCase: string;
  tools: string[];
  complexity: ComplexityLevel;
}

// =====================
// Apify Types
// =====================

export interface ApifyRunResponse {
  data: {
    id: string;
    defaultDatasetId: string;
    status: string;
  };
}

export interface ApifyReviewItem {
  id?: string;
  reviewId?: string;
  userName?: string;
  userImage?: string;
  score?: number;
  thumbsUpCount?: number;
  reviewCreatedVersion?: string;
  at?: string;
  replyContent?: string;
  repliedAt?: string;
  sortOrder?: string;
  appId?: string;
  text?: string;
  content?: string;
  title?: string;
  rating?: number;
  date?: string;
}
