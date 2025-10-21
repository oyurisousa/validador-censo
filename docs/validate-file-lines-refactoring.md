# Refatoração: validate-file agora recebe array de linhas

## 📋 Resumo da Mudança

O endpoint `POST /validation/validate-file` foi refatorado para receber um **array de strings** ao invés de uma **string única com `\n`**.

## 🎯 Motivação

**PROBLEMA:**

```json
{
  "content": "00|12345678|...\n30|12345678|...\n40|12345678|..."
}
```

- ❌ String muito longa e difícil de ler no JSON
- ❌ Escaping de caracteres especiais necessário
- ❌ Difícil de manipular no frontend
- ❌ Ruim para debug e visualização

**SOLUÇÃO:**

```json
{
  "lines": ["00|12345678|...", "30|12345678|...", "40|12345678|..."]
}
```

- ✅ Cada linha é um elemento do array
- ✅ Fácil leitura e manutenção
- ✅ Simples de manipular no frontend
- ✅ Ótimo para debug e logs

## 🔄 O Que Mudou

### ANTES

**Request Body:**

```json
{
  "content": "linha1\nlinha2\nlinha3",
  "version": "2025"
}
```

**Controller:**

```typescript
async validateFileWithContext(
  @Body() request: { content: string; version?: string },
): Promise<ValidationResultDto> {
  if (!request.content || request.content.trim().length === 0) {
    throw new BadRequestException('Conteúdo do arquivo é obrigatório');
  }

  const result = await this.validationEngine.validateFile(
    request.content,
    'file.txt',
    request.version || '2025',
  );
}
```

### DEPOIS

**Request Body:**

```json
{
  "lines": ["linha1", "linha2", "linha3"],
  "version": "2025"
}
```

**Controller:**

```typescript
async validateFileWithContext(
  @Body() request: { lines: string[]; version?: string },
): Promise<ValidationResultDto> {
  // Validação 1: Lista de linhas é obrigatória
  if (!request.lines || !Array.isArray(request.lines)) {
    throw new BadRequestException(
      'Lista de linhas é obrigatória e deve ser um array',
    );
  }

  // Validação 2: Lista não pode estar vazia
  if (request.lines.length === 0) {
    throw new BadRequestException('Lista de linhas não pode estar vazia');
  }

  // Validação 3: Remover linhas vazias e converter array para string
  const validLines = request.lines.filter(
    (line) => line && line.trim().length > 0,
  );

  if (validLines.length === 0) {
    throw new BadRequestException(
      'Nenhuma linha válida encontrada no arquivo',
    );
  }

  // Converter array de linhas para string com quebras de linha
  const content = validLines.join('\n');

  const result = await this.validationEngine.validateFile(
    content,
    'file.txt',
    request.version || '2025',
  );
}
```

## ✅ Novas Validações

O controller agora valida:

1. **`lines` é obrigatório e deve ser array**

   ```json
   { "lines": "not array" } → 400 Bad Request
   ```

2. **Array não pode estar vazio**

   ```json
   { "lines": [] } → 400 Bad Request
   ```

3. **Linhas vazias são filtradas automaticamente**

   ```json
   {
     "lines": [
       "00|12345678|...",
       "", // ← removida
       "30|12345678|...",
       "   " // ← removida
     ]
   }
   // Resultado: apenas 2 linhas processadas
   ```

4. **Se todas as linhas forem vazias → erro**
   ```json
   { "lines": ["", "  ", ""] } → 400 Bad Request
   ```

## 💻 Exemplo de Integração Frontend

### React/TypeScript

```typescript
function FileValidator() {
  const [lines, setLines] = useState<string[]>([]);

  // Opção 1: Upload de arquivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const fileLines = content.split('\n');
      setLines(fileLines);
    };
    reader.readAsText(file);
  };

  // Opção 2: Textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textLines = e.target.value.split('\n');
    setLines(textLines);
  };

  // Validar
  const validateFile = async () => {
    try {
      const response = await fetch('http://localhost:3000/validation/validate-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines, // Array de strings
          version: '2025'
        })
      });

      const result = await response.json();

      if (result.isValid) {
        alert('✓ Arquivo válido!');
      } else {
        console.log('Erros:', result.errors);
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {/* ou */}
      <textarea onChange={handleTextareaChange} />
      <button onClick={validateFile}>Validar</button>
    </div>
  );
}
```

### JavaScript Puro

```javascript
// Converter arquivo para array de linhas
async function validateFile(file) {
  const text = await file.text();
  const lines = text.split('\n').filter((line) => line.trim().length > 0);

  const response = await fetch(
    'http://localhost:3000/validation/validate-file',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines, version: '2025' }),
    },
  );

  return response.json();
}

// Usar
document.getElementById('file-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const result = await validateFile(file);
  console.log('Resultado:', result);
});
```

## 🧪 Como Testar

### 1. Iniciar servidor

```bash
npm run start:dev
```

### 2. Executar testes automatizados

```bash
node test-validate-file-lines.js
```

### 3. Teste manual com cURL

```bash
curl -X POST http://localhost:3000/validation/validate-file \
  -H "Content-Type: application/json" \
  -d '{
    "lines": [
      "00|12345678|1|01/02/2025|20/12/2025|Escola Teste|||||||||||||||||2|||||||||||||||||||||||||||||||||||||||||",
      "30|12345678|DIR001|12345678901|12345678901|JOÃO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||",
      "40|12345678|DIR001|12345678901|1|4|1"
    ],
    "version": "2025"
  }'
```

## 📊 Comparação

| Aspecto                  | ANTES (content)        | DEPOIS (lines)               |
| ------------------------ | ---------------------- | ---------------------------- |
| **Legibilidade**         | ❌ Ruim (string longa) | ✅ Ótima (array estruturado) |
| **Manipulação Frontend** | ❌ Difícil             | ✅ Fácil                     |
| **Debug**                | ❌ Difícil ver linhas  | ✅ Cada linha visível        |
| **Validação**            | ⚠️ Básica              | ✅ Completa (array, vazios)  |
| **Performance**          | ✅ Igual               | ✅ Igual                     |
| **JSON Size**            | ⚠️ Maior (escaping)    | ✅ Menor                     |

## 📝 Arquivos Modificados

1. **`src/api/controllers/validation.controller.ts`**
   - ✅ Alterado método `validateFileWithContext()`
   - ✅ Request: `{ content: string }` → `{ lines: string[] }`
   - ✅ Adicionadas validações de array
   - ✅ Filtro automático de linhas vazias
   - ✅ Conversão `lines.join('\n')` para `validateFile()`

2. **`docs/api-endpoints-refactored.md`**
   - ✅ Atualizado exemplo de request body
   - ✅ Atualizado exemplo de cURL

3. **`docs/integration-guide.md`**
   - ✅ Atualizado exemplo React
   - ✅ Adicionado `content.split('\n')` antes do fetch

4. **`test-validate-file-lines.js`** (NOVO)
   - ✅ Teste com array de linhas válido
   - ✅ Teste com linhas vazias (filtradas)
   - ✅ Teste de validações de erro

## 🚀 Benefícios

1. **Melhor DX (Developer Experience):**
   - Código mais limpo no frontend
   - Mais fácil de entender e manter

2. **Melhor UX (User Experience):**
   - Erros mais claros
   - Feedback específico por linha

3. **Manutenibilidade:**
   - Código mais testável
   - Validações mais robustas

4. **Compatibilidade:**
   - Mais natural para JavaScript/TypeScript
   - Alinhado com padrões REST modernos

## ⚠️ Breaking Change

**SIM, é uma breaking change!**

Se você já estava usando o endpoint `/validate-file`, precisa atualizar:

```diff
- const response = await fetch('/validation/validate-file', {
-   body: JSON.stringify({ content: "linha1\nlinha2" })
- });

+ const response = await fetch('/validation/validate-file', {
+   body: JSON.stringify({ lines: ["linha1", "linha2"] })
+ });
```

## ✅ Status

🟢 **IMPLEMENTADO E PRONTO PARA USO**

- ✅ Controller refatorado
- ✅ Validações implementadas
- ✅ Documentação atualizada
- ✅ Testes criados
- ✅ Exemplos de integração atualizados

## 🔄 Próximos Passos (Opcional)

1. **Deprecar formato antigo:**
   - Adicionar suporte para ambos formatos temporariamente
   - Logar warning quando usar formato antigo
   - Remover suporte antigo em próxima major version

2. **Validação de encoding:**
   - Detectar encoding de cada linha
   - Alertar se houver caracteres inválidos

3. **Limite de linhas:**
   - Adicionar validação de max lines (ex: 10.000)
   - Prevenir DoS com arquivos gigantes
