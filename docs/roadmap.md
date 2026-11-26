# Roadmap do Workout Tracker

O produto acompanha evolução física ao longo do tempo. A 1.0 reúne **treinamento e progressão muscular**. O registro local e a exportação formam a base de uso. As demais áreas entram quando houver um fluxo que justifique novos dados, permissões ou custos de operação.

| Módulo futuro | Primeira entrega possível | Critério de evolução |
| --- | --- | --- |
| Peso e composição física | Peso corporal e medidas registrados manualmente, com unidade, data e edição. | Tratar tendências, origem e unidades sem duplicar registros importados posteriormente. |
| Sono, fadiga e recuperação | Duração, horários e percepção de recuperação informados no dispositivo. | Consultar tendências, origem das observações e lacunas, mantendo a decisão de treino com a pessoa. |
| Alimentação | Refeições manuais com calorias e macronutrientes, unidades e porções editáveis. | Acrescentar busca por alimento e código de barras após validar cobertura, licença e qualidade. |
| Análises integradas | Comparações por período entre treinamento e registros disponíveis. | Mostrar lacunas, unidades e métodos. Associações observadas não fundamentam diagnóstico. |
| Conta e sincronização | Autenticação, cópia entre dispositivos e registro mesmo sem rede. | Testar isolamento de contas, filas, exclusões e edições concorrentes. |
| Integrações de saúde | Importar dados autorizados pelo usuário, por categoria e fonte. | Pedir acesso granular e deixar claro como revogar, excluir e exportar registros. |

O treinamento segue usando os contratos atuais de domínio e persistência. Um novo módulo pode ganhar seu contrato e estado quando existir um fluxo real, compartilhando navegação, tokens visuais e componentes de base. Os dados terão origem, instante, unidade e ID estável. A ordem de evolução será revista com o uso real.

## Integrações avaliadas

| Integração | Encaixe na PWA, backend ou nativo | Condições para adoção |
| --- | --- | --- |
| Open Food Facts | A PWA pode buscar produtos de código de barras on-line. Um backend facilita a identificação do cliente conforme os termos da API, limites e um cache governado. Uma base parcial versionada pode servir offline. | Dados sob ODbL, com atribuição e obrigações para bases derivadas. Fotos têm licença e direitos de terceiros próprios, geralmente CC BY-SA. Separar a procedência de bases e produtos. Priorizar códigos de barras e testar cobertura e erros de nutrição no Brasil. [Condições de reutilização](https://world.openfoodfacts.org/data) · [API oficial](https://openfoodfacts.github.io/openfoodfacts-server/api/) |
| USDA FoodData Central | Recorte de downloads estáticos compatível com PWA offline. Busca direta na API em produção requer backend para manter a chave privada e controlar cotas. | Dados CC0, com atribuição solicitada. Documentar versão, bases usadas, data e unidades. A cota-padrão publicada é de 1.000 chamadas por hora por IP. Validar relevância para alimentos e porções brasileiras. [API](https://fdc.nal.usda.gov/api-guide/) · [Downloads](https://fdc.nal.usda.gov/download-datasets/) |
| TBCA | Consulta humana pelo site. Um conjunto licenciado poderia ser transformado em snapshot para PWA ou servido por um backend. | Prioridade para alimentos brasileiros e medidas caseiras. O site traz restrição de reprodução do material. Solicitar termos e autorização expressa para extração, armazenamento, uso comercial e redistribuição antes de empacotar dados. [TBCA](https://www.tbca.net.br/index.html) |
| Apple HealthKit | Exige app iOS nativo ou encapsulamento com bridge nativa. | Capacidade do Xcode, justificativas de uso, permissões por tipo de dado e política para dados de saúde. Levar apenas categorias úteis e autorizadas. [HealthKit](https://developer.apple.com/documentation/healthkit/setting-up-healthkit) |
| Android Health Connect | Exige app Android ou bridge com SDK nativo. Integrado ao sistema a partir do Android 14. Versões compatíveis anteriores usam o app Health Connect. | Permissões em manifesto e execução, suporte por versão, origem dos registros, políticas da Play Store e testes de revogação. [Health Connect](https://developer.android.com/health-and-fitness/health-connect/get-started) |
| Supabase e PostgreSQL | Backend futuro da própria PWA e de outros clientes. A chave publicável do Supabase pode ser usada no cliente com RLS. Chaves secretas e privilégios administrativos ficam no servidor. | IDs próprios, autorização por conta, exportação portável e migração idempotente. Testar isolamento de linhas, recuperação, filas offline, exclusões e conflito entre aparelhos. Dimensionar custos de armazenamento, tráfego e regiões antes de contratar. [Chaves Supabase](https://supabase.com/docs/guides/getting-started/api-keys) · [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) |
| CSV do Hevy | Importação local compatível com a PWA, por arquivo escolhido pela pessoa. | O suporte oficial descreve export de treinos. Validar amostras anonimizadas reais, unidades, datas e tipos de séries. Pré-visualizar a associação aos IDs internos e tornar a importação idempotente antes de gravar. [Exportação oficial](https://help.hevyapp.com/hc/en-us/articles/43708290987415-Exporting-Your-Data-from-Hevy) · [Plano do importador](importacao-hevy.md) |

## Evolução para apps nativos

Uma bridge como Capacitor permite avaliar reuso da interface React e fornecer plugins nativos de saúde. Se desempenho, distribuição ou experiência das plataformas justificarem interfaces próprias, os contratos e regras TypeScript podem continuar compartilhados, com decisão posterior entre React Native e interfaces nativas. Avaliar capacidade de suporte, revisão das lojas, acessibilidade real, transferência de dados armazenados no navegador e atualização simultânea de clientes. [Capacitor](https://capacitorjs.com/docs)

## Privacidade, segurança e modelo comercial

Dados de saúde exigem tratamento compatível com a LGPD assim que houver coleta ou controle de dados pessoais no serviço. Desde o desenho, identificar finalidade e hipótese legal, minimizar os dados, tratar dados sensíveis conforme o art. 11 e oferecer os direitos do titular previstos no art. 18. Rever obrigações sobre transparência, retenção, eliminação, terceiros, transferências internacionais e incidentes antes de abrir contas. [Lei nº 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

Para uma arquitetura sincronizada, validar criptografia em trânsito e em repouso, controle de acesso por menor privilégio, backups com testes de recuperação e logs sem dados sensíveis. O armazenamento desta candidata permanece no dispositivo. Backups JSON carregam os registros em claro e devem ser guardados em local protegido pelo titular.

Uma proposta gratuita inclui treino local, catálogo, histórico e portabilidade. Uma proposta premium pode financiar sincronização, análise integrada avançada e planejamento, com custos e benefícios validados. Backup, exportação e exclusão continuam disponíveis para proteger o controle sobre os próprios dados. Dados de saúde ficam fora de publicidade direcionada e da revenda.
