# Exemplo de Validação - API Censo Escolar

## Formato Novo (Recomendado) - Lista de Registros

```json
{
  "records": [
    "00|12345678|ESCOLA EXEMPLO|3|1|0|Rua das Flores, 123|Centro|12345000|27|1234567|São Paulo|SP|Brasil|123456789|escola@exemplo.com",
    "10|12345678|001|Sala de Aula|1|1|1|0|1|20|15|1|1|1|0|0|1|1|1|1|1|1|1|1|1|1|1|1|1|1",
    "20|12345678|001|1|14|1|1|1|Turma 1º Ano|1|1|35|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0",
    "20|12345678|002|1|15|1|1|1|Turma 2º Ano|1|1|30|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0",
    "30|12345678|001|123456789012|12345678901|JOAO DA SILVA|15/08/2010|1|MARIA DA SILVA|JOSE DA SILVA|1|1||1|76|1234567|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|1234567890123456789012345678901234567890|76|12345000|1234567|1|7|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|joao@exemplo.com",
    "99"
  ],
  "version": "2025"
}
```

## Formato Legado - Conteúdo Concatenado

```json
{
  "content": "00|12345678|ESCOLA EXEMPLO|3|1|0|Rua das Flores, 123|Centro|12345000|27|1234567|São Paulo|SP|Brasil|123456789|escola@exemplo.com\n10|12345678|001|Sala de Aula|1|1|1|0|1|20|15|1|1|1|0|0|1|1|1|1|1|1|1|1|1|1|1|1|1|1\n20|12345678|001|1|14|1|1|1|Turma 1º Ano|1|1|35|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0\n30|12345678|001|123456789012|12345678901|JOAO DA SILVA|15/08/2010|1|MARIA DA SILVA|JOSE DA SILVA|1|1||1|76|1234567|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|1234567890123456789012345678901234567890|76|12345000|1234567|1|7|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|joao@exemplo.com\n99",
  "version": "2025"
}
```

## Estrutura dos Registros

### Registro 00 - Identificação da Escola

- Campo 1: Tipo de registro (00)
- Campo 2: Código INEP da escola (8 dígitos)
- Campo 3: Nome da escola
- ... (demais campos conforme layout)

### Registro 10 - Caracterização da Escola

- Campo 1: Tipo de registro (10)
- Campo 2: Código INEP da escola
- ... (demais campos conforme layout)

### Registro 20 - Turmas

- Campo 1: Tipo de registro (20)
- Campo 2: Código INEP da escola
- Campo 3: Código da turma
- Campo 4: Nome da turma
- Campo 5: Etapa de ensino
- ... (demais campos conforme layout)

### Registro 30 - Pessoa Física

- Campo 1: Tipo de registro (30)
- Campo 2: Código INEP da escola
- Campo 3: Código da pessoa no sistema
- Campo 4: Identificação única INEP
- Campo 5: CPF
- Campo 6: Nome completo
- Campo 7: Data de nascimento
- ... (demais campos conforme layout)

### Registro 99 - Fim de Arquivo

- Campo 1: Tipo de registro (99)

## Vantagens do Novo Formato (Lista de Registros)

1. **Estrutura mais clara**: Cada registro é um elemento da lista
2. **Facilita manipulação**: Adicionar/remover registros específicos
3. **Melhor para APIs**: Formato JSON nativo
4. **Evita problemas de encoding**: Não há quebras de linha para gerenciar
5. **Mais flexível**: Permite validar subconjuntos de registros

## Exemplo de Resposta

```json
{
  "isValid": false,
  "errors": [
    {
      "lineNumber": 3,
      "recordType": "CLASSES",
      "fieldName": "etapa_ensino",
      "fieldPosition": 4,
      "fieldValue": "99",
      "ruleName": "invalid_education_stage",
      "errorMessage": "Etapa de ensino inválida",
      "severity": "error"
    }
  ],
  "warnings": [],
  "totalRecords": 6,
  "processedRecords": 5,
  "processingTime": 45,
  "fileMetadata": {
    "fileName": "records.txt",
    "fileSize": 1024,
    "totalLines": 6,
    "encoding": "utf-8",
    "uploadDate": "2025-10-07T11:41:12.335Z"
  }
}
```
