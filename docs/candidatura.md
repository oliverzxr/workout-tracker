# Apresentação para candidatura

## Currículo

**Workout Tracker** — aplicação web de treino com React, TypeScript, IndexedDB e PWA. Implementa rotinas, registro de séries, histórico, gráficos e backup local. Testes de domínio e interface rodam em CI com Chromium e WebKit. [Demonstração](https://oliverzxr.github.io/workout-tracker/demo.html?state=active#/treino)

## LinkedIn

Desenvolvi o Workout Tracker para planejar e registrar treinos de musculação. A aplicação usa React e TypeScript, persiste dados no IndexedDB e funciona offline após o carregamento inicial. Trabalhei com validação, backup, detecção de conflitos entre abas, acessibilidade automatizada e testes de interface em CI. A versão experimental explora nutrição e evolução corporal em uma branch separada. [Demonstração](https://oliverzxr.github.io/workout-tracker/demo.html?state=active#/treino)

## Entrevista

Comecei com exercícios de JavaScript para contagem de séries e volume. Evoluí o projeto para uma aplicação de treino com React, TypeScript e persistência local. Um desafio foi manter o rascunho disponível offline sem sobrescrever uma edição de outra aba. O repositório IndexedDB grava uma revisão junto do estado e rejeita escritas baseadas em revisão antiga. Testei esse conflito, a restauração de backups e fluxos completos em Chromium e WebKit. A próxima evolução, ainda experimental, adiciona nutrição e medidas.

## Consolidação proposta

1. Revisar a candidata `codex/candidatura`, a demonstração HTTPS e a CI.
2. Após aprovação, integrar a candidata de treino à `main`, preservando o histórico e a branch `learning`.
3. Confirmar README, imagens e build no commit integrado. Validar a PWA publicada e um iPhone físico.
4. Atualizar a fonte do Pages de modo controlado e criar a tag e release `v1.0.0` no commit validado. A branch experimental segue seu ciclo de revisão.