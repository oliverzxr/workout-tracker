import type { Equipment, Exercise, Muscle, Snapshot } from './model';

const rows: [string, string, Muscle, Equipment, number][] = [
  ['bench', 'Supino reto', 'chest', 'barbell', 120],
  ['incline-db', 'Supino inclinado com halteres', 'chest', 'dumbbell', 120],
  ['machine-press', 'Supino na máquina', 'chest', 'machine', 90],
  ['fly', 'Crucifixo no cabo', 'chest', 'cable', 75],
  ['pushup', 'Flexão de braços', 'chest', 'bodyweight', 75],
  ['pullup', 'Barra fixa', 'back', 'bodyweight', 120],
  ['pulldown', 'Puxada alta', 'back', 'cable', 90],
  ['row', 'Remada curvada', 'back', 'barbell', 120],
  ['cable-row', 'Remada baixa', 'back', 'cable', 90],
  ['one-arm-row', 'Remada unilateral', 'back', 'dumbbell', 90],
  ['ohp', 'Desenvolvimento militar', 'shoulders', 'barbell', 120],
  ['db-press', 'Desenvolvimento com halteres', 'shoulders', 'dumbbell', 90],
  ['lateral', 'Elevação lateral', 'shoulders', 'dumbbell', 60],
  ['reverse-fly', 'Crucifixo inverso', 'shoulders', 'machine', 75],
  ['curl', 'Rosca direta', 'biceps', 'barbell', 75],
  ['hammer', 'Rosca martelo', 'biceps', 'dumbbell', 75],
  ['preacher', 'Rosca Scott', 'biceps', 'machine', 75],
  ['pushdown', 'Tríceps na polia', 'triceps', 'cable', 75],
  ['overhead-triceps', 'Tríceps francês', 'triceps', 'dumbbell', 75],
  ['close-bench', 'Supino com pegada fechada', 'triceps', 'barbell', 120],
  ['squat', 'Agachamento livre', 'quads', 'barbell', 150],
  ['leg-press', 'Leg press', 'quads', 'machine', 120],
  ['extension', 'Cadeira extensora', 'quads', 'machine', 75],
  ['goblet', 'Agachamento goblet', 'quads', 'kettlebell', 90],
  ['rdl', 'Terra romeno', 'hamstrings', 'barbell', 120],
  ['leg-curl', 'Mesa flexora', 'hamstrings', 'machine', 75],
  ['hip-thrust', 'Elevação pélvica', 'glutes', 'barbell', 120],
  ['split-squat', 'Agachamento búlgaro', 'glutes', 'dumbbell', 90],
  ['abduction', 'Abdução de quadril', 'glutes', 'band', 60],
  ['calf', 'Panturrilha em pé', 'calves', 'machine', 75],
  ['seated-calf', 'Panturrilha sentada', 'calves', 'machine', 75],
  ['crunch', 'Abdominal no solo', 'core', 'bodyweight', 45],
  ['leg-raise', 'Elevação de pernas', 'core', 'bodyweight', 60],
  ['wrist-curl', 'Flexão de punhos', 'forearms', 'dumbbell', 60],
];

export function initialSnapshot(): Snapshot {
  const exercises = rows.map(([slug, name, muscle, equipment, rest]): Exercise => ({
    id: 'catalog:' + slug, name, muscle, equipment, rest, archived: false,
  }));
  return { version: 1, exercises, routines: [], workouts: [], draft: null };
}
