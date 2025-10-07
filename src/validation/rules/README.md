# 📋 Sistema de Validação de Registros do Censo Escolar

## 🏗️ Estrutura de Arquivos

```
src/validation/rules/
├── base-record.rule.ts              # Classe base abstrata
├── record-rules-manager.service.ts  # Gerenciador de regras
├── record-rules/
│   ├── school-identification.rule.ts    # Registro 00
│   ├── school-characterization.rule.ts  # Registro 10
│   ├── classes.rule.ts                  # Registro 20
│   ├── physical-persons.rule.ts         # Registro 30
│   ├── school-manager-links.rule.ts     # Registro 40
│   ├── school-professional-links.rule.ts # Registro 50
│   ├── student-links.rule.ts            # Registro 60
│   └── file-end.rule.ts                 # Registro 99
└── README.md
```

## 🎯 Como Implementar um Novo Tipo de Registro

### 1. Criar o arquivo da regra

Crie um arquivo em `src/validation/rules/record-rules/` seguindo o padrão:

```typescript
// src/validation/rules/record-rules/meu-registro.rule.ts
import { Injectable } from '@nestjs/common';
import { BaseRecordRule } from '../base-record.rule';
import { RecordTypeEnum } from '../../../common/enums/record-types.enum';

@Injectable()
export class MeuRegistroRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.MEU_TIPO;

  protected readonly fields = [
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^XX$/, // Substitua XX pelo código do registro
      type: 'code' as const,
      description: 'Tipo de registro (sempre XX)',
    },
    {
      position: 1,
      name: 'campo_obrigatorio',
      required: true,
      minLength: 1,
      maxLength: 50,
      type: 'string' as const,
      description: 'Descrição do campo obrigatório',
    },
    {
      position: 2,
      name: 'campo_opcional',
      required: false,
      minLength: 1,
      maxLength: 100,
      type: 'string' as const,
      description: 'Descrição do campo opcional',
    },
    // ... adicione mais campos conforme necessário
  ];
}
```

### 2. Registrar no Gerenciador

Adicione a nova regra no `record-rules-manager.service.ts`:

```typescript
// No construtor
constructor(
  private readonly schoolIdentificationRule: SchoolIdentificationRule,
  private readonly schoolCharacterizationRule: SchoolCharacterizationRule,
  private readonly meuRegistroRule: MeuRegistroRule, // ← Adicione aqui
) {
  this.initializeRules();
}

// No método initializeRules()
private initializeRules(): void {
  this.rules.set(RecordTypeEnum.SCHOOL_IDENTIFICATION, this.schoolIdentificationRule);
  this.rules.set(RecordTypeEnum.SCHOOL_CHARACTERIZATION, this.schoolCharacterizationRule);
  this.rules.set(RecordTypeEnum.MEU_TIPO, this.meuRegistroRule); // ← Adicione aqui
}
```

### 3. Registrar no Módulo

Adicione no `validation.module.ts`:

```typescript
@Module({
  providers: [
    // ... outros providers
    MeuRegistroRule, // ← Adicione aqui
  ],
  exports: [
    // ... outros exports
  ],
})
export class ValidationModule {}
```

## 🔧 Tipos de Validação Disponíveis

### **Tipos de Campo:**

- `'string'` - Texto livre
- `'number'` - Valor numérico
- `'date'` - Data (formato DD/MM/AAAA)
- `'code'` - Código com validação específica

### **Propriedades de Validação:**

- `required: boolean` - Campo obrigatório
- `minLength: number` - Tamanho mínimo
- `maxLength: number` - Tamanho máximo
- `pattern: RegExp` - Padrão regex para validação
- `description: string` - Descrição para mensagens de erro

## 📝 Exemplos de Validação

### **Campo Obrigatório:**

```typescript
{
  position: 1,
  name: 'codigo_inep',
  required: true,
  minLength: 8,
  maxLength: 8,
  pattern: /^\d{8}$/,
  type: 'code' as const,
  description: 'Código INEP da escola (8 dígitos)',
}
```

### **Campo Opcional:**

```typescript
{
  position: 2,
  name: 'observacoes',
  required: false,
  minLength: 1,
  maxLength: 500,
  type: 'string' as const,
  description: 'Observações adicionais',
}
```

### **Campo de Data:**

```typescript
{
  position: 3,
  name: 'data_nascimento',
  required: false,
  minLength: 10,
  maxLength: 10,
  pattern: /^\d{2}\/\d{2}\/\d{4}$/,
  type: 'date' as const,
  description: 'Data de nascimento (DD/MM/AAAA)',
}
```

## 🚀 Validações Específicas

Para validações mais complexas, sobrescreva o método `validateFieldType`:

```typescript
protected validateFieldType(
  field: FieldRule,
  value: string,
  lineNumber: number,
): ValidationError[] {
  const errors = super.validateFieldType(field, value, lineNumber);

  // Validação específica para CPF
  if (field.name === 'cpf' && value && value.length === 11) {
    if (!this.isValidCPF(value)) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: field.name,
        fieldValue: value,
        ruleName: 'cpf_validation',
        errorMessage: 'CPF inválido',
        severity: 'error' as any,
      });
    }
  }

  return errors;
}

private isValidCPF(cpf: string): boolean {
  // Implementar validação do CPF
  return true;
}
```

## 📊 Como Usar

O sistema funciona automaticamente. Quando você faz upload de um arquivo:

1. **O sistema identifica** o tipo de registro pela primeira posição
2. **Carrega a regra** correspondente do gerenciador
3. **Valida cada campo** conforme as regras definidas
4. **Retorna os erros** encontrados com detalhes específicos

## 🎯 Benefícios

- ✅ **Fácil de implementar** - Apenas definir os campos
- ✅ **Reutilizável** - Classe base com validações comuns
- ✅ **Extensível** - Validações específicas por tipo
- ✅ **Manutenível** - Cada registro em arquivo separado
- ✅ **Testável** - Cada regra pode ser testada isoladamente

## 📋 Próximos Passos

1. **Implemente os registros restantes** seguindo os exemplos
2. **Adicione validações específicas** conforme necessário
3. **Teste cada regra** individualmente
4. **Integre com o sistema** existente

O sistema está pronto para ser expandido! 🚀
