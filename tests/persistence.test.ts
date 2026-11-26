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
    expect(fresh.data.exercises).toHaveLength(34);
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
