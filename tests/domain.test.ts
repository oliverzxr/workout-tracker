import { describe, expect, it } from 'vitest';
import { initialSnapshot } from '../src/domain/catalog';
import { editWorkout, finishDraft, move, newDraft, parseLoad, parseSet, remaining, snapshotSchema, workoutExercise } from '../src/domain/model';
import { muscleTotals, progression, totals, weekStart, weekWorkouts } from '../src/domain/stats';

describe('registro de treino', () => {
  it.each([['12,5', 12500], ['12.5', 12500], [',125', 125], ['0', 0], [' 50,001 ', 50001]])('normaliza %s', (text, grams) => {
    expect(parseLoad(text)).toBe(grams);
  });

  it.each(['', '12kg', '1.200,50', '-1', '1e3', 'Infinity', 'NaN', '2001'])('rejeita %s', text => {
    expect(parseLoad(text)).toBeNull();
  });

  it('preserva casas decimais, RIR zero e posição ao editar', () => {
    const row = workoutExercise(initialSnapshot().exercises[0]!, 2);
    row.sets[0] = { id: 'one', kind: 'work', load: '12,125', reps: '10', rir: '0', completed: true };
    row.sets[1] = { id: 'two', kind: 'warmup', load: '6.5', reps: '10', rir: '', completed: true };
    row.sets = move(row.sets, 1, -1);
    const draft = newDraft('Treino', [row], new Date('2026-11-23T15:00:00Z'));
    const workout = finishDraft(draft, '2026-11-23T16:00:00.000Z')!;
    expect(workout.exercises[0]?.sets.map(set => [set.id, set.grams, set.rir])).toEqual([
      ['two', 6500, null], ['one', 12125, 0],
    ]);
    expect(finishDraft(editWorkout(workout), workout.finishedAt)).toEqual(workout);
  });

  it('impede concluir série inválida e guarda nomes temporariamente vazios em rascunhos', () => {
    const empty = { id: 'one', kind: 'work', load: '12,5', reps: '0', rir: '2', completed: true } as const;
    expect(parseSet(empty)).toBeNull();
    expect(finishDraft(newDraft('Treino'))).toBeNull();
    const snapshot = initialSnapshot();
    snapshot.draft = newDraft('   ');
    expect(snapshotSchema.parse(snapshot).draft?.name).toBe('   ');
  });

  it('conta o descanso pelo horário absoluto', () => {
    expect(remaining(12_000, 10_500)).toBe(2);
    expect(remaining(12_000, 15_000)).toBe(0);
  });
});

describe('estatísticas', () => {
  it('separa frequência, séries válidas e volume por grupo muscular', () => {
    const [first, second] = initialSnapshot().exercises;
    const chest = workoutExercise(first!, 2);
    chest.sets[0] = { id: 'one', kind: 'work', load: '40', reps: '10', rir: '1', completed: true };
    chest.sets[1] = { id: 'two', kind: 'warmup', load: '20', reps: '10', rir: '', completed: true };
    const leg = workoutExercise({ ...second!, muscle: 'quads' });
    leg.sets[0] = { id: 'three', kind: 'work', load: '55,5', reps: '8', rir: '', completed: true };
    const monday = new Date(2026, 10, 23, 12);
    const current = finishDraft(newDraft('A', [chest, leg], monday), new Date(2026, 10, 23, 13).toISOString())!;
    const previous = finishDraft(newDraft('B', [chest], new Date(2026, 10, 22, 23, 59)), monday.toISOString())!;
    expect(weekStart(monday).getHours()).toBe(0);
    expect(weekWorkouts([previous, current], monday)).toEqual([current]);
    expect(totals([current])).toEqual({ sessions: 1, sets: 2, volume: 844 });
    expect(muscleTotals([current])).toEqual([{ muscle: 'quads', sets: 1, volume: 444 }, { muscle: 'chest', sets: 1, volume: 400 }]);
    expect(progression([previous, current], chest.exerciseId).map(point => point.load)).toEqual([40, 40]);
  });
});
