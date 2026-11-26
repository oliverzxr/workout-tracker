# Retomada dos estudos de JavaScript

Esta branch guarda o projeto de aprendizado no ponto em que a versão profissional foi planejada. O código original está no commit `5c1fb22323c75304f8d0db2ce5ff41e74bb96fb9`, com a mensagem `add workout calculations and tests`. A cópia local estava limpa na auditoria de 26 de novembro de 2026.

## O que já funciona

- `src/treino.js` exporta `contarSeries(treino)` e `calcularVolume(treino)` via CommonJS. A primeira soma o tamanho da lista de séries de cada exercício. A segunda soma `repeticoes * carga` para cada série.
- `tests/test.js` usa `node:test` e `node:assert/strict`. Os dois testes usam `assert.equal()` com um treino válido que tem 5 séries e volume de 1.016.
- Os dois testes passam com Node.js 24.21.0 usando o comando abaixo. O script `npm test` ainda contém o comando padrão de inicialização do npm e encerra com erro.

```sh
node --test
```

## O que ainda falta praticar

| Tópico | Estado no código original |
| --- | --- |
| Funções de validação | As duas funções assumem que o treino, os exercícios e as séries já têm o formato esperado. |
| `Number.isFinite()` | Nenhuma chamada. |
| `throw` | Nenhum lançamento explícito de erro. |
| `try/catch` | Nenhum bloco de tratamento de exceções. |
| `assert.throws()` | Nenhum teste de exceção. |

## Próximos exercícios

1. Execute `node --test` e rastreie a soma de volume série por série para entender o resultado atual.
2. Defina o contrato de uma série. Experimente exigir carga numérica, finita e não negativa, e repetições inteiras positivas. Decida também como tratar treinos vazios e listas ausentes.
3. Crie uma função de validação e chame-a antes da contagem e do cálculo. Use `Number.isFinite()` para testar cargas sem conversão implícita e `Number.isInteger()` para testar repetições. Compare `0`, `12.5`, `"12.5"`, `NaN` e `Infinity`.
4. Use `throw` com uma mensagem específica para cada dado inválido. Escreva testes com `assert.throws(() => calcularVolume(treinoInvalido), /mensagem esperada/)` e confirme que os casos válidos continuam passando.
5. Crie um pequeno ponto de entrada que chame as funções dentro de `try/catch` para apresentar o erro a quem usa o programa. Observe como o erro lançado na validação chega até esse ponto.
6. Configure `npm test` para chamar `node --test`. Em seguida, experimente aceitar cargas digitadas como `12,5` ou `12.5` no ponto de entrada e passar o número convertido à função de validação.

Para retomar no repositório local, atualize as referências do GitHub e selecione a branch com `git fetch origin` e `git switch learning`.
