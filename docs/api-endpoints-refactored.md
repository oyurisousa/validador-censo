# Documentação dos Endpoints de Validação - Refatorado

## 📋 Sumário

A API de validação foi refatorada para ter endpoints mais claros e específicos:

1. **POST `/validation/validate-line`** - Validação de linha individual SEM contexto
2. **POST `/validation/validate-file`** - Validação de arquivo completo COM contexto
3. **POST `/validation/upload`** - Upload de arquivo e validação completa COM contexto

---

## 1. POST `/validation/validate-line`

### 📝 Descrição

Valida uma **única linha** de registro (tipo 00-60) **sem considerar contexto** de outros registros.

- ✅ Valida estrutura da linha (quantidade de campos)
- ✅ Valida tipos de dados dos campos
- ✅ Valida regras de negócio isoladas (sem depender de outros registros)
- ❌ NÃO valida estrutura de arquivo
- ❌ NÃO valida contexto entre registros
- ❌ NÃO valida referências cruzadas

### 🎯 Casos de Uso

- Validação em tempo real no frontend (campo por campo)
- Validação de formulários antes de salvar
- Preview de validação antes de submeter arquivo completo

### 📥 Request Body

```json
{
  "recordType": "30",
  "line": "30|12345678|DIR001|123456789012|12345678901|JOÃO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||",
  "version": "2025"
}
```

**Parâmetros:**

- `recordType` (obrigatório): Tipo do registro - valores: `"00"`, `"10"`, `"20"`, `"30"`, `"40"`, `"50"`, `"60"`
- `line` (obrigatório): Conteúdo completo da linha a ser validada
- `version` (opcional): Versão do layout (padrão: `"2025"`)

### 📤 Response

```json
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "recordType": "30",
  "lineNumber": 1
}
```

**Em caso de erro:**

```json
{
  "isValid": false,
  "errors": [
    {
      "lineNumber": 1,
      "recordType": "30",
      "fieldName": "birth_date",
      "fieldDescription": "Data de nascimento",
      "fieldPosition": 6,
      "fieldValue": "15/15/1980",
      "ruleName": "date_format_validation",
      "errorMessage": "Data inválida: 15/15/1980",
      "severity": "error"
    }
  ],
  "warnings": [],
  "recordType": "30",
  "lineNumber": 1
}
```

### 💡 Exemplos de Uso

#### Validar registro de pessoa (30)

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "30",
    "line": "30|12345678|DIR001|123456789012|12345678901|JOÃO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||",
    "version": "2025"
  }'
```

#### Validar registro de escola (00)

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "00",
    "line": "00|12345678|1|01/02/2025|31/12/2025|||||||||||||||||2|||||||||||||||||||||||||||||||||||||",
    "version": "2025"
  }'
```

---

## 2. POST `/validation/validate-file`

### 📝 Descrição

Valida um **arquivo completo** do Censo Escolar (múltiplas linhas) **COM contexto** entre registros.

- ✅ Valida estrutura do arquivo (ordem dos registros, registro obrigatórios)
- ✅ Valida estrutura de cada linha (quantidade de campos)
- ✅ Valida tipos de dados dos campos
- ✅ Valida regras de negócio
- ✅ Valida contexto entre registros (ex: pessoa existe na escola, turma existe, etc.)
- ✅ Valida referências cruzadas

### 🎯 Casos de Uso

- Validação completa de arquivo antes de enviar ao INEP
- Validação de dados após edição em massa
- Validação de arquivos gerados por sistemas

### 📥 Request Body

```json
{
  "lines": [
    "00|12345678|1|01/02/2025|31/12/2025|||||||||||||||||2|||||||||||||||||||||||||||||||||||||||||",
    "30|12345678|DIR001|123456789012|12345678901|JOÃO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||",
    "40|12345678|DIR001|123456789012|1|4|1"
  ],
  "version": "2025"
}
```

**Parâmetros:**

- `lines` (obrigatório): Array de strings, onde cada string é uma linha/registro do arquivo
- `version` (opcional): Versão do layout (padrão: `"2025"`)

### 📤 Response

```json
{
  "isValid": true,
  "totalRecords": 3,
  "processedRecords": 3,
  "processingTime": 150,
  "errors": [],
  "warnings": [],
  "fileMetadata": {
    "fileName": "file.txt",
    "fileSize": 512,
    "totalLines": 3,
    "encoding": "UTF-8",
    "uploadDate": "2025-10-08T15:30:00.000Z"
  }
}
```

**Em caso de erro:**

```json
{
  "isValid": false,
  "totalRecords": 3,
  "processedRecords": 3,
  "processingTime": 180,
  "errors": [
    {
      "lineNumber": 3,
      "recordType": "40",
      "fieldName": "person_code",
      "fieldDescription": "Código de pessoa",
      "fieldPosition": 2,
      "fieldValue": "DIR999",
      "ruleName": "person_not_found",
      "errorMessage": "Não há pessoa física com esse código nesta escola.",
      "severity": "error"
    }
  ],
  "warnings": [],
  "fileMetadata": {
    "fileName": "file.txt",
    "fileSize": 512,
    "totalLines": 3,
    "encoding": "UTF-8",
    "uploadDate": "2025-10-08T15:30:00.000Z"
  }
}
```

### 💡 Exemplos de Uso

```bash
curl -X POST http://localhost:3000/validation/validate-file \
  -H "Content-Type: application/json" \
  -d '{
    "lines": [
      "00|12345678|1|01/02/2025|31/12/2025|||||||||||||||||2|||||||||||||||||||||||||||||||||||||||||",
      "30|12345678|DIR001|123456789012|12345678901|JOÃO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||",
      "40|12345678|DIR001|123456789012|1|4|1"
    ],
    "version": "2025"
  }'
```

---

## 3. POST `/validation/upload`

### 📝 Descrição

Faz **upload de um arquivo TXT** e realiza **validação completa COM contexto** entre registros.

Funcionalidade idêntica ao `/validate-file`, mas recebe o arquivo como **multipart/form-data** ao invés de texto direto no body.

- ✅ Valida tipo de arquivo (.txt)
- ✅ Valida tamanho do arquivo (máx 20MB)
- ✅ Valida estrutura do arquivo
- ✅ Valida contexto entre registros
- ✅ Todas as validações do `/validate-file`

### 🎯 Casos de Uso

- Upload de arquivo via interface web
- Upload de arquivo via aplicação mobile
- Integração com sistemas que geram arquivos locais

### 📥 Request (multipart/form-data)

```
POST /validation/upload
Content-Type: multipart/form-data

file: [arquivo.txt]
version: 2025
```

**Parâmetros:**

- `file` (obrigatório): Arquivo TXT do Censo Escolar
- `version` (opcional): Versão do layout (padrão: `"2025"`)

**Validações do arquivo:**

- Extensão: apenas `.txt`
- Tamanho máximo: 20MB
- Nome: máximo 100 caracteres
- Conteúdo: não pode estar vazio

### 📤 Response

Mesmo formato do `/validate-file`:

```json
{
  "isValid": true,
  "totalRecords": 50,
  "processedRecords": 50,
  "processingTime": 450,
  "errors": [],
  "warnings": [],
  "fileMetadata": {
    "fileName": "censo_2025.txt",
    "fileSize": 15420,
    "totalLines": 50,
    "encoding": "UTF-8",
    "uploadDate": "2025-10-08T15:30:00.000Z"
  }
}
```

### 💡 Exemplos de Uso

#### cURL

```bash
curl -X POST http://localhost:3000/validation/upload \
  -F "file=@censo_2025.txt" \
  -F "version=2025"
```

#### JavaScript (fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('version', '2025');

const response = await fetch('http://localhost:3000/validation/upload', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
```

#### React Hook

```jsx
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('version', '2025');

  try {
    const response = await fetch('/validation/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.isValid) {
      console.log('Arquivo válido!');
    } else {
      console.log('Erros encontrados:', result.errors);
    }
  } catch (error) {
    console.error('Erro no upload:', error);
  }
};
```

---

## 📊 Comparação dos Endpoints

| Característica                        | `/validate-line`         | `/validate-file`       | `/upload`           |
| ------------------------------------- | ------------------------ | ---------------------- | ------------------- |
| **Input**                             | JSON (linha única)       | JSON (texto completo)  | Multipart (arquivo) |
| **Valida estrutura de linha**         | ✅                       | ✅                     | ✅                  |
| **Valida campos**                     | ✅                       | ✅                     | ✅                  |
| **Valida regras de negócio isoladas** | ✅                       | ✅                     | ✅                  |
| **Valida estrutura de arquivo**       | ❌                       | ✅                     | ✅                  |
| **Valida contexto entre registros**   | ❌                       | ✅                     | ✅                  |
| **Valida referências cruzadas**       | ❌                       | ✅                     | ✅                  |
| **Uso ideal**                         | Tempo real / Formulários | Validação programática | Upload de arquivo   |

---

## 🔄 Migração da API Antiga

### Endpoint Antigo: `POST /validation/validate`

**Antes:**

```json
{
  "records": ["linha1", "linha2"],
  "content": "texto completo",
  "filePath": "/path/to/file"
}
```

**Agora:**

Para validação sem contexto (linha única):

```json
POST /validation/validate-line
{
  "recordType": "30",
  "line": "linha única"
}
```

Para validação com contexto (arquivo completo):

```json
POST /validation/validate-file
{
  "content": "linha1\nlinha2\nlinha3"
}
```

### Endpoint Antigo: `POST /validation/validate-with-context`

**Antes:**

```json
{
  "records": ["linha1", "linha2", "linha3"]
}
```

**Agora:**

```json
POST /validation/validate-file
{
  "content": "linha1\nlinha2\nlinha3"
}
```

---

## 🎯 Fluxo de Validação Recomendado

### Frontend - Validação em Tempo Real

1. **Durante digitação/edição de campos:**

   ```
   POST /validation/validate-line
   ```

   - Validar cada linha individualmente
   - Mostrar erros imediatamente ao usuário
   - Não valida contexto (mais rápido)

2. **Antes de enviar arquivo completo:**

   ```
   POST /validation/validate-file
   ```

   - Validar arquivo completo com contexto
   - Verificar referências cruzadas
   - Garantir consistência total

### Backend - Processamento em Lote

1. **Receber arquivo via upload:**

   ```
   POST /validation/upload
   ```

   - Upload seguro com validações
   - Processamento completo
   - Retorno detalhado de erros

---

## ⚠️ Códigos de Erro HTTP

| Código | Descrição             | Quando Ocorre                                     |
| ------ | --------------------- | ------------------------------------------------- |
| 200    | Sucesso               | Validação concluída (com ou sem erros de negócio) |
| 400    | Bad Request           | Parâmetros inválidos ou arquivo com problema      |
| 429    | Too Many Requests     | Limite de requisições excedido                    |
| 500    | Internal Server Error | Erro interno do servidor                          |

---

## 📝 Notas Importantes

1. **Validação sem contexto** (`/validate-line`) é mais rápida mas não garante consistência entre registros
2. **Validação com contexto** (`/validate-file` e `/upload`) é mais lenta mas garante integridade total
3. O campo `fieldDescription` está presente em todos os erros para facilitar exibição no frontend
4. Rate limiting está ativo em todos os endpoints para evitar sobrecarga
5. Arquivos são validados em memória (sem salvar no disco)

---

## 🚀 Próximos Passos

- [ ] Adicionar endpoint para validação incremental (adicionar linhas a um contexto existente)
- [ ] Adicionar suporte a validação assíncrona para arquivos grandes (> 10MB)
- [ ] Adicionar endpoint para obter relatório detalhado de erros em formato PDF
- [ ] Adicionar suporte a webhooks para notificação de validação concluída
