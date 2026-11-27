# Plataforma integrada · 1.1.0-alpha.1

A evolução é desenvolvida em `codex/fitness-platform`. A prévia pública de portfólio usa a candidata de treinamento 1.0.0-rc.4. Os contratos de treino e o backup original continuam válidos. A publicação estática entrega PWA e demonstração em memória. [Aplicação pública](https://oliverzxr.github.io/workout-tracker/) · [Demonstração de treino](https://oliverzxr.github.io/workout-tracker/demo.html?state=active#/treino)

## Módulos locais

- Visão geral com rotina escolhida para o próximo treino, semana de treino, séries válidas por grupo muscular, alimentação e peso. A recuperação será exibida quando houver registros e fonte identificada.
- Diário por data, refeições, alimentos próprios por 100 g, gramas ou porções de massa conhecida, metas e histórico editável. Entradas guardam uma cópia da composição e sua procedência, preservando o histórico quando um cadastro muda.
- Peso em kg e medidas personalizadas em cm, com objetivo por medida, edição e uma observação por dia e medida. A média usa as medições efetivamente registradas nos sete dias corridos terminados na data de cada ponto. Dias ausentes permanecem ausentes.
- IndexedDB separado, revisão otimista e validação estrita. Dois arquivos de backup em Ajustes, com confirmação de restauração: treino e nutrição/corpo. A demo usa dois repositórios em memória. Os backups ficam em texto claro para portabilidade. [Arquitetura do treino](arquitetura.md)


A visão geral segue o princípio de mostrar informação diária e oferecer o histórico nas páginas de detalhe. Na inspiração da Oura, interessa a separação entre o dia e a tendência; a plataforma calcula somente as medidas que o diário registra. [Visão geral da Oura](https://support.ouraring.com/hc/en-us/articles/360058599753-How-to-Use-the-Oura-App)

## Open Food Facts

O adaptador Node executa durante desenvolvimento e prévia do Vite. O navegador envia a consulta deliberada a `/api/foods`; o servidor encaminha somente o termo ou código ao Open Food Facts, com identificação do aplicativo. Consultas por código usam v3. A busca nominal usa Search-a-licious com filtro de país. Quando o índice de busca não traz a tabela nutricional, o usuário consulta o rótulo por código na mesma tela. Para adoção em produção, portar o adaptador para um serviço com quota controlada. GitHub Pages serve a candidata de treino sem depender dessa API. [Documentação oficial](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/) · [Busca textual e filtros](https://openfoodfacts.github.io/search-a-licious/users/ref-openapi/)

O limite local é de uma busca nominal a cada 6,5 s e uma consulta por código a cada 650 ms, dentro das cotas publicadas de 10 e 100 por minuto. Resultados ficam em cache de memória limitado por cinco minutos. Dados pessoais, metas e diários ficam no dispositivo. A API informa dados colaborativos, sujeitos a lacunas e divergências de rótulo. Em 27/11/2026, o código 7891000100103 retornou um produto e a consulta de exemplo “aveia” com filtro brasileiro encontrou 357 correspondências no índice Search-a-licious. Isso confirma funcionamento e alguma cobertura; estimar representatividade exige amostragem de marcas e categorias.

Para uso no diário, o rótulo precisa trazer energia, proteína, carboidratos e gorduras por 100 g. Campos ausentes não recebem zero. O adaptador rejeita apresentação explicitamente volumétrica e aceita porção quando o rótulo indica massa. A alternativa manual funciona offline. O painel e as entradas mostram atribuição ao Open Food Facts. Dados são ODbL e simples referências preservam procedência. Fotografias têm termos próprios e ficam fora desta integração. Uma base derivada redistribuída comercialmente deverá ser analisada à luz das obrigações de atribuição e reciprocidade da ODbL. [Dados e termos do Open Food Facts](https://world.openfoodfacts.org/data)

## Próximas integrações

| Integração | Problema que resolve e condição de entrada |
| --- | --- |
| Supabase Auth, PostgreSQL e RLS | Sincronizar contas após testar isolamento por usuário. Tabelas relacionais com IDs do cliente, revisão por entidade, registro de exclusões e regras RLS com testes para duas contas. Realtime pode sinalizar que há alterações. Uma fila local idempotente, retomada por cursor e política explícita de conflitos resolvem edições em aparelhos desconectados. Testar recuperação, exportação e exclusão antes de ativar contas. [Auth](https://supabase.com/docs/guides/auth/architecture) · [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) |
| USDA FoodData Central | Complementar alimentos genéricos e composições de referência. Separar fonte e versão, revisar diferenças de variedades e medidas brasileiras, manter a chave no servidor se usar a API. Downloads CC0 permitem subset offline com atribuição solicitada. [API](https://fdc.nal.usda.gov/api-guide/) |
| Hevy | Priorizar CSV local com prévia de mapeamento, unidades, horário, tipo de série e deduplicação. A chave pessoal requer Hevy Pro. Integração de terceiros via OAuth precisa de cadastro e revisão dos termos e escopos. Começar com leitura quando houver demanda e autorização. [Exportar CSV](https://help.hevyapp.com/hc/en-us/articles/43708290987415-Exporting-Your-Data-from-Hevy) · [Termos da API](https://developers.hevy.com/terms) |
| HealthKit e Health Connect | Reaproveitar registros de saúde com origem, unidade, fuso e deduplicação. Exigem cliente ou bridge nativa e permissão por tipo. Informar revogação, exclusão e lacunas. [Apple HealthKit](https://developer.apple.com/documentation/healthkit/setting-up-healthkit) · [Android Health Connect](https://developer.android.com/health-and-fitness/health-connect/get-started) |
| APIs de IA | Uma futura API pode resumir dados agregados e explicar material com referências revisadas. Comparar retenção, acesso, custo e opção local. Consentimento explícito por finalidade, avaliação de alucinações e limites para aconselhamento de saúde precedem uso de dados reais. Credenciais ficam no servidor. [Controles de dados da API OpenAI](https://platform.openai.com/docs/guides/your-data) |

Evolução fotográfica começa com dados locais, exportação e exclusão explícitas. Modelar consentimento e risco de imagens íntimas antes de avaliar uploads. Sono, fadiga e recuperação começam por observações com unidade, origem e janela temporal. Guardar dados mínimos e aplicar política de retenção antes de sincronizar. [Roadmap e LGPD](roadmap.md)

## Evidência e interpretação

Séries válidas, sessões, carga, repetições, RIR e tendência são observações com uma regra de cálculo. Uma futura contagem direta e indireta pode versionar a função do músculo em cada exercício; as categorias secundárias atuais são editoriais e não equivalem a frações comprovadas de estímulo. Frequência é número de sessões ou dias com exposição dentro do período, com a unidade declarada.

Para cruzar alimentação, recuperação e desempenho, alinhar dias e unidades, mostrar lacunas, tamanho da amostra, possíveis atrasos e fatores de confusão. Correlação intrapessoal não estabelece causa nem prescrição. Recomendações futuras devem indicar fonte, população, incerteza e data de revisão. Nenhum índice sintético de recuperação ou hipertrofia entra nesta versão. [Posicionamento ACSM sobre treinamento resistido](https://doi.org/10.1249/mss.0000000000003897)

## Mídia de exercício

Os quadros atuais continuam atribuídos. A apresentação aumenta a área útil e trata as imagens em tons escuros sem trocar os arquivos licenciados. Para uma coleção própria, gravar ângulo fixo, duas fases de movimento, cadência natural e fundo comum. Validar técnica antes de distribuir. MP4 curto com poster e reprodução solicitada é candidato principal. Comparar custo de decodificação, tamanho, acessibilidade e pausa com WebP animado e GIF. Arquivos animados devem carregar sob demanda, respeitar movimento reduzido e funcionar com alternativa estática. [Avaliação e créditos](midia-em-movimento.md)

## Validação

Os testes de domínio verificam conversão de porções, totais, rótulos incompletos, separação de bases, backup e média móvel. Os fluxos de interface cobrem registro manual offline, recarga, edição de peso, medida personalizada, objetivos, resultado do catálogo, consulta do rótulo e indisponibilidade. Axe percorre as superfícies exercitadas. O fluxo de busca por nome, rótulo e registro de 40 g também foi executado contra o provedor real no navegador.
