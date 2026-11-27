# Workout Tracker

Aplicativo de treino em português brasileiro. Monte rotinas, registre séries e acompanhe sua progressão no dispositivo. A candidata de treino `1.0.0-rc.4` está disponível publicamente. Esta branch tem a plataforma experimental `1.1.0-alpha.1`, com nutrição e evolução corporal.

## Avaliar a plataforma

[Portfólio de treino por HTTPS](https://oliverzxr.github.io/workout-tracker/demo.html?state=active#/treino) · [Documentação da plataforma](docs/plataforma.md)

A versão de treino é a base da apresentação. A demo possui rotinas e histórico de exemplo, com estado separado e descartável.

Use Node.js 24 LTS e npm. O build de produção permite avaliar instalação, uso offline, backup e exportação.

```sh
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4200
```

Abra [a aplicação](http://127.0.0.1:4200/). O armazenamento do navegador é vinculado ao endereço de acesso. Para trazer treinos de outro endereço, exporte um backup JSON lá e restaure em **Ajustes**.

Para conferir a interface preenchida, execute `npm run build:demo` e `npm run preview -- --mode demo --host 127.0.0.1 --port 4201`. Abra [Nutrição](http://127.0.0.1:4201/demo.html#/nutricao), [evolução corporal](http://127.0.0.1:4201/demo.html#/corpo), [visão geral](http://127.0.0.1:4201/demo.html#/inicio) ou [o treino ativo de exemplo](http://127.0.0.1:4201/demo.html?state=active#/treino). A demonstração usa o mesmo editor com um repositório em memória e repõe as amostras quando recarregada.

## Usar o aplicativo

1. Monte uma rotina ou inicie um treino livre em **Início**.
2. Abra **Rotinas → Gerenciar exercícios** para buscar 76 movimentos por nome ou alias e filtrar por músculos e equipamento. A ficha reúne instruções, histórico, progressão e, quando disponível, quadros de execução sob demanda. No treino, use o seletor rápido para adicionar movimentos. Use o menu de cada exercício para reordenar e ajustar o descanso da sessão. Em **Gerenciar exercícios**, defina o descanso padrão dos próximos treinos.
3. Digite a carga em kg com vírgula ou ponto, as repetições e, se quiser, RIR. Concluir a série inicia o descanso. O menu da série permite marcar aquecimento e mudar a ordem.
4. Finalize o treino para consultá-lo ou editá-lo em **Histórico**. Em **Progresso**, veja frequência, volume e séries válidas por grupo muscular, evolução e recordes.
5. Em **Ajustes**, instale o app, baixe um backup JSON ou exporte o histórico em CSV.

O app funciona offline depois do primeiro carregamento completo. No iPhone, abra por HTTPS e use **Safari → Compartilhar → Adicionar à Tela de Início**. Ative **Abrir como App da Web** quando essa opção aparecer. O cronômetro recalcula o tempo restante ao voltar à tela. [Instruções da Apple](https://support.apple.com/en-in/guide/iphone/iph42ab2f3a7/27/ios/27)

### Seus dados

O navegador guarda seus dados localmente. Exporte um backup antes de limpar os dados do site ou de trocar de aparelho, perfil ou endereço. A restauração substitui os dados locais após confirmação.

## Capturas da candidata

| Tela | Celular | Desktop |
| --- | --- | --- |
| Início | [Celular](docs/screenshots/rc/mobile-inicio.png) | [Desktop](docs/screenshots/rc/desktop-inicio.png) |
| Rotinas | [Celular](docs/screenshots/rc/mobile-rotinas.png) | [Desktop](docs/screenshots/rc/desktop-rotinas.png) |
| Catálogo | [Celular](docs/screenshots/rc/mobile-catalogo.png) | [Desktop](docs/screenshots/rc/desktop-catalogo.png) |
| Ficha de exercício | [Celular](docs/screenshots/rc/mobile-exercicio.png) · [Progressão](docs/screenshots/rc/mobile-exercicio-progresso.png) | [Desktop](docs/screenshots/rc/desktop-exercicio.png) |
| Treino ativo | [Celular](docs/screenshots/rc/mobile-treino-ativo.png) | [Desktop](docs/screenshots/rc/desktop-treino-ativo.png) |
| Histórico | [Celular](docs/screenshots/rc/mobile-historico.png) | [Desktop](docs/screenshots/rc/desktop-historico.png) |
| Progresso | [Celular](docs/screenshots/rc/mobile-progresso.png) | [Desktop](docs/screenshots/rc/desktop-progresso.png) |
| Ajustes offline | [Celular](docs/screenshots/rc/mobile-ajustes-offline.png) | [Desktop](docs/screenshots/rc/desktop-ajustes-offline.png) |
| Falha de armazenamento | [Celular](docs/screenshots/rc/mobile-erro-armazenamento.png) | [Desktop](docs/screenshots/rc/desktop-erro-armazenamento.png) |

[Início vazio](docs/screenshots/rc/mobile-inicio-vazio.png) · [Treino vazio](docs/screenshots/rc/mobile-treino-vazio.png)

## Capturas da plataforma

| Tela | Celular | Desktop |
| --- | --- | --- |
| Visão geral | [Celular](docs/screenshots/plataforma/mobile-visao-geral-metricas.png) | [Desktop](docs/screenshots/plataforma/desktop-visao-geral-metricas.png) |
| Nutrição | [Celular](docs/screenshots/plataforma/mobile-nutricao.png) | [Desktop](docs/screenshots/plataforma/desktop-nutricao.png) |
| Evolução corporal | [Celular](docs/screenshots/plataforma/mobile-corpo.png) | [Desktop](docs/screenshots/plataforma/desktop-corpo.png) |


## Documentação

- [Roteiro de validação e testes](docs/validacao-rc.md)
- [Sistema visual](docs/sistema-visual.md)
- [Referências e decisões de design](docs/design-rc3.md)
- [Avaliação de demonstrações animadas](docs/midia-em-movimento.md)
- [Arquitetura e métricas](docs/arquitetura.md)
- [Roadmap do produto e integrações](docs/roadmap.md)
- [Comparativo das fontes do catálogo](docs/fontes-catalogo.md)
- [Procedência e atribuição das ilustrações](docs/catalogo-midias.md)
- [Auditoria de licença e uso comercial](docs/licencas-projeto.md)
- [Notas e preparação da release 1.0.0](docs/releases/v1.0.0.md)
- [Viabilidade de importar CSV do Hevy](docs/importacao-hevy.md)
- [Licenças de terceiros distribuídas com o app](public/THIRD-PARTY-NOTICES.txt)
- [Projeto original de aprendizado](https://github.com/oliverzxr/workout-tracker/tree/learning)
