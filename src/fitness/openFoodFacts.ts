import { nutritionSchema } from './model';
import type { FoodDetails } from './model';

export type FoodResult = { barcode: string; name: string; food: FoodDetails | null; lookup?: boolean };
export const barcodePattern = /^\d{8,14}$/;

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function number(value: unknown) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return NaN;
}

export function foodFromProduct(raw: unknown): FoodResult | null {
  const product = record(raw);
  const barcode = String(product.code ?? product._id ?? '');
  const name = [product.product_name_pt, product.product_name].find(
    (value): value is string => typeof value === 'string' && Boolean(value.trim()),
  )?.trim().slice(0, 100);
  if (!barcodePattern.test(barcode) || !name) return null;
  const values = record(product.nutriments);
  const nutrition = nutritionSchema.safeParse({
    kcal: number(values['energy-kcal_100g']), protein: number(values.proteins_100g),
    carbs: number(values.carbohydrates_100g), fat: number(values.fat_100g),
  });
  const serving = number(product.serving_quantity);
  // Open Food Facts normaliza serving_quantity em g ou ml. O diário atual mede massa.
  const reportedServing = String(product.serving_size ?? '');
  const servingInGrams = /(?:^|[\s\d])g\b/i.test(reportedServing)
    && !/\bml\b/i.test(reportedServing)
    && serving > 0 && serving <= 20_000;
  const liquid = product.product_quantity_unit === 'ml'
    || (typeof product.quantity === 'string' && /\d\s*(?:ml|l)\b/i.test(product.quantity));
  return { barcode, name, food: nutrition.success && !liquid ? {
    name, nutrition: nutrition.data, serving: servingInGrams ? serving : null, source: { kind: 'off', barcode },
  } : null };
}

export async function searchFoods(query: string) {
  const endpoint = new URL(import.meta.env.BASE_URL + 'api/foods', location.href);
  endpoint.searchParams.set('q', query.trim());
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(9000) });
  if (!response.ok) throw new Error('Falha na busca');
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Resposta inválida');
  return data as FoodResult[];
}
