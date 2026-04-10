import { TrendDataPoint, NewsItem, ShareOfSearch } from './types';

// Fallback static trend data (representative of Chile banca digital landscape)
export const FALLBACK_TREND_DATA: TrendDataPoint[] = [
  { date: '2025-03-10', bci: 72, bancoDeChile: 85, santander: 60, tenpo: 48, mach: 32 },
  { date: '2025-03-17', bci: 68, bancoDeChile: 80, santander: 58, tenpo: 52, mach: 30 },
  { date: '2025-03-24', bci: 75, bancoDeChile: 82, santander: 62, tenpo: 55, mach: 35 },
  { date: '2025-03-31', bci: 80, bancoDeChile: 88, santander: 65, tenpo: 58, mach: 38 },
  { date: '2025-04-07', bci: 78, bancoDeChile: 86, santander: 63, tenpo: 60, mach: 40 },
];

export const FALLBACK_SHARE_OF_SEARCH: ShareOfSearch[] = [
  { brand: 'Banco de Chile', share: 31, trend: 'stable' },
  { brand: 'BCI', share: 26, trend: 'up' },
  { brand: 'Santander', share: 21, trend: 'down' },
  { brand: 'Tenpo', share: 14, trend: 'up' },
  { brand: 'MACH', share: 8, trend: 'stable' },
];

export const FALLBACK_NEWS: NewsItem[] = [
  {
    title: 'BCI lanza nueva funcionalidad de pagos instantáneos en app personas',
    source: 'Chocale.cl',
    date: '2025-03-28',
    summary: 'El banco BCI habilitó transferencias instantáneas 24/7 para todos los clientes de su app personas, eliminando los tiempos de espera en transferencias entre bancos.',
    url: 'https://chocale.cl',
  },
  {
    title: 'Tenpo avanza en proceso de licencia bancaria ante la CMF',
    source: 'DF.cl',
    date: '2025-03-22',
    summary: 'La fintech chilena Tenpo aceleró su proceso de solicitud de licencia bancaria, lo que le permitiría ofrecer créditos y productos financieros completos.',
    url: 'https://df.cl',
  },
  {
    title: 'CMF publica nuevas normas de Open Finance para bancos chilenos',
    source: 'CMF Chile',
    date: '2025-03-15',
    summary: 'La Comisión para el Mercado Financiero publicó las normas de implementación del Open Finance en Chile, obligando a los bancos a exponer APIs de datos de clientes.',
    url: 'https://cmf.cl',
  },
  {
    title: 'Boom de pagos QR en comercios: Tenpo y MACH lideran adopción',
    source: 'Emol Economía',
    date: '2025-03-10',
    summary: 'Los pagos mediante código QR crecieron un 340% en el último año en Chile, con Tenpo y MACH capturando el 60% de las transacciones en pequeños comercios.',
    url: 'https://emol.com',
  },
  {
    title: 'Itaú Chile relanza app móvil con foco en experiencia de usuario',
    source: 'Chocale.cl',
    date: '2025-03-05',
    summary: 'Itaú Chile presentó la versión completamente rediseñada de su app móvil, con nueva interfaz, biometría mejorada y acceso más rápido a productos de crédito.',
    url: 'https://chocale.cl',
  },
];

export async function fetchTrendsData(): Promise<{
  trendData: TrendDataPoint[];
  shareOfSearch: ShareOfSearch[];
  news: NewsItem[];
}> {
  // In production this is handled by Claude web_search in the API route
  // This function provides the fallback structure
  return {
    trendData: FALLBACK_TREND_DATA,
    shareOfSearch: FALLBACK_SHARE_OF_SEARCH,
    news: FALLBACK_NEWS,
  };
}
