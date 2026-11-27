import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { IndexedTrackerRepository, WriteConflict } from '../src/data/repository';
import { dayTotals, emptyFitness, fitnessBackup, localDay, measureTrend, portionGrams, readFitnessBackup, recordMeasurement } from '../src/fitness/model';
import type { Entry, Fitness } from '../src/fitness/model';
import { foodFromProduct } from '../src/fitness/openFoodFacts';
import { LocalFitnessRepository } from '../src/fitness/repository';
import { productUrl } from '../server/openFoodFacts';

describe('nutrição local', () => {
  const food: Entry['food'] = { name: 'Pão integral', serving: 50, source: { kind: 'manual' }, nutrition: { kcal: 250, protein: 10, carbs: 42, fat: 4 } };

  it('converte porções em massa e soma usando a composição de 100 g', () => {
    expect(portionGrams(1.5, 'serving', food.serving)).toMatchObject({ success: true, data: 75 });
    expect(portionGrams(1, 'serving', null).success).toBe(false);
    expect(portionGrams(0, 'g', null).success).toBe(false);
    expect(dayTotals([{ id: 'a', date: localDay(), meal: 'Lanche', food, grams: 75 }])).toEqual({ kcal: 187.5, protein: 7.5, carbs: 31.5, fat: 3 });
  });

  it('aceita zero declarado, rejeita rótulos incompletos e não converte ml em g', () => {
    const product = { code: '7891000100103', product_name_pt: 'Produto', serving_size: '20 g', serving_quantity: 20 };
    expect(foodFromProduct({ ...product, nutriments: { 'energy-kcal_100g': 320 } })?.food).toBeNull();
    const nutriments = { 'energy-kcal_100g': '320', proteins_100g: 7, carbohydrates_100g: 50, fat_100g: 0 };
    expect(foodFromProduct({ ...product, nutriments })?.food).toMatchObject({ nutrition: { fat: 0 }, serving: 20 });
    expect(foodFromProduct({ ...product, nutriments, quantity: '500 ml' })?.food).toBeNull();
    expect(foodFromProduct({ ...product, nutriments, serving_size: '20 ml' })?.food?.serving).toBeNull();
  });

  it('define a origem do provedor e limita a busca nominal a produtos do Brasil', () => {
    const url = productUrl('queijo & aveia');
    expect(url.hostname).toBe('search.openfoodfacts.org');
    expect(url.searchParams.get('q')).toBe('countries:"en:brazil" queijo aveia');
    expect(productUrl('7891000100103').pathname).toBe('/api/v3/product/7891000100103.json');
  });
});

describe('evolução e persistência', () => {
  it('calcula a média de sete dias por data, sem interpolar dias ausentes', () => {
    const values = [
      { id: 'a', date: '2026-11-20', metricId: 'peso', value: 80 },
      { id: 'b', date: '2026-11-24', metricId: 'peso', value: 78 },
      { id: 'c', date: '2026-11-27', metricId: 'peso', value: 77 },
    ];
    expect(measureTrend(values, 'peso').map(item => item.average)).toEqual([80, 79, 77.5]);
    const edited = recordMeasurement({ ...emptyFitness(), observations: values }, { ...values[2]!, id: 'd', value: 76 });
    expect(edited.observations).toHaveLength(3);
    expect(measureTrend(edited.observations, 'peso').at(-1)?.average).toBe(77);
  });

  it('preserva o backup novo, rejeita referências inválidas e não altera o armazenamento de treino', async () => {
    const prefix = 'fitness-test-' + crypto.randomUUID();
    const fitness = new LocalFitnessRepository(prefix + '-corpo');
    const other = new LocalFitnessRepository(prefix + '-corpo');
    const training = new IndexedTrackerRepository(prefix + '-treino');
    try {
      const before = await training.read();
      const data: Fitness = { ...emptyFitness(), observations: [{ id: 'x', date: '2026-11-27', metricId: 'peso', value: 79.5 }] };
      expect(readFitnessBackup(fitnessBackup(data))).toEqual(data);
      expect(() => readFitnessBackup(fitnessBackup({ ...data, objectives: [{ metricId: 'desconhecida', target: 10 }] }))).toThrow();
      expect(await fitness.save(data, 0)).toBe(1);
      await expect(other.save(emptyFitness(), 0)).rejects.toBeInstanceOf(WriteConflict);
      expect(await other.read()).toEqual({ revision: 1, data });
      expect(await training.read()).toEqual(before);
    } finally { await Promise.all([training.close(), fitness.close(), other.close()]); }
  });
});
