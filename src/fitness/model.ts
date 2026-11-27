import { z } from 'zod';

export const nutrients = ['kcal', 'protein', 'carbs', 'fat'] as const;
export const nutrientNames = { kcal: 'Calorias', protein: 'Proteínas', carbs: 'Carboidratos', fat: 'Gorduras' };
export const meals = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia'] as const;

const id = z.string().min(1).max(120);
const label = z.string().trim().min(1).max(100);
const date = z.iso.date();
const grams = z.number().positive().max(20_000);
const metricValue = z.number().positive().max(1_000);
export const nutritionSchema = z.strictObject({
  kcal: z.number().min(0).max(10_000), protein: z.number().min(0).max(1_000),
  carbs: z.number().min(0).max(1_000), fat: z.number().min(0).max(1_000),
});
const foodDetails = z.strictObject({
  name: label,
  nutrition: nutritionSchema,
  serving: grams.nullable(),
  source: z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('manual') }),
    z.strictObject({ kind: z.literal('off'), barcode: z.string().regex(/^\d{8,14}$/) }),
  ]),
});
const food = foodDetails.extend({ id });
const entry = z.strictObject({
  id, date, meal: z.enum(meals), food: foodDetails, grams,
});
const measure = z.strictObject({ id: id.refine(value => value !== 'peso'), name: label });
const measureEntry = z.strictObject({ id, date, metricId: id, value: metricValue });
export const fitnessSchema = z.strictObject({
  version: z.literal(1),
  foods: z.array(food),
  entries: z.array(entry),
  targets: nutritionSchema.nullable(),
  measurements: z.array(measure),
  observations: z.array(measureEntry),
  objectives: z.array(z.strictObject({ metricId: id, target: metricValue })),
  nextRoutineId: id.nullable(),
}).superRefine((value, ctx) => {
  const metrics = new Set(['peso', ...value.measurements.map(metric => metric.id)]);
  const unique = [
    value.foods.map(item => item.id), value.entries.map(item => item.id),
    value.measurements.map(item => item.id), value.observations.map(item => item.id),
    value.observations.map(item => item.metricId + ':' + item.date), value.objectives.map(item => item.metricId),
  ];
  if (unique.some(values => new Set(values).size !== values.length)
    || [...value.observations, ...value.objectives].some(item => !metrics.has(item.metricId))) {
    ctx.addIssue({ code: 'custom', message: 'Dados duplicados ou medidas inexistentes.' });
  }
});

export type Nutrition = z.infer<typeof nutritionSchema>;
export type FoodDetails = z.infer<typeof foodDetails>;
export type Food = z.infer<typeof food>;
export type Entry = z.infer<typeof entry>;
export type MetricEntry = z.infer<typeof measureEntry>;
export type Fitness = z.infer<typeof fitnessSchema>;

export const emptyFitness = (): Fitness => ({
  version: 1, foods: [], entries: [], targets: null, measurements: [], observations: [], objectives: [], nextRoutineId: null,
});

export function localDay(now = new Date()) {
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((part, i) => String(part).padStart(i === 0 ? 4 : 2, '0')).join('-');
}

export function decimal(value: string) {
  const normalized = value.trim().replace(',', '.');
  return /^\d+(?:\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}

export function portionGrams(amount: number, unit: 'g' | 'serving', serving: number | null) {
  const total = unit === 'g' ? amount : serving === null ? NaN : amount * serving;
  return grams.safeParse(total);
}

export function nutritionFrom(form: FormData) {
  return nutritionSchema.safeParse(Object.fromEntries(nutrients.map(key => [key, decimal(String(form.get(key) ?? ''))])));
}

export function dayTotals(entries: Entry[]): Nutrition {
  const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
  for (const item of entries) {
    for (const key of nutrients) totals[key] += item.food.nutrition[key] * item.grams / 100;
  }
  return totals;
}

export function recordMeasurement(data: Fitness, observation: MetricEntry): Fitness {
  const kept = data.observations.filter(item => item.id !== observation.id
    && (item.metricId !== observation.metricId || item.date !== observation.date));
  return { ...data, observations: [...kept, observation] };
}

export function measureTrend(entries: MetricEntry[], metricId: string) {
  const points = entries.filter(item => item.metricId === metricId).sort((a, b) => a.date.localeCompare(b.date));
  let left = 0;
  let total = 0;
  return points.map((point, i) => {
    total += point.value;
    while (+new Date(point.date) - +new Date(points[left]!.date) > 6 * 86_400_000) total -= points[left++]!.value;
    return { ...point, average: total / (i - left + 1) };
  });
}

export const fitnessBackup = (data: Fitness) => JSON.stringify({ format: 'workout-tracker-fitness', data }, null, 2);
export function readFitnessBackup(raw: string) {
  return z.strictObject({ format: z.literal('workout-tracker-fitness'), data: fitnessSchema }).parse(JSON.parse(raw)).data;
}
