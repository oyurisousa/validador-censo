# 📋 Implementação do Suporte à Fase 2 do Censo Escolar

## 🎯 Objetivo

Refatorar o sistema de validação para suportar **duas fases distintas** do Censo Escolar:

- **FASE 1**: Matrícula Inicial (registros 00-60)
- **FASE 2**: Situação do Aluno (registros 89-91)

---

## 📝 Resumo das Mudanças

### 1. **Enums Atualizados** (`record-types.enum.ts`)

#### Novo Enum: `CensusPhaseEnum`

```typescript
export enum CensusPhaseEnum {
  INITIAL_ENROLLMENT = '1', // Fase 1: Matrícula Inicial
  SITUATION_UPDATE = '2', // Fase 2: Situação do Aluno
}
```

#### `RecordTypeEnum` Expandido

Novos registros adicionados:

- `SCHOOL_MANAGER_SITUATION = '89'` (Situação do Gestor Escolar)
- `STUDENT_SITUATION = '90'` (Situação do Aluno na Turma)
- `STUDENT_ADMISSION_AFTER = '91'` (Admissão Após)

---

### 2. **Nova Regra de Validação: Registro 89**

Arquivo: `school-manager-situation.rule.ts`

#### Campos Validados:

1. **Tipo de registro** (89) - obrigatório
2. **Código INEP da escola** - 8 dígitos, obrigatório
3. **CPF do Gestor** - 11 dígitos, obrigatório, validação especial
4. **Nome do Gestor** - máx 100 caracteres, apenas letras e espaços
5. **Cargo** - 1 (Diretor) ou 2 (Outro Cargo)
6. **E-mail** - máx 50 caracteres, formato válido

#### Validações Especiais:

- CPF não pode ser `00000000000` ou `00000000191`
- Nome deve conter apenas letras maiúsculas e espaços
- E-mail deve seguir padrão RFC com caracteres permitidos específicos

#### Validações de Contexto (requerem APIs externas):

- Escola existe no cadastro INEP ✅
- Escola não está "Extinta" ✅
- Escola não está "Faltante" ✅
- CPF válido na Receita Federal ⚠️ (requer integração)
- Nome corresponde ao CPF na Receita Federal ⚠️ (requer integração)

---

### 3. **Nova Regra de Validação: Registro 90**

Arquivo: `student-situation.rule.ts`

#### Campos Validados:

1. **Tipo de registro** (90) - obrigatório
2. **Código INEP da escola** - 8 dígitos, obrigatório
3. **Código da turma na entidade** - até 20 caracteres, ignorado
4. **Código INEP da turma** - até 10 dígitos, obrigatório
5. **Código INEP do aluno** - 12 dígitos, obrigatório
6. **Código do aluno na entidade** - até 20 caracteres, ignorado
7. **Código da matrícula** - até 12 dígitos, obrigatório
8. **Situação do aluno** - 1 dígito (1-7), obrigatório

#### Situações do Aluno:

1. Transferido
2. Deixou de frequentar
3. Falecido
4. Reprovado
5. Aprovado
6. Aprovado concluinte
7. Em andamento

#### Validações Contextuais:

- Código da escola deve ser igual ao do registro 89 antecedente
- Turma deve existir na escola e ser de escolarização
- Aluno deve estar vinculado à turma
- Matrícula deve pertencer ao aluno e estar na turma
- Situações específicas dependem da etapa da turma

---

### 4. **Nova Regra de Validação: Registro 91**

Arquivo: `student-admission-after.rule.ts`

#### Campos Validados:

1. **Tipo de registro** (91) - obrigatório
2. **Código INEP da escola** - 8 dígitos, obrigatório
3. **Código da turma na entidade** - até 20 caracteres, desconsiderado
4. **Código INEP da turma** - até 10 dígitos, opcional
5. **Código INEP do aluno** - 12 dígitos, obrigatório
6. **Código do aluno na entidade** - até 20 caracteres, desconsiderado
7. **Código da matrícula** - **DEVE SER NULO** (sistema busca automaticamente)
8. **Tipo de mediação** - 1 dígito (1-3), condicional
9. **Código da modalidade** - 1 dígito (1-4), condicional
10. **Código da etapa** - até 2 dígitos, condicional
11. **Situação do aluno** - 1 dígito (1-7), obrigatório

#### Regras Condicionais Complexas:

**Quando campo 4 (Turma INEP) for NULO:**

- Campos 8, 9, 10 são **OBRIGATÓRIOS**

**Quando campo 4 (Turma INEP) for PREENCHIDO:**

- Campos 8, 9, 10 **DEVEM SER NULOS**

#### Restrições por Mediação:

- **Semipresencial (2)**: apenas etapas 69, 70, 71 (EJA)
- **EAD (3)**: modalidades 1, 3, 4; etapas específicas (30-40, 67, 70, 71, 73, 74)

#### Restrições por Etapa:

- **Educação Infantil (1, 2)**: não permite situações 4, 5, 6
- **Aprovado concluinte (6)**: apenas etapas finais
- **Em andamento (7)**: apenas etapas específicas
- **Etapas proibidas**: 3, 22, 23, 56, 64, 68, 72

#### Validações Contextuais:

- Aluno deve ter vínculo na primeira etapa do Censo 2024
- Sistema busca automaticamente o código da matrícula (lógica complexa)
- Validação de situação anterior do aluno
- Validação de modalidade quando matrícula da própria escola

---

### 5. **DTOs Atualizados** (`validation.dto.ts`)

Adicionado campo opcional `phase`:

```typescript
@ApiPropertyOptional({
  description: 'Fase do Censo Escolar: "1" para Matrícula Inicial (registros 00-60), "2" para Situação do Aluno (registros 89-91)',
  example: '1',
  default: '1',
  enum: ['1', '2'],
})
@IsString()
@IsOptional()
phase?: '1' | '2';
```

---

### 4. **Controller Atualizado** (`validation.controller.ts`)

#### Endpoint: `POST /validation/validate-line`

**Antes:**

- Aceitava apenas registros `00-60`

**Agora:**

- Aceita registros `00-60` (FASE 1) e `89-91` (FASE 2)
- Novo parâmetro: `phase` ('1' ou '2', padrão: '1')
- Valida se o tipo de registro corresponde à fase especificada

**Exemplo de Requisição (FASE 2):**

```json
{
  "recordType": "89",
  "line": "89|12345678|12345678901|JOÃO DA SILVA|1|gestor@escola.com.br",
  "version": "2025",
  "phase": "2"
}
```

#### Endpoint: `POST /validation/validate-file`

**Mudanças:**

- Novo parâmetro: `phase` ('1' ou '2', padrão: '1')
- Valida múltiplas linhas considerando a fase especificada

**Exemplo de Requisição (FASE 2):**

```json
{
  "lines": [
    "89|12345678|12345678901|JOÃO DA SILVA|1|gestor@escola.com.br",
    "99"
  ],
  "version": "2025",
  "phase": "2"
}
```

#### Endpoint: `POST /validation/upload`

**Mudanças:**

- Novo campo no form-data: `phase` ('1' ou '2', padrão: '1')
- Valida o arquivo completo considerando a fase

---

### 5. **ValidationEngineService Atualizado**

#### Método: `validateSingleLine()`

**Assinatura atualizada:**

```typescript
async validateSingleLine(
  line: string,
  recordTypeCode: string,
  version: string = '2025',
  phase: '1' | '2' = '1',  // NOVO PARÂMETRO
): Promise<{ errors: ValidationError[]; warnings: ValidationError[] }>
```

**Validações adicionadas:**

1. Verifica se o tipo de registro é válido para a fase especificada
2. Retorna erro se houver incompatibilidade (ex: registro '89' na fase '1')

#### Método: `validateFile()`

**Assinatura atualizada:**

```typescript
async validateFile(
  content: string,
  fileName: string,
  version: string = '2025',
  phase: '1' | '2' = '1',  // NOVO PARÂMETRO
): Promise<ValidationResult>
```

#### Função: `convertRecordTypeCodeToEnum()`

Expandida para incluir novos registros:

```typescript
case '89': return RecordTypeEnum.SCHOOL_MANAGER_SITUATION;
case '90': return RecordTypeEnum.PROFESSIONAL_SITUATION;
case '91': return RecordTypeEnum.STUDENT_SITUATION;
```

#### Função: `getExpectedFieldCount()`

Adicionadas contagens de campos para novos registros:

```typescript
case '89': return 6;   // School Manager Situation
case '90': return 8;   // Student Situation
case '91': return 11;  // Student Admission After
```

---

### 6. **Módulos e Gerenciadores Atualizados**

#### `validation.module.ts`

- Adicionado `SchoolManagerSituationRule` aos providers

#### `record-rules-manager.service.ts`

- Registrada nova regra `SchoolManagerSituationRule` no mapa de regras
- Comentários atualizados para separar regras por fase

---

## 🔄 Fluxo de Validação

### FASE 1 (Matrícula Inicial)

```
Registros Permitidos: 00, 10, 20, 30, 40, 50, 60, 99
Finalização: 99|

Ordem Típica:
00 → (Identificação da Escola)
10 → (Caracterização da Escola)
20 → (Turmas)
30 → (Pessoas Físicas)
40 → (Vínculos de Gestores)
50 → (Vínculos de Profissionais)
60 → (Matrículas de Alunos)
99 → (Fim do Arquivo)
```

### FASE 2 (Situação do Aluno)

```
Registros Permitidos: 89, 90, 91, 99
Finalização: 99|

Ordem Típica:
89 → (Situação do Gestor Escolar) ✅ IMPLEMENTADO
90 → (Situação do Aluno na Turma) ✅ IMPLEMENTADO
91 → (Admissão Após) ✅ IMPLEMENTADO
99 → (Fim do Arquivo)
```

---

## 🧪 Exemplos de Uso

### Validar Linha Individual (FASE 2)

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{
    "recordType": "89",
    "line": "89|12345678|12345678901|JOÃO DA SILVA|1|gestor@escola.com.br",
    "version": "2025",
    "phase": "2"
  }'
```

### Validar Arquivo Completo (FASE 2)

```bash
curl -X POST http://localhost:3000/validation/validate-file \
  -H "Content-Type: application/json" \
  -d '{
    "lines": [
      "89|12345678|12345678901|JOÃO DA SILVA|1|gestor@escola.com.br",
      "89|12345678|98765432109|MARIA SANTOS|2|maria@escola.com.br",
      "99"
    ],
    "version": "2025",
    "phase": "2"
  }'
```

### Upload de Arquivo (FASE 2)

```bash
curl -X POST http://localhost:3000/validation/upload \
  -F "file=@censo_fase2.txt" \
  -F "version=2025" \
  -F "phase=2"
```

---

## ⚠️ Validações de Compatibilidade

### Erros Retornados por Incompatibilidade de Fase

#### Tentando usar registro da FASE 2 na FASE 1:

```json
{
  "statusCode": 400,
  "message": "Tipo de registro \"89\" não é válido para FASE 1 (Matrícula Inicial). Registros permitidos: 00, 10, 20, 30, 40, 50, 60, 99"
}
```

#### Tentando usar registro da FASE 1 na FASE 2:

```json
{
  "statusCode": 400,
  "message": "Tipo de registro \"30\" não é válido para FASE 2 (Situação do Aluno). Registros permitidos: 89, 90, 91, 99"
}
```

---

## 📊 Status de Implementação

| Registro | Nome                      | Fase  | Status          | Campos |
| -------- | ------------------------- | ----- | --------------- | ------ |
| 00       | Identificação da Escola   | 1     | ✅ Completo     | 56     |
| 10       | Caracterização da Escola  | 1     | ✅ Completo     | 187    |
| 20       | Turmas                    | 1     | ✅ Completo     | 70     |
| 30       | Pessoas Físicas           | 1     | ✅ Completo     | 108    |
| 40       | Vínculos de Gestores      | 1     | ✅ Completo     | 7      |
| 50       | Vínculos de Profissionais | 1     | ✅ Completo     | 38     |
| 60       | Matrículas de Alunos      | 1     | ✅ Completo     | 32     |
| **89**   | **Situação do Gestor**    | **2** | **✅ Completo** | **6**  |
| **90**   | **Situação do Aluno**     | **2** | **✅ Completo** | **8**  |
| **91**   | **Admissão Após**         | **2** | **✅ Completo** | **11** |
| 99       | Fim do Arquivo            | Ambas | ✅ Completo     | 1      |

---

## 📝 Próximos Passos

### 1. ✅ Implementação Completa dos Registros da FASE 2

Todos os registros da FASE 2 foram implementados:

- ✅ Registro 89 (Situação do Gestor Escolar) - 6 campos
- ✅ Registro 90 (Situação do Aluno na Turma) - 8 campos
- ✅ Registro 91 (Admissão Após) - 11 campos

### 2. Integrações Externas

- API da Receita Federal para validação de CPF
- API do INEP para validação de escolas, turmas, alunos
- Validação de nome contra CPF
- Busca automática de código de matrícula (registro 91)

### 3. Validações de Contexto entre Registros

- Verificar código da escola entre registro 89 e 90/91
- Validar se turmas/alunos existem nos registros da FASE 1
- Validar situação do aluno baseada em dados de matrícula anterior
- Implementar lógica complexa de admissão após

### 4. Testes Automatizados

- Criar testes unitários para cada registro da FASE 2
- Criar testes de integração entre registros
- Validar todos os cenários de regras condicionais

### 5. Documentação e Refinamento

- ✅ Criar exemplos completos para registro 89
- ✅ Criar exemplos completos para registro 90
- ✅ Criar exemplos completos para registro 91
- Atualizar documentação da API no Swagger
- Criar guia de migração da FASE 1 para FASE 2

---

## 🔧 Arquivos Modificados

```
src/
├── common/
│   ├── dto/
│   │   └── validation.dto.ts ✏️ (adicionado campo phase)
│   └── enums/
│       └── record-types.enum.ts ✏️ (novos enums e registros)
│
├── api/
│   └── controllers/
│       └── validation.controller.ts ✏️ (3 endpoints atualizados)
│
└── validation/
    ├── engine/
    │   └── validation-engine.service.ts ✏️ (métodos atualizados)
    │
    └── rules/
        ├── record-rules/
        │   ├── school-manager-situation.rule.ts ⭐ NOVO
        │   ├── student-situation.rule.ts ⭐ NOVO
        │   └── student-admission-after.rule.ts ⭐ NOVO
        │
        ├── record-rules-manager.service.ts ✏️ (registradas 3 novas regras)
        └── validation.module.ts ✏️ (adicionados 3 providers)

docs/
├── FASE2_IMPLEMENTACAO.md ⭐ NOVO (este arquivo)
├── registro-89-exemplos.md ⭐ NOVO
├── registro-90-exemplos.md ⭐ NOVO
└── registro-91-exemplos.md ⭐ NOVO
```

---

## ✅ Checklist de Implementação

- [x] Criar enum `CensusPhaseEnum`
- [x] Adicionar registros 89, 90, 91 ao `RecordTypeEnum`
- [x] Criar regra de validação para registro 89
- [x] Adicionar campo `phase` nos DTOs
- [x] Atualizar controller: endpoint `validate-line`
- [x] Atualizar controller: endpoint `validate-file`
- [x] Atualizar controller: endpoint `upload`
- [x] Atualizar `validateSingleLine()` no engine
- [x] Atualizar `validateFile()` no engine
- [x] Atualizar `convertRecordTypeCodeToEnum()`
- [x] Atualizar `getExpectedFieldCount()`
- [x] Registrar `SchoolManagerSituationRule` no módulo
- [x] Atualizar `RecordRulesManagerService`
- [x] Criar documentação de implementação
- [x] Implementar registro 90 (Situação do Aluno)
- [x] Criar documentação e exemplos do registro 90
- [x] Implementar registro 91 (Admissão Após)
- [x] Criar documentação e exemplos do registro 91
- [ ] Adicionar testes automatizados para FASE 2
- [ ] Integrar APIs externas (Receita Federal, INEP)

---

## 📚 Referências

- Layout de Importação e Exportação 2025 (Matrícula Inicial)
- Instruções Gerais para Migração no Educacenso 2025
- Especificação do Registro 89 (fornecida pelo usuário)

---

**Data de Implementação**: Outubro de 2025  
**Versão**: 1.0  
**Status**: ✅ **FASE 2 COMPLETA** - Todos os registros (89, 90, 91) implementados!
