# Registro 91 - Admissão Após: Exemplos de Validação

## Visão Geral

O **Registro 91** é utilizado na FASE 2 do Censo Escolar para informar a admissão de alunos após o início do ano letivo. Este registro contém 11 campos e possui regras complexas de validação condicional.

## Estrutura do Registro

```
91|CCCCCCCC|TTTTTTTTTTTTTTTTTTTT|TTTTTTTTTT|AAAAAAAAAAAA|AAAAAAAAAAAAAAAAAAAA|MMMMMMMMMMMM|M|M|EE|S
```

### Campos:

1. **Tipo de registro** (2 caracteres, fixo: "91")
2. **Código da escola - INEP** (8 dígitos, obrigatório)
3. **Código da turma na entidade/escola** (até 20 caracteres, desconsiderado)
4. **Código da turma - INEP** (até 10 dígitos, opcional)
5. **Código de identificação única do aluno - INEP** (12 dígitos, obrigatório)
6. **Código de identificação única do aluno na entidade/escola** (até 20 caracteres, desconsiderado)
7. **Código da matrícula** (até 12 dígitos, **DEVE SER NULO**)
8. **Tipo de mediação didático pedagógico** (1 dígito: 1-Presencial, 2-Semipresencial, 3-EAD)
9. **Código da modalidade** (1 dígito: 1-Regular, 2-Especial, 3-EJA, 4-Profissional)
10. **Código da etapa** (até 2 dígitos)
11. **Situação do aluno** (1 dígito: 1-7)

## Regras de Negócio Importantes

### 1. Campo 7 (Código da matrícula)

- **DEVE SER NULO** - o sistema busca automaticamente o código da matrícula

### 2. Regras Condicionais (Campos 8, 9, 10)

**Quando campo 4 (Código da turma - INEP) for NULO:**

- Campo 8 (Tipo de mediação) → **OBRIGATÓRIO**
- Campo 9 (Código da modalidade) → **OBRIGATÓRIO**
- Campo 10 (Código da etapa) → **OBRIGATÓRIO**

**Quando campo 4 (Código da turma - INEP) for PREENCHIDO:**

- Campo 8 (Tipo de mediação) → **DEVE SER NULO**
- Campo 9 (Código da modalidade) → **DEVE SER NULO**
- Campo 10 (Código da etapa) → **DEVE SER NULO**

### 3. Restrições por Tipo de Mediação

**Semipresencial (2):**

- Etapas permitidas: apenas 69, 70 ou 71 (EJA)

**EAD (3):**

- Modalidades permitidas: apenas 1, 3 ou 4 (não permite Educação Especial)
- Etapas permitidas: 30-40, 67, 70, 71, 73, 74

### 4. Restrições por Etapa e Situação do Aluno

**Educação Infantil (etapas 1, 2):**

- Situações NÃO permitidas: 4 (Reprovado), 5 (Aprovado), 6 (Aprovado concluinte)

**Situação 6 (Aprovado concluinte):**

- Apenas para etapas finais: 27, 28, 29, 32, 33, 34, 37, 38, 39, 40, 41, 67, 70, 71, 73, 74

**Situação 7 (Em andamento):**

- Apenas para etapas: 1, 2, 39, 40, 65, 67, 68, 69, 70, 71, 73, 74

### 5. Etapas Não Permitidas

- As seguintes etapas **NÃO podem** ser informadas: 3, 22, 23, 56, 64, 68, 72

## Exemplos de Uso

### Exemplo 1: Admissão com Turma Informada (Cenário Comum)

```
91|12345678|||1234567890|123456789012||||||1
```

**Explicação:**

- Tipo: 91
- Escola INEP: 12345678
- Turma INEP: 1234567890 (preenchida)
- Aluno INEP: 123456789012
- Matrícula: vazio (correto)
- Mediação, Modalidade, Etapa: todos vazios (correto, pois turma foi informada)
- Situação: 1 (Transferido)

✅ **VÁLIDO** - Quando a turma é informada, não é necessário preencher mediação, modalidade e etapa.

---

### Exemplo 2: Admissão sem Turma (Informação Manual)

```
91|12345678|||123456789012|||1|1|25|1
```

**Explicação:**

- Tipo: 91
- Escola INEP: 12345678
- Turma INEP: vazio
- Aluno INEP: 123456789012
- Matrícula: vazio (correto)
- Mediação: 1 (Presencial) - obrigatório pois turma está vazia
- Modalidade: 1 (Regular) - obrigatório pois turma está vazia
- Etapa: 25 (Ensino Fundamental - 4º ano) - obrigatório pois turma está vazia
- Situação: 1 (Transferido)

✅ **VÁLIDO** - Quando a turma não é informada, mediação, modalidade e etapa são obrigatórios.

---

### Exemplo 3: ❌ ERRO - Matrícula Preenchida

```
91|12345678|||1234567890|123456789012||123456789|||1
```

❌ **INVÁLIDO** - Campo 7 (Código da matrícula) não pode ser preenchido. O sistema busca automaticamente.

**Erro retornado:**

```
O campo "Código da matrícula" não pode ser preenchido.
```

---

### Exemplo 4: ❌ ERRO - Campos Condicionais Incorretos

```
91|12345678|||1234567890|123456789012||1|1|25|1
```

❌ **INVÁLIDO** - Quando campo 4 (Código da turma - INEP) é preenchido, os campos 8, 9 e 10 devem estar vazios.

**Erros retornados:**

```
O campo "Tipo de mediação didático pedagógico" não pode ser preenchido quando o campo "Código da turma - INEP" for preenchido.
O campo "Código da modalidade" não pode ser preenchido quando o campo "Código da turma - INEP" for preenchido.
```

---

### Exemplo 5: ❌ ERRO - Campos Condicionais Faltando

```
91|12345678|||123456789012||||||1
```

❌ **INVÁLIDO** - Quando campo 4 (Código da turma - INEP) está vazio, os campos 8, 9 e 10 são obrigatórios.

**Erros retornados:**

```
O campo "Tipo de mediação didático pedagógico" deve ser preenchido quando o campo "Código da turma - INEP" não for preenchido.
O campo "Código da modalidade" deve ser preenchido quando o campo "Código da turma - INEP" não for preenchido.
O campo "Código da etapa" deve ser preenchido quando o campo "Código da turma - INEP" não for preenchido.
```

---

### Exemplo 6: Admissão em EJA Semipresencial

```
91|12345678|||123456789012|||2|3|70|1
```

✅ **VÁLIDO** - Semipresencial (2) com EJA (3) e etapa 70 (EJA Médio).

---

### Exemplo 7: ❌ ERRO - Semipresencial com Etapa Inválida

```
91|12345678|||123456789012|||2|3|25|1
```

❌ **INVÁLIDO** - Semipresencial só permite etapas 69, 70 ou 71 (EJA).

**Erro retornado:**

```
O campo "Etapa de Ensino" deve ser preenchido com 69, 70 ou 71 quando o campo "Mediação didático-pedagógica" for igual a 2 (Semipresencial).
```

---

### Exemplo 8: Admissão em EAD

```
91|12345678|||123456789012|||3|3|70|1
```

✅ **VÁLIDO** - EAD (3) com EJA (3) e etapa 70.

---

### Exemplo 9: ❌ ERRO - EAD com Educação Especial

```
91|12345678|||123456789012|||3|2|25|1
```

❌ **INVÁLIDO** - EAD não permite modalidade 2 (Educação Especial).

**Erro retornado:**

```
O campo "Código da modalidade" deve ser preenchido com 1, 3 ou 4 quando o campo "Mediação didático-pedagógica" for igual a 3 (Educação a Distância).
```

---

### Exemplo 10: ❌ ERRO - Educação Infantil com Reprovação

```
91|12345678|||123456789012|||1|1|1|4
```

❌ **INVÁLIDO** - Educação Infantil (etapa 1) não pode ter situação 4 (Reprovado).

**Erro retornado:**

```
O campo "Situação do aluno" não pode ser preenchido com 4, 5 ou 6 para Educação Infantil.
```

---

### Exemplo 11: ❌ ERRO - Aprovado Concluinte em Etapa Intermediária

```
91|12345678|||123456789012|||1|1|25|6
```

❌ **INVÁLIDO** - Situação 6 (Aprovado concluinte) só é permitida para etapas finais.

**Erro retornado:**

```
O campo "Situação do aluno" (6-Aprovado concluinte) só é permitido para etapas finais.
```

---

### Exemplo 12: Aprovado Concluinte em Etapa Final

```
91|12345678|||123456789012|||1|1|29|6
```

✅ **VÁLIDO** - Etapa 29 (Ensino Médio - 3ª série) permite Aprovado concluinte.

---

### Exemplo 13: ❌ ERRO - Etapa Não Permitida

```
91|12345678|||123456789012|||1|1|3|1
```

❌ **INVÁLIDO** - Etapa 3 está na lista de etapas proibidas.

**Erro retornado:**

```
O campo "Código da etapa" foi preenchido com valor não permitido.
```

---

### Exemplo 14: ❌ ERRO - Em Andamento em Etapa Incompatível

```
91|12345678|||123456789012|||1|1|25|7
```

❌ **INVÁLIDO** - Situação 7 (Em andamento) não é permitida para etapa 25.

**Erro retornado:**

```
O campo "Situação do aluno" (7-Em andamento) só é permitido para etapas específicas.
```

---

### Exemplo 15: Em Andamento em Educação Infantil

```
91|12345678|||123456789012|||1|1|1|7
```

✅ **VÁLIDO** - Educação Infantil (etapa 1) permite situação 7 (Em andamento).

---

## Tabela de Situações do Aluno

| Código | Descrição            | Observações                          |
| ------ | -------------------- | ------------------------------------ |
| 1      | Transferido          | Todas as etapas                      |
| 2      | Deixou de frequentar | Todas as etapas                      |
| 3      | Falecido             | Todas as etapas                      |
| 4      | Reprovado            | Não permitido para Educação Infantil |
| 5      | Aprovado             | Não permitido para Educação Infantil |
| 6      | Aprovado concluinte  | Apenas etapas finais                 |
| 7      | Em andamento         | Apenas etapas específicas            |

## Tabela de Modalidades

| Código | Descrição             | Restrições             |
| ------ | --------------------- | ---------------------- |
| 1      | Ensino Regular        | Todas as mediações     |
| 2      | Educação Especial     | Não permitido para EAD |
| 3      | EJA                   | Todas as mediações     |
| 4      | Educação Profissional | Todas as mediações     |

## Tabela de Mediações

| Código | Descrição      | Restrições                              |
| ------ | -------------- | --------------------------------------- |
| 1      | Presencial     | Todas as etapas e modalidades           |
| 2      | Semipresencial | Apenas etapas 69, 70, 71 (EJA)          |
| 3      | EAD            | Modalidades 1, 3, 4; Etapas específicas |

## Dicas de Implementação

1. **Sempre deixe o campo 7 (Código da matrícula) vazio** - o sistema preenche automaticamente
2. **Escolha entre preencher turma OU (mediação + modalidade + etapa)** - não ambos
3. **Valide as restrições de mediação** antes de escolher a etapa
4. **Atenção especial para Educação Infantil** - não permite aprovação/reprovação
5. **Aprovado concluinte só funciona para última série** de cada nível de ensino

## Validações Contextuais (Não Implementadas)

Estas validações requerem acesso ao banco de dados ou APIs externas:

- Validar que o código da escola é igual ao do registro 89 antecedente
- Validar que o código da turma existe na escola
- Validar que a turma é de escolarização
- Validar que o aluno tem vínculo na primeira etapa do Censo 2024
- Validar que o aluno não aparece em outro registro 91 na mesma escola/matrícula
- Validar a lógica complexa de busca automática da matrícula
- Validar situação do aluno baseada na matrícula anterior

## Status da Implementação

✅ **Implementado:**

- Validação de campos obrigatórios
- Validação de formato e tamanho
- Validação de regras condicionais
- Validação de restrições por mediação
- Validação de restrições por etapa e situação
- Validação de etapas proibidas

⚠️ **Pendente:**

- Validações contextuais (requerem integração com banco de dados/APIs)
- Validação de compatibilidade com registro 89 antecedente
- Validação de existência de escola, turma, aluno
- Lógica automática de busca de matrícula
