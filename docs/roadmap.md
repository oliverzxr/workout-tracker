# Roadmap do Workout Tracker

O objetivo é acompanhar a evolução física ao longo do tempo, com registros que continuem úteis quando avaliados em conjunto. A candidata 1.0 reúne o módulo de treinamento, com os dados disponíveis no dispositivo e portáveis em backup.

| Etapa | Entrega | Critério de aceite |
| --- | --- | --- |
| Treinamento 1.0 | Rotinas, registro de séries, descanso, histórico, progressão, backup e uso offline. | O treino iniciado no celular pode ser retomado e concluído sem internet. Um backup restaura o histórico em outro perfil. |
| Peso e medidas | Registro manual de peso corporal e medidas, com unidade, data e edição. | Uma série histórica usa critérios de medida claros, com exportação e histórico preservados. |
| Sono e recuperação | Registro de duração, horário e percepção de recuperação. | Os registros mantêm data local e permitem consultar tendências sem atribuir diagnóstico. |
| Nutrição | Registro de refeições e totais por dia, inicialmente com entrada manual. | Uma refeição pode ser ajustada e exportada. As fontes dos dados e as unidades ficam claras. |
| Análise integrada | Comparações temporais entre treinamento e os demais registros disponíveis. | Cada gráfico explicita período, unidade e lacunas. Associações são apresentadas como observações. |
| Conta e sincronização | Autenticação e sincronização entre dispositivos, mantendo capacidade de registro offline. | Os dados ficam isolados por conta. Edições concorrentes, exclusões e recuperação após desconexão têm comportamento verificável. |

A ordem após treinamento é provisória. A prioridade pode mudar conforme o uso real. Por exemplo, sincronização pode vir antes da análise integrada se a alternância entre aparelhos se tornar uma necessidade frequente.

## Organização

O treinamento continua usando o contrato `TrackerRepository` e o adaptador IndexedDB atuais. Um novo módulo poderá declarar seu próprio contrato quando tiver um fluxo real. O shell, os tokens de interface e os componentes genéricos seguem compartilhados. Os atalhos para módulos serão adicionados à navegação quando houver funcionalidades utilizáveis.

Quando houver conta e sincronização, escolher a infraestrutura a partir dos requisitos de propriedade, privacidade, sessões e conflitos. Uma avaliação de Supabase/PostgreSQL deverá incluir políticas de acesso por conta, migração de backups locais e comportamento offline. A sincronização exigirá versionamento do formato de exportação, operações idempotentes e uma política explícita para resolução de conflitos. Até lá, a base permanece IndexedDB.

## Integração dos registros

Manter instantes com fuso de apresentação definido, unidades explícitas e identificadores estáveis. Avaliar os períodos e lacunas antes de cruzar registros. A análise integrada poderá ler os registros dos módulos quando a semântica de cada um estiver estável.
