<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

**Sistema de Validação do Censo Escolar 2025** - API NestJS para validação de arquivos educacionais conforme especificações do INEP.

### 🎯 Funcionalidades Principais

- **Validação em Tempo Real**: Feedback imediato durante digitação (`/validate-line`)
- **Validação Completa**: Análise com contexto entre registros (`/validate-file`)
- **Upload com Validação**: Interface web para upload de arquivos (`/upload`)
- **Validações Contextuais**: Regras condicionais baseadas em outros registros
- **Relatórios Detalhados**: Erros específicos com descrições acionáveis

### 📋 Tipos de Registro Suportados

| Código | Descrição                | Campos | Validações Especiais         |
| ------ | ------------------------ | ------ | ---------------------------- |
| 00     | Identificação da Escola  | 56     | Datas, códigos IBGE          |
| 10     | Caracterização da Escola | 187    | Infraestrutura, equipamentos |
| 20     | Turmas                   | 70     | Etapa vs modalidade, AEE     |
| 30     | Pessoa Física            | 108    | CPF válido, nacionalidade    |
| 40     | Vínculo Gestor           | 7      | Máx 3 gestores, contexto     |
| 50     | Vínculo Profissional     | 38     | Função vs área conhecimento  |
| 60     | Matrícula do Aluno       | 32     | Transporte, AEE, contexto    |

### 🏗️ Arquitetura

- **ValidationEngineService**: Orquestrador principal
- **BaseRecordRule**: Classe base para validações por registro
- **StructuralValidatorService**: Validações estruturais do arquivo
- **Contextos**: SchoolContext, PersonContext, ClassContext para validações cruzadas

## 🚀 Quick Start

### Instalação

```bash
$ npm install
# ou
$ pnpm install
```

### Executar o projeto

```bash
# development
$ npm run start

# watch mode (recomendado para desenvolvimento)
$ npm run start:dev

# production mode
$ npm run start:prod
```

### 🎮 Como Usar

#### 1. Validação em Tempo Real

```bash
curl -X POST http://localhost:3000/validation/validate-line \
  -H "Content-Type: application/json" \
  -d '{"recordType": "30", "line": "30|12345678|DIR001|...", "version": "2025"}'
```

#### 2. Validação de Arquivo Completo

```bash
curl -X POST http://localhost:3000/validation/validate-file \
  -H "Content-Type: application/json" \
  -d '{"content": "conteúdo do arquivo completo...", "version": "2025"}'
```

#### 3. Upload de Arquivo

```bash
curl -X POST http://localhost:3000/validation/upload \
  -F "file=@censo2025.txt" \
  -F "version=2025"
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## 📚 Documentação

### Documentação Técnica Completa

- **[SISTEMA_VALIDACAO_COMPLETO.md](./SISTEMA_VALIDACAO_COMPLETO.md)** - Documentação detalhada de toda a arquitetura

### Documentação por Tópico

- **[docs/api-endpoints-refactored.md](./docs/api-endpoints-refactored.md)** - Documentação completa da API
- **[docs/integration-guide.md](./docs/integration-guide.md)** - Guia de integração com exemplos
- **[docs/REFACTORING_README.md](./docs/REFACTORING_README.md)** - Resumo da refatoração da API

### Exemplos Práticos

- **[examples/validation-example.md](./examples/validation-example.md)** - Exemplos de uso da API

### 🔧 Desenvolvimento

Para adicionar novas validações, consulte a seção "Como Adicionar Nova Validação" na documentação completa.

### 🧪 Testes de Validação

```bash
# Testar regras específicas
node test-rule-18.js           # Testar regra estrutural 18
node test-field-numbers.js     # Testar numeração de campos
node test-improved-messages.js # Testar mensagens de erro
```

## 📊 Performance

| Endpoint         | Tempo Médio       | Tipo de Validação       | Caso de Uso            |
| ---------------- | ----------------- | ----------------------- | ---------------------- |
| `/validate-line` | 50-100ms          | Básica (sem contexto)   | Tempo real no frontend |
| `/validate-file` | 500ms-2s          | Completa (com contexto) | Validação final        |
| `/upload`        | 500ms-2s + upload | Completa + metadata     | Interface web          |

## 🛡️ Validações Implementadas

- ✅ **Estruturais**: 41 regras estruturais (arquivo, escola, relacionamentos)
- ✅ **Por Campo**: Tipos, comprimentos, padrões, obrigatoriedade
- ✅ **Condicionais**: Campos obrigatórios baseados em outros campos
- ✅ **Contextuais**: Validações entre registros diferentes
- ✅ **Negócios**: Regras específicas do Censo Escolar 2025

## 🎯 Status do Projeto

- ✅ API completa com 3 endpoints
- ✅ Validação de todos os 8 tipos de registro (00, 10, 20, 30, 40, 50, 60, 99)
- ✅ Validações contextuais entre registros
- ✅ Mensagens de erro específicas e acionáveis
- ✅ Documentação completa da arquitetura
- ✅ Testes automatizados das validações

## License

MIT licensed.
