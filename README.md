# Workout Tracker

Aplicativo de musculação em português brasileiro. Crie rotinas, registre séries e acompanhe seu progresso. O treino ativo é salvo no dispositivo e pode ser retomado depois de fechar o app.

## Rodar a versão de avaliação

Use Node.js 24 LTS e npm.

```sh
npm ci
npm run dev
```

Para avaliar a instalação e o modo offline, use o build de produção. Abra o endereço mostrado pelo Vite, normalmente `http://localhost:4173`. Em um iPhone físico, abra a aplicação por HTTPS.

```sh
npm run build
npm run preview
```

## Usar o aplicativo

1. Abra **Rotinas** para montar um treino ou inicie um treino livre em **Início**.
2. Adicione exercícios do catálogo. O menu de cada exercício permite reordenar e ajustar o descanso daquela sessão. Em **Gerenciar exercícios**, você define o descanso padrão dos próximos treinos.
3. Digite a carga em kg com vírgula ou ponto, repetições e, se quiser, RIR. Use o botão de confirmação para concluir a série e iniciar o descanso. Para aquecimento, selecione o tipo no menu da série.
4. Finalize o treino para consultá-lo e editá-lo em **Histórico**. Em **Progresso**, acompanhe frequência semanal, séries válidas por grupo muscular, volume e recordes por exercício.
5. Em **Ajustes**, instale o app, baixe um backup JSON ou exporte o histórico em CSV.

No iPhone, use **Safari → Compartilhar → Adicionar à Tela de Início** e ative **Abrir como App da Web** quando essa opção aparecer. Depois do primeiro carregamento completo, o app funciona offline. O cronômetro recalcula o tempo restante ao voltar para a tela. No iPhone, conte com o alerta visual ao voltar ao app. [Instruções da Apple](https://support.apple.com/en-in/guide/iphone/iph42ab2f3a7/27/ios/27)

### Seus dados

O navegador guarda seus dados localmente. Exporte um backup antes de limpar os dados do site, mudar de aparelho, de perfil ou de endereço. Para transferir os treinos, restaure o backup no destino. A restauração substitui os dados locais após confirmação.

## Testes

```sh
npm run lint
npm test
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Em Linux, use `npx playwright install --with-deps chromium webkit` para instalar também as dependências do sistema. A suíte de interface testa o build de produção em Chromium desktop e WebKit com viewport e toque de iPhone. O mesmo conjunto de verificações roda no GitHub Actions.

## Capturas da aplicação

[Início no desktop](docs/screenshots/inicio.png) · [Treino ativo no iPhone emulado](docs/screenshots/treino-iphone.png) · [Progresso no desktop](docs/screenshots/progresso.png)

As capturas foram geradas pela suíte de interface a partir de treinos registrados durante os testes.

## Documentação

- [Arquitetura, armazenamento e métricas](docs/arquitetura.md)
- [Viabilidade de importar histórico do Hevy](docs/importacao-hevy.md)
- [Licenças de terceiros distribuídos com o app](public/THIRD-PARTY-NOTICES.txt)
- [Projeto original de aprendizado](https://github.com/oliverzxr/workout-tracker/tree/learning)
