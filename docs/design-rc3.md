# Revisão de experiência

A rc.2 repete bordas, cabeçalhos e superfícies preenchidas em áreas com funções distintas. No treino mobile, o título, o nome editável e os chips chegam antes da primeira linha. Em desktop, os painéis de progresso se comportam como widgets independentes. No catálogo, o fundo claro dos desenhos compete com o nome e a instrução.

## Decisões extraídas das referências

| Referência consultada | Decisão observada | Aplicação neste produto |
| --- | --- | --- |
| Hevy | O histórico anterior fica ao lado do registro, com confirmação explícita de cada série e descanso no contexto. | Manter carga anterior e cópia acessíveis na linha. Destacar a primeira confirmação pendente. [Fluxo de registro](https://www.hevyapp.com/features/track-workouts/) · [Capturas](https://apps.apple.com/us/app/hevy-workout-tracker-gym-log/id1458862350) |
| Strong | Uma tabela compacta e valores alinhados deixam a operação previsível. | Diminuir o espaço vertical acima das séries e retirar contornos redundantes dos campos concluídos. [Interface oficial](https://www.strong.app/) · [Capturas](https://apps.apple.com/us/app/strong-workout-tracker-gym-log/id464254577) |
| WHOOP | Uma métrica bem hierarquizada e referências temporais legíveis informam o que observar. | Colocar o período junto da leitura semanal e concentrar cor nos dados relevantes. A interface usa barras de séries, sem replicar o sistema de anéis. [Navegação e leitura](https://support.whoop.com/s/article/Navigating-the-WHOOP-Mobile-App?language=en_US) · [Capturas](https://apps.apple.com/us/app/whoop/id933944389) |
| Bevel | A visão geral oferece caminhos de aprofundamento por assunto, com profundidade ligada ao contexto. | A ficha aproxima orientação, execução e evolução; os futuros módulos poderão reutilizar a organização de métricas sem ocupar o menu atual. [Capturas](https://apps.apple.com/us/app/bevel-ai-health-coach/id6456176249) |
| MacroFactor | Resumo temporal, métrica e detalhe têm níveis distintos, com dados granulares disponíveis. | O resumo semanal tem uma hierarquia própria e a tabela do gráfico continua acessível. [Guia com telas reais](https://help.macrofactorapp.com/en/articles/22-get-to-know-your-dashboard) · [Capturas](https://apps.apple.com/us/app/macrofactor-macro-tracker/id1553503471) |

A leitura das referências foi feita nas telas públicas conduzidas pelos próprios produtos e na documentação dos fluxos. Nenhum asset de interface dos concorrentes integra o build.

## Direção

A interface usa preto `#000000`, superfície fria `#101416`, controles `#171C1E`, texto `#EDF2F1` e turquesa mineral `#8CE2D0`. Inter permanece como família única. O peso regular domina leitura e campos; números tabulares alinham séries e métricas. Títulos de tela e títulos de sessão têm papéis distintos e escala moderada.

No celular, primeiro a ação, depois o ritmo semanal e as rotinas. Nas sessões, título e progresso cedem altura à primeira tabela, enquanto descanso, adição e finalização permanecem na zona de toque inferior. No desktop, conteúdo e contexto usam duas larguras deliberadas. O treino põe ações em uma coluna fixa ao rolar, e o resto do produto alinha a navegação por texto e marcação de página.

A assinatura visual deriva do registro. Três marcas verticais no símbolo lembram séries anotadas. Faixas de carga de trabalho na semana mostram séries válidas reais e usam a mesma gramática de dados do progresso. Cor indica ação, sessão e estado. Abertura de detalhes, pressão e foco respondem ao usuário. O layout respeita redução de movimento.

## Revisão após capturas reais

A primeira captura mostrou que o botão de treino livre tinha largura excessiva no desktop e que os filtros do navegador tinham peso visual desigual em WebKit. A largura passou a acompanhar a ação, os seletores receberam o mesmo tratamento visual e a legenda passou a explicar o gráfico de séries por dia. O seletor de exercício no progresso usa o mesmo controle. A curva distribui pontos pela data real das sessões.

No treino preenchido de 393 × 750 px CSS, a primeira confirmação pendente fica visível acima do dock. Os valores concluídos passam a texto tabular sem fundo individual, e o campo pronto para uso mantém o alvo de toque. A coluna lateral do desktop deixa o cronômetro e as ações disponíveis na rolagem. A suíte verifica essas duas posições e a recuperação quando o armazenamento falha.
