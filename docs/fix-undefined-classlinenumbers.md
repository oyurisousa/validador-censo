# Correção: Erro "Cannot read properties of undefined (reading 'get')"

## 🐛 Erro Encontrado

```json
{
  "lineNumber": 0,
  "recordType": "STRUCTURAL",
  "fieldName": "validation_error",
  "errorMessage": "Erro durante validação estrutural: Cannot read properties of undefined (reading 'get')",
  "severity": "error"
}
```

## 🔍 Causa Raiz

Ao adicionar o campo `classLineNumbers: Map<string, number>` na interface `SchoolStructure`, esquecemos de atualizar **todos os lugares** onde objetos `SchoolStructure` são criados.

### Locais Afetados

1. ✅ `base-structural.rule.ts` - **JÁ CORRIGIDO** na mudança original
2. ❌ `structural-rules-manager.service.ts` - **FALTAVA CORRIGIR**

### O Problema

No arquivo `structural-rules-manager.service.ts`, a criação da estrutura estava **sem** o campo `classLineNumbers`:

```typescript
// ❌ ANTES - FALTAVA classLineNumbers
schoolStructures.set(currentSchool, {
  schoolCode: currentSchool,
  // ... outros campos
  allClasses: new Set(),
  // classLineNumbers: new Map(), ← FALTANDO!
  totalStudents: 0,
  totalProfessionals: 0,
});
```

Quando o código de validação tentava fazer:

```typescript
const lineNumber = school.classLineNumbers.get(classCode);
                    ↑
                    undefined (não foi inicializado)
```

Resultado: `TypeError: Cannot read properties of undefined (reading 'get')`

## ✅ Correção Aplicada

### 1. Adicionar `classLineNumbers` na Inicialização

```typescript
schoolStructures.set(currentSchool, {
  schoolCode: currentSchool,
  situacaoFuncionamento: parts[2] || '',
  dependenciaAdministrativa: parts[20] || '',
  records: [],
  hasRecord00: false,
  hasRecord10: false,
  hasRecord20: false,
  hasRecord30: false,
  hasRecord40: false,
  hasRecord50: false,
  hasRecord60: false,
  record40Count: 0,
  classesWithStudents: new Set(),
  classesWithProfessionals: new Set(),
  allClasses: new Set(),
  classLineNumbers: new Map(), // ✅ ADICIONADO
  totalStudents: 0,
  totalProfessionals: 0,
});
```

### 2. Adicionar Rastreamento de Linha no `case '20'`

```typescript
case '20':
  schoolStructure.hasRecord20 = true;
  const classCode = parts[2] || '';
  schoolStructure.allClasses.add(classCode);

  // ✅ ADICIONADO: Rastrear número da linha da turma
  if (classCode && !schoolStructure.classLineNumbers.has(classCode)) {
    schoolStructure.classLineNumbers.set(classCode, i + 1);
  }
  break;
```

## 📊 Comparação ANTES vs DEPOIS

### ANTES (Causava Erro)

```typescript
// Inicialização
schoolStructures.set(currentSchool, {
  // ...
  allClasses: new Set(),
  // classLineNumbers NÃO EXISTE
});

// Uso posterior (em school-structure.rule.ts)
const lineNumber = school.classLineNumbers.get(classCode);
//                       ↑ undefined
//                       Resultado: TypeError
```

### DEPOIS (Corrigido)

```typescript
// Inicialização
schoolStructures.set(currentSchool, {
  // ...
  allClasses: new Set(),
  classLineNumbers: new Map(), // ✅ Existe
});

// Caso '20': Popular o Map
schoolStructure.classLineNumbers.set(classCode, i + 1);

// Uso posterior (em school-structure.rule.ts)
const lineNumber = school.classLineNumbers.get(classCode) || 0;
//                       ↑ Map válido
//                       Resultado: número da linha correto
```

## 🎯 Arquivos Modificados

### `src/validation/rules/structural-rules-manager.service.ts`

**Linha ~110-130:** Inicialização de `SchoolStructure`

```diff
  schoolStructures.set(currentSchool, {
    // ... outros campos
    allClasses: new Set(),
+   classLineNumbers: new Map(),
    totalStudents: 0,
    totalProfessionals: 0,
  });
```

**Linha ~145-165:** Processamento do registro 20

```diff
  case '20':
    schoolStructure.hasRecord20 = true;
-   schoolStructure.allClasses.add(parts[2] || '');
+   const classCode = parts[2] || '';
+   schoolStructure.allClasses.add(classCode);
+   // Rastrear o número da linha da turma
+   if (classCode && !schoolStructure.classLineNumbers.has(classCode)) {
+     schoolStructure.classLineNumbers.set(classCode, i + 1);
+   }
    break;
```

## ✅ Validação da Correção

### Teste Manual

```bash
# 1. Iniciar servidor
npm run start:dev

# 2. Testar com arquivo que tenha turmas
curl -X POST http://localhost:3000/validation/validate-file \
  -H "Content-Type: application/json" \
  -d '{
    "lines": [
      "00|12345678|1|...",
      "20|12345678|TURMA1|..."
    ]
  }'

# 3. Verificar que NÃO retorna erro de "Cannot read properties of undefined"
# 4. Verificar que erro de turma sem profissional tem lineNumber correto
```

### Resultado Esperado

```json
{
  "errors": [
    {
      "lineNumber": 2, // ✅ Linha correta
      "recordType": "20",
      "fieldValue": "TURMA1",
      "errorMessage": "Turma informada sem profissional..."
    }
  ]
}
```

## 🔍 Como Prevenir no Futuro

### 1. Usar Factory Method

Em vez de criar objetos manualmente em vários lugares:

```typescript
// factory.ts
function createEmptySchoolStructure(schoolCode: string): SchoolStructure {
  return {
    schoolCode,
    situacaoFuncionamento: '',
    // ... todos os campos
    classLineNumbers: new Map(), // ✅ Garantido estar aqui
  };
}

// Uso
schoolStructures.set(currentSchool, createEmptySchoolStructure(currentSchool));
```

### 2. Adicionar Validação em Runtime

```typescript
if (!schoolStructure.classLineNumbers) {
  throw new Error('classLineNumbers não inicializado');
}
```

### 3. Usar TypeScript Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true
  }
}
```

## 📝 Lições Aprendidas

1. ✅ **Ao adicionar campo obrigatório em interface:** Verificar **todos os lugares** onde objetos dessa interface são criados

2. ✅ **Usar busca global:**

   ```bash
   grep -r "schoolStructures.set" src/
   ```

3. ✅ **Testar após mudanças:** Executar validação completa para detectar erros

4. ✅ **TypeScript ajuda, mas não pega tudo:** Objetos criados inline podem passar pela verificação de tipos mas ter campos faltando em runtime

## 🎁 Benefício Final

Agora **ambos os lugares** onde `SchoolStructure` é criado têm o campo `classLineNumbers` corretamente inicializado, permitindo que:

- ✅ Erros de turmas sem alunos mostrem linha correta
- ✅ Erros de turmas sem profissionais mostrem linha correta
- ✅ Nenhum erro de "Cannot read properties of undefined"

## ✅ Status

🟢 **CORRIGIDO E TESTADO**

- ✅ Campo `classLineNumbers` adicionado em todos os lugares
- ✅ Rastreamento de linha implementado em todos os lugares
- ✅ Erro "Cannot read properties of undefined" resolvido
- ✅ Validações estruturais funcionando corretamente
