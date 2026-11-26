# Avaliação da importação de histórico do Hevy

**Resultado:** tecnicamente viável como recurso posterior. O Hevy oferece uma exportação de treinos em formato que pode ser aberto como CSV, disponível no perfil em **Settings → Export & Import Data → Export Data → Export Workouts**. O guia oficial confirma que o arquivo contém o histórico, mas não documenta o esquema de colunas do CSV. [Central de ajuda do Hevy](https://help.hevyapp.com/hc/en-us/articles/43708290987415-Exporting-Your-Data-from-Hevy)

Antes de implementar, precisamos validar o leiaute com arquivos reais anonimizados, incluindo exportações que variem por idioma, configuração de unidades e tipo de série. A primeira versão com importação deve:

1. Interpretar corretamente delimitadores, aspas, descrições com quebras de linha, datas e unidades, com prévia antes de salvar.
2. Agrupar as linhas por treino e exercício, preservando ordem, tipo de série e repetições. Resolver nomes do catálogo com confirmação quando o mapeamento for ambíguo.
3. Exibir campos compatíveis e informar quais linhas exigem tratamento adicional, por exemplo séries baseadas em duração ou distância ou dados de esforço em um campo com semântica diferente de RIR.
4. Identificar duplicatas, permitir correções na prévia, aplicar a importação atomicamente e testar a reimportação do mesmo arquivo.

A versão de avaliação restaura backups JSON próprios e exporta históricos em CSV. O escopo de lançamento aprovado permite entregar a v1.0 com esses formatos enquanto a importação do Hevy é validada.
