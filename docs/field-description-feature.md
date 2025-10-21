# 📝 Campo fieldDescription nos Erros de Validação

## 🎯 Objetivo

Adicionar o campo `fieldDescription` aos erros de validação para exibir descrições amigáveis dos campos ao usuário final, separando o identificador técnico (`fieldName`) da descrição legível.

## 🔧 Mudanças Implementadas

### 1. **Interface ValidationError**

```typescript
export interface ValidationError {
  lineNumber: number;
  recordType: string;
  fieldName: string; // Identificador técnico (ex: 'co_entidade')
  fieldDescription?: string; // ✨ NOVO: Descrição amigável (ex: 'Código INEP da Escola')
  fieldPosition?: number;
  fieldValue: string;
  ruleName: string;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}
```

### 2. **DTO ValidationErrorDto**

```typescript
export class ValidationErrorDto {
  fieldName: string; // Identificador técnico
  fieldDescription?: string; // ✨ NOVO: Descrição amigável
  // ... outros campos
}
```

### 3. **BaseRecordRule - Métodos Helpers**

Adicionados dois métodos auxiliares para facilitar a criação de erros:

```typescript
/**
 * Helper para criar erro de validação com descrição do campo
 */
protected createFieldError(
  field: FieldRule,
  lineNumber: number,
  fieldValue: string,
  ruleName: string,
  errorMessage: string,
  severity: ValidationSeverity = ValidationSeverity.ERROR
): ValidationError

/**
 * Helper para criar erro genérico de validação
 */
protected createError(
  lineNumber: number,
  fieldName: string,
  fieldDescription: string | undefined,
  fieldPosition: number,
  fieldValue: string,
  ruleName: string,
  errorMessage: string,
  severity: ValidationSeverity = ValidationSeverity.ERROR
): ValidationError
```

### 4. **BaseStructuralRule**

O método `createError` foi atualizado para aceitar `fieldDescription` opcional.

## 📊 Exemplo de Uso

### **Resposta da API (antes):**

```json
{
  "lineNumber": 5,
  "recordType": "00",
  "fieldName": "co_entidade",
  "fieldPosition": 1,
  "fieldValue": "123",
  "ruleName": "min_length",
  "errorMessage": "Código INEP da Escola deve ter pelo menos 8 caracteres",
  "severity": "error"
}
```

### **Resposta da API (depois):**

```json
{
  "lineNumber": 5,
  "recordType": "00",
  "fieldName": "co_entidade",
  "fieldDescription": "Código INEP da Escola", // ✨ NOVO
  "fieldPosition": 1,
  "fieldValue": "123",
  "ruleName": "min_length",
  "errorMessage": "Código INEP da Escola deve ter pelo menos 8 caracteres",
  "severity": "error"
}
```

## 🎨 Como Exibir no Frontend

### **Exemplo React:**

```tsx
function ErrorDisplay({ error }: { error: ValidationError }) {
  return (
    <div className="error-item">
      <div className="error-header">
        <span className="line-number">Linha {error.lineNumber}</span>
        <span className="severity">{error.severity}</span>
      </div>

      {/* Use fieldDescription se disponível, senão use fieldName */}
      <div className="field-name">
        <strong>Campo:</strong> {error.fieldDescription || error.fieldName}
      </div>

      <div className="error-message">{error.errorMessage}</div>

      {error.fieldValue && (
        <div className="field-value">
          <strong>Valor:</strong> <code>{error.fieldValue}</code>
        </div>
      )}

      {/* Info técnica (opcional, para debug) */}
      <details className="technical-details">
        <summary>Detalhes técnicos</summary>
        <ul>
          <li>Campo técnico: {error.fieldName}</li>
          <li>Regra: {error.ruleName}</li>
          <li>Tipo de registro: {error.recordType}</li>
        </ul>
      </details>
    </div>
  );
}
```

### **Exemplo de Tabela:**

```tsx
function ErrorTable({ errors }: { errors: ValidationError[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Linha</th>
          <th>Campo</th>
          <th>Valor</th>
          <th>Erro</th>
        </tr>
      </thead>
      <tbody>
        {errors.map((error, index) => (
          <tr key={index}>
            <td>{error.lineNumber}</td>
            <td title={error.fieldName}>
              {error.fieldDescription || error.fieldName}
            </td>
            <td>
              <code>{error.fieldValue}</code>
            </td>
            <td>{error.errorMessage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### **Exemplo de Agrupamento:**

```tsx
function GroupedErrors({ errors }: { errors: ValidationError[] }) {
  // Agrupar por campo
  const groupedByField = errors.reduce(
    (acc, error) => {
      const key = error.fieldDescription || error.fieldName;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(error);
      return acc;
    },
    {} as Record<string, ValidationError[]>,
  );

  return (
    <div>
      {Object.entries(groupedByField).map(([fieldName, fieldErrors]) => (
        <div key={fieldName} className="field-errors">
          <h3>{fieldName}</h3>
          <ul>
            {fieldErrors.map((error, i) => (
              <li key={i}>
                Linha {error.lineNumber}: {error.errorMessage}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

## 📋 Exemplo de Filtros

```tsx
function ErrorFilters({ errors }: { errors: ValidationError[] }) {
  const [selectedField, setSelectedField] = useState<string>('all');

  // Obter lista única de campos
  const fields = Array.from(
    new Set(
      errors.map((e) => ({
        name: e.fieldName,
        description: e.fieldDescription || e.fieldName,
      })),
    ),
  );

  const filteredErrors =
    selectedField === 'all'
      ? errors
      : errors.filter((e) => e.fieldName === selectedField);

  return (
    <div>
      <select onChange={(e) => setSelectedField(e.target.value)}>
        <option value="all">Todos os campos</option>
        {fields.map((field) => (
          <option key={field.name} value={field.name}>
            {field.description}
          </option>
        ))}
      </select>

      <ErrorList errors={filteredErrors} />
    </div>
  );
}
```

## 🔍 Uso em Pesquisas

```tsx
function ErrorSearch({ errors }: { errors: ValidationError[] }) {
  const [search, setSearch] = useState('');

  const filteredErrors = errors.filter((error) => {
    const searchLower = search.toLowerCase();
    return (
      error.fieldDescription?.toLowerCase().includes(searchLower) ||
      error.fieldName.toLowerCase().includes(searchLower) ||
      error.errorMessage.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <input
        type="search"
        placeholder="Buscar por campo ou mensagem..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ErrorList errors={filteredErrors} />
    </div>
  );
}
```

## 📈 Estatísticas de Erros

```tsx
function ErrorStats({ errors }: { errors: ValidationError[] }) {
  const statsByField = errors.reduce(
    (acc, error) => {
      const key = error.fieldDescription || error.fieldName;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="error-stats">
      <h3>Campos com mais erros:</h3>
      <ol>
        {Object.entries(statsByField)
          .sort(([, a], [, b]) => b - a)
          .map(([field, count]) => (
            <li key={field}>
              <strong>{field}:</strong> {count} erro(s)
            </li>
          ))}
      </ol>
    </div>
  );
}
```

## ✅ Benefícios

1. **Melhor UX**: Usuários veem nomes amigáveis ao invés de códigos técnicos
2. **Separação de Conceitos**: `fieldName` para lógica, `fieldDescription` para UI
3. **Flexibilidade**: Frontend pode escolher qual usar conforme o contexto
4. **Compatibilidade**: Campo opcional, não quebra código existente
5. **Debug**: Ainda mantém o `fieldName` técnico para desenvolvedores

## 🚀 Próximos Passos

- [ ] Adicionar traduções para `fieldDescription` (i18n)
- [ ] Criar tooltip com detalhes técnicos ao hover
- [ ] Implementar links de ajuda por campo
- [ ] Adicionar sugestões de correção baseadas no campo

---

**Pronto para melhorar a experiência do usuário! 🎉**
