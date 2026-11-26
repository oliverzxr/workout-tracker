import type { Equipment, Exercise, Muscle } from '../domain/model';

type Profile = { aliases: readonly string[]; secondary: readonly Muscle[] };

const profiles: Record<string, Profile> = {
  'catalog:bench': { aliases: ["Supino plano","Supino reto com barra","Bench press"], secondary: ["shoulders","triceps"] },
  'catalog:incline-db': { aliases: ["Supino inclinado","Incline dumbbell press"], secondary: ["shoulders","triceps"] },
  'catalog:machine-press': { aliases: ["Chest press","Supino sentado","Press de peito"], secondary: ["triceps","shoulders"] },
  'catalog:fly': { aliases: ["Crossover","Crucifixo na polia","Cable fly"], secondary: ["shoulders"] },
  'catalog:pushup': { aliases: ["Flexão de braço","Apoio","Push-up","Flexão no chão"], secondary: ["triceps","shoulders","core"] },
  'catalog:pullup': { aliases: ["Pull-up","Barra fixa pronada","Barra pronada"], secondary: ["biceps","forearms","shoulders"] },
  'catalog:pulldown': { aliases: ["Puxador frente","Lat pulldown","Puxada frontal"], secondary: ["biceps","forearms","shoulders"] },
  'catalog:row': { aliases: ["Remada com barra","Bent-over row"], secondary: ["biceps","shoulders","core"] },
  'catalog:cable-row': { aliases: ["Remada sentada","Remada baixa na polia","Seated cable row"], secondary: ["biceps","shoulders","forearms"] },
  'catalog:one-arm-row': { aliases: ["Serrote","Remada com halter","Dumbbell row"], secondary: ["biceps","shoulders","forearms"] },
  'catalog:ohp': { aliases: ["Desenvolvimento com barra","Overhead press","OHP"], secondary: ["triceps","core","chest"] },
  'catalog:db-press': { aliases: ["Desenvolvimento de ombro","Shoulder press","Dumbbell press vertical"], secondary: ["triceps","core"] },
  'catalog:lateral': { aliases: ["Abdução de ombros","Lateral raise","Elevação lateral com halteres"], secondary: ["back"] },
  'catalog:reverse-fly': { aliases: ["Peck deck inverso","Reverse fly","Voador invertido"], secondary: ["back"] },
  'catalog:curl': { aliases: ["Rosca bíceps","Barbell curl","Rosca direta com barra"], secondary: ["forearms"] },
  'catalog:hammer': { aliases: ["Rosca neutra","Hammer curl","Rosca martelo com halteres"], secondary: ["forearms"] },
  'catalog:preacher': { aliases: ["Rosca no banco Scott","Preacher curl","Scott na máquina"], secondary: ["forearms"] },
  'catalog:pushdown': { aliases: ["Tríceps pulley","Tríceps corda","Pushdown","Tríceps no cabo"], secondary: ["forearms"] },
  'catalog:overhead-triceps': { aliases: ["Tríceps francês com halter","Overhead dumbbell triceps extension"], secondary: ["forearms"] },
  'catalog:close-bench': { aliases: ["Supino fechado","Close-grip bench press"], secondary: ["chest","shoulders"] },
  'catalog:squat': { aliases: ["Agachamento com barra","Agachamento de costas","Back squat","Squat"], secondary: ["glutes","core","hamstrings"] },
  'catalog:leg-press': { aliases: ["Leg press 45","Pressão de pernas","Prensa de pernas"], secondary: ["glutes","hamstrings"] },
  'catalog:extension': { aliases: ["Extensora","Leg extension","Extensão de joelhos"], secondary: [] },
  'catalog:goblet': { aliases: ["Agachamento taça","Goblet squat","Agachamento com kettlebell"], secondary: ["glutes","core"] },
  'catalog:rdl': { aliases: ["Levantamento terra romeno","RDL","Romanian deadlift"], secondary: ["glutes","core","forearms"] },
  'catalog:leg-curl': { aliases: ["Flexora deitada","Leg curl","Flexão de joelhos deitada"], secondary: ["calves"] },
  'catalog:hip-thrust': { aliases: ["Hip thrust","Elevação de quadril com barra"], secondary: ["hamstrings","core"] },
  'catalog:split-squat': { aliases: ["Afundo búlgaro","Bulgarian split squat"], secondary: ["quads","core"] },
  'catalog:abduction': { aliases: ["Abdução com elástico","Abdução em pé","Hip abduction"], secondary: ["core"] },
  'catalog:calf': { aliases: ["Elevação de panturrilha em pé","Standing calf raise","Gêmeos em pé"], secondary: [] },
  'catalog:seated-calf': { aliases: ["Gêmeos sentado","Seated calf raise"], secondary: [] },
  'catalog:crunch': { aliases: ["Crunch","Abdominal curto","Abdominal supra"], secondary: [] },
  'catalog:leg-raise': { aliases: ["Elevação de pernas deitada","Leg raise","Abdominal infra"], secondary: [] },
  'catalog:wrist-curl': { aliases: ["Rosca de punho","Wrist curl","Flexão de punho"], secondary: [] },
  'catalog:db-bench': { aliases: ["Supino reto com halteres","Dumbbell bench press"], secondary: ["triceps","shoulders"] },
  'catalog:db-fly': { aliases: ["Crucifixo reto","Dumbbell fly","Crucifixo com halter"], secondary: ["shoulders"] },
  'catalog:decline-bench': { aliases: ["Supino declinado","Decline bench press"], secondary: ["triceps","shoulders"] },
  'catalog:incline-bench': { aliases: ["Supino inclinado barra","Incline barbell bench press"], secondary: ["shoulders","triceps"] },
  'catalog:machine-fly': { aliases: ["Voador","Peck deck","Pec deck","Butterfly"], secondary: ["shoulders"] },
  'catalog:cable-press': { aliases: ["Chest press no cabo","Standing cable chest press"], secondary: ["triceps","shoulders","core"] },
  'catalog:chinup': { aliases: ["Barra supinada","Chin-up","Barra fixa mãos supinadas"], secondary: ["biceps","forearms","shoulders"] },
  'catalog:tbar-row': { aliases: ["T-bar row","Remada T","Remada landmine"], secondary: ["biceps","forearms","core"] },
  'catalog:machine-row': { aliases: ["Remada articulada","Chest-supported row"], secondary: ["biceps","shoulders","forearms"] },
  'catalog:straight-arm-pulldown': { aliases: ["Puxada com braços retos","Straight-arm pulldown","Pulldown braços estendidos"], secondary: ["triceps","core"] },
  'catalog:front-raise': { aliases: ["Elevação anterior","Front raise","Elevação frontal com halteres"], secondary: ["chest"] },
  'catalog:arnold': { aliases: ["Arnold press","Press Arnold"], secondary: ["triceps","core"] },
  'catalog:rear-delt-cable': { aliases: ["Crucifixo posterior no cabo","Reverse cable fly"], secondary: ["back"] },
  'catalog:face-pull': { aliases: ["Face pull","Remada para a face","Puxada com corda para o rosto"], secondary: ["back","biceps"] },
  'catalog:db-curl': { aliases: ["Rosca com halteres","Alternating dumbbell curl","Rosca unilateral"], secondary: ["forearms"] },
  'catalog:incline-curl': { aliases: ["Rosca no banco inclinado","Incline dumbbell curl"], secondary: ["forearms"] },
  'catalog:concentration-curl': { aliases: ["Rosca apoiada","Concentration curl"], secondary: ["forearms"] },
  'catalog:cable-curl': { aliases: ["Rosca polia baixa","Cable curl","Rosca na polia"], secondary: ["forearms"] },
  'catalog:lying-triceps': { aliases: ["Tríceps deitado","Skull crusher","Tríceps testa com barra"], secondary: ["forearms"] },
  'catalog:cable-overhead': { aliases: ["Tríceps francês na polia","Overhead cable extension"], secondary: ["forearms","core"] },
  'catalog:bench-dip': { aliases: ["Tríceps banco","Bench dip","Mergulho para tríceps"], secondary: ["chest","shoulders"] },
  'catalog:triceps-dip': { aliases: ["Paralelas","Dip","Dips para tríceps"], secondary: ["chest","shoulders"] },
  'catalog:front-squat': { aliases: ["Agachamento frente","Front squat"], secondary: ["glutes","core"] },
  'catalog:hack-squat': { aliases: ["Hack squat","Agachamento hack","Hack na máquina"], secondary: ["glutes","hamstrings"] },
  'catalog:leg-press-horizontal': { aliases: ["Leg press sentado","Prensa horizontal","Horizontal leg press"], secondary: ["glutes","hamstrings"] },
  'catalog:lunge': { aliases: ["Passada com halteres","Avanço com halteres","Dumbbell lunge"], secondary: ["glutes","hamstrings","core"] },
  'catalog:step-up': { aliases: ["Step-up","Subida em banco","Subida no step"], secondary: ["glutes","core"] },
  'catalog:seated-leg-curl': { aliases: ["Flexora sentada","Seated leg curl","Flexão de joelhos sentada"], secondary: ["calves"] },
  'catalog:single-leg-rdl': { aliases: ["RDL unilateral","Stiff unilateral","Single-leg RDL"], secondary: ["glutes","core"] },
  'catalog:good-morning': { aliases: ["Good morning","Bom dia"], secondary: ["glutes","core"] },
  'catalog:deadlift': { aliases: ["Terra","Deadlift","Terra tradicional"], secondary: ["hamstrings","quads","back","core","forearms"] },
  'catalog:glute-bridge': { aliases: ["Ponte de quadril","Glute bridge","Elevação de quadril no solo"], secondary: ["hamstrings","core"] },
  'catalog:cable-kickback': { aliases: ["Coice na polia","Glute kickback","Extensão glútea na polia"], secondary: ["hamstrings","core"] },
  'catalog:sumo-deadlift': { aliases: ["Terra sumô","Sumo deadlift"], secondary: ["hamstrings","quads","back","core","forearms"] },
  'catalog:calf-db': { aliases: ["Gêmeos com halteres","Dumbbell calf raise","Elevação de calcanhares com halteres"], secondary: [] },
  'catalog:leg-press-calf': { aliases: ["Gêmeos no leg press","Calf press","Panturrilha na prensa"], secondary: [] },
  'catalog:shoulder-tap': { aliases: ["Toque no ombro em prancha","Shoulder taps"], secondary: ["shoulders","triceps"] },
  'catalog:oblique-crunch': { aliases: ["Abdominal cruzado","Cross-body crunch"], secondary: [] },
  'catalog:cable-crunch': { aliases: ["Abdominal no cabo","Cable crunch","Abdominal ajoelhado"], secondary: [] },
  'catalog:dead-bug': { aliases: ["Inseto morto","Dead bug","Abdominal alternado deitado"], secondary: [] },
  'catalog:reverse-curl': { aliases: ["Rosca pronada","Reverse curl","Rosca inversa com barra"], secondary: ["biceps"] },
  'catalog:wrist-extension': { aliases: ["Rosca de punho inversa","Extensão de punho","Reverse wrist curl"], secondary: [] },
};

const emptyProfile: Profile = { aliases: [], secondary: [] };

export function exerciseProfile(exerciseId: string): Profile {
  return Object.hasOwn(profiles, exerciseId) ? profiles[exerciseId]! : emptyProfile;
}

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR');

export type CatalogFilters = {
  query: string; muscle: Muscle | ''; gear: Equipment | ''; includeArchived: boolean;
};

export const defaultCatalogFilters: CatalogFilters = { query: '', muscle: '', gear: '', includeArchived: false };

export function searchExercises(exercises: Exercise[], filters: CatalogFilters) {
  const terms = normalize(filters.query).split(/[^\p{Letter}\p{Number}]+/u).filter(Boolean);
  return exercises.filter(item => {
    if ((!filters.includeArchived && item.archived) || (filters.gear && item.equipment !== filters.gear)) return false;
    const { aliases, secondary } = exerciseProfile(item.id);
    if (filters.muscle && item.muscle !== filters.muscle && !secondary.includes(filters.muscle)) return false;
    const label = normalize([item.name, ...aliases].join(' '));
    return terms.every(term => label.includes(term));
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
