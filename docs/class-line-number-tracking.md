# Rastreamento de Número de Linha em Erros Estruturais de Turmas

## 📋 Problema Identificado

Erros estruturais de turmas (sem alunos, sem profissionais) estavam retornando `lineNumber: 0`:

```json
{
  "lineNumber": 0, // ❌ Não diz qual linha
  "recordType": "20",
  "fieldName": "class_without_professionals",
  "fieldValue": "142667",
  "errorMessage": "Turma informada sem profissional escolar em sala de aula vinculado a ela."
}
```

❌ **Problema:** Usuário não sabe **em qual linha** do arquivo está a turma `142667`

## 🎯 Por Que Isso Acontecia?

As validações estruturais são feitas **após** processar todas as linhas:

1. **Primeira passada:** Coleta informações (quais turmas existem, quais têm alunos, quais têm profissionais)
2. **Segunda passada:** Valida consistência (turma tem alunos? turma tem profissionais?)

Na segunda passada, o sistema sabia o **código da turma** (`142667`), mas **não sabia a linha** onde ela foi declarada.

### Estrutura Antiga

```typescript
interface SchoolStructure {
  allClasses: Set<string>; // ❌ Só código: ['142667', '142668', ...]
  classesWithStudents: Set<string>; // ❌ Só código
  classesWithProfessionals: Set<string>; // ❌ Só código
}
```

## ✅ Solução Implementada

Adicionado **rastreamento de número de linha** para cada turma usando um `Map`:

### Estrutura Nova

```typescript
interface SchoolStructure {
  allClasses: Set<string>; // Mantido para compatibilidade
  classesWithStudents: Set<string>; // Mantido para compatibilidade
  classesWithProfessionals: Set<string>; // Mantido para compatibilidade

  // ✅ NOVO: Map para rastrear linha de cada turma
  classLineNumbers: Map<string, number>; // classCode -> lineNumber
}
```

### Como Funciona

#### 1. Durante Coleta de Contexto (caso '20')

```typescript
case '20':
  schoolStructure.hasRecord20 = true;
  const classCode = parts[2] || '';
  schoolStructure.allClasses.add(classCode);

  // ✅ Rastrear o número da linha da turma
  if (classCode && !schoolStructure.classLineNumbers.has(classCode)) {
    schoolStructure.classLineNumbers.set(classCode, i + 1);
  }
  break;
```

**Exemplo:**

```
Linha 5: 20|12345678|142667|001|TURMA A|...
         ↓
classLineNumbers.set('142667', 5)
```

#### 2. Durante Validação Estrutural

```typescript
// Validar que todas as turmas tenham profissionais
for (const classCode of school.allClasses) {
  if (!school.classesWithProfessionals.has(classCode)) {
    // ✅ Buscar o número da linha da turma
    const lineNumber = school.classLineNumbers.get(classCode) || 0;

    errors.push(
      this.createError(
        lineNumber, // ✅ Agora usa linha correta
        '20',
        'class_without_professionals',
        2,
        classCode,
        'class_needs_professionals',
        'Turma informada sem profissional escolar em sala de aula vinculado a ela.',
        ValidationSeverity.ERROR,
      ),
    );
  }
}
```

## 📊 Resultado

### ANTES

```json
{
  "lineNumber": 0,
  "recordType": "20",
  "fieldValue": "142667",
  "errorMessage": "Turma informada sem profissional escolar..."
}
```

❌ Usuário precisa procurar manualmente a turma `142667` no arquivo

### DEPOIS

```json
{
  "lineNumber": 5,
  "recordType": "20",
  "fieldValue": "142667",
  "errorMessage": "Turma informada sem profissional escolar..."
}
```

✅ Usuário vai direto para **linha 5** do arquivo

## 🎯 Validações Afetadas

### 1. Turma Sem Alunos

```typescript
if (!school.classesWithStudents.has(classCode)) {
  const lineNumber = school.classLineNumbers.get(classCode) || 0;
  // Erro com lineNumber correto
}
```

**Exemplo:**

```
Linha 8: 20|12345678|TURMA_X|...
         ↓
         Turma TURMA_X declarada mas sem alunos (registro 60)
         ↓
Erro na linha 8 (não linha 0)
```

### 2. Turma Sem Profissionais

```typescript
if (!school.classesWithProfessionals.has(classCode)) {
  const lineNumber = school.classLineNumbers.get(classCode) || 0;
  // Erro com lineNumber correto
}
```

**Exemplo:**

```
Linha 12: 20|12345678|TURMA_Y|...
          ↓
          Turma TURMA_Y declarada mas sem profissionais (registro 50)
          ↓
Erro na linha 12 (não linha 0)
```

## 💡 Benefícios

### 1. UX Melhorada

```
✅ Usuário clica no erro e vai direto para a linha
✅ Não precisa procurar manualmente o código da turma
✅ Correção mais rápida
```

### 2. Frontend Mais Útil

```typescript
// Frontend pode destacar linha específica
function highlightError(error) {
  if (error.lineNumber > 0) {
    editor.goToLine(error.lineNumber);
    editor.highlightLine(error.lineNumber);
  }
}
```

### 3. Debug Mais Fácil

```
Desenvolvedor vê exatamente onde está o problema
Correlação clara entre erro e linha do arquivo
```

## 🔧 Detalhes Técnicos

### Estrutura do Map

```typescript
classLineNumbers: Map<string, number>

// Exemplo após processar arquivo:
Map {
  '142667' => 5,   // Turma 142667 declarada na linha 5
  '142668' => 8,   // Turma 142668 declarada na linha 8
  'TURMA_A' => 12, // Turma TURMA_A declarada na linha 12
}
```

### Inicialização

```typescript
schoolStructures.set(currentSchool, {
  // ... outros campos
  classLineNumbers: new Map(), // ✅ Inicializa Map vazio
});
```

### População (durante case '20')

```typescript
const classCode = parts[2] || '';
if (classCode && !schoolStructure.classLineNumbers.has(classCode)) {
  schoolStructure.classLineNumbers.set(classCode, i + 1);
}
```

**Nota:** Usa `!has(classCode)` para evitar sobrescrever se turma aparecer duplicada (mantém primeira ocorrência)

### Uso (durante validação)

```typescript
const lineNumber = school.classLineNumbers.get(classCode) || 0;
```

**Fallback:** Se por algum motivo não encontrar no Map, usa `0`

## 📝 Exemplo Completo

### Arquivo de Entrada

```
Linha 1:  00|12345678|1|...
Linha 2:  10|12345678|...
Linha 3:  30|12345678|DIR001|...
Linha 4:  40|12345678|DIR001|...
Linha 5:  20|12345678|142667|001|TURMA A|...     ← Turma sem profissional
Linha 6:  20|12345678|142668|002|TURMA B|...
Linha 7:  50|12345678|PROF001|1|142668|...       ← Profissional só na turma 142668
Linha 8:  60|12345678|ALU001|1|142667|...
Linha 9:  60|12345678|ALU002|1|142668|...
```

### Processamento

```typescript
// Coleta de contexto:
classLineNumbers: Map {
  '142667' => 5,  // ← Rastreado na linha 5
  '142668' => 6,  // ← Rastreado na linha 6
}

classesWithProfessionals: Set {
  '142668'  // Apenas 142668 tem profissional
}

// Validação estrutural:
for (classCode of ['142667', '142668']) {
  if (!classesWithProfessionals.has(classCode)) {
    // classCode = '142667' não tem profissional
    lineNumber = classLineNumbers.get('142667')  // ← Retorna 5
    // Cria erro com lineNumber: 5
  }
}
```

### Resultado

```json
{
  "errors": [
    {
      "lineNumber": 5, // ✅ Linha correta!
      "recordType": "20",
      "fieldName": "class_without_professionals",
      "fieldValue": "142667",
      "errorMessage": "Turma informada sem profissional escolar em sala de aula vinculado a ela."
    }
  ]
}
```

## 🧪 Como Testar

```bash
# 1. Criar arquivo com turma sem profissional
echo "00|12345678|1|..." > test.txt
echo "20|12345678|TURMA1|..." >> test.txt
# (sem registro 50 para TURMA1)

# 2. Validar
curl -X POST http://localhost:3000/validation/validate-file \
  -H "Content-Type: application/json" \
  -d '{"lines":["00|12345678|...","20|12345678|TURMA1|..."]}'

# 3. Verificar que erro retorna lineNumber correto (2)
```

## 📁 Arquivos Modificados

### 1. `base-structural.rule.ts`

**Interface SchoolStructure:**

```diff
  export interface SchoolStructure {
+   classLineNumbers: Map<string, number>; // classCode -> lineNumber
  }
```

**Inicialização:**

```diff
  schoolStructures.set(currentSchool, {
+   classLineNumbers: new Map(),
  });
```

**População (case '20'):**

```diff
  case '20':
    const classCode = parts[2] || '';
    schoolStructure.allClasses.add(classCode);
+   if (classCode && !schoolStructure.classLineNumbers.has(classCode)) {
+     schoolStructure.classLineNumbers.set(classCode, i + 1);
+   }
    break;
```

### 2. `school-structure.rule.ts`

**Validação de turmas sem alunos:**

```diff
  for (const classCode of school.allClasses) {
    if (!school.classesWithStudents.has(classCode)) {
+     const lineNumber = school.classLineNumbers.get(classCode) || 0;
      errors.push(
-       this.createError(0, '20', ...)
+       this.createError(lineNumber, '20', ...)
      );
    }
  }
```

**Validação de turmas sem profissionais:**

```diff
  for (const classCode of school.allClasses) {
    if (!school.classesWithProfessionals.has(classCode)) {
+     const lineNumber = school.classLineNumbers.get(classCode) || 0;
      errors.push(
-       this.createError(0, '20', ...)
+       this.createError(lineNumber, '20', ...)
      );
    }
  }
```

## ⚡ Performance

**Impacto:** Desprezível

- `Map.set()`: O(1)
- `Map.get()`: O(1)
- Memória adicional: ~50 bytes por turma
- Para 1000 turmas: ~50KB adicional

## ✅ Status

🟢 **IMPLEMENTADO E PRONTO**

- ✅ Map `classLineNumbers` adicionado à interface
- ✅ População automática durante coleta de contexto
- ✅ Uso correto em validações estruturais
- ✅ Fallback para 0 se turma não encontrada
- ✅ Compatibilidade mantida (Sets antigos preservados)

## 🔄 Próximos Passos (Opcional)

1. **Aplicar mesmo padrão para outros erros estruturais:**
   - Pessoas sem vínculos
   - Gestores duplicados
   - etc.

2. **Criar Map adicional para registro 30 (pessoas):**

   ```typescript
   personLineNumbers: Map<string, number>; // personCode -> lineNumber
   ```

3. **Adicionar rastreamento de múltiplas ocorrências:**
   ```typescript
   classLineNumbers: Map<string, number[]>; // Todas as linhas onde turma aparece
   ```
