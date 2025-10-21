# Validação de Etapas - Registro 20

## 📋 Resumo da Implementação

Foi implementada a validação completa de **Etapas Agregadas** (Campo 25) e **Etapas de Ensino** (Campo 26) no **Registro 20 (Turmas)**, comparando os códigos informados com a tabela de etapas do banco de dados.

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Utilizadas

1. **`aggregated_steps`** - Etapas Agregadas (7 registros)
2. **`steps`** - Etapas de Ensino (35 registros)

### Relacionamento

- AggregatedStep → Steps (1:N)

---

## 🔧 Componentes Implementados

### 1. **Serviço de Validação** (`src/validation/utils/step.service.ts`)

- Carrega etapas do banco de dados (PostgreSQL)
- Fallback para CSV caso o banco não esteja disponível
- Cache em memória para performance
- Métodos principais:
  - `isValidAggregatedStep(code: string): Promise<boolean>`
  - `isValidStep(code: string): Promise<boolean>`
  - `isStepCompatibleWithAggregated(stepCode, aggStepCode): Promise<boolean>`

### 2. **Regra de Validação** (`src/validation/rules/record-rules/classes.rule.ts`)

- Método `validateSteps()` - validação assíncrona
- Injeção do `StepService`
- Integrado ao método `validateAsync()`

### 3. **Integração no Sistema**

- Registrado `StepService` no `ValidationModule`
- Validação assíncrona já configurada no Registro 20

---

## ✅ Regras de Validação Implementadas

### Campo 25: Etapa Agregada

#### Regra 1: Obrigatória quando curricular = 1

- **Condição**: Campo 14 (Curricular) = 1 (Sim)
- **Validação**: Campo 25 deve ser preenchido
- **Erro**: `aggregated_step_required_when_curricular`
- **Mensagem**: "O campo 'Etapa agregada' deve ser preenchido quando o campo 'Curricular (etapa de ensino)' for 1 (Sim)"

#### Regra 2: Não pode ser preenchida quando curricular ≠ 1

- **Condição**: Campo 14 (Curricular) ≠ 1
- **Validação**: Campo 25 deve estar vazio
- **Erro**: `aggregated_step_not_allowed_when_not_curricular`
- **Mensagem**: "O campo 'Etapa agregada' não pode ser preenchido quando o campo 'Curricular (etapa de ensino)' não for 1 (Sim)"

#### Regra 3: Código deve existir na tabela

- **Condição**: Quando preenchido
- **Validação**: Código deve existir na tabela `aggregated_steps`
- **Erro**: `invalid_aggregated_step_code`
- **Mensagem**: "O código 'XXX' não está na Tabela de Etapas do INEP"

---

### Campo 26: Etapa

#### Regra 4: Não pode ser preenchida quando curricular ≠ 1

- **Condição**: Campo 14 (Curricular) ≠ 1
- **Validação**: Campo 26 deve estar vazio
- **Erro**: `step_not_allowed_when_not_curricular`
- **Mensagem**: "O campo 'Etapa' não pode ser preenchido quando o campo 'Curricular (etapa de ensino)' não for 1 (Sim)"

#### Regra 5: Obrigatória para certas etapas agregadas

- **Condição**: Etapa agregada = 301, 302, 303, 306 ou 308
- **Validação**: Campo 26 deve ser preenchido
- **Erro**: `step_required_for_aggregated_step`
- **Mensagem**: "O campo 'Etapa' deve ser preenchido quando o campo 'Etapa agregada' for XXX"

#### Regra 6: Obrigatória quando formação geral básica = 1

- **Condição**: Campo 34 (Formação geral básica) = 1 (Sim)
- **Validação**: Campo 26 deve ser preenchido
- **Erro**: `step_required_when_formacao_geral`
- **Mensagem**: "O campo 'Etapa' deve ser preenchido quando o campo 'Formação geral básica' for 1 (Sim)"

#### Regra 7: Código deve existir na tabela

- **Condição**: Quando preenchido
- **Validação**: Código deve existir na tabela `steps`
- **Erro**: `invalid_step_code`
- **Mensagem**: "O código 'XX' não está na Tabela de Etapas do INEP"

#### Regra 8: Compatibilidade entre etapa e etapa agregada

- **Condição**: Ambos os campos preenchidos
- **Validação**: Etapa deve pertencer à etapa agregada informada
- **Erro**: `step_incompatible_with_aggregated`
- **Mensagem**: "A etapa 'XX' não é compatível com a etapa agregada 'XXX'. Etapas esperadas: X, X, X"

---

## 📊 Combinações Válidas

### 301 - Educação Infantil

- **Etapas válidas**: 1, 2, 3
- 1: Educação infantil - creche (0 a 3 anos)
- 2: Educação infantil - pré-escola (4 e 5 anos)
- 3: Educação infantil - unificada (0 a 5 anos)

### 302 - Ensino Fundamental

- **Etapas válidas**: 14, 15, 16, 17, 18, 19, 20, 21, 41
- 14-21: 1º ao 8º Ano
- 41: 9º Ano

### 303 - Multi e correção de fluxo

- **Etapas válidas**: 22, 23, 56
- 22: Ensino fundamental - multi
- 23: Ensino fundamental - correção de fluxo
- 56: Educação infantil e ensino fundamental - multietapa

### 304 - Ensino Médio

- **Etapas válidas**: 25, 26, 27, 28, 29
- 25-28: 1ª a 4ª Série
- 29: Não seriada

### 305 - Ensino Médio - Normal/Magistério

- **Etapas válidas**: 35, 36, 37, 38
- 35-38: 1ª a 4ª Série

### 306 - EJA

- **Etapas válidas**: 69, 70, 72, 71, 74, 73, 67
- 69: EJA - Ensino fundamental - anos iniciais
- 70: EJA - Ensino fundamental - anos finais
- 71: EJA - Ensino médio
- 72: EJA - Multietapas
- 73, 74, 67: Cursos integrados

### 308 - Educação Profissional

- **Etapas válidas**: 39, 40, 64, 68
- 39: Curso técnico - concomitante
- 40: Curso técnico - subsequente
- 64: Curso técnico misto
- 68: Curso FIC concomitante

---

## 🧪 Testes Realizados

### Teste do Serviço

```bash
npm run build
node -e "
const { StepService } = require('./dist/src/validation/utils/step.service');
const service = new StepService();
setTimeout(async () => {
  console.log('Etapa agregada 301:', await service.isValidAggregatedStep('301') ? '✅' : '❌');
  console.log('Etapa agregada 999:', await service.isValidAggregatedStep('999') ? '❌' : '✅');
  console.log('Etapa 1:', await service.isValidStep('1') ? '✅' : '❌');
  console.log('Etapa 999:', await service.isValidStep('999') ? '❌' : '✅');
  console.log('Compatibilidade 1+301:', await service.isStepCompatibleWithAggregated('1', '301') ? '✅' : '❌');
  console.log('Compatibilidade 14+301:', await service.isStepCompatibleWithAggregated('14', '301') ? '❌' : '✅');
  console.log('Total agregadas:', service.getAggregatedStepCount());
  console.log('Total etapas:', service.getStepCount());
  process.exit(0);
}, 2000);
"
```

### Resultados

```
✅ Etapa agregada 301 (Educação Infantil): VÁLIDA
✅ Etapa agregada 999: INVÁLIDA
✅ Etapa 1 (Creche): VÁLIDA
✅ Etapa 999: INVÁLIDA
✅ Compatibilidade 1+301: COMPATÍVEL
✅ Compatibilidade 14+301: INCOMPATÍVEL
📊 Total agregadas: 7
📊 Total etapas: 35
```

---

## 📝 Exemplos de Validação

### Exemplo 1: Válido

```
Campo 14 (Curricular): 1
Campo 25 (Etapa agregada): 301
Campo 26 (Etapa): 1
```

✅ Sem erros - Creche (1) pertence à Educação Infantil (301)

### Exemplo 2: Erro - Etapa agregada obrigatória

```
Campo 14 (Curricular): 1
Campo 25 (Etapa agregada): [vazio]
Campo 26 (Etapa): [vazio]
```

❌ Erro: Etapa agregada deve ser preenchida quando curricular = 1

### Exemplo 3: Erro - Código inválido

```
Campo 14 (Curricular): 1
Campo 25 (Etapa agregada): 999
Campo 26 (Etapa): 1
```

❌ Erro: O código "999" não está na Tabela de Etapas do INEP

### Exemplo 4: Erro - Incompatibilidade

```
Campo 14 (Curricular): 1
Campo 25 (Etapa agregada): 301
Campo 26 (Etapa): 14
```

❌ Erro: A etapa "14" (1º Ano Fundamental) não é compatível com a etapa agregada "301" (Educação Infantil). Etapas esperadas: 1, 2, 3

### Exemplo 5: Erro - Campo não permitido

```
Campo 14 (Curricular): 0
Campo 25 (Etapa agregada): 301
Campo 26 (Etapa): 1
```

❌ Erro: Campo "Etapa agregada" não pode ser preenchido quando curricular ≠ 1

---

## 🚀 Como Usar

O sistema automaticamente valida os códigos de etapas quando processar registros tipo 20 com validação assíncrona ativada.

---

## 📚 Arquivos Criados/Modificados

### Criados

- `src/validation/utils/step.service.ts` - Serviço de validação de etapas
- `docs/STEPS_VALIDATION.md` - Esta documentação

### Modificados

- `src/validation/rules/record-rules/classes.rule.ts` - Adicionada validação de etapas
- `src/validation/validation.module.ts` - Registrado StepService

---

## 🎯 Regras Implementadas vs Especificação

### ✅ Implementadas

- [x] Campo 25: Obrigatório quando curricular = 1
- [x] Campo 25: Não pode ser preenchido quando curricular ≠ 1
- [x] Campo 25: Código deve existir na tabela
- [x] Campo 26: Não pode ser preenchido quando curricular ≠ 1
- [x] Campo 26: Obrigatório para etapas agregadas específicas (301, 302, 303, 306, 308)
- [x] Campo 26: Obrigatório quando formação geral básica = 1
- [x] Campo 26: Código deve existir na tabela
- [x] Campo 26: Compatibilidade com etapa agregada

### ⏳ A Implementar (Regras complexas adicionais)

- [ ] Campo 26: Validação com tipo de mediação (semipresencial/EAD)
- [ ] Campo 26: Validação com local de funcionamento diferenciado
- [ ] Campo 26: Validação com atividade complementar
- [ ] Campo 26: Validação com modalidade
- [ ] Campo 26: Validação de formação geral básica vs itinerário formativo
- [ ] Campo 26: Requer docente vinculado (exceto creche)

---

## ✨ Próximos Passos

1. ✅ Serviço criado
2. ✅ Validações básicas implementadas
3. ✅ Testes realizados
4. ⏳ Implementar regras complexas adicionais
5. ⏳ Validação cruzada com outros campos
6. ⏳ Validação de docentes vinculados

---

## 📊 Performance

- Cache em memória para todas as etapas e etapas agregadas
- Lookup O(1) para verificação de códigos
- Carregamento único na inicialização
- Suporte a fallback para CSV se banco indisponível
