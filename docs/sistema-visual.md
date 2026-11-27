# Sistema visual

O fundo preto absoluto sustenta todos os destinos. Superfícies aparecem para campos, menus e comandos que precisam ser reconhecidos rapidamente. As listas usam alinhamento, tipografia e divisórias. Inter é servida localmente, com algarismos tabulares em cargas, repetições, cronômetro e totais.

| Papel | Valor | Aplicação |
| --- | --- | --- |
| Fundo | `#000000` | Tela |
| Superfície | `#101416` | Contextos de ação, seleção e formulários |
| Campo | `#171c1e` | Entradas e comandos secundários |
| Texto | `#edf2f1` | Leitura principal |
| Texto secundário | `#a8b3b3` | Metadados, unidades e instruções |
| Destaque | `#8ce2d0` | Ação principal, foco, confirmação e séries na semana |

`src/tokens.css` define os papéis. Bordas e preenchimentos indicam função. A lista de histórico usa uma coluna de data e outra de métricas, a área de rotinas separa ação e organização, e o progresso combina resumo do período, série histórica e distribuição muscular. Cada destino mantém a mesma anatomia de títulos, listas e ações, com o layout definido pelo conteúdo.

No celular, quatro destinos ficam na barra inferior. Ajustes permanece no cabeçalho. Em telas largas, navegação e marca compartilham uma linha, com marcação inferior do destino ativo. A mesma estrutura poderá receber navegação contextual para novos módulos quando existirem rotas reais.

No treino, o contador de séries e a sequência precedem a tabela. A primeira confirmação pendente recebe o destaque principal. Carga anterior e cópia permanecem na linha, abaixo dos campos no celular. Controles de sessão ficam no rodapé móvel e em uma coluna lateral no desktop. O foco tem contorno visível e animações de estado respeitam movimento reduzido. [Tamanho de alvo, WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

[Avaliação das referências e iterações](design-rc3.md)
