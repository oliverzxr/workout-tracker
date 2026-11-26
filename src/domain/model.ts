import { z } from 'zod';

export const muscles = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'calves', 'core', 'forearms'] as const;
export const equipment = ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'band', 'other'] as const;
export const setKinds = ['work', 'warmup'] as const;

const id = z.string().min(1).max(100);
const name = z.string().trim().min(1).max(80);
const instant = z.iso.datetime();
const rest = z.number().int().min(0).max(900);
const identity = z.object({ exerciseId: id, name, muscle: z.enum(muscles), rest });
const exercise = z.object({ id, name, muscle: z.enum(muscles), equipment: z.enum(equipment), rest, archived: z.boolean() });
const routineItem = z.object({ id, exerciseId: id, sets: z.number().int().min(1).max(20) });
const routine = z.object({ id, name, items: z.array(routineItem).min(1) });
const setBase = z.object({ id, kind: z.enum(setKinds) });
const draftSet = setBase.extend({
  load: z.string().max(20), reps: z.string().max(5), rir: z.string().max(5), completed: z.boolean(),
});
const savedSet = setBase.extend({
  grams: z.number().int().min(0).max(2_000_000),
  reps: z.number().int().min(1).max(999),
  rir: z.number().int().min(0).max(10).nullable(),
});
const draftExercise = identity.extend({ id, sets: z.array(draftSet) });
const savedExercise = identity.extend({ id, sets: z.array(savedSet).min(1) });
const workoutBase = z.object({ id, name, startedAt: instant });
const draft = workoutBase.extend({
  name: z.string().max(80),
  timer: z.object({ endAt: z.number().int().nonnegative(), duration: rest, exercise: name }).nullable(),
  exercises: z.array(draftExercise),
});
const workout = workoutBase.extend({
  finishedAt: instant,
  exercises: z.array(savedExercise).min(1),
}).refine(value => value.finishedAt >= value.startedAt);
const unique = <T extends { id: string }>(rows: T[]) => new Set(rows.map(row => row.id)).size === rows.length;
const safeDraft = draft.refine(value =>
  unique(value.exercises) && value.exercises.every(item =>
    unique(item.sets) && item.sets.every(set => !set.completed || parseSet(set) !== null),
  ),
);

export const snapshotSchema = z.object({
  version: z.literal(1),
  exercises: z.array(exercise),
  routines: z.array(routine),
  workouts: z.array(workout),
  draft: safeDraft.nullable(),
}).refine(data => {
  const ids = new Set(data.exercises.map(item => item.id));
  return unique(data.exercises) && unique(data.routines) && unique(data.workouts) &&
    data.routines.every(item => unique(item.items) && item.items.every(row => ids.has(row.exerciseId))) &&
    data.workouts.every(item => unique(item.exercises) && item.exercises.every(row => ids.has(row.exerciseId) && unique(row.sets))) &&
    (!data.draft || (!data.workouts.some(item => item.id === data.draft?.id) && data.draft.exercises.every(row => ids.has(row.exerciseId))));
});

export type Muscle = typeof muscles[number];
export type Equipment = typeof equipment[number];
export type Exercise = z.infer<typeof exercise>;
export type Routine = z.infer<typeof routine>;
export type DraftSet = z.infer<typeof draftSet>;
export type DraftExercise = z.infer<typeof draftExercise>;
export type Draft = z.infer<typeof draft>;
export type Workout = z.infer<typeof workout>;
export type SavedSet = z.infer<typeof savedSet>;
export type Snapshot = z.infer<typeof snapshotSchema>;

export const newId = () => crypto.randomUUID();

export function parseLoad(input: string): number | null {
  const text = input.trim();
  if (!/^(?:\d{1,4}(?:[.,]\d{1,3})?|[.,]\d{1,3})$/.test(text)) return null;
  const result = Number(text.replace(',', '.'));
  return Number.isFinite(result) && result <= 2000 ? Math.round(result * 1000) : null;
}

export function parseSet(set: DraftSet): SavedSet | null {
  const grams = parseLoad(set.load);
  const reps = /^\d{1,3}$/.test(set.reps.trim()) ? Number(set.reps) : 0;
  const rir = set.rir.trim() === '' ? null : /^\d{1,2}$/.test(set.rir.trim()) ? Number(set.rir) : Infinity;
  if (grams === null || reps < 1 || (rir !== null && rir > 10)) return null;
  return { id: set.id, kind: set.kind, grams, reps, rir };
}

export function emptySet(): DraftSet {
  return { id: newId(), kind: 'work', load: '', reps: '', rir: '', completed: false };
}

export function workoutExercise(exercise: Exercise, count = 1): DraftExercise {
  return {
    id: newId(), exerciseId: exercise.id, name: exercise.name, muscle: exercise.muscle, rest: exercise.rest,
    sets: Array.from({ length: count }, emptySet),
  };
}

export function newDraft(name: string, exercises: DraftExercise[] = [], now = new Date()): Draft {
  return { id: newId(), name, exercises, startedAt: now.toISOString(), timer: null };
}

export function finishDraft(value: Draft, finishedAt = new Date().toISOString()): Workout | null {
  if (value.exercises.some(item => item.sets.some(set => set.completed && !parseSet(set)))) return null;
  const exercises = value.exercises.flatMap(item => {
    const valid = item.sets.filter(set => set.completed).map(parseSet).filter(set => set !== null);
    return valid.length ? [{ ...item, sets: valid }] : [];
  });
  const result = workout.safeParse({ ...value, exercises, finishedAt });
  return result.success ? result.data : null;
}

export function editWorkout(value: Workout, inputLoad = (grams: number) => String(grams / 1000)): Draft {
  return {
    ...value, timer: null,
    exercises: value.exercises.map(item => ({
      ...item, sets: item.sets.map(set => ({
        id: set.id, kind: set.kind, load: inputLoad(set.grams),
        reps: String(set.reps), rir: set.rir === null ? '' : String(set.rir), completed: true,
      })),
    })),
  };
}

export function move<T>(items: T[], index: number, step: -1 | 1): T[] {
  const destination = index + step;
  if (index < 0 || index >= items.length || destination < 0 || destination >= items.length) return items;
  const reordered = [...items];
  const [row] = reordered.splice(index, 1);
  reordered.splice(destination, 0, row!);
  return reordered;
}

export function remaining(endAt: number, now = Date.now()): number {
  return Math.max(0, Math.ceil((endAt - now) / 1000));
}
