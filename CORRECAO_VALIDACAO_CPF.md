# CORREÇÃO DAS REGRAS DE VALIDAÇÃO DE CPF - REGISTRO 30

## Problema Identificado

O usuário reportou que a validação de CPF estava incorreta na linha 251:

```
251	30	5	CPF	CPF é obrigatório para pessoas com nacionalidade brasileira	nacionalidade:1|cpf
```

**Problema**: A validação estava exigindo CPF para TODAS as pessoas com nacionalidade brasileira, independente do tipo de vínculo.

**Caso específico**: A linha 251 se referia a um ALUNO (registro 60), não um professor (registro 50), mas mesmo assim a validação estava exigindo CPF apenas por ser brasileiro.

## Regras Corretas do INEP para CPF (Campo 5)

Segundo a documentação oficial do INEP, o CPF é **condicional** e deve ser preenchido apenas quando:

### 1. **Gestores Escolares (Registro 40)**

- CPF é **sempre obrigatório** para pessoas com vínculo de gestor escolar
- Independente da nacionalidade

### 2. **Profissionais Escolares (Registro 50)**

- CPF é obrigatório **SOMENTE** quando:
  - Campo 13 (Nacionalidade) = 1 (Brasileira) OU 2 (Brasileira - nascido no exterior/naturalizado)
  - **E** a pessoa possui vínculo de profissional escolar em sala de aula

### 3. **Alunos (Registro 60)**

- CPF é obrigatório **SOMENTE** quando:
  - A pessoa possui vínculo de aluno(a)
  - **E** está matriculada nas etapas: **69, 70, 72, 71, 67, 73 ou 74**
  - Independente da nacionalidade

### 4. **Validação do CPF**

- Quando preenchido, deve ter exatamente 11 caracteres numéricos
- Deve ser válido segundo o algoritmo da Receita Federal
- Não pode haver duplicação (exceto casos específicos de ID Inep)

## Correções Implementadas

### 1. **Removida validação incorreta**

```typescript
// ANTES (INCORRETO)
if (['1', '2'].includes(nacionalidade) && !cpf) {
  // Erro para TODOS os brasileiros
}
```

### 2. **Implementada validação contextual**

```typescript
// DEPOIS (CORRETO)
validateWithContext(parts, lineNumber, schoolContext) {
  // Validação depende do tipo de vínculo + outras condições
  this.validateCpfRequirements(parts, lineNumber, errors, schoolContext);
}
```

### 3. **Regras específicas por vínculo**

#### **Gestores (sempre obrigatório)**

```typescript
if (hasManagerBond && !cpf) {
  error: 'CPF é obrigatório para gestores escolares';
}
```

#### **Profissionais (condicional - nacionalidade)**

```typescript
if (hasProfessionalBond && ['1', '2'].includes(nacionalidade) && !cpf) {
  error: 'CPF é obrigatório para profissionais brasileiros';
}
```

#### **Alunos (condicional - etapas específicas)**

```typescript
const cpfRequiredStages = ['69', '70', '72', '71', '67', '73', '74'];
const studentStages = schoolContext.studentStages.get(codigoPessoa) || [];
const hasStageRequiringCpf = studentStages.some((stage) =>
  cpfRequiredStages.includes(stage),
);

if (hasStudentEnrollment && hasStageRequiringCpf && !cpf) {
  error: 'CPF é obrigatório para alunos nas etapas específicas';
}
```

## Casos de Teste

### ✅ **Caso 1: Gestor sem CPF**

- Pessoa com vínculo gestor (registro 40)
- Nacionalidade: qualquer
- **Resultado**: ERRO - CPF obrigatório

### ✅ **Caso 2: Professor brasileiro sem CPF**

- Pessoa com vínculo profissional (registro 50)
- Nacionalidade: 1 (brasileira)
- **Resultado**: ERRO - CPF obrigatório

### ✅ **Caso 3: Professor estrangeiro sem CPF**

- Pessoa com vínculo profissional (registro 50)
- Nacionalidade: 3 (estrangeira)
- **Resultado**: OK - CPF não obrigatório

### ✅ **Caso 4: Aluno brasileiro fundamental sem CPF**

- Pessoa com vínculo aluno (registro 60)
- Nacionalidade: 1 (brasileira)
- Etapa: 4 (ensino fundamental)
- **Resultado**: OK - CPF não obrigatório (etapa não exige)

### ✅ **Caso 5: Aluno superior sem CPF**

- Pessoa com vínculo aluno (registro 60)
- Nacionalidade: qualquer
- Etapa: 69 (ensino superior)
- **Resultado**: ERRO - CPF obrigatório (etapa exige)

## Resolução do Problema Original

**Linha 251 original**:

- Pessoa física com nacionalidade brasileira (1)
- Vínculo de ALUNO (não professor)
- Etapa provavelmente não era 69,70,72,71,67,73,74
- **Antes**: Erro incorreto exigindo CPF por ser brasileiro
- **Depois**: Validação correta baseada na etapa do aluno

## Estrutura de Contexto Necessária

Para a validação contextual, é necessário passar informações dos registros relacionados:

```typescript
interface SchoolContext {
  codigoInep: string;
  managerBonds: string[]; // códigos do registro 40
  professionalBonds: string[]; // códigos do registro 50
  studentEnrollments: string[]; // códigos do registro 60
  studentStages: Map<string, string[]>; // código -> etapas do registro 60
  existingPersonCodes: string[];
}
```

## Conclusão

A correção implementada resolve o problema identificado, implementando as regras exatas do INEP onde:

- **CPF não é obrigatório por nacionalidade sozinha**
- **CPF é obrigatório baseado no TIPO DE VÍNCULO + condições específicas**
- **Validação contextual considera dados dos registros 40, 50 e 60**

Isso garante que alunos brasileiros em etapas que não exigem CPF (como ensino fundamental) não tenham erro de validação incorreto.

## Problema Adicional Corrigido: Duplicação de Erros

### **Problema Identificado**

Usuário reportou que cada erro aparecia **duas vezes** para a mesma linha:

```
285	30	54	Zona de residência	Zona de residência é obrigatória para residência no Brasil	-
285	30	54	Zona de residência	Zona de residência é obrigatória para residência no Brasil	-
```

### **Causa Raiz**

O método `validateWithContext()` estava executando validações duplicadas:

1. `super.validate()` → executava `validateBusinessRules()`
2. `this.validateBusinessRules()` → executava as mesmas regras novamente

### **Solução Implementada**

```typescript
// ANTES (duplicado)
const fieldErrors = super.validate(parts, lineNumber);
const businessErrors = this.validateBusinessRules(parts, lineNumber);

// DEPOIS (sem duplicação)
const basicErrors = this.validate(parts, lineNumber); // já inclui tudo
```

### **Benefícios**

- ✅ **Eliminação de erros duplicados**
- ✅ **Melhor performance** (menos validações redundantes)
- ✅ **Logs mais limpos** para análise
- ✅ **Validações contextuais mantidas** (CPF baseado em vínculo)
