import { ApifyReviewItem, Review, AppId } from './types';

const RUN_URL =
  'https://api.apify.com/v2/actor-runs/9iEk45UzcMeMT5bIw';

const APP_MAP: Record<string, { appId: AppId; appName: string; packageId: string }> = {
  'cl.bci.app.personas': { appId: 'bci', appName: 'App BCI Personas', packageId: 'cl.bci.app.personas' },
  'cl.tenpo.app': { appId: 'tenpo', appName: 'Tenpo', packageId: 'cl.tenpo.app' },
  'cl.itau.app': { appId: 'itau', appName: 'Itaú Chile', packageId: 'cl.itau.app' },
};

export async function fetchReviewsFromApify(): Promise<Review[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error('APIFY_TOKEN not set');

  // Get run details to find defaultDatasetId
  const runRes = await fetch(`${RUN_URL}?token=${token}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 0 },
  });

  if (!runRes.ok) throw new Error(`Apify run fetch failed: ${runRes.status}`);

  const runData = await runRes.json();
  const datasetId = runData?.data?.defaultDatasetId;
  if (!datasetId) throw new Error('No defaultDatasetId in Apify run');

  // Fetch dataset items
  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}&limit=200`,
    { next: { revalidate: 0 } }
  );

  if (!itemsRes.ok) throw new Error(`Apify dataset fetch failed: ${itemsRes.status}`);

  const items: ApifyReviewItem[] = await itemsRes.json();
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Empty dataset from Apify');
  }

  return items.map((item, idx): Review => {
    const packageId = item.appId || '';
    const appMeta = APP_MAP[packageId] || { appId: 'bci' as AppId, appName: 'App BCI Personas', packageId };
    return {
      id: item.reviewId || item.id || `review-${idx}`,
      app: appMeta.appId,
      appName: appMeta.appName,
      rating: item.score ?? item.rating ?? 3,
      text: item.text || item.content || '',
      date: item.at || item.date || new Date().toISOString(),
      author: item.userName,
    };
  });
}

// Fallback hardcoded reviews for when Apify fails
export const FALLBACK_REVIEWS: Review[] = [
  // BCI Reviews
  { id: 'bci-1', app: 'bci', appName: 'App BCI Personas', rating: 1, date: '2025-12-10', text: 'Desde la última actualización los botones no responden. No puedo hacer nada en la app. Llevo 3 días sin poder transferir.' },
  { id: 'bci-2', app: 'bci', appName: 'App BCI Personas', rating: 2, date: '2025-12-05', text: 'La publicidad bloquea mis datos de cuenta. Es imposible ver el saldo sin que aparezca un banner. Muy molesto.' },
  { id: 'bci-3', app: 'bci', appName: 'App BCI Personas', rating: 1, date: '2025-12-01', text: 'El chat con el ejecutivo cierra la sesión y pierdo todo el historial. Pésima experiencia de atención al cliente.' },
  { id: 'bci-4', app: 'bci', appName: 'App BCI Personas', rating: 3, date: '2025-11-20', text: 'La app se congela al intentar acceder a los fondos mutuos. A veces tarda 30 segundos en cargar.' },
  { id: 'bci-5', app: 'bci', appName: 'App BCI Personas', rating: 5, date: '2025-11-15', text: 'Me encanta la función de Mis Finanzas, muy útil para controlar gastos. La carga Bip! es rapidísima.' },
  { id: 'bci-6', app: 'bci', appName: 'App BCI Personas', rating: 4, date: '2025-11-10', text: 'Buena app en general pero le falta mejorar la estabilidad. La biometría funciona perfecto.' },
  { id: 'bci-7', app: 'bci', appName: 'App BCI Personas', rating: 2, date: '2025-11-05', text: 'Después del update de noviembre todo empeoró. La app tarda mucho en cargar y se cierra sola.' },
  { id: 'bci-8', app: 'bci', appName: 'App BCI Personas', rating: 1, date: '2025-10-28', text: 'Cobros que no reconozco en mi cuenta. El servicio al cliente no me da respuesta clara. Muy preocupante.' },
  { id: 'bci-9', app: 'bci', appName: 'App BCI Personas', rating: 3, date: '2025-10-20', text: 'La tarjeta virtual es muy útil pero el proceso para activarla es confuso. Debería ser más simple.' },
  { id: 'bci-10', app: 'bci', appName: 'App BCI Personas', rating: 5, date: '2025-10-15', text: 'Excelente app, muy completa. OpenSky rewards es un gran plus. Recomendado.' },
  { id: 'bci-11', app: 'bci', appName: 'App BCI Personas', rating: 2, date: '2025-10-10', text: 'La autenticación por huella dactilar falla constantemente. Tengo que usar clave siempre.' },
  { id: 'bci-12', app: 'bci', appName: 'App BCI Personas', rating: 1, date: '2025-10-01', text: 'App caída por horas sin aviso. Ni siquiera pusieron un comunicado en redes sociales. Inaceptable.' },
  { id: 'bci-13', app: 'bci', appName: 'App BCI Personas', rating: 4, date: '2025-09-25', text: 'Los depósitos a plazo desde la app son muy convenientes. Podrían mejorar la interfaz de inversiones.' },
  { id: 'bci-14', app: 'bci', appName: 'App BCI Personas', rating: 3, date: '2025-09-15', text: 'Necesito poder programar transferencias automáticas. Es increíble que no tengan esa función básica.' },
  { id: 'bci-15', app: 'bci', appName: 'App BCI Personas', rating: 2, date: '2025-09-10', text: 'La navegación es complicada. Hay demasiados menús y no encuentro fácilmente lo que busco.' },
  // Tenpo Reviews
  { id: 'tenpo-1', app: 'tenpo', appName: 'Tenpo', rating: 4, date: '2025-12-08', text: 'Muy buena app para pagos. Interfaz moderna y fácil de usar. Me encanta que no tenga letra chica.' },
  { id: 'tenpo-2', app: 'tenpo', appName: 'Tenpo', rating: 5, date: '2025-12-02', text: 'La mejor cuenta de ahorro del mercado. 3% anual y sin comisiones. Lo recomiendo a todos.' },
  { id: 'tenpo-3', app: 'tenpo', appName: 'Tenpo', rating: 2, date: '2025-11-25', text: 'Muchos problemas para hacer transferencias al exterior. Llevo días esperando que se acredite el dinero.' },
  { id: 'tenpo-4', app: 'tenpo', appName: 'Tenpo', rating: 1, date: '2025-11-18', text: 'Me bloquearon la cuenta sin previo aviso. Atención al cliente pésima, solo responden por chat.' },
  { id: 'tenpo-5', app: 'tenpo', appName: 'Tenpo', rating: 5, date: '2025-11-10', text: 'Increíble app. Los pagos con QR son instantáneos y la interfaz es muy intuitiva.' },
  { id: 'tenpo-6', app: 'tenpo', appName: 'Tenpo', rating: 3, date: '2025-11-05', text: 'El soporte tarda mucho en responder. Para una fintech, esperaba mejor atención al cliente.' },
  { id: 'tenpo-7', app: 'tenpo', appName: 'Tenpo', rating: 4, date: '2025-10-30', text: 'Me gusta la transparencia en los cobros. Todo está muy claro desde el principio.' },
  { id: 'tenpo-8', app: 'tenpo', appName: 'Tenpo', rating: 2, date: '2025-10-22', text: 'La app se cae frecuentemente en horario pico. Ya es la tercera vez esta semana.' },
  { id: 'tenpo-9', app: 'tenpo', appName: 'Tenpo', rating: 5, date: '2025-10-15', text: 'Excelente experiencia. La verificación de identidad fue súper rápida, en menos de 5 minutos.' },
  { id: 'tenpo-10', app: 'tenpo', appName: 'Tenpo', rating: 4, date: '2025-10-08', text: 'Buenos beneficios y cashback. Podrían agregar más comercios afiliados.' },
  { id: 'tenpo-11', app: 'tenpo', appName: 'Tenpo', rating: 3, date: '2025-10-01', text: 'Buena para compras pero los retiros en cajero aún tienen comisión. Eso debería ser gratis.' },
  { id: 'tenpo-12', app: 'tenpo', appName: 'Tenpo', rating: 5, date: '2025-09-25', text: 'La mejor alternativa a los bancos tradicionales. Sin papeleos, sin filas, todo digital.' },
  { id: 'tenpo-13', app: 'tenpo', appName: 'Tenpo', rating: 4, date: '2025-09-18', text: 'App muy estable. Rara vez falla. Los pagos Bip! y del TAG son muy convenientes.' },
  { id: 'tenpo-14', app: 'tenpo', appName: 'Tenpo', rating: 2, date: '2025-09-10', text: 'Límites de transferencia muy bajos. No puedo usar la cuenta para pagos de monto mayor.' },
  { id: 'tenpo-15', app: 'tenpo', appName: 'Tenpo', rating: 5, date: '2025-09-05', text: 'Diseño hermoso y funcional. La mejor UX de todas las apps financieras de Chile.' },
  // Itaú Reviews
  { id: 'itau-1', app: 'itau', appName: 'Itaú Chile', rating: 3, date: '2025-12-07', text: 'App funcional pero le falta innovación. Los menús son confusos y están desactualizados.' },
  { id: 'itau-2', app: 'itau', appName: 'Itaú Chile', rating: 2, date: '2025-12-01', text: 'Problemas constantes con la autenticación. Me pide el token cada vez que abro la app.' },
  { id: 'itau-3', app: 'itau', appName: 'Itaú Chile', rating: 4, date: '2025-11-22', text: 'La app mejoró mucho después de la última actualización. Las transferencias son más rápidas.' },
  { id: 'itau-4', app: 'itau', appName: 'Itaú Chile', rating: 1, date: '2025-11-15', text: 'Pésimo. Llevo una semana sin poder ver mis movimientos. El error persiste aunque reinstale la app.' },
  { id: 'itau-5', app: 'itau', appName: 'Itaú Chile', rating: 5, date: '2025-11-08', text: 'Excelente servicio. Los ejecutivos en la app son muy atentos y resuelven rápido.' },
  { id: 'itau-6', app: 'itau', appName: 'Itaú Chile', rating: 3, date: '2025-11-01', text: 'La app tiene muchas funciones pero cuesta encontrarlas. Navegación mejorable.' },
  { id: 'itau-7', app: 'itau', appName: 'Itaú Chile', rating: 2, date: '2025-10-25', text: 'No entiendo por qué me cobran comisión por transferencias. En otros bancos es gratis.' },
  { id: 'itau-8', app: 'itau', appName: 'Itaú Chile', rating: 4, date: '2025-10-18', text: 'Buen sistema de notificaciones. Siempre me avisa de cada movimiento en tiempo real.' },
  { id: 'itau-9', app: 'itau', appName: 'Itaú Chile', rating: 3, date: '2025-10-10', text: 'App decente pero necesita más funciones digitales. Todavía hay trámites que requieren ir a la sucursal.' },
  { id: 'itau-10', app: 'itau', appName: 'Itaú Chile', rating: 1, date: '2025-10-03', text: 'La app se cuelga al abrir la sección de inversiones. Debo reinstalarla cada semana.' },
  { id: 'itau-11', app: 'itau', appName: 'Itaú Chile', rating: 5, date: '2025-09-25', text: 'Muy buena app después de la actualización. Rápida, intuitiva y completa.' },
  { id: 'itau-12', app: 'itau', appName: 'Itaú Chile', rating: 2, date: '2025-09-18', text: 'El login con biometría falla seguido. Tengo que ingresar la clave manualmente siempre.' },
  { id: 'itau-13', app: 'itau', appName: 'Itaú Chile', rating: 4, date: '2025-09-10', text: 'Me gusta la sección de préstamos. Todo el proceso es 100% digital y rápido.' },
  { id: 'itau-14', app: 'itau', appName: 'Itaú Chile', rating: 3, date: '2025-09-03', text: 'La app es básica comparada con la competencia. Le falta funcionalidades como pagos Bip! o tag.' },
  { id: 'itau-15', app: 'itau', appName: 'Itaú Chile', rating: 2, date: '2025-08-28', text: 'Atención al cliente muy lenta. Puse un reclamo y tardaron 5 días hábiles en responderme.' },
];
