# Arquitetura

A aplicação roda no navegador com React, TypeScript e Vite. A composição em `src/main.tsx` injeta um repositório local na aplicação. Os módulos de domínio e de integração de dados podem ser testados sem montar a interface.

| Módulo | Responsabilidade |
| --- | --- |
| `src/domain` | Contratos, validação, catálogo, transformações de treino e cálculos de progresso. |
| `src/data` | Contrato `TrackerRepository`, adaptador IndexedDB e formatos de backup e exportação. |
| `src/catalog` | Perfis editoriais, busca por alias, fichas técnicas e referências de mídia por ID. |
| `src/app` | Navegação, estado de aplicação, política de gravação, registro do service worker e mensagens em português brasileiro. |
| `src/ui` | Telas, formulários, tabela de séries, cronômetro e gráfico. |

O catálogo tem 76 exercícios editoriais, incluindo os 34 IDs originais. O cadastro guarda nome, grupo muscular principal, equipamento e descanso. Aliases, grupos secundários, técnica e mídia ficam associados ao ID em `src/catalog`, longe do esquema de persistência. Ao abrir uma base antiga ou restaurar um backup válido, são incluídos apenas IDs de catálogo ausentes. A atualização na IndexedDB é transacional e revisada uma vez quando há dados novos. Textos da interface, nomes de grupos e formatação estão em `src/app/pt-BR.ts`. Identificadores estáveis do catálogo e categorias internas independem dos rótulos traduzidos. O nome e a sigla públicos são declarados no mesmo módulo. Ícones de instalação e metadados do HTML acompanham mudanças de marca. A fonte Inter é distribuída via Fontsource sob SIL Open Font License e servida pelo próprio app. A composição visual e a evolução planejada estão descritas no [sistema visual](sistema-visual.md) e no [roadmap](roadmap.md).

## Dados e gravação

O estado contém catálogo, rotinas, treinos finalizados e um treino ativo opcional. As sessões guardam o nome e o grupo muscular do exercício no momento do registro, além do ID estável. Assim, editar ou arquivar um exercício preserva a leitura do histórico. Rotinas existentes podem continuar usando exercícios arquivados. O seletor de novos exercícios oferece somente os ativos.

O rascunho guarda os valores digitados, inclusive entradas parciais como `12,`. A conclusão valida a carga e a contagem de repetições. O histórico guarda cargas como gramas inteiras para evitar arredondamento no armazenamento. A exportação JSON usa um esquema versionado para validar formato, IDs e referências antes de substituir dados.

O adaptador IndexedDB grava o estado e a revisão juntos. Alterações são aplicadas na tela imediatamente e gravadas em sequência. Uma escrita que partiu de uma revisão antiga recebe um conflito, preservando a versão já salva. A tela permite baixar o estado em memória ou reabrir a versão gravada. O app informa visualmente se ainda está salvando ou se a gravação falhou.

O contrato de leitura e gravação pode receber outro adaptador. A sincronização em múltiplos dispositivos exigirá um protocolo de mudanças, política de conflitos e registro de exclusões. Para Supabase e PostgreSQL, os mesmos IDs permitem migrar o catálogo e as sessões para tabelas relacionais. A autorização deverá ser aplicada por usuário no banco, com políticas de acesso e testes de isolamento. O cliente local pode continuar responsável pelo rascunho offline.

## Métricas

- Frequência semanal conta sessões finalizadas iniciadas entre segunda e domingo, no fuso do dispositivo.
- Séries válidas contam as séries de trabalho concluídas. Séries de aquecimento ficam no histórico.
- Volume de carga é a soma de carga em kg × repetições das séries válidas.
- A distribuição muscular atribui cada série ao grupo principal registrado para aquele exercício.
- A progressão mostra a maior carga e o volume por sessão para o exercício selecionado. Os recordes são os maiores valores dessas duas métricas.

## PWA e hospedagem

O build gera um manifesto com ícones comuns, um ícone adaptável e um ícone da Tela de Início do iOS. O service worker guarda HTML, scripts, estilos, fontes locais e WebP necessários às demonstrações. Após instalar o cache, a app serve miniaturas separadas de 144 × 108 e quadros de 480 × 360 sob demanda. O editor de treino usa um seletor textual e a ficha detalhada carrega em um chunk separado. [Origem da mídia](catalogo-midias.md) O modo offline depende de uma primeira abertura bem-sucedida por HTTPS ou loopback. A atualização de versão é oferecida quando os arquivos novos estão em cache. O descanso guarda o horário de término e recalcula o tempo ao reabrir a aplicação, inclusive após suspensão do navegador.

A pasta `dist` é o artefato estático. O caminho relativo no Vite permite servir o build na raiz ou em `/workout-tracker/`. Para o deploy definitivo, a fonte de publicação do GitHub Pages deverá ser GitHub Actions, com publicação manual a partir da `main` após passar nas verificações. A CI também testa o build com base `/workout-tracker/`. [Preparação da publicação](releases/v1.0.0.md) Use o mesmo endereço público durante a avaliação que envolve dados reais ou exporte e restaure um backup ao trocar de origem.
