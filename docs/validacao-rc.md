# Validação da candidata 1.0.0-rc.3

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

Em Linux, `npx playwright install --with-deps chromium webkit` instala também as dependências do sistema. Para reproduzir a verificação do Pages, execute `npm run build` e `npm run test:rc` com `VITE_BASE_PATH=/workout-tracker/` definido no ambiente. Remova a variável e repita o build para servir na raiz. Use `CAPTURE_RC=1` ao executar a suíte de candidata para atualizar as capturas versionadas.

## Cobertura

| Verificação | Resultado local |
| --- | --- |
| ESLint, TypeScript estrito, build de produção e build de demonstração | Aprovados. |
| Domínio e integração | 27 testes incluindo preservação dos 34 IDs originais, coexistência com exercícios pessoais e arquivados, gravação concorrente e restauração de backups anteriores. |
| Fluxos de interface | 8 execuções em Chromium e WebKit, cobrindo rotina, reordenação, cargas decimais, aquecimento, retomada, edição do treino, arquivo e restauração de backups. |
| Suíte da candidata | 10 execuções em Chromium e WebKit também aprovadas no subcaminho do portfólio. O catálogo valida busca por alias, músculos secundários, equipamentos, créditos, imagens, histórico e alternância de métrica por exercício. A interface cobre retomada após falha de armazenamento, posição da próxima confirmação em 393 px e alinhamento dos controles no desktop. |
| Acessibilidade e layout | Axe com regras WCAG 2.0, 2.1 e 2.2 A/AA nas superfícies exercitadas. Testes de foco, Escape, alvos de toque e largura a 320, 393, 768 e 1280 px CSS. |
| PWA e armazenamento | Manifesto, ícones comuns, maskable e iOS servidos. Chromium aprovou os critérios de instalação via DevTools. Em rede desligada, o app recarregou o treino e os quadros, persistiu no IndexedDB, finalizou a sessão, exportou CSV e gerou JSON restaurado em outro perfil. |
| Imagens | 28 pares WebP mais 28 miniaturas, 644.136 bytes no total. A suíte valida os arquivos e os metadados. O seletor do treino não carrega imagens do catálogo. As fichas abrem os quadros por solicitação, e a suíte verifica o acesso offline. |
| Dependências | `npm audit` em produção e desenvolvimento sem vulnerabilidades reportadas na execução de 26/11/2026. |

A demo injeta um repositório em memória. Uma verificação falha se ela tentar usar IndexedDB. As alterações de demonstração são descartadas ao recarregar. As capturas usam exclusivamente dados de exemplo.

O build verificou o perfil de iPhone em WebKit. A instalação pela Tela de Início e o retorno após bloquear a tela em iPhone físico ainda exigem teste por HTTPS no endereço definitivo. Axe cobre as regras e os fluxos executados. A validação de instalação real e de leitor de tela em aparelho continua separada.
