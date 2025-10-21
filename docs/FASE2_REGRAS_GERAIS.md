# Regras Gerais da Fase 2 - Situação do Aluno

Este documento descreve a implementação das regras gerais específicas da **Fase 2** do Censo Escolar (Situação do Aluno).

## ⚠️ Importante

A Fase 2 possui suas próprias regras gerais, **diferentes** das regras da Fase 1. As regras da Fase 1 **NÃO devem ser aplicadas** na validação de arquivos da Fase 2.

## Regras Implementadas

### ✅ Regra 1: Codificação ISO-8859-1

**Descrição:** Deve ser utilizado o padrão ISO-8859-1 de codificação de caracteres.

**Mensagem de Erro:**

```
Para a geração do arquivo deve ser utilizado o padrão ISO-8859-1 de codificação de caracteres.
```

**Tipo:** Validação

**Implementação:** Esta regra já está implementada em `character-encoding.rule.ts` e é aplicada em ambas as fases.

---

### ✅ Regra 2: Registro 89 com 6 campos

**Descrição:** O registro 89 deve ter 6 campos.

**Mensagem de Erro:**

```
Registro 89 com número de campos diferente de 6, foram encontrados <número de campos> campos.
```

**Tipo:** Validação

**Implementação:** `PhaseTwoStructureRule.validateRecordStructures()`

---

### ✅ Regra 3: Registro 90 com 8 campos

**Descrição:** O registro 90 deve ter 8 campos.

**Mensagem de Erro:**

```
Registro 90 com número de campos diferente de 8, foram encontrados <número de campos> campos.
```

**Tipo:** Validação

**Implementação:** `PhaseTwoStructureRule.validateRecordStructures()`

---

### ✅ Regra 4: Registro 91 com 11 campos

**Descrição:** O registro 91 deve ter 11 campos.

**Mensagem de Erro:**

```
Registro 91 com número de campos diferente de 11, foram encontrados <número de campos> campos.
```

**Tipo:** Validação

**Implementação:** `PhaseTwoStructureRule.validateRecordStructures()`

---

### ✅ Regra 5: Sequência do Registro 90

**Descrição:** O registro 90 deve vir após um registro 89 ou após um registro 90.

**Mensagem de Erro:**

```
Registro 90 declarado em linha inadequada.
```

**Tipo:** Validação

**Implementação:** `PhaseTwoStructureRule.validatePhaseTwoSequence()`

---

### ✅ Regra 6: Sequência do Registro 91

**Descrição:** O registro 91 deve vir após um registro 89 ou após um registro 90 ou após um registro 91.

**Mensagem de Erro:**

```
Registro 91 declarado em linha inadequada.
```

**Tipo:** Validação

**Implementação:** `PhaseTwoStructureRule.validatePhaseTwoSequence()`

---

### ✅ Regra 7: Existência do Registro 89

**Descrição:** Deve haver um registro 89 para cada escola informada.

**Mensagem de Erro:**

```
Estrutura da escola incorreta. Não foi encontrado o registro 89.
```

**Tipo:** Validação

**Implementação:** `PhaseTwoStructureRule.validatePhaseTwoSchoolStructure()`

---

### ✅ Regra 8: Unicidade do Registro 89

**Descrição:** Não pode haver mais de um registro 89 para cada escola informada.

**Mensagem de Erro:**

```
Estrutura da escola incorreta. A escola <código da escola> possui mais de um registro 89.
```

**Tipo:** Validação

**Implementação:** `PhaseTwoStructureRule.validatePhaseTwoSchoolStructure()`

---

### ❌ Regra 9: Situação do Aluno (NÃO IMPLEMENTÁVEL)

**Descrição:** Deve haver um registro 90 para cada matrícula ativa de escolarização da escola em turmas que não são de itinerário formativo exclusivo.

**Mensagem de Erro:**

```
Não foi informada a situação do aluno <código do aluno> vinculado à turma <código da turma>.
```

**Tipo:** Processamento

**Motivo:** Esta regra depende de dados armazenados na base do IENP (matrículas ativas) e só pode ser validada durante o processamento do arquivo no sistema do IENP. Não é possível validar no validador local.

---

### ✅ Regra 10: Caracteres Permitidos

**Descrição:** Não pode haver letras minúsculas nem caracteres acentuados.

**Mensagem de Erro:**

```
O campo "<nome do campo>" do registro <número do registro> contém caractere(s) inválido(s).
```

**Tipo:** Validação

**Implementação:** `PhaseTwoStructureRule.validatePhaseTwoCharacters()`

---

### ❌ Regra 11: Importação Única (NÃO IMPLEMENTÁVEL)

**Descrição:** Cada escola só pode ser importada uma vez no período preliminar de coleta e mais uma única vez no período de retificação.

**Mensagem de Erro:**

```
A escola <código da escola> já foi importada.
```

**Tipo:** Processamento

**Motivo:** Esta regra depende do histórico de importações armazenado na base do IENP e só pode ser validada durante o processamento do arquivo no sistema do IENP. Não é possível validar no validador local.

---

## Estrutura dos Arquivos da Fase 2

### Registros Válidos

- **89** - Identificação da Escola (6 campos)
- **90** - Situação do Aluno na Turma (8 campos)
- **91** - Situação do Aluno no Componente Curricular (11 campos)
- **99** - Final do Arquivo

### Sequência Permitida

```
89 (Escola)
├── 90 (Situação do Aluno)
│   └── 90 (Situação do Aluno - repetível)
│       └── 91 (Situação no Componente - opcional)
│           └── 91 (Situação no Componente - repetível)
├── 90 ou 91 (continua...)
└── 99 (Final do Arquivo)
```

## Arquivos Modificados

1. **`src/validation/rules/structural-rules/phase-two-structure.rule.ts`** (NOVO)
   - Nova regra estrutural específica para Fase 2
   - Implementa validações 2, 3, 4, 5, 6, 7, 8 e 10

2. **`src/validation/rules/structural-rules-manager.service.ts`**
   - Atualizado para incluir lógica de separação entre Fase 1 e Fase 2
   - Método `validateStructure()` agora verifica a fase e aplica regras apropriadas
   - Método `buildValidationContext()` processa registros 89, 90 e 91

3. **`src/validation/validation.module.ts`**
   - Adicionado provider `PhaseTwoStructureRule`

## Como Usar

Para validar um arquivo da Fase 2, chame o endpoint de validação com o parâmetro `phase=2`:

```typescript
POST /api/validate
{
  "fileName": "arquivo_fase2.txt",
  "content": "...",
  "phase": "2"  // ← Importante!
}
```

## Diferenças entre Fase 1 e Fase 2

| Aspecto                    | Fase 1                         | Fase 2                  |
| -------------------------- | ------------------------------ | ----------------------- |
| Registros                  | 00, 10, 20, 30, 40, 50, 60, 99 | 89, 90, 91, 99          |
| Foco                       | Matrícula Inicial              | Situação do Aluno       |
| Estrutura de Escola        | Registro 00 obrigatório        | Registro 89 obrigatório |
| Validação de Turmas        | Sim (Registro 20)              | Não                     |
| Validação de Profissionais | Sim (Registros 40, 50)         | Não                     |
| Validação de Alunos        | Sim (Registro 60)              | Sim (Registros 90, 91)  |

## Próximos Passos

1. ✅ Implementar regras gerais da Fase 2
2. ⏳ Implementar regras específicas dos campos dos registros 89, 90 e 91
3. ⏳ Criar testes unitários para as regras da Fase 2
4. ⏳ Documentar formato dos registros 89, 90 e 91
