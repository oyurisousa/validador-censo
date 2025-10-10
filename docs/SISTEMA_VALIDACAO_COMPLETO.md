# 📚 Sistema de Validação do Censo Escolar - Documentação Completa

## 🎯 Visão Geral

O Sistema de Validação do Censo Escolar é uma aplicação NestJS que valida arquivos de dados educacionais seguindo as especificações do INEP. O sistema utiliza uma arquitetura em camadas com validações estruturais, por registro e contextual.

---

## 🏗️ Arquitetura do Sistema

### Estrutura Principal

```
src/
├── api/                           # Camada de API (Controllers, Guards, Interceptors)
├── common/                        # Interfaces, DTOs, Enums compartilhados
├── file-processing/               # Processamento de arquivos (parsers)
├── reports/                       # Geração de relatórios de validação
└── validation/                    # ⭐ NÚCLEO DO SISTEMA ⭐
    ├── engine/                    # Motor de validação principal
    ├── validators/                # Validadores específicos por camada
    └── rules/                     # Regras de validação por registro
```

---

## 🔄 Fluxo de Validação

### 1. Entrada do Arquivo

```typescript
// 3 pontos de entrada possíveis:
POST /validation/validate-line     → Validação linha única (sem contexto)
POST /validation/validate-file     → Validação completa (com contexto)
POST /validation/upload           → Upload + Validação completa
```

### 2. Processamento no ValidationEngineService

```typescript
validateFile(content, fileName, version) {
    // 1. Validações estruturais (arquivo como um todo)
    // 2. Validações de linha (cada registro individualmente)
    // 3. Validações contextuais (relações entre registros)
    // 4. Ordenação e consolidação dos erros
}
```

### 3. Camadas de Validação

#### 🔴 Camada 1: Validação Estrutural

- **Responsável**: `StructuralValidatorService`
- **O que valida**:
  - **Codificação**: ISO-8859-1 (Latin-1) conforme especificação INEP
  - **Caracteres válidos**: Apenas maiúsculas, números e caracteres especiais
  - **Estrutura geral**: Presença de registro 99, sequência correta
  - **Regras estruturais**: Escolas ativas devem ter todos os registros obrigatórios

#### 🟡 Camada 2: Validação de Arquivo

- **Responsável**: `FileValidatorService`
- **O que valida**:
  - Tamanho do arquivo (máx 20MB)
  - Formato (.txt)
  - Sequência de registros

#### 🟢 Camada 3: Validação de Registro

- **Responsável**: `RecordValidatorService` + regras específicas
- **O que valida**:
  - Número de campos por registro
  - Tipos de dados (string, number, date)
  - Comprimento de campos
  - Padrões (regex)
  - Campos obrigatórios

#### 🔵 Camada 4: Validação Contextual

- **Responsável**: Regras específicas com contexto
- **O que valida**:
  - Relações entre registros (registro 40 precisa existir registro 30)
  - Validações condicionais (se transporte=1, campos 23-32 obrigatórios)
  - Consistência de dados entre registros

---

## 🧩 Classes e Interfaces Principais

### 🎛️ ValidationEngineService (Orquestrador)

```typescript
class ValidationEngineService {
  // PRINCIPAL: Validação completa com contexto
  async validateFile(content, fileName, version): Promise<ValidationResult>;

  // ALTERNATIVA: Validação sem contexto (tempo real)
  async validateSingleLine(
    line,
    recordTypeCode,
    version,
  ): Promise<{ errors; warnings }>;

  // INTERNO: Validação com contexto entre registros
  private async validateRecordsWithContext(records, fileName, version);
}
```

**Responsabilidades:**

- Coordenar todas as camadas de validação
- Manter contexto entre registros (escola, pessoa, turma)
- Aplicar regras condicionais baseadas em contexto
- Consolidar e ordenar erros/avisos

### 🔧 BaseRecordRule (Classe Base)

```typescript
abstract class BaseRecordRule {
  protected abstract fields: FieldRule[]; // Definição dos campos
  protected abstract recordType: RecordTypeEnum; // Tipo do registro

  // Validação básica do registro
  validate(parts: string[], lineNumber: number): ValidationError[];

  // Validação com contexto (sobrescrita opcional)
  validateWithContext?(
    parts,
    schoolContext,
    classContext,
    personContext,
    lineNumber,
  );

  // Helpers para validação
  protected validateField(field, value, lineNumber, allParts);
  protected isConditionallyRequired(field, allParts);
  protected validateBusinessRules(parts, lineNumber);
}
```

**Como funciona:**

1. Define estrutura dos campos (`FieldRule[]`)
2. Valida cada campo individualmente
3. Aplica regras condicionais
4. Permite sobrescrita para validações específicas

### 📋 FieldRule (Definição de Campo)

```typescript
interface FieldRule {
  position: number; // Posição no registro (0-based)
  name: string; // Nome interno do campo
  required: boolean; // Obrigatório sempre?
  minLength?: number; // Tamanho mínimo
  maxLength?: number; // Tamanho máximo
  pattern?: RegExp; // Padrão regex
  type: 'string' | 'number' | 'date' | 'code'; // Tipo de dados
  description: string; // Descrição amigável
  conditionalRequired?: ConditionalRequired; // Obrigatório condicionalmente
}
```

**Exemplo prático:**

```typescript
{
    position: 20,                        // Campo 21 (posição 20 em array 0-based)
    name: 'transporte_publico',
    required: false,
    minLength: 1,
    maxLength: 1,
    pattern: /^[01]$/,
    type: 'code',
    description: 'Utiliza transporte público',
    conditionalRequired: undefined       // Sempre opcional
},
{
    position: 22,                        // Campo 23 (posição 22 em array 0-based)
    name: 'poder_publico_rodoviario',
    required: false,
    minLength: 1,
    maxLength: 1,
    pattern: /^[01]$/,
    type: 'code',
    description: 'Transporte rodoviário - Poder Público',
    conditionalRequired: {               // Obrigatório SE:
        field: 'transporte_publico',     // Campo "transporte_publico"
        values: ['1']                    // = '1' (usa transporte)
    }
}
```

### 🔄 Contextos para Validação

#### SchoolContext (Registro 00)

```typescript
interface SchoolContext {
  codigoInep: string; // Código da escola
  situacaoFuncionamento: string; // 1=Ativa, 2=Paralisada, 3=Extinta
  dependenciaAdministrativa: string; // 1=Federal, 2=Estadual, etc.
  localizacaoDiferenciada?: number; // Campo 20: Localização diferenciada
}
```

#### PersonContext (Registro 30)

```typescript
interface PersonContext {
  codigoPessoa: string; // Código único da pessoa
  identificacaoInep?: string; // ID no INEP
  paisResidencia?: number; // Campo 51: País (76=Brasil)
  enrolledClasses?: string[]; // Turmas onde está matriculado
}
```

#### ClassContext (Registro 20)

```typescript
interface ClassContext {
  codigoTurma: string; // Código da turma
  mediacao?: number; // Campo 6: Mediação didática
  etapa?: number; // Campo 26: Etapa de ensino
  curricular?: boolean; // Campo 14: Turma curricular
  atendimentoEducacionalEspecializado?: boolean; // Campo 16: AEE
  atividadeComplementar?: boolean; // Campo 19: Atividade complementar
  itinerarioFormativo?: boolean; // Campo 35: Itinerário formativo
  itinerarioProfissional?: boolean; // Campo 36: Itinerário profissional
  areasConhecimento?: { [key: string]: boolean }; // Campos 43-69
}
```

---

## 🎭 Tipos de Validação por Registro

### Registro 00 - Identificação da Escola

- **Classe**: `SchoolIdentificationRule`
- **Campos**: 56 campos
- **Validações especiais**:
  - Data início/fim atividades
  - Consistência de endereço
  - Códigos IBGE válidos

### Registro 10 - Caracterização da Escola

- **Classe**: `SchoolCharacterizationRule`
- **Campos**: 187 campos
- **Validações especiais**:
  - Infraestrutura condicionada por dependência administrativa
  - Equipamentos condicionados por etapas oferecidas
  - Recursos tecnológicos consistentes

### Registro 20 - Turmas

- **Classe**: `ClassesRule`
- **Campos**: 70 campos
- **Validações especiais**:
  - Etapa vs modalidade de ensino
  - Áreas de conhecimento vs itinerário
  - Mediação didática vs etapa

### Registro 30 - Pessoa Física

- **Classe**: `PhysicalPersonsRule`
- **Campos**: 108 campos
- **Validações especiais**:
  - CPF válido (algoritmo)
  - Consistência nacionalidade vs país
  - Escolaridade vs data nascimento

### Registro 40 - Vínculo Gestor Escolar

- **Classe**: `SchoolManagerBondRule`
- **Campos**: 7 campos
- **Validações contextuais**:
  - Pessoa deve existir (registro 30)
  - Máximo 3 gestores por escola
  - Cargo vs função de confiança

### Registro 50 - Vínculo Profissional Escolar

- **Classe**: `SchoolProfessionalBondRule`
- **Campos**: 38 campos
- **Validações contextuais**:
  - Pessoa deve existir (registro 30)
  - Turma deve existir (registro 20)
  - Função vs área de conhecimento
  - Itinerário formativo vs disciplina

### Registro 60 - Matrícula do Aluno

- **Classe**: `StudentEnrollmentRule`
- **Campos**: 32 campos
- **Validações contextuais**:
  - Pessoa deve existir (registro 30)
  - Turma deve existir (registro 20)
  - Transporte público → campos transporte obrigatórios
  - AEE → campos específicos do AEE
  - Escolarização em casa vs localização diferenciada

---

## 🚦 Validações Condicionais (Exemplos Práticos)

### 1. Transporte Escolar (Registro 60)

```typescript
// Campo 21: Utiliza transporte público
{ name: 'transporte_publico', required: false, pattern: /^[01]$/ }

// Campos 23-32: SE transporte_publico = '1', ENTÃO obrigatórios
{
    name: 'poder_publico_rodoviario',
    conditionalRequired: { field: 'transporte_publico', values: ['1'] }
}
```

### 2. AEE - Atendimento Educacional Especializado

```typescript
// Turma (registro 20): Campo 16 = AEE (0=Não, 1=Sim)
// Aluno (registro 60): SE turma.AEE = 1, ENTÃO campos AEE específicos

if (classContext?.specializedEducationalService) {
  // Validações específicas para turmas de AEE
  errors.push(...this.validateAEEFields(parts, lineNumber));
}
```

### 3. Campos que NÃO devem ser preenchidos

```typescript
// Exemplo: Campo só pode ser preenchido se dependência = Federal
const field = { maxLength: 0 }; // maxLength: 0 = não deve ter valor

if (fieldValue && field.maxLength === 0) {
  errors.push({
    errorMessage: 'Este campo não deve ser preenchido para esta situação',
  });
}
```

---

## 🔍 Validações Estruturais (Arquivo como um todo)

### SchoolStructureRule - Estrutura por Escola

```typescript
// Escola ATIVA (situação = 1) → deve ter registros 00, 10, 20, 30, 40
// Escola PARALISADA/EXTINTA (situação = 2,3) → deve ter apenas 00, 30, 40

if (situacao === '1') {
  const missingRecords = [];
  if (!school.hasRecord00) missingRecords.push('00');
  if (!school.hasRecord10) missingRecords.push('10');
  if (!school.hasRecord20) missingRecords.push('20');
  if (!school.hasRecord30) missingRecords.push('30');
  if (!school.hasRecord40) missingRecords.push('40');

  if (missingRecords.length > 0) {
    errors.push({
      errorMessage: `Escolas em atividade devem ter registros: ${missingRecords.join(', ')}`,
    });
  }
}
```

### Outras Validações Estruturais

- **Sequência de registros**: 00 → 10 → 20 → 30 → 40,50,60 → 99
- **Relacionamentos**: Toda turma (20) deve ter pelo menos 1 aluno (60) e 1 profissional (50)
- **Limites**: Máximo 1.500 turmas por escola, máximo 3 gestores
- **Codificação**: Arquivo deve ser ISO-8859-1 (Latin-1) sem BOM

#### 📝 Sobre a Codificação ISO-8859-1

**Conforme especificação INEP:**
> "Deve ser utilizado o padrão ISO-8859-1 de codificação de caracteres."

**Características:**
- ✅ Suporta caracteres de 0x00 a 0xFF (256 caracteres)
- ✅ Inclui acentos portugueses: À, Á, Ã, Ç, É, Í, Ó, Ú, etc.
- ❌ **NÃO usar UTF-8** (incompatível com validadores INEP)
- ❌ Não deve ter BOM (Byte Order Mark)

**Caracteres válidos nos campos:**
- Letras: **A-Z** (apenas maiúsculas)
- Números: **0-9** 
- Especiais: **espaço, hífen (-), barra (/), etc.**
- ❌ Minúsculas (a-z) são convertidas automaticamente ou geram erro

---

## 📊 Tipos de Erro e Severidade

### Severidade dos Erros

```typescript
enum ValidationSeverity {
  ERROR = 'error', // Impede o envio ao INEP
  WARNING = 'warning', // Permite envio com ressalva
  INFO = 'info', // Informativo apenas
}
```

### Categorias de Erro

1. **Estruturais** (lineNumber: 0): Arquivo/estrutura geral
2. **De Campo** (lineNumber: N): Campo específico de uma linha
3. **Contextuais** (lineNumber: N): Relação entre registros
4. **De Formato** (lineNumber: N): Tipo/padrão do campo

### Exemplo de ValidationError

```typescript
{
    lineNumber: 150,                              // Linha do arquivo
    recordType: 'STUDENT_ENROLLMENT',             // Tipo do registro
    fieldName: 'poder_publico_rodoviario',        // Nome interno
    fieldDescription: 'Transporte rodoviário - Poder Público',  // Descrição amigável
    fieldPosition: 22,                            // Posição no array (0-based)
    fieldValue: '',                               // Valor encontrado
    ruleName: 'required_field',                   // Regra violada
    errorMessage: 'Transporte rodoviário - Poder Público é obrigatório quando utiliza transporte público',
    severity: 'error'                             // Nível do erro
}
```

---

## 🎮 Como Usar - Casos de Uso

### 1. Validação em Tempo Real (Frontend)

```typescript
// Para feedback imediato durante digitação
const response = await fetch('/validation/validate-line', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recordType: '30',
    line: '30|12345678|DIR001|12345678901|...',
    version: '2025',
  }),
});

// Retorna: { errors: ValidationError[], warnings: ValidationError[] }
```

### 2. Validação Completa de Arquivo

```typescript
// Para validação final antes do envio
const response = await fetch('/validation/validate-file', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'conteúdo completo do arquivo...',
    version: '2025',
  }),
});

// Retorna: ValidationResult completo com contexto
```

### 3. Upload com Validação

```typescript
// Para upload de arquivos
const formData = new FormData();
formData.append('file', arquivo);
formData.append('version', '2025');

const response = await fetch('/validation/upload', {
  method: 'POST',
  body: formData,
});

// Retorna: ValidationResult + FileMetadata
```

---

## 🛠️ Como Adicionar Nova Validação

### 1. Campo Simples

```typescript
// Em qualquer *Rule class, adicionar ao array fields:
{
    position: 25,                        // Posição no registro
    name: 'novo_campo',
    required: true,                      // Sempre obrigatório
    maxLength: 10,
    pattern: /^[A-Z]+$/,                // Só letras maiúsculas
    type: 'string',
    description: 'Descrição do Novo Campo'
}
```

### 2. Campo Condicional

```typescript
{
    position: 26,
    name: 'campo_condicional',
    required: false,                     // Não sempre obrigatório
    maxLength: 5,
    type: 'code',
    description: 'Campo Condicional',
    conditionalRequired: {               // Obrigatório SE:
        field: 'novo_campo',             // novo_campo
        values: ['ATIVO', 'ESPECIAL']    // IN ('ATIVO', 'ESPECIAL')
    }
}
```

### 3. Validação de Negócio Complexa

```typescript
// Sobrescrever método validateBusinessRules na regra específica:
protected validateBusinessRules(parts: string[], lineNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    const campoA = parts[10] || '';
    const campoB = parts[15] || '';

    // Regra: Se A = '1', então B deve ser diferente de '0'
    if (campoA === '1' && campoB === '0') {
        errors.push(this.createError(
            lineNumber,
            'campoB',
            'Campo B',
            15,
            campoB,
            'business_rule_A_B',
            'Quando Campo A é 1, Campo B não pode ser 0',
            ValidationSeverity.ERROR
        ));
    }

    return errors;
}
```

### 4. Validação Contextual Entre Registros

```typescript
// Sobrescrever método validateWithContext:
validateWithContext(
    parts: string[],
    schoolContext: SchoolContext,
    classContext: ClassContext,
    personContext: PersonContext,
    lineNumber: number
): ValidationError[] {
    const errors = this.validate(parts, lineNumber); // Validação básica

    // Validação contextual
    const codigoPessoa = parts[2] || '';
    if (!personContext) {
        errors.push(this.createError(
            lineNumber,
            'codigo_pessoa',
            'Código da Pessoa',
            2,
            codigoPessoa,
            'person_not_found',
            'Pessoa não encontrada no registro 30',
            ValidationSeverity.ERROR
        ));
    }

    return errors;
}
```

---

## 🔧 Manutenção e Troubleshooting

### Problemas Comuns

1. **Campo não aparece como obrigatório quando deveria**
   - Verificar `conditionalRequired` está configurado corretamente
   - Conferir se o campo de referência tem o nome exato
   - Debugar com `console.log` o valor do campo de referência

2. **Erro "campo deveria não ser preenchido" genérico**
   - Campo tem `maxLength: 0` → não deve ter valor
   - Implementar validação específica com mensagem clara

3. **Validação contextual não funciona**
   - Verificar se a regra sobrescreve `validateWithContext`
   - Confirmar que o contexto está sendo criado corretamente
   - Validar ordem dos registros (contexto deve ser criado antes)

### Debug e Logs

```typescript
// Para debug durante desenvolvimento:
console.log('Contexto escola:', schoolContext);
console.log('Contexto pessoa:', personContext);
console.log('Valor campo referência:', parts[refField.position]);
console.log('Campo obrigatório?', this.isConditionallyRequired(field, parts));
```

### Testes

```typescript
// Criar arquivo test-[funcionalidade].js para testar:
const parts = ['60', 'escola', 'pessoa', 'turma', '1' /* ... campos ... */];
const errors = rule.validateWithContext(
  parts,
  schoolCtx,
  classCtx,
  personCtx,
  1,
);
console.log('Erros encontrados:', errors.length);
```

---

## 📈 Performance e Otimizações

### Validação Rápida vs Completa

| Tipo            | Tempo    | Validações   | Uso             |
| --------------- | -------- | ------------ | --------------- |
| `validate-line` | 50-100ms | Sem contexto | Tempo real      |
| `validate-file` | 500ms-2s | Com contexto | Validação final |

### Early Stopping

- Erros estruturais críticos → para o processamento
- Campo obrigatório vazio → não valida outros aspectos do campo
- Tipo de registro inválido → não valida campos específicos

### Otimizações Aplicadas

- Validação em camadas com curto-circuito
- Contextos criados uma vez e reutilizados
- Ordenação de erros por linha para facilitar correção
- Separação entre erros e avisos

---

## 🎯 Resumo Executivo

**O que o sistema faz:**
✅ Valida arquivos do Censo Escolar 2025 conforme especificações INEP  
✅ Oferece 3 modos: linha única, arquivo completo, upload  
✅ Aplica validações estruturais, de campo e contextuais  
✅ Gera relatórios detalhados com erros específicos e acionáveis

**Como está organizado:**
🏗️ Arquitetura em camadas (Estrutural → Arquivo → Registro → Contextual)  
📋 Regras baseadas em FieldRule com validações condicionais  
🔄 Contextos mantidos entre registros para validações cruzadas  
⚡ Otimizado para performance com early stopping

**Como usar:**
🚀 `/validate-line` → validação rápida para feedback em tempo real  
📄 `/validate-file` → validação completa com contexto para arquivos  
📤 `/upload` → upload + validação completa para interfaces web

**Como estender:**
➕ Adicionar campos → definir FieldRule  
🔧 Regras condicionais → configurar conditionalRequired  
🎯 Validações complexas → sobrescrever validateBusinessRules  
🔗 Validações contextuais → sobrescrever validateWithContext

---

_Sistema desenvolvido com NestJS, TypeScript e arquitetura modular para facilitar manutenção e extensibilidade._
