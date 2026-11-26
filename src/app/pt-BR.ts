export const brand = { name: 'Workout Tracker', short: 'WT' };
export const locale = 'pt-BR';

export const t = {
  shell: {
    skip: 'Ir para o conteúdo', navigation: 'Navegação principal', local: 'Dados neste dispositivo',
    offline: 'Sem conexão', localHelp: 'Sobre seus dados locais',
    demo: 'Demonstração', demoNote: 'Dados de exemplo. Alterações duram até recarregar a página.',
  },
  nav: { home: 'Início', routines: 'Rotinas', history: 'Histórico', progress: 'Progresso', settings: 'Ajustes' },
  muscles: {
    chest: 'Peitoral', back: 'Costas', shoulders: 'Ombros', biceps: 'Bíceps', triceps: 'Tríceps',
    quads: 'Quadríceps', hamstrings: 'Posteriores', glutes: 'Glúteos', calves: 'Panturrilhas', core: 'Core', forearms: 'Antebraços',
  },
  equipment: {
    barbell: 'Barra', dumbbell: 'Halteres', machine: 'Máquina', cable: 'Cabo', bodyweight: 'Peso corporal',
    kettlebell: 'Kettlebell', band: 'Elástico', other: 'Outro',
  },
  kinds: { work: 'Série válida', warmup: 'Aquecimento' },
  common: {
    add: 'Adicionar', cancel: 'Cancelar', save: 'Salvar', edit: 'Editar', close: 'Fechar', remove: 'Remover',
    up: 'Subir', down: 'Descer', name: 'Nome', exercise: 'Exercício', exercises: 'Exercícios',
    sets: 'Séries', validSets: 'Séries válidas', kg: 'kg', reps: 'Reps', rir: 'RIR', volume: 'Volume de carga',
    noHistory: 'Seu histórico ainda está vazio.', noResults: 'Nenhum exercício encontrado.',
    muscle: 'Grupo muscular', gear: 'Equipamento', restSeconds: 'Descanso (s)',
  },
  home: {
    heading: 'Área de treino', description: 'Registre suas séries e retome de onde parou.',
    start: 'Iniciar treino livre', resume: 'Retomar treino', free: 'Treino livre',
    week: 'Esta semana', sessions: 'Treinos', quick: 'Suas rotinas', allRoutines: 'Ver rotinas',
    noRoutines: 'Crie uma rotina para começar com seus exercícios e séries planejados.',
    createRoutine: 'Criar rotina', recent: 'Último treino', seeHistory: 'Ver histórico',
    noRecent: 'Seu primeiro treino aparecerá aqui.', startRoutine: 'Iniciar rotina',
    openRoutine: 'Escolher rotina', draftHint: 'Continue da última série registrada.',
    preferred: 'Escolha a carga e registre suas séries conforme treina.',
    trainingDay: 'Treino registrado', restDay: 'Sem treino registrado',
    weekEmpty: 'Os dias de treino serão marcados aqui após a primeira sessão.',
  },
  catalog: {
    heading: 'Catálogo de exercícios', subtitle: 'Gerencie seus exercícios e o descanso padrão de cada um.',
    search: 'Buscar exercício', new: 'Novo exercício', edit: 'Editar exercício', archive: 'Arquivar',
    restore: 'Reativar', showArchived: 'Mostrar arquivados', archived: 'Arquivado', pick: 'Adicionar exercício',
    empty: 'Busque pelo nome ou filtre por grupo muscular.',
  },
  routines: {
    heading: 'Rotinas', description: 'Organize a ordem dos exercícios e planeje suas séries.',
    empty: 'Você ainda não criou rotinas.', create: 'Nova rotina', edit: 'Editar rotina', start: 'Começar',
    catalog: 'Gerenciar exercícios', remove: 'Excluir rotina', confirm: 'Excluir esta rotina?',
    name: 'Nome da rotina', sets: 'Séries planejadas', invalid: 'Informe um nome e adicione pelo menos um exercício com 1 a 20 séries.',
    preview: 'Ver exercícios',
  },
  active: {
    heading: 'Treino em andamento', editHeading: 'Editar treino', name: 'Nome do treino', finish: 'Finalizar treino',
    discard: 'Descartar treino', confirmDiscard: 'Descartar este rascunho de treino?', empty: 'Adicione um exercício para começar a registrar suas séries.',
    previous: 'Anterior', noPrevious: 'Sem registro anterior', series: 'Série', load: 'Carga',
    addSet: 'Adicionar série', complete: 'Concluir série', reopen: 'Reabrir série', copy: 'Copiar série anterior',
    invalid: 'Informe carga de 0 a 2.000 kg, repetições de 1 a 999 e RIR opcional de 0 a 10.',
    finishInvalid: 'Informe o nome do treino e conclua pelo menos uma série.',
    activeExists: 'Já existe um treino em andamento. Retome ou descarte esse treino primeiro.',
    options: 'Opções', removeSet: 'Remover série', removeExercise: 'Remover exercício',
    reorderUp: 'Mover para cima', reorderDown: 'Mover para baixo', rest: 'Descanso',
    restNow: 'Iniciar descanso', noRest: 'Desativado', timerComplete: 'Descanso concluído',
    stop: 'Encerrar descanso', addTime: '+15 s de descanso',
    rirHelp: 'RIR é o número de repetições que ainda conseguiria fazer.',
    editPending: 'Conclua as séries adicionadas ou remova as linhas pendentes antes de salvar.',
    confirmUnfinished: 'As séries preenchidas, mas ainda não concluídas, ficarão fora do histórico. Finalizar treino?',
    cancelEdit: 'Sair sem salvar as alterações deste treino?',
    jump: 'Ir para exercício', completedSets: 'Séries concluídas',
  },
  history: {
    heading: 'Histórico', description: 'Consulte os detalhes e edite treinos finalizados.', details: 'Ver treino',
    remove: 'Excluir treino', confirm: 'Excluir este treino do histórico?',
    emptyDetail: 'Os treinos finalizados aparecem aqui com as séries, cargas e repetições.',
  },
  progress: {
    heading: 'Progresso', description: 'Acompanhe a frequência, a carga e as séries válidas.',
    weekly: 'Resumo semanal', prev: 'Semana anterior', next: 'Semana seguinte', muscles: 'Séries por grupo muscular',
    muscleHint: 'As séries entram no grupo principal de cada exercício. Volume = carga × repetições.',
    empty: 'Ainda não há séries válidas neste período.', progression: 'Evolução por exercício', record: 'Maior carga',
    volumeRecord: 'Maior volume por treino', load: 'Carga por treino', volume: 'Volume por treino',
    noExercises: 'Registre uma série válida para ver a evolução.',
    table: 'Ver dados do gráfico', date: 'Data',
  },
  settings: {
    heading: 'Ajustes', description: 'Instalação, armazenamento e cópia dos seus dados.', local: 'Armazenamento local',
    warning: 'Seus treinos ficam neste navegador, sem sincronização. Limpar os dados do site ou trocar de aparelho pode apagar o acesso ao seu histórico. Exporte backups regularmente.',
    backup: 'Baixar backup JSON', csv: 'Exportar histórico em CSV', restore: 'Restaurar backup',
    restoreConfirm: 'Restaurar este backup substituirá os dados locais, inclusive o treino em andamento. Continuar?',
    restoreError: 'O arquivo não é um backup válido desta aplicação. Seus dados foram preservados.',
    restoreSuccess: 'Backup restaurado.', installed: 'O aplicativo está instalado.', install: 'Instalar aplicativo',
    installation: 'Instalação', ios: 'No iPhone, abra no Safari, toque em Compartilhar e escolha Adicionar à Tela de Início. Se aparecer, ative Abrir como App da Web.',
    offline: 'Depois do primeiro carregamento completo com internet, o app pode abrir e registrar treinos offline.',
    ready: 'Disponível offline', update: 'Atualizar aplicativo',
    updateNotice: 'Uma nova versão está pronta. Salve suas alterações antes de atualizar.',
    csvHeaders: ['ID do treino', 'Treino', 'Início', 'Fim', 'Exercício', 'Série', 'Tipo', 'Carga (kg)', 'Repetições', 'RIR'],
  },
  storage: {
    loading: 'Carregando seus dados…', saved: 'Salvo neste dispositivo', saving: 'Salvando…',
    error: 'O navegador não conseguiu salvar ou abrir os dados. Verifique o armazenamento e tente novamente.',
    conflict: 'Outra janela alterou os dados. Reabra a versão salva para continuar. Você pode baixar uma cópia das alterações desta janela antes disso.',
    reload: 'Abrir versão salva', retry: 'Tentar novamente',
  },
};

export const formatNumber = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format;
const inputNumber = new Intl.NumberFormat(locale, { maximumFractionDigits: 3, useGrouping: false });
export const formatInputLoad = (grams: number) => inputNumber.format(grams / 1000);
const dateFormat = new Intl.DateTimeFormat(locale, { day: '2-digit', month: 'short' });
const longDateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' });
export const shortDate = (value: string | Date) => dateFormat.format(new Date(value));
export const longDate = (value: string) => longDateFormat.format(new Date(value));
export const countLabel = (value: number, singular: string, plural: string) =>
  formatNumber(value) + ' ' + (value === 1 ? singular : plural).toLocaleLowerCase(locale);
