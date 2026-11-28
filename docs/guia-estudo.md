# Guia para explicar o projeto

## Fluxo principal

Uma rotina referencia IDs de exercícios e quantidades de séries. Ao iniciar, o domínio cria um rascunho com valores editáveis. Concluir uma série valida os campos e pode iniciar o descanso. Finalizar transforma as séries concluídas em histórico. Explique por que cargas são armazenadas em gramas inteiras e aceitam vírgula ou ponto.

## Arquitetura

Leia `src/domain/model.ts` para tipos e validação, `src/domain/stats.ts` para cálculos, `src/data/repository.ts` para o contrato e IndexedDB, e `src/app/useTracker.ts` para estado e gravações. A interface recebe o repositório, permitindo uma demonstração em memória.

## Perguntas para praticar

1. Como o app reage se duas abas editam a mesma revisão? Identifique `WriteConflict` e o caminho de recuperação.
2. Por que um treino antigo continua legível após editar um exercício? Examine nome, grupo e ID armazenados na sessão.
3. Como o descanso sobrevive à suspensão? Explique o horário de término e o recálculo do tempo restante.
4. Qual a diferença entre backup JSON e CSV? O primeiro é validado e restaurável. O CSV exporta histórico para consulta.
5. Qual a diferença entre volume de carga e quantidade de séries? Consulte os testes e `stats.ts`.
6. Como o service worker permite abrir offline? Explique primeiro carregamento, cache e atualização.
7. O que foi testado? Diferencie testes de domínio, persistência com IndexedDB simulado, Playwright e axe. Explique que falta teste em iPhone físico.
8. O que mudaria para sincronizar? Discuta identidade, autorização, fila offline, exclusões, conflitos e migração de backups.
9. O que é experimental? Nutrição e corpo estão em outra branch. O adaptador Open Food Facts precisa de servidor na implantação.

Execute os testes do README e percorra a demonstração antes da entrevista. Explique decisões e limitações com exemplos que você tenha conseguido reproduzir.