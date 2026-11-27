import { emptyFitness, localDay } from '../fitness/model';
import type { Fitness, Food, Entry } from '../fitness/model';

function ago(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDay(date);
}

export function demoFitness(empty: boolean): Fitness {
  if (empty) return emptyFitness();
  const items: [name: string, kcal: number, protein: number, carbs: number, fat: number, mass: number, meal: Entry['meal']][] = [
    ['Iogurte natural integral', 61, 3.5, 4.7, 3.3, 170, 'Café da manhã'],
    ['Aveia em flocos', 389, 17, 66, 7, 45, 'Café da manhã'],
    ['Banana-prata', 98, 1.3, 26, 0.1, 100, 'Café da manhã'],
    ['Arroz integral cozido', 124, 2.6, 26, 1.0, 150, 'Almoço'],
    ['Feijão carioca cozido', 76, 4.8, 13.6, 0.5, 140, 'Almoço'],
    ['Peito de frango grelhado', 165, 31, 0, 3.6, 160, 'Almoço'],
    ['Abacate', 160, 2, 8.5, 14.7, 90, 'Lanche'],
  ];
  const foods = items.map(([name, kcal, protein, carbs, fat, serving], index): Food => ({
    id: 'demo-food-' + index, name, nutrition: { kcal, protein, carbs, fat }, serving, source: { kind: 'manual' },
  }));
  const entries = [0, 1, 3].flatMap(days => items.map((item, index): Entry => {
    const { name, nutrition, serving, source } = foods[index]!;
    return { id: 'demo-meal-' + days + '-' + index, date: ago(days), meal: item[6], grams: item[5], food: { name, nutrition, serving, source } };
  }));
  const observations = [79.7, 79.2, 79.5, 78.8, 79.1, 78.7, 78.3, 78.5].map((value, index) => ({
    id: 'demo-weight-' + index, date: ago(28 - index * 4), metricId: 'peso', value,
  }));
  return {
    version: 1, foods, entries, targets: { kcal: 2250, protein: 140, carbs: 260, fat: 70 },
    nextRoutineId: 'review-routine-0', measurements: [{ id: 'cintura-demo', name: 'Cintura' }],
    observations: [...observations, { id: 'demo-waist-1', date: ago(14), metricId: 'cintura-demo', value: 85.5 },
      { id: 'demo-waist-2', date: ago(0), metricId: 'cintura-demo', value: 84 }],
    objectives: [{ metricId: 'peso', target: 77 }],
  };
}
