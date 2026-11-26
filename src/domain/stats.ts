import type { Muscle, Workout } from './model';

export function validSets(workout: Workout) {
  return workout.exercises.flatMap(item => item.sets
    .filter(set => set.kind === 'work')
    .map(set => ({ ...set, muscle: item.muscle, exerciseId: item.exerciseId })));
}

export function totals(workouts: Workout[]) {
  const sets = workouts.flatMap(validSets);
  return { sessions: workouts.length, sets: sets.length, volume: sets.reduce((total, set) => total + set.grams * set.reps, 0) / 1000 };
}

export function muscleTotals(workouts: Workout[]) {
  const byMuscle = new Map<Muscle, { sets: number; volume: number }>();
  for (const set of workouts.flatMap(validSets)) {
    const previous = byMuscle.get(set.muscle) ?? { sets: 0, volume: 0 };
    byMuscle.set(set.muscle, { sets: previous.sets + 1, volume: previous.volume + set.grams * set.reps });
  }
  return [...byMuscle].map(([muscle, value]) => ({ muscle, sets: value.sets, volume: value.volume / 1000 }))
    .sort((a, b) => b.sets - a.sets || b.volume - a.volume);
}

export function weekStart(date = new Date(), offset = 0) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - (start.getDay() + 6) % 7 + offset * 7);
  return start;
}

export function weekWorkouts(workouts: Workout[], date = new Date(), offset = 0) {
  const start = weekStart(date, offset);
  const end = weekStart(date, offset + 1);
  return workouts.filter(workout => {
    const day = new Date(workout.startedAt);
    return day >= start && day < end;
  });
}

export function progression(workouts: Workout[], exerciseId: string) {
  return [...workouts].sort((a, b) => a.startedAt.localeCompare(b.startedAt)).flatMap(workout => {
    const sets = validSets(workout).filter(set => set.exerciseId === exerciseId);
    if (!sets.length) return [];
    return [{
      id: workout.id,
      date: workout.startedAt,
      load: Math.max(...sets.map(set => set.grams)) / 1000,
      volume: sets.reduce((total, set) => total + set.grams * set.reps, 0) / 1000,
    }];
  });
}
