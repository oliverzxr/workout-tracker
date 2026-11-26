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
  ['db-bench', 'Supino com halteres', 'chest', 'dumbbell', 120],
  ['db-fly', 'Crucifixo com halteres', 'chest', 'dumbbell', 75],
  ['decline-bench', 'Supino declinado com barra', 'chest', 'barbell', 120],
  ['incline-bench', 'Supino inclinado com barra', 'chest', 'barbell', 120],
  ['machine-fly', 'Crucifixo na máquina', 'chest', 'machine', 75],
  ['cable-press', 'Supino em pé no cabo', 'chest', 'cable', 75],
  ['chinup', 'Barra fixa supinada', 'back', 'bodyweight', 120],
  ['tbar-row', 'Remada cavalinho', 'back', 'barbell', 120],
  ['machine-row', 'Remada na máquina', 'back', 'machine', 90],
  ['straight-arm-pulldown', 'Pullover no cabo', 'back', 'cable', 75],
  ['front-raise', 'Elevação frontal', 'shoulders', 'dumbbell', 60],
  ['arnold', 'Desenvolvimento Arnold', 'shoulders', 'dumbbell', 90],
  ['rear-delt-cable', 'Crucifixo inverso no cabo', 'shoulders', 'cable', 75],
  ['face-pull', 'Puxada para o rosto', 'shoulders', 'cable', 75],
  ['db-curl', 'Rosca alternada', 'biceps', 'dumbbell', 75],
  ['incline-curl', 'Rosca inclinada', 'biceps', 'dumbbell', 75],
  ['concentration-curl', 'Rosca concentrada', 'biceps', 'dumbbell', 75],
  ['cable-curl', 'Rosca no cabo', 'biceps', 'cable', 75],
  ['lying-triceps', 'Tríceps testa', 'triceps', 'barbell', 75],
  ['cable-overhead', 'Tríceps acima da cabeça no cabo', 'triceps', 'cable', 75],
  ['bench-dip', 'Mergulho no banco', 'triceps', 'bodyweight', 75],
  ['triceps-dip', 'Mergulho nas paralelas', 'triceps', 'bodyweight', 90],
  ['front-squat', 'Agachamento frontal', 'quads', 'barbell', 150],
  ['hack-squat', 'Agachamento no hack', 'quads', 'machine', 120],
  ['leg-press-horizontal', 'Leg press horizontal', 'quads', 'machine', 120],
  ['lunge', 'Afundo com halteres', 'quads', 'dumbbell', 90],
  ['step-up', 'Subida no caixote', 'quads', 'dumbbell', 90],
  ['seated-leg-curl', 'Cadeira flexora', 'hamstrings', 'machine', 75],
  ['single-leg-rdl', 'Terra romeno unilateral', 'hamstrings', 'dumbbell', 90],
  ['good-morning', 'Bom dia com barra', 'hamstrings', 'barbell', 90],
  ['deadlift', 'Levantamento terra convencional', 'glutes', 'barbell', 150],
  ['glute-bridge', 'Ponte de glúteos no solo', 'glutes', 'bodyweight', 75],
  ['cable-kickback', 'Extensão de quadril no cabo', 'glutes', 'cable', 75],
  ['sumo-deadlift', 'Levantamento terra sumô', 'glutes', 'barbell', 150],
  ['calf-db', 'Panturrilha em pé com halteres', 'calves', 'dumbbell', 75],
  ['leg-press-calf', 'Panturrilha no leg press', 'calves', 'machine', 75],
  ['shoulder-tap', 'Prancha com toque no ombro', 'core', 'bodyweight', 60],
  ['oblique-crunch', 'Abdominal oblíquo cruzado', 'core', 'bodyweight', 60],
  ['cable-crunch', 'Abdominal na polia', 'core', 'cable', 60],
  ['dead-bug', 'Abdominal dead bug', 'core', 'bodyweight', 60],
  ['reverse-curl', 'Rosca inversa', 'forearms', 'barbell', 75],
  ['wrist-extension', 'Extensão de punhos', 'forearms', 'dumbbell', 60],
];

function catalogExercises(): Exercise[] {
  return rows.map(([slug, name, muscle, equipment, rest]): Exercise => ({
    id: 'catalog:' + slug, name, muscle, equipment, rest, archived: false,
  }));
}

export function initialSnapshot(): Snapshot {
  return { version: 1, exercises: catalogExercises(), routines: [], workouts: [], draft: null };
}

export function withBundledExercises(snapshot: Snapshot): Snapshot {
  const existing = new Set(snapshot.exercises.map(item => item.id));
  const missing = catalogExercises().filter(item => !existing.has(item.id));
  return missing.length ? { ...snapshot, exercises: [...snapshot.exercises, ...missing] } : snapshot;
}
