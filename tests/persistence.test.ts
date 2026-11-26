import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { exportBackup, exportCsv, importBackup } from '../src/data/export';
import { IndexedTrackerRepository, WriteConflict } from '../src/data/repository';
import { initialSnapshot } from '../src/domain/catalog';
import { finishDraft, newDraft, workoutExercise } from '../src/domain/model';

describe('persistência IndexedDB', () => {
  it('semeia o catálogo, guarda o rascunho e recupera campos e cronômetro em nova conexão', async () => {
    const key = 'test-' + crypto.randomUUID();
    const repo = new IndexedTrackerRepository(key);
    const fresh = await repo.read();
    expect(fresh.data.exercises).toHaveLength(76);
    const exercise = workoutExercise(fresh.data.exercises[0]!);
    exercise.sets[0]!.load = '12,';
    const draft = { ...newDraft('Pernas', [exercise]), timer: { exercise: exercise.name, endAt: 30000, duration: 30 } };
    expect(await repo.save({ ...fresh.data, draft }, fresh.revision)).toBe(1);
    await repo.close();
    const reopened = new IndexedTrackerRepository(key);
    expect((await reopened.read()).data.draft).toEqual(draft);
    await reopened.close();
  });

  it('rejeita edição concorrente sem sobrescrever a revisão salva em outra aba', async () => {
    const key = 'test-' + crypto.randomUUID();
    const first = new IndexedTrackerRepository(key);
    const second = new IndexedTrackerRepository(key);
    const [a, b] = await Promise.all([first.read(), second.read()]);
    const winner = newDraft('Treino A');
    await first.save({ ...a.data, draft: winner }, a.revision);
    await expect(second.save({ ...b.data, draft: newDraft('Treino B') }, b.revision)).rejects.toBeInstanceOf(WriteConflict);
    expect((await second.read()).data.draft).toEqual(winner);
    await Promise.all([first.close(), second.close()]);
  });
});

describe('preservação do catálogo anterior', () => {
  it('acrescenta movimentos sem sobrescrever edições, rotinas, histórico ou rascunhos', async () => {
    const key = 'test-' + crypto.randomUUID();
    const repo = new IndexedTrackerRepository(key);
    const other = new IndexedTrackerRepository(key);
    const first = await repo.read();
    const legacy = { ...first.data, exercises: first.data.exercises.slice(0, 34) };
    const edited = { ...legacy.exercises[0]!, name: 'Supino da academia', rest: 180, archived: true };
    legacy.exercises[0] = edited;
    legacy.exercises.push({ ...edited, id: 'personal', name: 'Exercício pessoal', archived: false });
    const row = workoutExercise(edited);
    row.sets[0] = { id: 'a', kind: 'work', load: '65,5', reps: '6', rir: '2', completed: true };
    legacy.routines = [{ id: 'rotina', name: 'A', items: [{ id: 'item', exerciseId: edited.id, sets: 3 }] }];
    legacy.draft = newDraft('Rascunho A', [row]);
    legacy.workouts = [finishDraft(newDraft('Treino A', [row]))!];
    await repo.save(legacy, first.revision);
    const [migrated, concurrent] = await Promise.all([repo.read(), other.read()]);
    expect(concurrent).toEqual(migrated);
    expect(migrated.revision).toBe(2);
    expect(await repo.read()).toEqual(migrated);
    expect(migrated.data.exercises).toHaveLength(77);
    expect(migrated.data.exercises.slice(0, 35)).toEqual(legacy.exercises);
    expect(migrated.data.routines).toEqual(legacy.routines);
    expect(migrated.data.workouts).toEqual(legacy.workouts);
    expect(migrated.data.draft).toEqual(legacy.draft);
    expect(importBackup(exportBackup(legacy))).toEqual(migrated.data);
    await Promise.all([repo.close(), other.close()]);
  });
});
describe('arquivos de exportação', () => {
  it('valida versão e referências antes de restaurar', () => {
    const snapshot = initialSnapshot();
    expect(importBackup(exportBackup(snapshot))).toEqual(snapshot);
    expect(() => importBackup(exportBackup({ ...snapshot, routines: [{ id: 'a', name: 'Rotina', items: [{ id: 'b', exerciseId: 'missing', sets: 3 }] }] }))).toThrow();
    expect(() => importBackup('{"format":"workout-tracker-backup","data":{"version":2}}')).toThrow();
    expect(() => importBackup('{')).toThrow();
  });

  it('escapa aspas, quebras de linha e fórmulas ao exportar para planilha', () => {
    const item = workoutExercise(initialSnapshot().exercises[0]!);
    item.sets[0] = { id: 'a', kind: 'work', load: '12,5', reps: '10', rir: '', completed: true };
    const workout = finishDraft(newDraft('=HYPERLINK("x")\nA', [item]))!;
    const csv = exportCsv([workout], ['id', 'treino'], { work: 'Válida', warmup: 'Aquecimento' });
    expect(csv).toContain("'=HYPERLINK(\"\"x\"\")\nA");
    expect(csv).toContain('"12.5","10",""');
  });
});
