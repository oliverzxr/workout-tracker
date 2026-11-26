export const directions = {
  arranque: {
    name: 'Arranque',
    summary: 'Contraste alto, tipografia de pista e acesso direto à próxima série.',
    interaction: 'Todas as séries à vista. A fila de exercícios salta para o bloco escolhido.',
    palette: ['#171611', '#262318', '#f7d45e', '#faf4df'],
  },
  caderno: {
    name: 'Caderno',
    summary: 'Papel mineral, tinta verde e uma página para cada sessão.',
    interaction: 'As séries seguem em ordem de leitura, com a carga anterior anotada ao lado.',
    palette: ['#f3f0e7', '#e9e5da', '#23493e', '#1a2924'],
  },
  cadencia: {
    name: 'Cadência',
    summary: 'Azul profundo, formas arredondadas e uma estação por vez.',
    interaction: 'Um exercício aberto por vez, com a sequência sempre acessível.',
    palette: ['#111724', '#202a3e', '#cbd4ff', '#f4a88f'],
  },
} as const;

export type Direction = keyof typeof directions;

export const designCopy = {
  compare: 'Comparar direções', demo: 'Demonstração', demoSaved: 'Sessão demonstrativa',
  train: 'Treinar', active: 'Treino em andamento', exerciseOrder: 'Ordem dos exercícios',
  completed: 'Séries concluídas', workoutBack: 'Sair da sessão', workoutSettings: 'Editar nome',
  pending: 'Séries para registrar', nextExercise: 'Próximo exercício', exerciseDone: 'Séries registradas neste exercício.',
  exerciseLibrary: 'Catálogo', seeAll: 'Ver todas', weekEmpty: 'Os dias de treino aparecem aqui após a primeira sessão.',
  chooseRoutine: 'Escolha uma rotina ou registre um treino livre.', startEmpty: 'Selecione um exercício no catálogo para começar.',
  noSessions: 'Finalize uma sessão para consultar suas séries e cargas aqui.',
  noRoutines: 'Monte sua primeira rotina com os exercícios que você faz com frequência.',
  historyMonth: 'Sessões registradas', noChart: 'A evolução aparece após registrar a primeira série válida.',
};
