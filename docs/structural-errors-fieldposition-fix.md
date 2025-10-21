# Correção: fieldPosition Incorreto em Erros Estruturais

## 🎯 Problema Identificado

Erro estava sendo apresentado de forma confusa:

```json
{
  "lineNumber": 3,
  "recordType": "20",
  "fieldName": "class_without_professionals",
  "fieldPosition": 2, // ❌ ERRADO - sugere campo 3
  "fieldValue": "139275",
  "errorMessage": "Turma informada sem profissional escolar..."
}
```

**Problema:** `fieldPosition: 2` sugere que o erro está no **campo 3** do registro 20 (Código da Turma na Entidade/Escola).

Mas o campo 3 do registro 20 só tem validações sobre:

1. Deve ser preenchido
2. Máximo 20 caracteres
3. Não pode duplicar na mesma escola

❌ **Nada sobre "profissional vinculado"!**

## 📋 Análise Correta

A regra é uma **REGRA GERAL #23** (estrutural):

```
23. Todas as turmas (registro 20) devem ter profissional escolar
    em sala de aula (registro 50) vinculado a ela.
```

Essa é uma **validação de relacionamento entre registros**, não validação de campo específico.

## ✅ Correção Aplicada

### Regra #22: Turmas sem Alunos

```typescript
// ANTES
this.createError(lineNumber, '20', 'class_without_students', 2, ...)

// DEPOIS
this.createError(
  lineNumber,
  '20',
  'class_without_students',
  -1,  // ✅ -1 = erro estrutural
  classCode,
  'class_needs_students',
  'Turma informada sem aluno(a) vinculado a ela.',
  ValidationSeverity.ERROR,
  'Estrutura de vínculos da turma',  // ✅ fieldDescription
)
```

### Regra #23: Turmas sem Profissionais

```typescript
// ANTES
this.createError(lineNumber, '20', 'class_without_professionals', 2, ...)

// DEPOIS
this.createError(
  lineNumber,
  '20',
  'class_without_professionals',
  -1,  // ✅ -1 = erro estrutural
  classCode,
  'class_needs_professionals',
  'Turma informada sem profissional escolar em sala de aula vinculado a ela.',
  ValidationSeverity.ERROR,
  'Estrutura de vínculos da turma',  // ✅ fieldDescription
)
```

## 📊 Resultado

**ANTES:**

```json
{
  "lineNumber": 3,
  "fieldPosition": 2, // ❌ Confunde com campo 3
  "fieldValue": "139275"
}
```

**DEPOIS:**

```json
{
  "lineNumber": 3,
  "fieldDescription": "Estrutura de vínculos da turma",
  "fieldPosition": -1, // ✅ Erro estrutural
  "fieldValue": "139275"
}
```

## 💡 Convenções de fieldPosition

### `fieldPosition >= 0`

Erro em campo específico da linha

- Campo obrigatório não preenchido
- Formato inválido
- Tamanho incorreto

### `fieldPosition = -1`

Erro estrutural com linha conhecida

- Turma sem alunos (regra #22)
- Turma sem profissionais (regra #23)
- Vínculos duplicados
- Horários coincidentes

### `fieldPosition = 0` e `lineNumber = 0`

Erro global sem linha específica

- Alunos sem turmas (escola inteira)
- Mais de 100 escolas no arquivo

## 📁 Arquivo Modificado

`src/validation/rules/structural-rules/school-structure.rule.ts`

- Alterado `fieldPosition` de `2` para `-1` (2 validações)
- Adicionado `fieldDescription`: "Estrutura de vínculos da turma"

## ✅ Status

🟢 **CORRIGIDO**

- ✅ Erros estruturais agora usam `fieldPosition: -1`
- ✅ Adicionado `fieldDescription` claro
- ✅ Não confunde mais com validação de campo específico
