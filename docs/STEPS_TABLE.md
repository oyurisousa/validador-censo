# Tabela de Etapas - Implementação

## 📋 Resumo

Foi implementada a estrutura de dados para **Etapas Agregadas** e **Etapas de Ensino**, com importação automática dos dados da tabela do INEP.

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

#### 1. **`aggregated_steps`** - Etapas Agregadas

- `code` (VARCHAR(10), PK) - Código da etapa agregada (ex: 301, 302)
- `name` (VARCHAR(255)) - Nome da etapa agregada
- `created_at` - Data de criação
- `updated_at` - Data de atualização

#### 2. **`steps`** - Etapas de Ensino

- `code` (VARCHAR(10), PK) - Código da etapa (ex: 1, 2, 14, 15)
- `name` (VARCHAR(255)) - Nome da etapa
- `aggregated_step_code` (VARCHAR(10), FK, nullable) - Referência à etapa agregada
- `created_at` - Data de criação
- `updated_at` - Data de atualização

### Relacionamentos

- **AggregatedStep → Steps** (1:N) - Uma etapa agregada pode ter várias etapas de ensino
- Cascade delete configurado

---

## 📊 Dados Importados

### Etapas Agregadas (7 registros)

| Código | Nome                                         |
| ------ | -------------------------------------------- |
| 301    | Educação Infantil                            |
| 302    | Ensino Fundamental                           |
| 303    | Multi e correção de fluxo                    |
| 304    | Ensino Médio                                 |
| 305    | Ensino Médio - Normal/Magistério             |
| 306    | Educação de Jovens e Adultos (EJA)           |
| 308    | Educação Profissional Técnica de Nível Médio |

### Etapas de Ensino (35 registros)

#### 301 - Educação Infantil (3 etapas)

- 1: Educação infantil - creche (0 a 3 anos)
- 2: Educação infantil - pré-escola (4 e 5 anos)
- 3: Educação infantil - unificada (0 a 5 anos)

#### 302 - Ensino Fundamental (9 etapas)

- 14: Ensino fundamental de 9 anos - 1º Ano
- 15: Ensino fundamental de 9 anos - 2º Ano
- 16: Ensino fundamental de 9 anos - 3º Ano
- 17: Ensino fundamental de 9 anos - 4º Ano
- 18: Ensino fundamental de 9 anos - 5º Ano
- 19: Ensino fundamental de 9 anos - 6º Ano
- 20: Ensino fundamental de 9 anos - 7º Ano
- 21: Ensino fundamental de 9 anos - 8º Ano
- 41: Ensino fundamental de 9 anos - 9º Ano

#### 303 - Multi e correção de fluxo (3 etapas)

- 22: Ensino fundamental de 9 anos - multi
- 23: Ensino fundamental de 9 anos - correção de fluxo
- 56: Educação infantil e ensino fundamental - multietapa

#### 304 - Ensino Médio (5 etapas)

- 25: Ensino médio - 1ª Série
- 26: Ensino médio - 2ª Série
- 27: Ensino médio - 3ª Série
- 28: Ensino médio - 4ª Série
- 29: Ensino médio - não seriada

#### 305 - Ensino Médio - Normal/Magistério (4 etapas)

- 35: Ensino médio - normal/magistério - 1ª Série
- 36: Ensino médio - normal/magistério - 2ª Série
- 37: Ensino médio - normal/magistério - 3ª Série
- 38: Ensino médio - normal/magistério - 4ª Série

#### 306 - EJA (7 etapas)

- 69: EJA - Ensino fundamental - anos iniciais (1º segmento)
- 70: EJA - Ensino fundamental - anos finais (2º segmento)
- 72: EJA - Ensino fundamental - anos iniciais e anos finais (EJA Multietapas)
- 71: EJA - Ensino médio (3º segmento)
- 74: Curso técnico integrado na modalidade EJA
- 73: Curso FIC integrado na modalidade EJA - nível fundamental
- 67: Curso FIC integrado na modalidade EJA - nível médio

#### 308 - Educação Profissional (4 etapas)

- 39: Curso técnico - concomitante
- 40: Curso técnico - subsequente
- 64: Curso técnico misto
- 68: Curso FIC concomitante

---

## 🔧 Componentes Implementados

### 1. **Schema do Prisma** (`prisma/schema.prisma`)

```prisma
model AggregatedStep {
  code      String   @id @db.VarChar(10)
  name      String   @db.VarChar(255)
  steps     Step[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("aggregated_steps")
}

model Step {
  code              String         @id @db.VarChar(10)
  name              String         @db.VarChar(255)
  aggregatedStepCode String?       @map("aggregated_step_code") @db.VarChar(10)
  aggregatedStep    AggregatedStep? @relation(fields: [aggregatedStepCode], references: [code], onDelete: Cascade)
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt @map("updated_at")

  @@index([aggregatedStepCode])
  @@map("steps")
}
```

### 2. **Seed** (`prisma/seeds/steps.seed.js`)

- Lê o CSV `prisma/data/step.csv`
- Processa as duas colunas: Etapa Agregada e Etapa de Ensino
- Cria relacionamento correto entre as tabelas
- Insere dados em batch para performance

### 3. **Seed Principal** (`prisma/seed.js`)

Atualizado para incluir:

```javascript
await seedSteps();
```

---

## 📝 Estrutura do CSV

O arquivo `prisma/data/step.csv` tem a seguinte estrutura:

| Coluna A              | Coluna B            | Coluna C     | Coluna D                          |
| --------------------- | ------------------- | ------------ | --------------------------------- |
| Código Etapa Agregada | Nome Etapa Agregada | Código Etapa | Nome Etapa                        |
| 301                   | Educação Infantil   | 1            | Educação infantil - creche...     |
|                       |                     | 2            | Educação infantil - pré-escola... |
|                       |                     | 3            | Educação infantil - unificada...  |
| 302                   | Ensino Fundamental  | 14           | Ensino fundamental... 1º Ano      |

**Nota**: Quando a coluna A está vazia, a etapa pertence à última etapa agregada preenchida.

---

## 🚀 Como Usar

### Popular o Banco de Dados

```bash
npm run prisma:seed
```

### Consultar Dados

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Buscar etapa agregada com suas etapas
const aggStep = await prisma.aggregatedStep.findUnique({
  where: { code: '301' },
  include: { steps: true },
});

// Verificar se uma etapa existe
const step = await prisma.step.findUnique({
  where: { code: '14' },
});

// Buscar etapa com sua agregada
const stepWithAgg = await prisma.step.findUnique({
  where: { code: '14' },
  include: { aggregatedStep: true },
});
```

---

## 📊 Estatísticas da Importação

```
✅ 7 etapas agregadas criadas
✅ 35 etapas de ensino criadas

Distribuição:
- 301 - Educação Infantil: 3 steps
- 302 - Ensino Fundamental: 9 steps
- 303 - Multi e correção de fluxo: 3 steps
- 304 - Ensino Médio: 5 steps
- 305 - Ensino Médio - Normal/Magistério: 4 steps
- 306 - EJA: 7 steps
- 308 - Educação Profissional: 4 steps
```

---

## 🔄 Uso no Registro 20 (Turmas)

### Campos Relacionados

#### Campo 25: Etapa Agregada

- **Tipo**: Código (3 dígitos)
- **Validação**: Deve existir na tabela `aggregated_steps`
- **Exemplo**: 301, 302, 303...

#### Campo 26: Etapa

- **Tipo**: Código (1-2 dígitos)
- **Validação**: Deve existir na tabela `steps`
- **Exemplo**: 1, 14, 25...

### Validações Futuras

- [ ] Criar serviço `StepService` para validar códigos
- [ ] Validar se a etapa pertence à etapa agregada correta
- [ ] Validar compatibilidade com tipo de turma
- [ ] Validar combinações válidas de etapa/organização

---

## 📚 Arquivos Criados/Modificados

### Criados

- `prisma/seeds/steps.seed.js` - Seed de etapas
- `docs/STEPS_TABLE.md` - Esta documentação

### Modificados

- `prisma/schema.prisma` - Adicionadas tabelas AggregatedStep e Step
- `prisma/seed.js` - Incluído seed de etapas

---

## ✨ Próximos Passos

1. ✅ Tabelas criadas
2. ✅ Dados importados
3. ⏳ Criar `StepService` para validações
4. ⏳ Implementar validações no Registro 20
5. ⏳ Validar compatibilidade etapa vs etapa agregada
6. ⏳ Adicionar validações de regras de negócio

---

## 🎯 Exemplo de Validação Futura

```typescript
// No Registro 20, campo 25 (Etapa Agregada)
const etapaAgregada = '301';
const isValid = await stepService.isValidAggregatedStep(etapaAgregada);

// No Registro 20, campo 26 (Etapa)
const etapa = '1';
const isValidStep = await stepService.isValidStep(etapa);

// Validar se a etapa pertence à etapa agregada
const isCompatible = await stepService.isStepCompatibleWithAggregated(
  etapa,
  etapaAgregada,
);
```
