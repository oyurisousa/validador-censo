# 🧪 Exemplos de Uso - Validação Fase 2 (Registro 90)

Este arquivo contém exemplos práticos de como usar a API de validação com o registro 90 (Situação do Aluno na Turma).

---

## 📝 Formato do Registro 90

```
90|<CÓDIGO_INEP>|<TURMA_ENTIDADE>|<TURMA_INEP>|<ALUNO_INEP>|<ALUNO_ENTIDADE>|<MATRÍCULA>|<SITUAÇÃO>
```

### Campos:

1. **90**: Tipo de registro (fixo)
2. **Código INEP da Escola**: 8 dígitos numéricos
3. **Código da Turma na Entidade**: Até 20 caracteres (campo IGNORADO)
4. **Código da Turma INEP**: Até 10 dígitos numéricos
5. **Código do Aluno INEP**: 12 dígitos numéricos
6. **Código do Aluno na Entidade**: Até 20 caracteres (campo IGNORADO)
7. **Código da Matrícula**: Até 12 dígitos numéricos
8. **Situação do Aluno**: 1 dígito (1-7)

### Situações Permitidas:

- **1** - Transferido
- **2** - Deixou de frequentar
- **3** - Falecido
- **4** - Reprovado
- **5** - Aprovado
- **6** - Aprovado concluinte
- **7** - Em andamento/Sem movimentação

---

## 🔧 Exemplos de Requisições

### 1. Validar Linha Individual (validate-line)

#### ✅ Exemplo Válido - Aluno Aprovado

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "90",
    "line": "90|12345678|TURMA01|1234567890|123456789012|ALU001|987654321|5",
    "version": "2025",
    "phase": "2"
  }'
```

**Resposta Esperada:**

```json
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "recordType": "90",
  "lineNumber": 1
}
```

#### ✅ Exemplo Válido - Aluno Transferido

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "90",
    "line": "90|12345678||1234567890|123456789012||987654321|1",
    "version": "2025",
    "phase": "2"
  }'
```

#### ✅ Exemplo Válido - Aluno Reprovado

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "90",
    "line": "90|87654321|TURMA02|9876543210|098765432109|ALU002|123456789|4",
    "version": "2025",
    "phase": "2"
  }'
```

---

### ❌ Exemplos com Erros

#### Erro: Código da Turma INEP muito longo

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "90",
    "line": "90|12345678||12345678901|123456789012||987654321|5",
    "version": "2025",
    "phase": "2"
  }'
```

**Resposta Esperada:**

```json
{
  "isValid": false,
  "errors": [
    {
      "lineNumber": 1,
      "recordType": "90",
      "fieldName": "codigo_turma_inep",
      "fieldPosition": 3,
      "fieldDescription": "Código da turma INEP",
      "fieldValue": "12345678901",
      "ruleName": "turma_inep_max_length",
      "errorMessage": "O campo \"Código da turma – INEP\" está maior que o especificado.",
      "severity": "error"
    }
  ],
  "warnings": [],
  "recordType": "90",
  "lineNumber": 1
}
```

#### Erro: Situação Inválida

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "90",
    "line": "90|12345678||1234567890|123456789012||987654321|9",
    "version": "2025",
    "phase": "2"
  }'
```

**Resposta Esperada:**

```json
{
  "isValid": false,
  "errors": [
    {
      "lineNumber": 1,
      "recordType": "90",
      "fieldName": "situacao_aluno",
      "fieldPosition": 7,
      "fieldDescription": "Situação do aluno",
      "fieldValue": "9",
      "ruleName": "pattern",
      "errorMessage": "Campo situacao_aluno com valor inválido",
      "severity": "error"
    }
  ],
  "warnings": [],
  "recordType": "90",
  "lineNumber": 1
}
```

#### Erro: Código do Aluno INEP Inválido (não tem 12 dígitos)

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "90",
    "line": "90|12345678||1234567890|12345678901||987654321|5",
    "version": "2025",
    "phase": "2"
  }'
```

---

### 2. Validar Arquivo Completo (validate-file)

#### ✅ Exemplo Válido - Múltiplos Alunos

```bash
curl -X POST http://localhost:3000/validation/validate-file \
  -H "Content-Type: application/json" \
  -d '{
    "lines": [
      "89|12345678|12345678901|JOAO DA SILVA|1|diretor@escola.com.br",
      "90|12345678||1234567890|123456789012||987654321|5",
      "90|12345678||1234567890|098765432109||876543210|6",
      "90|12345678||1234567890|111222333444||765432109|4",
      "99"
    ],
    "version": "2025",
    "phase": "2"
  }'
```

**Resposta Esperada:**

```json
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "totalRecords": 5,
  "processedRecords": 5,
  "processingTime": 145,
  "fileMetadata": {
    "fileName": "file.txt",
    "fileSize": 312,
    "totalLines": 5,
    "encoding": "ISO-8859-1",
    "uploadDate": "2025-10-20T16:00:00.000Z"
  }
}
```

#### ✅ Exemplo Válido - Diferentes Situações

```bash
curl -X POST http://localhost:3000/validation/validate-file \
  -H "Content-Type: application/json" \
  -d '{
    "lines": [
      "89|12345678|12345678901|MARIA SANTOS|1|diretora@escola.com.br",
      "90|12345678||1000000001|111111111111||100000001|5",
      "90|12345678||1000000001|222222222222||100000002|4",
      "90|12345678||1000000001|333333333333||100000003|1",
      "90|12345678||1000000001|444444444444||100000004|2",
      "90|12345678||1000000001|555555555555||100000005|7",
      "99"
    ],
    "version": "2025",
    "phase": "2"
  }'
```

---

### 3. Upload de Arquivo (upload)

#### Criar arquivo de teste

```bash
# Criar arquivo censo_fase2_situacao_alunos.txt
cat > censo_fase2_situacao_alunos.txt << EOF
89|12345678|12345678901|JOAO DA SILVA|1|diretor@escola.com.br
90|12345678||1234567890|123456789012||987654321|5
90|12345678||1234567890|098765432109||876543210|6
90|12345678||1234567890|111222333444||765432109|4
90|12345678||9876543210|222333444555||654321098|1
90|12345678||9876543210|333444555666||543210987|2
99
EOF
```

#### Upload do arquivo

```bash
curl -X POST http://localhost:3000/validation/upload \
  -F "file=@censo_fase2_situacao_alunos.txt" \
  -F "version=2025" \
  -F "phase=2"
```

---

## 📊 Casos de Teste

### Teste 1: Todas as Situações Válidas

```bash
# 1 - Transferido
"90|12345678||1234567890|123456789012||987654321|1"

# 2 - Deixou de frequentar
"90|12345678||1234567890|123456789012||987654321|2"

# 3 - Falecido
"90|12345678||1234567890|123456789012||987654321|3"

# 4 - Reprovado
"90|12345678||1234567890|123456789012||987654321|4"

# 5 - Aprovado
"90|12345678||1234567890|123456789012||987654321|5"

# 6 - Aprovado concluinte
"90|12345678||1234567890|123456789012||987654321|6"

# 7 - Em andamento
"90|12345678||1234567890|123456789012||987654321|7"
```

---

### Teste 2: Código INEP da Escola Inválido

```json
{
  "recordType": "90",
  "line": "90|123456||1234567890|123456789012||987654321|5",
  "phase": "2"
}
```

**Resultado esperado**: Erro de tamanho (deve ter 8 dígitos)

---

### Teste 3: Código do Aluno INEP Inválido

```json
{
  "recordType": "90",
  "line": "90|12345678||1234567890|12345678901||987654321|5",
  "phase": "2"
}
```

**Resultado esperado**: Erro de tamanho (deve ter 12 dígitos)

---

### Teste 4: Código da Matrícula com Letras

```json
{
  "recordType": "90",
  "line": "90|12345678||1234567890|123456789012||ABC123|5",
  "phase": "2"
}
```

**Resultado esperado**: Erro de formato (deve ser numérico)

---

### Teste 5: Situação Inválida (0)

```json
{
  "recordType": "90",
  "line": "90|12345678||1234567890|123456789012||987654321|0",
  "phase": "2"
}
```

**Resultado esperado**: Erro de valor inválido (deve ser 1-7)

---

### Teste 6: Situação Inválida (8)

```json
{
  "recordType": "90",
  "line": "90|12345678||1234567890|123456789012||987654321|8",
  "phase": "2"
}
```

**Resultado esperado**: Erro de valor inválido (deve ser 1-7)

---

### Teste 7: Número de Campos Incorreto

```json
{
  "recordType": "90",
  "line": "90|12345678||1234567890|123456789012||987654321",
  "phase": "2"
}
```

**Resultado esperado**: Erro de contagem de campos (esperado: 8, encontrado: 7)

---

### Teste 8: Campos Vazios Obrigatórios

```json
{
  "recordType": "90",
  "line": "90||||||||",
  "phase": "2"
}
```

**Resultado esperado**: Múltiplos erros de campos obrigatórios não preenchidos

---

### Teste 9: Código da Turma INEP com Letras

```json
{
  "recordType": "90",
  "line": "90|12345678||TURMA123AB|123456789012||987654321|5",
  "phase": "2"
}
```

**Resultado esperado**: Erro de formato (deve ser numérico)

---

### Teste 10: Todos os campos corretos ✅

```json
{
  "recordType": "90",
  "line": "90|12345678|TURMA_LOCAL|1234567890|123456789012|ALU_LOCAL|987654321|5",
  "phase": "2"
}
```

**Resultado esperado**: Validação bem-sucedida

---

## ⚠️ Validações Contextuais (requerem dados externos)

As seguintes validações requerem integração com banco de dados ou APIs externas:

### 1. Código da Escola Igual ao Registro 89 Anterior

O código INEP da escola deve ser igual ao informado no registro 89 que antecede.

### 2. Turma Existe na Escola

O código da turma INEP deve existir e pertencer à escola informada.

### 3. Turma é de Escolarização

A turma deve ser de escolarização (não pode ser AEE, atividade complementar, etc.).

### 4. Turma Não é Itinerário Formativo Exclusivo

A turma não pode ser de itinerário formativo sem formação geral básica.

### 5. Aluno Vinculado à Turma

O aluno deve estar matriculado na turma informada.

### 6. Matrícula Pertence ao Aluno

O código da matrícula deve pertencer ao aluno informado.

### 7. Matrícula Pertence à Turma

A matrícula deve estar vinculada à turma informada.

### 8. Situações por Etapa de Ensino

#### Educação Infantil

- ❌ Não pode: 4 (Reprovado), 5 (Aprovado), 6 (Aprovado concluinte)
- ✅ Pode: 1 (Transferido), 2 (Deixou de frequentar), 3 (Falecido), 7 (Em andamento)

#### Aprovado Concluinte (situação 6)

Permitido apenas para etapas: 27, 28, 29, 32, 33, 34, 37, 38, 39, 40, 41, 67, 68, 70, 71, 73, 74

#### Em Andamento (situação 7)

Permitido apenas para etapas: 1, 2, 39, 40, 65, 67, 68, 69, 70, 71, 73, 74

### 9. Aluno Admitido Após

Se o aluno foi admitido após o período de referência, não pode ter situações: 3, 4, 5, 6, 7

---

## 🚫 Erros Comuns

### Erro: Tentando usar registro 90 na fase 1

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "90",
    "line": "90|12345678||1234567890|123456789012||987654321|5",
    "phase": "1"
  }'
```

**Resposta:**

```json
{
  "statusCode": 400,
  "message": "Tipo de registro \"90\" não é válido para FASE 1 (Matrícula Inicial). Registros permitidos: 00, 10, 20, 30, 40, 50, 60, 99"
}
```

---

## 📋 Estrutura de Arquivo Completo Fase 2

```
89|<ESCOLA>|<CPF_GESTOR>|<NOME_GESTOR>|<CARGO>|<EMAIL>
90|<ESCOLA>|<TURMA_ENT>|<TURMA_INEP>|<ALUNO_INEP>|<ALUNO_ENT>|<MATRICULA>|<SITUACAO>
90|<ESCOLA>|<TURMA_ENT>|<TURMA_INEP>|<ALUNO_INEP>|<ALUNO_ENT>|<MATRICULA>|<SITUACAO>
...
99
```

**Exemplo Real:**

```
89|12345678|12345678901|JOAO DA SILVA|1|diretor@escola.com.br
90|12345678||1234567890|123456789012||987654321|5
90|12345678||1234567890|098765432109||876543210|6
90|12345678||1234567890|111222333444||765432109|4
90|12345678||9876543210|222333444555||654321098|1
90|12345678||9876543210|333444555666||543210987|2
99
```

---

## 📝 Notas Importantes

1. **Campos 3 e 6 são IGNORADOS**: Código da turma na entidade e código do aluno na entidade são desconsiderados
2. **Código INEP da Escola**: Deve ter exatamente 8 dígitos
3. **Código da Turma INEP**: Máximo 10 dígitos numéricos
4. **Código do Aluno INEP**: Exatamente 12 dígitos numéricos
5. **Código da Matrícula**: Máximo 12 dígitos numéricos
6. **Situação**: Apenas valores de 1 a 7
7. **Registro 89 deve vir antes**: O registro 90 deve ter um registro 89 antecedente com o mesmo código de escola

---

## 🔗 Endpoints Disponíveis

| Endpoint                    | Método | Descrição                              |
| --------------------------- | ------ | -------------------------------------- |
| `/validation/validate-line` | POST   | Valida uma única linha (sem contexto)  |
| `/validation/validate-file` | POST   | Valida múltiplas linhas (com contexto) |
| `/validation/upload`        | POST   | Upload e validação de arquivo TXT      |

---

**Última Atualização**: Outubro 2025  
**Versão da API**: 2025  
**Status**: ✅ Registro 90 Implementado
