# 🔧 Correção: fieldDescription em Validações de Negócio

## ❌ Problema Identificado

O campo `fieldDescription` estava sendo incluído automaticamente nas validações de campo individuais (feitas pela `BaseRecordRule`), mas **não** estava sendo incluído nas validações de regras de negócio personalizadas.

### Exemplo do Problema:

```json
// ✅ Validação de campo (tinha fieldDescription)
{
  "fieldName": "etapa",
  "fieldDescription": "Etapa de ensino específica",  // ✅ Presente
  "errorMessage": "Etapa de ensino específica tem formato inválido"
}

// ❌ Validação de regra de negócio (não tinha fieldDescription)
{
  "fieldName": "horarios_validation",
  "fieldDescription": undefined,  // ❌ Ausente
  "errorMessage": "Para tipo de mediação presencial, pelo menos um horário deve ser preenchido"
}
```

## 🔍 Causa Raiz

As validações de regras de negócio (método `validateBusinessRules`) estavam criando erros manualmente usando:

```typescript
// ❌ Forma antiga (sem fieldDescription)
errors.push({
  lineNumber,
  recordType: this.recordType,
  fieldName: 'horarios_validation',
  fieldPosition: 6,
  fieldValue: tipoMediacao,
  ruleName: 'schedule_required_for_presencial',
  errorMessage: 'Para tipo de mediação presencial...',
  severity: 'error',
});
```

Ao invés de usar o método helper `createError()` que adiciona automaticamente o `fieldDescription`.

## ✅ Solução Implementada

### 1. Importar ValidationSeverity

```typescript
import { ValidationSeverity } from '../../../common/enums/record-types.enum';
```

### 2. Usar o método helper createError()

```typescript
// ✅ Forma correta (com fieldDescription)
errors.push(
  this.createError(
    lineNumber,
    'horarios_validation', // fieldName
    'Horários de funcionamento', // fieldDescription (descrição amigável)
    6, // fieldPosition
    tipoMediacao, // fieldValue
    'schedule_required_for_presencial', // ruleName
    'Para tipo de mediação presencial...', // errorMessage
    ValidationSeverity.ERROR,
  ),
);
```

## 📋 Validações Corrigidas no ClassesRule

Foram atualizadas **8 validações de regras de negócio**:

1. ✅ **Horários de funcionamento** - `horarios_validation`
2. ✅ **Tipo de turma** - `tipo_turma_validation`
3. ✅ **Atividade complementar** - `atividade_complementar_validation`
4. ✅ **Atividade duplicada** - `atividade_duplicada_validation`
5. ✅ **Organização da turma** - `organizacao_turma_validation`
6. ✅ **Organização exclusiva** - `organizacao_exclusiva_validation`
7. ✅ **Organização curricular** - `organizacao_curricular_validation`
8. ✅ **Itinerário formativo** - `itinerario_areas_validation`
9. ✅ **Componentes curriculares** - `componentes_curriculares_validation`

## 📊 Resultado Final

Agora **todos** os erros retornados pela API incluem o campo `fieldDescription`:

```json
{
  "errors": [
    {
      "lineNumber": 2,
      "recordType": "20",
      "fieldName": "etapa",
      "fieldDescription": "Etapa de ensino específica", // ✅
      "fieldPosition": 25,
      "fieldValue": "-2,8,154",
      "ruleName": "pattern_validation",
      "errorMessage": "Etapa de ensino específica tem formato inválido",
      "severity": "error"
    },
    {
      "lineNumber": 2,
      "recordType": "20",
      "fieldName": "horarios_validation",
      "fieldDescription": "Horários de funcionamento", // ✅ AGORA TEM!
      "fieldPosition": 6,
      "fieldValue": "1",
      "ruleName": "schedule_required_for_presencial",
      "errorMessage": "Para tipo de mediação presencial, pelo menos um horário de funcionamento deve ser preenchido",
      "severity": "error"
    }
  ]
}
```

## 🎯 Boas Práticas

### ✅ Sempre usar o método helper para criar erros:

```typescript
// Para validações de campo específico
const field = this.fields.find((f) => f.position === 6);
errors.push(
  this.createFieldError(
    field,
    lineNumber,
    value,
    'rule_name',
    'Mensagem de erro',
  ),
);

// Para validações genéricas/regras de negócio
errors.push(
  this.createError(
    lineNumber,
    'campo_tecnico',
    'Descrição Amigável do Campo', // ← IMPORTANTE!
    fieldPosition,
    fieldValue,
    'rule_name',
    'Mensagem de erro',
    ValidationSeverity.ERROR,
  ),
);
```

### ❌ Evitar criar erros manualmente:

```typescript
// ❌ NÃO FAZER ISSO
errors.push({
  lineNumber,
  recordType: this.recordType,
  fieldName: 'campo',
  // ... sem fieldDescription
});
```

## 🔍 Como Verificar se Há Erros Faltando fieldDescription

Execute uma busca no código:

```bash
# Buscar por criação manual de erros
grep -r "errors.push({" src/validation/rules/

# Verificar se algum não usa o helper
grep -r "errors.push({" src/validation/rules/ | grep -v "createError"
```

## 📝 Checklist para Novas Regras

Ao criar novas regras de validação:

- [ ] Importar `ValidationSeverity` se necessário
- [ ] Usar `createFieldError()` para erros de campo específico
- [ ] Usar `createError()` para erros de regras de negócio
- [ ] Sempre incluir uma descrição amigável no 3º parâmetro
- [ ] Testar que o `fieldDescription` aparece na resposta da API

## 🚀 Impacto no Frontend

Agora o frontend pode consistentemente exibir descrições amigáveis:

```tsx
function ErrorDisplay({ error }) {
  return (
    <div>
      {/* Sempre vai ter fieldDescription agora! */}
      <strong>{error.fieldDescription}</strong>
      <p>{error.errorMessage}</p>

      {/* fieldName fica para uso técnico/debug */}
      <small>Campo técnico: {error.fieldName}</small>
    </div>
  );
}
```

---

**Problema resolvido! Todos os erros agora incluem fieldDescription. ✅**
