# Validação da candidata 1.0.0-rc.1

## Reproduzir

```sh
npm ci
npx playwright install chromium webkit
npm run lint
npm test
npm run build
npm run test:e2e
npm run build:demo
npm run test:rc
```

Em Linux, `npx playwright install --with-deps chromium webkit` instala também as dependências do sistema.

## Cobertura

- Testes de domínio, armazenamento e exportação continuam cobrindo validação, cálculos, backups e conflitos entre abas.
- Testes de interface cobrem rotinas, reordenação, carga decimal, aquecimento, retomada, edição do treino, métricas e importação de backup.
- A suíte da candidata audita os pontos de entrada com axe-core em Chromium e WebKit. Verifica navegação, telas preenchidas e vazias, catálogo durante treino, dimensões de toque e conteúdo sem rolagem horizontal em larguras de 320, 393, 768 e 1280 pixels CSS.
- O build real fornece manifesto, ícones e service worker. Chromium verifica os critérios de instalação pelo DevTools Protocol. O fluxo em rede desativada recarrega uma sessão persistida, conclui um treino com carga decimal, confere as linhas do CSV e restaura o JSON em outro perfil.
- A demonstração injeta um repositório em memória. A verificação de interface falha se ela tentar usar IndexedDB. As alterações são descartadas ao recarregar.

A avaliação de Safari foi executada em WebKit com perfil de iPhone. A instalação pela Tela de Início e o retorno após bloquear a tela em um iPhone físico ainda precisam de uma verificação em HTTPS. Os testes automatizados de acessibilidade cobrem as regras selecionadas e os fluxos exercitados.
