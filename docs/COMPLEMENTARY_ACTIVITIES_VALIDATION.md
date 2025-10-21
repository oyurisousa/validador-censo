# Validação de Atividades Complementares - Registro 20

## 📋 Resumo da Implementação

Foi implementada a validação completa de atividades complementares no **Registro 20 (Turmas)**, campos **17-22**, comparando os códigos informados com a tabela de atividades complementares do banco de dados.

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Criadas

1. **`areas`** - Áreas principais (10 registros)
2. **`sub_areas`** - Subáreas dentro de cada área (29 registros)
3. **`complementary_activities`** - Atividades complementares (145 registros)

### Relacionamentos

- Area → SubAreas (1:N)
- Area → Atividades (1:N)
- SubArea → Atividades (1:N)

### Dados Importados

- ✅ **10 áreas**
- ✅ **29 subáreas**
- ✅ **145 atividades complementares**

---

## 🔧 Componentes Implementados

### 1. **Schema do Prisma** (`prisma/schema.prisma`)

Adicionadas 3 novas tabelas relacionadas mantendo os códigos originais do CSV.

### 2. **Serviço de Validação** (`src/validation/utils/complementary-activity.service.ts`)

- Carrega atividades do banco de dados (PostgreSQL)
- Fallback para CSV caso o banco não esteja disponível
- Cache em memória para performance
- Método `isValidActivity(code: string): Promise<boolean>`

### 3. **Seeds Modulares** (`prisma/seeds/`)

```
prisma/
├── seed.js (orquestrador)
└── seeds/
    ├── municipalities.seed.js (UFs e municípios)
    └── complementary-activities.seed.js (Áreas, subáreas e atividades)
```

### 4. **Regra de Validação** (`src/validation/rules/record-rules/classes.rule.ts`)

- Método `validateComplementaryActivities()` - validação assíncrona
- Método `validateAsync()` - combina validações síncronas e assíncronas
- Injeção do `ComplementaryActivityService`

### 5. **Integração no Sistema**

- Atualizado `RecordRulesManagerService` para suportar validação assíncrona
- Atualizado `RecordValidatorService` para usar validação assíncrona no Registro 20
- Registrado `ComplementaryActivityService` no `ValidationModule`

---

## ✅ Regras de Validação Implementadas

### Campos 17-22: Códigos de Atividade Complementar

#### Regra 1: Não pode ser preenchido quando campo 15 ≠ 1

- **Condição**: Campo 15 (Atividade complementar) não for 1 (Sim)
- **Validação**: Campos 17-22 devem estar vazios
- **Erro**: `activity_not_allowed`
- **Mensagem**: "O campo 'Código X - Atividade complementar' não pode ser preenchido quando o campo 'Atividade complementar' não for 1 (Sim)"

#### Regra 2: Código deve existir na tabela

- **Condição**: Quando preenchido
- **Validação**: Código deve existir na tabela `complementary_activities`
- **Erro**: `invalid_activity_code`
- **Mensagem**: "O código 'XXXXX' não está na Tabela de Tipo de Atividade Complementar do INEP"

#### Regra 3: Pelo menos um código obrigatório

- **Condição**: Campo 15 = 1 (Sim)
- **Validação**: Pelo menos um dos campos 17-22 deve ser preenchido
- **Erro**: `activity_type_required`
- **Mensagem**: "O campo 'Atividade complementar' foi preenchido com 1 (Sim), porém a turma não informou o tipo de atividade complementar"

#### Regra 4: Não pode haver códigos duplicados

- **Condição**: Múltiplos códigos preenchidos
- **Validação**: Todos os códigos devem ser únicos
- **Erro**: `activity_duplicate`
- **Mensagem**: "Tipo de atividade complementar não foi preenchido corretamente. Não pode haver dois códigos do tipo de atividade iguais"

---

## 🧪 Testes

### Teste do Serviço

```bash
cd /home/yuri/www/validador-censo
npm run build
node -e "
const { ComplementaryActivityService } = require('./dist/src/validation/utils/complementary-activity.service');
const service = new ComplementaryActivityService();
setTimeout(async () => {
  console.log('Código 11002:', await service.isValidActivity('11002') ? '✅' : '❌');
  console.log('Código 99999:', await service.isValidActivity('99999') ? '❌' : '✅');
  console.log('Total:', service.getActivityCount());
  process.exit(0);
}, 2000);
"
```

### Resultados

```
✅ Código 11002 (Canto coral): VÁLIDO
✅ Código 99999 (não existe): INVÁLIDO
📊 Total de atividades carregadas: 145
```

### Casos de Teste

1. ✅ **Código válido** (11002 - Canto coral)
2. ❌ **Código inválido** (99999)
3. ❌ **Campo preenchido com atividade complementar = 0**
4. ❌ **Atividade complementar = 1 sem código**
5. ✅ **Múltiplos códigos válidos** (11002, 12003, 14001)
6. ❌ **Códigos duplicados** (11002, 11002)

---

## 📊 Exemplos de Códigos Válidos

| Código | Nome da Atividade                 | Área                                  |
| ------ | --------------------------------- | ------------------------------------- |
| 11002  | Canto coral                       | Cultura, Artes e Educação Patrimonial |
| 12003  | Desenho                           | Cultura, Artes e Educação Patrimonial |
| 14001  | Teatro                            | Cultura, Artes e Educação Patrimonial |
| 21001  | Recreação (Brinquedoteca e Jogos) | Esporte e Lazer                       |
| 31001  | Matemática                        | Acompanhamento Pedagógico             |

---

## 🚀 Como Usar

### 1. Popular o Banco de Dados

```bash
npm run prisma:seed
```

### 2. Executar Validações

O sistema automaticamente valida os códigos de atividades complementares quando processar registros tipo 20.

### 3. Adicionar Novas Tabelas (Futuramente)

Para adicionar novas tabelas de validação:

1. Criar o modelo no `schema.prisma`
2. Criar um seed em `prisma/seeds/nome-da-tabela.seed.js`
3. Importar e chamar no `prisma/seed.js`
4. Criar um service em `src/validation/utils/nome-da-tabela.service.ts`
5. Adicionar validação na regra correspondente

---

## 📝 Arquivos Modificados/Criados

### Criados

- `prisma/seeds/municipalities.seed.js`
- `prisma/seeds/complementary-activities.seed.js`
- `src/validation/utils/complementary-activity.service.ts`
- `test/test-complementary-activities.js`
- `test/test-complementary-activities.txt`
- `test/test-complementary-activities-direct.ts`

### Modificados

- `prisma/schema.prisma` - Adicionadas tabelas Area, SubArea, ComplementaryActivity
- `prisma/seed.js` - Refatorado para estrutura modular
- `src/validation/rules/record-rules/classes.rule.ts` - Adicionada validação de atividades
- `src/validation/rules/record-rules-manager.service.ts` - Suporte a validação assíncrona
- `src/validation/validators/record-validator.service.ts` - Registro 20 usa validação assíncrona
- `src/validation/validation.module.ts` - Registrado ComplementaryActivityService

---

## ✨ Melhorias Futuras

- [ ] Cache com TTL para recarregar dados periodicamente
- [ ] API REST para consultar atividades complementares
- [ ] Validação de combinações inválidas de atividades
- [ ] Relatório de atividades mais utilizadas
- [ ] Exportação de dados de atividades para Excel

---

## 📚 Documentação Adicional

- Schema do banco: `prisma/schema.prisma`
- CSV de origem: `prisma/data/complementary_activity.csv`
- Seeds: `prisma/seeds/`
- Regras de validação: `src/validation/rules/record-rules/classes.rule.ts`
