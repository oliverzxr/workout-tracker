import { initialSnapshot } from '../domain/catalog';
import type { StoredTracker, TrackerRepository } from '../data/repository';
import { finishDraft, newDraft, workoutExercise } from '../domain/model';
import type { DraftSet, Routine, Snapshot } from '../domain/model';
import { weekStart } from '../domain/stats';
import { formatInputLoad } from '../app/pt-BR';

const plans: ReadonlyArray<{ name: string; movements: ReadonlyArray<readonly [string, number, number, number]> }> = [
  { name: 'Superior A', movements: [['bench', 3, 62.5, 8], ['cable-row', 3, 47.5, 10], ['incline-db', 3, 22, 10], ['lateral', 3, 8, 15], ['pushdown', 2, 25, 12]] },
  { name: 'Inferior A', movements: [['squat', 3, 82.5, 6], ['rdl', 3, 70, 8], ['leg-press', 3, 140, 10], ['leg-curl', 3, 35, 12], ['calf', 3, 55, 14]] },
  { name: 'Superior B', movements: [['pulldown', 3, 52.5, 10], ['db-press', 3, 20, 10], ['one-arm-row', 3, 26, 10], ['fly', 2, 12.5, 12], ['hammer', 3, 14, 12]] },
];

function set(row: DraftSet, load: number, reps: number, rir: number | null, kind: DraftSet['kind'] = 'work'): DraftSet {
  return { ...row, kind, load: formatInputLoad(load * 1000), reps: String(reps), rir: rir === null ? '' : String(rir), completed: true };
}

const exerciseId = (slug: string) => 'catalog:' + slug;

export function demoSnapshot(mode: 'empty' | 'active' | 'filled', now = new Date()): Snapshot {
  const data = initialSnapshot();
  if (mode === 'empty') return data;

  const find = (slug: string) => data.exercises.find(item => item.id === exerciseId(slug))!;
  data.routines = plans.map((plan, index): Routine => ({
    id: 'review-routine-' + index, name: plan.name,
    items: plan.movements.map(([slug, sets], order) => ({ id: 'review-slot-' + index + '-' + order, exerciseId: exerciseId(slug), sets })),
  }));

  const monday = weekStart(now);
  for (let week = -4; week <= 0; week++) {
    plans.forEach((plan, index) => {
      const start = new Date(monday);
      start.setDate(monday.getDate() + 7 * week + 2 * index);
      start.setHours(18 + index % 2, 10 + index * 7, 0, 0);
      if (start.getTime() > now.getTime() - 75 * 60_000) {
        if (week !== 0 || index > 0) return;
        start.setTime(now.getTime() - 90 * 60_000);
      }
      const entries = plan.movements.map(([slug, count, load, reps], position) => {
        const entry = workoutExercise(find(slug), count + (position === 0 ? 1 : 0));
        const workLoad = Math.max(4, load + week * (position === 0 ? 2.5 : 1.25));
        entry.sets = entry.sets.map((row, setIndex) => position === 0 && setIndex === 0
          ? set(row, Math.round(workLoad / 2 / 2.5) * 2.5, 10, null, 'warmup')
          : set(row, workLoad, Math.max(5, reps - (setIndex === 3 ? 1 : 0)), Math.max(1, 3 - setIndex)));
        return entry;
      });
      const draft = newDraft(plan.name, entries, start);
      const end = new Date(start.getTime() + (52 + index * 5) * 60_000);
      const workout = finishDraft({ ...draft, id: 'review-workout-' + week + '-' + index }, end.toISOString());
      if (workout) data.workouts.push(workout);
    });
  }

  if (mode === 'active') {
    const plan = plans[0]!;
    const entries = plan.movements.map(([slug, count], index) => workoutExercise(find(slug), count + (index === 0 ? 1 : 0)));
    const first = entries[0]!;
    first.sets[0] = set(first.sets[0]!, 35, 10, null, 'warmup');
    first.sets[1] = set(first.sets[1]!, 65, 8, 2);
    first.sets[2] = { ...first.sets[2]!, load: '65', reps: '8', rir: '2' };
    data.draft = {
      ...newDraft(plan.name, entries, new Date(now.getTime() - 12 * 60_000)),
      timer: { endAt: now.getTime() + 82_000, duration: 120, exercise: first.name },
    };
  }
  return data;
}

export class DemoRepository implements TrackerRepository {
  private revision = 0;
  constructor(private data: Snapshot) {}
  async read(): Promise<StoredTracker> {
    return { data: this.data, revision: this.revision };
  }
  async save(data: Snapshot, expectedRevision: number): Promise<number> {
    if (expectedRevision !== this.revision) throw new Error('Revisão demonstrativa inválida');
    this.data = data;
    return ++this.revision;
  }
}
