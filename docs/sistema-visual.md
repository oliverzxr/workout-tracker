# Sistema visual

O fundo é preto absoluto, com separação entre superfícies por luminância e divisórias finas. O destaque turquesa é reservado a ações principais, seleção, foco e confirmações de treino. A tipografia Inter é servida localmente e usa algarismos tabulares em campos, cronômetros e métricas.

| Papel | Valor de referência | Aplicação |
| --- | --- | --- |
| Fundo | `#000000` | Tela e barras globais |
| Superfície | `#101112` | Exercícios, formulários e sessões |
| Campo | `#171819` | Entradas e ações secundárias |
| Texto | `#f3f5f5` | Leitura e valores |
| Texto secundário | `#a6adad` | Unidades, metadados e instruções |
| Destaque | `#76e3cb` | Próxima série, ação principal e foco |

Os valores ficam em `src/tokens.css`. Botões, campos, modais, estados vazios e linhas de lista compartilham estados, margens e contornos em `src/styles.css`. As telas reutilizam `Title`, `Dialog`, `Empty` e `Order`. O shell organiza quatro destinos de treinamento, com Ajustes no cabeçalho. A entrada de futuros módulos poderá reutilizar os mesmos componentes com navegação contextual.

No treino ativo, a ordem de leitura é nome, progresso da sessão, exercícios, valores anteriores e ações de descanso. O dock concentra as ações que precisam ficar acessíveis perto do polegar. O menor alvo dos controles principais mede pelo menos 44 pixels CSS nas verificações. O tipo da série e o estado de conclusão contam com texto acessível e forma visual. O foco aparece com contorno e a interface respeita movimento reduzido. [Referência de tamanho de alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

A referência do Hevy orientou a proximidade entre série atual, série anterior e descanso por exercício. Os componentes, a navegação e a linguagem visual do Workout Tracker foram definidos para este produto. [Registro de treinos no Hevy](https://www.hevyapp.com/features/track-workouts/) · [Cronômetro do Hevy](https://www.hevyapp.com/features/workout-rest-timer/)
