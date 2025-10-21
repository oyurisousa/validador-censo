# 🧪 Exemplos de Uso - Validação Fase 2 (Registro 89)

Este arquivo contém exemplos práticos de como usar a API de validação com o registro 89 (Situação do Gestor Escolar).

---

## 📝 Formato do Registro 89

```
89|<CÓDIGO_INEP>|<CPF>|<NOME>|<CARGO>|<EMAIL>
```

### Campos:

1. **89**: Tipo de registro (fixo)
2. **Código INEP**: 8 dígitos numéricos
3. **CPF**: 11 dígitos numéricos
4. **Nome**: Máximo 100 caracteres (apenas letras e espaços)
5. **Cargo**: 1 (Diretor) ou 2 (Outro Cargo)
6. **E-mail**: Máximo 50 caracteres, formato válido

---

## 🔧 Exemplos de Requisições

### 1. Validar Linha Individual (validate-line)

#### ✅ Exemplo Válido

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "89",
    "line": "89|12345678|12345678901|JOAO DA SILVA|1|diretor@escola.com.br",
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
  "recordType": "89",
  "lineNumber": 1
}
```

#### ❌ Exemplo com Erro - CPF Inválido

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "89",
    "line": "89|12345678|00000000000|JOAO DA SILVA|1|diretor@escola.com.br",
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
      "recordType": "89",
      "fieldName": "cpf_gestor",
      "fieldPosition": 2,
      "fieldDescription": "CPF do Gestor Escolar",
      "fieldValue": "00000000000",
      "ruleName": "cpf_invalid",
      "errorMessage": "O campo \"Número do CPF do Gestor Escolar\" foi preenchido com valor inválido.",
      "severity": "error"
    }
  ],
  "warnings": [],
  "recordType": "89",
  "lineNumber": 1
}
```

#### ❌ Exemplo com Erro - Nome com Caracteres Inválidos

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "89",
    "line": "89|12345678|12345678901|JOAO123|1|diretor@escola.com.br",
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
      "recordType": "89",
      "fieldName": "nome_gestor",
      "fieldPosition": 3,
      "fieldDescription": "Nome do Gestor Escolar",
      "fieldValue": "JOAO123",
      "ruleName": "nome_invalid_chars",
      "errorMessage": "O campo \"Nome do Gestor Escolar\" foi preenchido com valor inválido.",
      "severity": "error"
    }
  ],
  "warnings": [],
  "recordType": "89",
  "lineNumber": 1
}
```

#### ❌ Exemplo com Erro - E-mail Inválido

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "89",
    "line": "89|12345678|12345678901|JOAO DA SILVA|1|email_invalido",
    "version": "2025",
    "phase": "2"
  }'
```

---

### 2. Validar Arquivo Completo (validate-file)

#### ✅ Exemplo Válido - Múltiplos Gestores

```bash
curl -X POST http://localhost:3000/validation/validate-file \
  -H "Content-Type: application/json" \
  -d '{
    "lines": [
      "89|12345678|12345678901|JOAO DA SILVA|1|diretor@escola.com.br",
      "89|12345678|98765432109|MARIA SANTOS|2|coordenadora@escola.com.br",
      "89|87654321|11122233344|PEDRO OLIVEIRA|1|pedro@outraescola.edu.br",
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
  "totalRecords": 4,
  "processedRecords": 4,
  "processingTime": 125,
  "fileMetadata": {
    "fileName": "file.txt",
    "fileSize": 256,
    "totalLines": 4,
    "encoding": "ISO-8859-1",
    "uploadDate": "2025-10-20T15:30:00.000Z"
  }
}
```

#### ❌ Exemplo com Múltiplos Erros

```bash
curl -X POST http://localhost:3000/validation/validate-file \
  -H "Content-Type: application/json" \
  -d '{
    "lines": [
      "89|12345678|00000000000|JOAO|1|diretor@escola.com.br",
      "89|87654321|12345678901|MARIA123|3|maria@escola",
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
# Criar arquivo censo_fase2.txt
cat > censo_fase2.txt << EOF
89|12345678|12345678901|JOAO DA SILVA|1|diretor@escola.com.br
89|12345678|98765432109|MARIA SANTOS|2|coordenadora@escola.com.br
99
EOF
```

#### Upload do arquivo

```bash
curl -X POST http://localhost:3000/validation/upload \
  -F "file=@censo_fase2.txt" \
  -F "version=2025" \
  -F "phase=2"
```

---

## 🚫 Erros Comuns

### Erro: Fase incorreta

Se tentar validar registro 89 na fase 1:

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "89",
    "line": "89|12345678|12345678901|JOAO DA SILVA|1|diretor@escola.com.br",
    "phase": "1"
  }'
```

**Resposta:**

```json
{
  "statusCode": 400,
  "message": "Tipo de registro \"89\" não é válido para FASE 1 (Matrícula Inicial). Registros permitidos: 00, 10, 20, 30, 40, 50, 60, 99"
}
```

### Erro: Número de campos incorreto

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "89",
    "line": "89|12345678|12345678901|JOAO DA SILVA|1",
    "phase": "2"
  }'
```

**Resposta:**

```json
{
  "isValid": false,
  "errors": [
    {
      "lineNumber": 1,
      "recordType": "89",
      "fieldName": "field_count",
      "fieldPosition": -1,
      "fieldValue": "5",
      "ruleName": "field_count_validation",
      "errorMessage": "Registro tipo 89 deve ter 6 campos, mas foram encontrados 5 campos",
      "severity": "error"
    }
  ],
  "warnings": [],
  "recordType": "89",
  "lineNumber": 1
}
```

---

## 📊 Casos de Teste

### Teste 1: CPF Proibido (00000000000)

```json
{
  "recordType": "89",
  "line": "89|12345678|00000000000|JOAO DA SILVA|1|diretor@escola.com.br",
  "phase": "2"
}
```

**Resultado esperado**: Erro de CPF inválido

---

### Teste 2: CPF Proibido (00000000191)

```json
{
  "recordType": "89",
  "line": "89|12345678|00000000191|JOAO DA SILVA|1|diretor@escola.com.br",
  "phase": "2"
}
```

**Resultado esperado**: Erro de CPF inválido

---

### Teste 3: Nome muito longo (>100 caracteres)

```json
{
  "recordType": "89",
  "line": "89|12345678|12345678901|JOAO DA SILVA SANTOS OLIVEIRA FERREIRA COSTA LIMA SOUZA PEREIRA ALMEIDA NASCIMENTO ARAUJO CARVALHO RODRIGUES|1|diretor@escola.com.br",
  "phase": "2"
}
```

**Resultado esperado**: Erro de tamanho máximo excedido

---

### Teste 4: Cargo inválido

```json
{
  "recordType": "89",
  "line": "89|12345678|12345678901|JOAO DA SILVA|5|diretor@escola.com.br",
  "phase": "2"
}
```

**Resultado esperado**: Erro de valor inválido (deve ser 1 ou 2)

---

### Teste 5: E-mail com caracteres especiais inválidos

```json
{
  "recordType": "89",
  "line": "89|12345678|12345678901|JOAO DA SILVA|1|diretor#escola.com.br",
  "phase": "2"
}
```

**Resultado esperado**: Erro de formato de e-mail

---

### Teste 6: Código INEP com menos de 8 dígitos

```json
{
  "recordType": "89",
  "line": "89|123456|12345678901|JOAO DA SILVA|1|diretor@escola.com.br",
  "phase": "2"
}
```

**Resultado esperado**: Erro de tamanho do campo

---

### Teste 7: CPF com menos de 11 dígitos

```json
{
  "recordType": "89",
  "line": "89|12345678|123456789|JOAO DA SILVA|1|diretor@escola.com.br",
  "phase": "2"
}
```

**Resultado esperado**: Erro de tamanho do campo

---

### Teste 8: Nome com números

```json
{
  "recordType": "89",
  "line": "89|12345678|12345678901|JOAO DA SILVA 123|1|diretor@escola.com.br",
  "phase": "2"
}
```

**Resultado esperado**: Erro de caracteres inválidos

---

### Teste 9: E-mail muito longo (>50 caracteres)

```json
{
  "recordType": "89",
  "line": "89|12345678|12345678901|JOAO DA SILVA|1|diretor.da.escola.municipal.de.ensino.basico@escola.com.br",
  "phase": "2"
}
```

**Resultado esperado**: Erro de tamanho máximo excedido

---

### Teste 10: Todos os campos corretos ✅

```json
{
  "recordType": "89",
  "line": "89|12345678|12345678901|JOAO DA SILVA SANTOS|1|joao.silva@escola.com.br",
  "phase": "2"
}
```

**Resultado esperado**: Validação bem-sucedida

---

## 📝 Notas Importantes

1. **CPFs Proibidos**: Os valores `00000000000` e `00000000191` são explicitamente rejeitados
2. **Caracteres no Nome**: Apenas letras (incluindo acentuadas) e espaços são permitidos
3. **Formato de E-mail**: Deve seguir o padrão RFC com caracteres específicos permitidos
4. **Código INEP**: Deve ter exatamente 8 dígitos numéricos
5. **CPF**: Deve ter exatamente 11 dígitos numéricos
6. **Cargo**: Apenas valores 1 (Diretor) ou 2 (Outro Cargo) são aceitos

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
**Status**: ✅ Registro 89 Implementado
