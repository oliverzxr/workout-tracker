# Workout Tracker

Aplicativo de treino em português brasileiro. Monte rotinas, registre séries e acompanhe sua progressão no dispositivo. A candidata `1.0.0-rc.1` reúne o módulo completo de treinamento.

## Avaliar a candidata

Use Node.js 24 LTS e npm. O build de produção permite avaliar instalação, uso offline, backup e exportação.

```sh
npm ci
npm run build
npm run preview -- --host 127.0.0.1 --port 4186
```

Abra [a aplicação](http://127.0.0.1:4186/). O armazenamento do navegador é vinculado ao endereço de acesso. Para trazer treinos de outro endereço, exporte um backup JSON lá e restaure em **Ajustes**.

Para conferir a interface preenchida, use `npm run demo` e abra [a demonstração](http://127.0.0.1:4187/demo.html) ou [o treino ativo de exemplo](http://127.0.0.1:4187/demo.html?state=active#/treino). A demonstração usa o mesmo editor com um repositório em memória e repõe as amostras quando recarregada.

## Usar o aplicativo

1. Monte uma rotina ou inicie um treino livre em **Início**.
2. Adicione exercícios do catálogo. Use o menu de cada exercício para reordenar e ajustar o descanso da sessão. Em **Gerenciar exercícios**, defina o descanso padrão dos próximos treinos.
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
| Treino ativo | [Celular](docs/screenshots/rc/mobile-treino-ativo.png) | [Desktop](docs/screenshots/rc/desktop-treino-ativo.png) |
| Histórico | [Celular](docs/screenshots/rc/mobile-historico.png) | [Desktop](docs/screenshots/rc/desktop-historico.png) |
| Progresso | [Celular](docs/screenshots/rc/mobile-progresso.png) | [Desktop](docs/screenshots/rc/desktop-progresso.png) |
| Ajustes offline | [Celular](docs/screenshots/rc/mobile-ajustes-offline.png) | [Desktop](docs/screenshots/rc/desktop-ajustes-offline.png) |

[Início vazio](docs/screenshots/rc/mobile-inicio-vazio.png) · [Treino vazio](docs/screenshots/rc/mobile-treino-vazio.png)

## Documentação

- [Roteiro de validação e testes](docs/validacao-rc.md)
- [Sistema visual](docs/sistema-visual.md)
- [Arquitetura e métricas](docs/arquitetura.md)
- [Roadmap do produto](docs/roadmap.md)
- [Viabilidade de importar CSV do Hevy](docs/importacao-hevy.md)
- [Licenças de terceiros distribuídas com o app](public/THIRD-PARTY-NOTICES.txt)
- [Projeto original de aprendizado](https://github.com/oliverzxr/workout-tracker/tree/learning)
