# 🏗️ Regras de Validação Estrutural do Censo Escolar

## 📋 Visão Geral

As **Regras Estruturais** são diferentes das **Regras de Registro**. Enquanto as regras de registro validam campos individuais dentro de cada registro, as regras estruturais validam:

- Estrutura geral do arquivo
- Sequência de registros
- Relacionamentos entre diferentes registros
- Limites e restrições globais
- Codificação e caracteres

## 🏗️ Estrutura de Arquivos

```
src/validation/rules/
├── base-structural.rule.ts                    # Classe base abstrata para regras estruturais
├── structural-rules-manager.service.ts        # Gerenciador de regras estruturais
└── structural-rules/
    ├── file-structure.rule.ts                 # Validação da estrutura geral do arquivo
    ├── record-sequence.rule.ts                # Validação da sequência de registros
    ├── school-structure.rule.ts               # Validação da estrutura individual de escolas
    ├── character-encoding.rule.ts             # Validação de caracteres e codificação
    └── README.md                              # Esta documentação
```

## 📚 Regras Implementadas

### 1. **FileStructureRule** - Estrutura Geral do Arquivo

Valida aspectos globais do arquivo:

- ✅ Presença do registro 99 (fim de arquivo)
- ✅ Número de campos correto por tipo de registro (00, 10, 20, 30, 40, 50, 60)
- ✅ Limite máximo de 100 escolas por arquivo
- ✅ Presença de pelo menos uma escola

**Campos esperados por registro:**

- Registro 00: 56 campos
- Registro 10: 187 campos
- Registro 20: 70 campos
- Registro 30: 108 campos
- Registro 40: 7 campos
- Registro 50: 38 campos
- Registro 60: 32 campos

### 2. **RecordSequenceRule** - Sequência de Registros

Valida a ordem correta dos registros conforme especificação do Censo:

- **Registro 00** → Deve vir no início ou após registros 40 ou 60
- **Registro 10** → Deve vir após registro 00
- **Registro 20** → Deve vir após registros 10 ou 20
- **Registro 30** → Deve vir após registros 00, 20 ou 30
- **Registro 40** → Deve vir após registros 30 ou 40
- **Registro 50** → Deve vir após registros 40 ou 50
- **Registro 60** → Deve vir após registros 50 ou 60

### 3. **SchoolStructureRule** - Estrutura Individual de Escolas

Valida a estrutura de cada escola conforme sua situação de funcionamento:

#### **Escola Em Atividade (situação = 1):**

- ✅ Deve ter registros: 00, 10, 20, 30, 40
- ✅ Todas as turmas (20) devem ter alunos (60)
- ✅ Todas as turmas (20) devem ter profissionais (50)
- ✅ Máximo de 3 gestores (registro 40)
- ✅ Máximo de 1.500 turmas

#### **Escola Paralisada/Extinta (situação = 2 ou 3):**

- ✅ Deve ter apenas registros: 00, 30, 40
- ❌ Não deve ter registros: 10, 20, 50, 60

#### **Validações de Relacionamento:**

- Se há alunos (60), deve haver turmas (20)
- Se há profissionais (50), deve haver turmas (20)
- Cada turma deve ter pelo menos um aluno
- Cada turma deve ter pelo menos um profissional

### 4. **CharacterEncodingRule** - Caracteres e Codificação

Valida caracteres permitidos e codificação do arquivo:

#### **Caracteres Permitidos:**

- ✅ Letras MAIÚSCULAS (A-Z)
- ✅ Números (0-9)
- ✅ Caracteres especiais básicos
- ❌ Letras minúsculas (a-z)
- ❌ Acentos e caracteres especiais latinos

#### **Codificação:**

- ✅ Deve ser ISO-8859-1 (caracteres 0x00 a 0xFF)
- ❌ Não deve ter BOM (Byte Order Mark)
- ❌ Não deve ter caracteres Unicode fora do padrão ISO-8859-1
- ⚠️ Aviso sobre mistura de terminadores de linha (CRLF vs LF)

## 🎯 Como Funciona

### Fluxo de Validação Estrutural:

```typescript
// 1. O StructuralValidatorService delega para o gerenciador
const errors = structuralValidatorService.validateStructure(records);

// 2. O gerenciador executa todas as regras na ordem correta
StructuralRulesManagerService
  ├─> FileStructureRule          // Valida estrutura básica
  ├─> CharacterEncodingRule      // Valida caracteres
  ├─> RecordSequenceRule         // Valida sequência (se estrutura OK)
  └─> SchoolStructureRule        // Valida escolas individuais (se estrutura OK)
```

### Contexto de Validação:

As regras estruturais trabalham com um **contexto compartilhado**:

```typescript
interface StructuralValidationContext {
  records: string[]; // Todos os registros do arquivo
  schoolStructures: Map<string, SchoolStructure>; // Estruturas de cada escola
  totalSchools: number; // Total de escolas no arquivo
  hasRecord99: boolean; // Se tem registro de fim
  fileContent?: string; // Conteúdo completo (para validação de encoding)
}
```

## 🔧 Como Usar

### **Uso Básico:**

```typescript
import { StructuralValidatorService } from './validators/structural-validator.service';

// Validar estrutura completa
const errors = await structuralValidator.validateStructure(records);

// Validar apenas caracteres e codificação
const charErrors = await structuralValidator.validateCharacters(fileContent);
const encodingErrors = await structuralValidator.validateEncoding(fileContent);
```

### **Uso Granular (através do gerenciador):**

```typescript
import { StructuralRulesManagerService } from './rules/structural-rules-manager.service';

// Validar apenas estrutura do arquivo
const fileErrors = await manager.validateFileStructureOnly(records);

// Validar apenas sequência de registros
const seqErrors = await manager.validateRecordSequenceOnly(records);

// Validar apenas estruturas das escolas
const schoolErrors = await manager.validateSchoolStructuresOnly(records);

// Validar apenas caracteres e codificação
const charErrors = await manager.validateCharactersAndEncoding(content);
```

## 🆕 Como Adicionar Uma Nova Regra Estrutural

### **Passo 1: Criar a Regra**

```typescript
// src/validation/rules/structural-rules/my-structural-rule.ts
import { Injectable } from '@nestjs/common';
import {
  BaseStructuralRule,
  StructuralValidationContext,
} from '../base-structural.rule';
import { ValidationError } from '../../../common/interfaces/validation.interface';

@Injectable()
export class MyStructuralRule extends BaseStructuralRule {
  constructor() {
    super('my_rule', 'Descrição da minha regra');
  }

  validate(context: StructuralValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];

    // Implementar validação aqui
    // Use: context.records, context.schoolStructures, etc.

    // Criar erros usando o helper
    errors.push(
      this.createError(
        lineNumber,
        recordType,
        fieldName,
        fieldPosition,
        fieldValue,
        'rule_name',
        'Mensagem de erro',
      ),
    );

    return errors;
  }
}
```

### **Passo 2: Registrar no Gerenciador**

```typescript
// src/validation/rules/structural-rules-manager.service.ts
constructor(
  private readonly fileStructureRule: FileStructureRule,
  private readonly myStructuralRule: MyStructuralRule, // ← Adicionar
) {}

validateStructure(records: string[], fileContent?: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const context = this.buildValidationContext(records, fileContent);

  // Adicionar validação
  const myErrors = this.myStructuralRule.validate(context);
  errors.push(...myErrors);

  return errors;
}
```

### **Passo 3: Registrar no Módulo**

```typescript
// src/validation/validation.module.ts
import { MyStructuralRule } from './rules/structural-rules/my-structural-rule';

@Module({
  providers: [
    // ... outros providers
    MyStructuralRule, // ← Adicionar
  ],
})
export class ValidationModule {}
```

## 🎯 Benefícios da Arquitetura

### ✅ **Separação de Responsabilidades**

- Cada regra tem uma responsabilidade específica
- Fácil de testar isoladamente

### ✅ **Reutilização de Código**

- Classe base com métodos auxiliares
- Contexto compartilhado entre regras

### ✅ **Manutenibilidade**

- Cada regra em arquivo separado
- Fácil de adicionar/remover regras

### ✅ **Flexibilidade**

- Pode executar todas as regras ou apenas algumas
- Ordem de execução controlada

### ✅ **Consistência**

- Mesmo padrão de erros em todas as regras
- Nomenclatura padronizada

## 📊 Exemplos de Erros

### **Estrutura de Arquivo:**

```json
{
  "lineNumber": 0,
  "recordType": "FILE",
  "fieldName": "school_limit",
  "ruleName": "file_structure_too_many_schools",
  "errorMessage": "Número de escola por arquivo (100 escolas) excedido.",
  "severity": "error"
}
```

### **Sequência de Registros:**

```json
{
  "lineNumber": 15,
  "recordType": "20",
  "fieldName": "record_sequence",
  "ruleName": "record_sequence_invalid_sequence",
  "errorMessage": "Registro 20 declarado em linha inadequada, após o registro 00. Esperado após: registro 10 ou registro 20",
  "severity": "error"
}
```

### **Estrutura de Escola:**

```json
{
  "lineNumber": 0,
  "recordType": "20",
  "fieldName": "class_without_students",
  "ruleName": "school_structure_class_needs_students",
  "errorMessage": "Turma informada sem aluno(a) vinculado a ela.",
  "severity": "error"
}
```

### **Caracteres e Codificação:**

```json
{
  "lineNumber": 5,
  "recordType": "00",
  "fieldName": "field_3",
  "ruleName": "character_encoding_invalid_characters",
  "errorMessage": "O campo contém caractere(s) não permitido(s): \"á\".",
  "severity": "error"
}
```

## 🚀 Próximos Passos

Possíveis melhorias futuras:

1. **Validações Avançadas:**
   - Validação de CPF/CNPJ
   - Validação de CEP
   - Validação de datas lógicas

2. **Performance:**
   - Cache de contexto
   - Paralelização de validações independentes

3. **Relatórios:**
   - Sugestões de correção
   - Estatísticas de erros

4. **Testes:**
   - Testes unitários para cada regra
   - Testes de integração

---

**Sistema pronto para expansão! 🎉**
