import { snapshotSchema } from '../domain/model';
import type { Snapshot, Workout } from '../domain/model';

export function exportBackup(data: Snapshot) {
  return JSON.stringify({ format: 'workout-tracker-backup', data }, null, 2);
}

export function importBackup(text: string): Snapshot {
  const object: unknown = JSON.parse(text);
  if (!object || typeof object !== 'object' || !('format' in object) || object.format !== 'workout-tracker-backup' || !('data' in object)) {
    throw new Error('Invalid backup');
  }
  return snapshotSchema.parse(object.data);
}

function quote(value: string | number) {
  const text = typeof value === 'string' && /^[\s\uFEFF]*[=+@-]/.test(value) ? "'" + value : String(value);
  return '"' + text.replaceAll('"', '""') + '"';
}

export function exportCsv(workouts: Workout[], headings: string[], kinds: { warmup: string; work: string }) {
  const rows = workouts.flatMap(workout => workout.exercises.flatMap(exercise => exercise.sets.map((set, index) => [
    workout.id, workout.name, workout.startedAt, workout.finishedAt, exercise.name, index + 1,
    kinds[set.kind], set.grams / 1000, set.reps, set.rir ?? '',
  ])));
  return '\uFEFF' + [headings, ...rows].map(row => row.map(quote).join(',')).join('\r\n');
}

export function download(content: string, fileName: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
