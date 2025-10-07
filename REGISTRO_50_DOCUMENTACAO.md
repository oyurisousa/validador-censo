# Registro 50 - Vínculo de Profissional Escolar em Sala de Aula

## Visão Geral

O registro 50 implementa a validação completa para vínculos de profissionais escolares em sala de aula com 38 campos e regras de negócio complexas que incluem validação cruzada com registros 00, 20 e 30.

## Estrutura dos Campos

### Campos Obrigatórios

1. **Tipo de registro** (Posição 0): Sempre "50"
2. **Código de escola - Inep** (Posição 1): 8 dígitos, deve corresponder ao registro 00
3. **Código da pessoa física** (Posição 2): Até 20 caracteres, deve existir no registro 30
4. **Código da Turma** (Posição 4): Até 20 caracteres, deve existir no registro 20
5. **Função que exerce na turma** (Posição 6): Valores 1-9 com regras específicas

### Campos Condicionais

- **Situação funcional** (Posição 7): Obrigatório para docentes em escolas públicas
- **Áreas do conhecimento** (Posições 8-32): Para docentes em etapas específicas
- **Itinerários formativos** (Posições 33-36): Para docentes com itinerário
- **Itinerário profissional** (Posição 37): Para funções específicas

## Funções Suportadas

| Código | Função                                      | Restrições                                                  |
| ------ | ------------------------------------------- | ----------------------------------------------------------- |
| 1      | Docente                                     | Presencial/Semipresencial                                   |
| 2      | Auxiliar/Assistente educacional             | Presencial/Semipresencial + Curricular                      |
| 3      | Profissional/Monitor atividade complementar | Presencial/Semipresencial + Atividade complementar          |
| 4      | Tradutor-Intérprete de Libras               | Presencial/Semipresencial + Alunos com deficiência auditiva |
| 5      | Docente titular EAD                         | Educação a distância                                        |
| 6      | Docente tutor EAD                           | Educação a distância                                        |
| 7      | Guia-Intérprete                             | Presencial/Semipresencial                                   |
| 8      | Profissional apoio deficiência              | Presencial/Semipresencial                                   |
| 9      | Instrutor Educação Profissional             | Itinerário profissional + Etapas específicas                |

## Validações de Contexto

### Validação Cruzada com Registro 00

- Código da escola deve ser idêntico
- Dependência administrativa afeta situação funcional

### Validação Cruzada com Registro 20

- Código da turma deve existir
- Tipo de mediação didática restringe funções
- Etapa da turma afeta áreas de conhecimento
- Itinerários formativos e profissionais

### Validação Cruzada com Registro 30

- Código da pessoa deve existir
- Identificação INEP deve corresponder
- Não pode haver conflito aluno-professor na mesma turma

## Regras de Negócio Implementadas

### 1. Restrições por Mediação Didática

- Funções 1,2,3,4,7,8: Apenas presencial ou semipresencial
- Funções 5,6: Apenas educação à distância

### 2. Restrições por Tipo de Turma

- Função 2: Apenas turmas curriculares
- Função 3: Apenas atividades complementares
- Função 9: Apenas com itinerário profissional

### 3. Áreas de Conhecimento

- Obrigatório código 1 para docentes (exceto educação infantil)
- Não pode haver duplicatas
- Deve estar oferecida pela turma

### 4. Itinerários Formativos

- Obrigatório para docentes em turmas com itinerário
- Não podem todos ser "Não"

### 5. Situação Funcional

- Obrigatório para docentes em escolas públicas
- Não pode ser preenchido para outras funções

### 6. Tradutor de Libras

- Deve haver alunos com deficiência auditiva na turma

## Uso da API

### Validação Básica

```typescript
POST / api / validation / validate;
```

### Validação com Contexto

```typescript
POST /api/validation/validate-with-context
```

A validação com contexto é essencial para o registro 50 pois permite:

- Verificação de existência de pessoas e turmas
- Validação de regras entre registros
- Verificação de conflitos aluno-professor
- Aplicação correta das regras de negócio

## Exemplo de Implementação

```typescript
const schoolProfessionalBond = new SchoolProfessionalBondRule();

// Validação com contexto completo
const errors = schoolProfessionalBond.validateWithContext(
  fields, // Campos do registro 50
  schoolContext, // Dados do registro 00
  classContext, // Dados do registro 20
  personContext, // Dados do registro 30
  lineNumber,
);
```

## Campos Especiais

### Áreas de Conhecimento (Campos 9-33)

- 25 campos para diferentes disciplinas
- Validação contra tabela de áreas conhecidas
- Verificação de duplicatas
- Primeira área obrigatória em condições específicas

### Itinerários Formativos (Campos 34-37)

- 4 áreas: Linguagens, Matemática, Ciências Natureza, Ciências Humanas
- Valores 0 (Não) ou 1 (Sim)
- Não podem todos ser 0 quando preenchidos

## Integração no Sistema

O registro 50 está completamente integrado ao sistema de validação:

1. **ValidationEngine**: Suporte à validação com contexto
2. **RecordRulesManager**: Registro da regra no sistema
3. **ValidationModule**: Provider configurado
4. **API Controller**: Endpoints disponíveis

## Características Técnicas

- **38 campos** com validações específicas
- **Validação cruzada** com 3 tipos de registro
- **Regras de negócio complexas** com múltiplas condições
- **Suporte a contexto** para validação avançada
- **Mensagens de erro específicas** para cada regra
- **Performance otimizada** com validação em duas passadas

Este registro representa um dos mais complexos do sistema educacional, cobrindo todos os aspectos necessários para garantir a integridade dos dados de vínculos profissionais em sala de aula.
