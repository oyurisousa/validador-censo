# 🧪 Testando o Endpoint de Upload

## Problema Identificado

O `FileUploadGuard` estava sendo executado **antes** do `FileInterceptor`, causando o erro "Arquivo é obrigatório" mesmo quando o arquivo estava sendo enviado.

**Causa**: Guards são executados antes dos Interceptors no lifecycle do NestJS.

**Solução**: Removi o `FileUploadGuard` e implementei todas as validações diretamente no controller.

---

## ✅ Como Testar o Endpoint

### 1. **Usando cURL (Terminal)**

```bash
curl -X POST http://localhost:3000/api/validation/upload \
  -F "file=@caminho/para/seu/arquivo.txt" \
  -F "version=2025"
```

**Nota**: Não esqueça do prefixo `/api` na URL!

### 2. **Usando Postman**

1. Crie uma nova requisição POST
2. URL: `http://localhost:3000/api/validation/upload`
3. Vá para a aba **Body**
4. Selecione **form-data**
5. Adicione os campos:
   - **Key**: `file` | **Type**: File | **Value**: Selecione seu arquivo .txt
   - **Key**: `version` | **Type**: Text | **Value**: `2025`
6. Clique em **Send**

### 3. **Usando Insomnia**

1. Crie uma nova requisição POST
2. URL: `http://localhost:3000/api/validation/upload`
3. Selecione **Multipart Form**
4. Adicione os campos:
   - **Name**: `file` | **Type**: File | Selecione seu arquivo
   - **Name**: `version` | **Type**: Text | **Value**: `2025`
5. Clique em **Send**

### 4. **Usando JavaScript/Fetch no Frontend**

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]); // arquivo do input type="file"
formData.append('version', '2025');

fetch('http://localhost:3000/api/validation/upload', {
  method: 'POST',
  body: formData,
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Erro:', error));
```

### 5. **Usando React (exemplo completo)**

```jsx
import React, { useState } from 'react';

function FileUploadComponent() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Selecione um arquivo');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('version', '2025');

    try {
      const response = await fetch(
        'http://localhost:3000/api/validation/upload',
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer upload');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao fazer upload: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".txt" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Validar Arquivo'}
        </button>
      </form>

      {result && (
        <div>
          <h3>Resultado:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default FileUploadComponent;
```

### 6. **Usando Next.js (App Router)**

```tsx
'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [result, setResult] = useState(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(
        'http://localhost:3000/api/validation/upload',
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro:', error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" accept=".txt" required />
      <input type="text" name="version" defaultValue="2025" />
      <button type="submit">Upload</button>

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </form>
  );
}
```

---

## 🔍 Validações Implementadas

O endpoint agora valida:

1. ✅ **Arquivo obrigatório** - Retorna erro se nenhum arquivo for enviado
2. ✅ **Tipo de arquivo** - Apenas arquivos `.txt` são aceitos
3. ✅ **Tamanho máximo** - Limite de 20MB
4. ✅ **Nome do arquivo** - Máximo de 100 caracteres
5. ✅ **Conteúdo vazio** - Retorna erro se o arquivo estiver vazio

---

## 🚨 Possíveis Erros e Soluções

### Erro: "Arquivo é obrigatório"

**Causa**: O campo do formulário não está com o nome correto.

**Solução**: O campo deve ter o nome `file` (não `files`, não `arquivo`, mas exatamente `file`):

```html
<input type="file" name="file" />
```

### Erro: "Apenas arquivos .txt são permitidos"

**Causa**: Você está tentando enviar um arquivo que não termina com `.txt`.

**Solução**: Renomeie seu arquivo para ter a extensão `.txt`.

### Erro: CORS

**Causa**: O frontend está em um domínio diferente do backend.

**Solução**: O CORS já está configurado para aceitar qualquer origem no `main.ts`.

### Erro: "Payload Too Large"

**Causa**: O arquivo é maior que o limite do body-parser.

**Solução**: O limite está configurado para 20MB no código. Se precisar de mais, aumente o valor em `maxSize`.

---

## 📝 Exemplo de Arquivo de Teste

Crie um arquivo `teste.txt` com conteúdo simples:

```
00|12345678|1|01/02/2025|31/12/2025|||||||||||||||||2|||||||||||||||||||||||||||||||||||||
30|12345678|DIR001|123456789012|12345678901|JOAO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
40|12345678|DIR001|123456789012|1|4|1
99|1
```

---

## 🔗 Swagger Documentation

Acesse a documentação interativa:

```
http://localhost:3000/api/docs
```

Lá você pode testar o endpoint diretamente pela interface do Swagger!

---

## ⚠️ Nota Importante

O nome do campo no formulário **DEVE** ser exatamente `file`, pois é isso que o `FileInterceptor('file')` está esperando. Se você usar outro nome, precisará alterar também no decorator:

```typescript
@UseInterceptors(FileInterceptor('meuCampo'))
```

Qualquer dúvida, me avise! 🚀
