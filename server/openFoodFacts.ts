import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { barcodePattern, foodFromProduct } from '../src/fitness/openFoodFacts';
import type { FoodResult } from '../src/fitness/openFoodFacts';

const provider = 'https://world.openfoodfacts.org/';
const agent = 'WorkoutTracker/1.1 (https://github.com/oliverzxr/workout-tracker)';
const fields = 'code,product_name,product_name_pt,nutriments,serving_size,serving_quantity,quantity,product_quantity_unit';

export function productUrl(query: string) {
  if (barcodePattern.test(query)) {
    const url = new URL('api/v3/product/' + query + '.json', provider);
    url.searchParams.set('fields', fields);
    return url;
  }
  const url = new URL('https://search.openfoodfacts.org/search');
  const name = query.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  url.searchParams.set('q', 'countries:"en:brazil" ' + name);
  url.searchParams.set('page_size', '10');
  url.searchParams.set('langs', 'pt,en');
  url.searchParams.set('fields', fields + ',countries');
  return url;
}

export function openFoodFactsProxy(): Plugin {
  const cache = new Map<string, { expires: number; items: FoodResult[] }>();
  let nextSearch = 0;
  let nextBarcode = 0;
  function send(res: ServerResponse, status: number, value: unknown) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(value));
  }
  async function middleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
    const url = new URL(req.url ?? '/', 'http://local');
    if (!url.pathname.endsWith('/api/foods')) { next(); return; }
    if (req.method !== 'GET') { send(res, 405, { error: 'method' }); return; }
    const query = (url.searchParams.get('q') ?? '').trim();
    if (query.length < 2 || query.length > 80 || !/[\p{L}\p{N}]/u.test(query)) { send(res, 400, { error: 'query' }); return; }
    const key = query.toLocaleLowerCase('pt-BR');
    const now = Date.now();
    const cached = cache.get(key);
    if (cached && cached.expires > now) { send(res, 200, cached.items); return; }
    const barcode = barcodePattern.test(query);
    if (now < (barcode ? nextBarcode : nextSearch)) { send(res, 429, { error: 'rate' }); return; }
    if (barcode) nextBarcode = now + 650;
    else nextSearch = now + 6500;
    try {
      const response = await fetch(productUrl(query), {
        headers: { 'User-Agent': agent, Accept: 'application/json' },
        signal: AbortSignal.timeout(7000),
      });
      if (response.status === 404 && barcode) { send(res, 200, []); return; }
      if (!response.ok) { send(res, response.status === 429 ? 429 : 502, { error: 'upstream' }); return; }
      const payload = await response.json() as { product?: unknown; hits?: { countries?: string[] }[] };
      const items = (barcode ? [payload.product] : (Array.isArray(payload.hits) ? payload.hits.filter(hit => Array.isArray(hit.countries) && hit.countries.includes('en:brazil')) : []))
        .flatMap(item => {
          const result = foodFromProduct(item);
          return result ? [{ ...result, lookup: !barcode && !result.food }] : [];
        });
      const unique = [...new Map(items.map(item => [item.barcode, item])).values()];
      if (cache.size >= 48) cache.delete(cache.keys().next().value!);
      cache.set(key, { items: unique, expires: now + 5 * 60_000 });
      send(res, 200, unique);
    } catch {
      send(res, 502, { error: 'upstream' });
    }
  }
  return {
    name: 'open-food-facts-proxy',
    configureServer(server) { server.middlewares.use((req, res, next) => { void middleware(req, res, next); }); },
    configurePreviewServer(server) { server.middlewares.use((req, res, next) => { void middleware(req, res, next); }); },
  };
}
