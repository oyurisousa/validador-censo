# Sistema de Validação de Municípios - Censo Educacional

## Descrição

Este sistema implementa a validação automática dos códigos de municípios conforme a tabela auxiliar do INEP, conforme especificado na documentação do Censo Educacional. As validações são aplicadas nos seguintes campos:

- **Registro 00, Campo 8**: Município da escola (obrigatório)
- **Registro 30, Campo 16**: Município de nascimento (condicional - quando nacionalidade = 1)
- **Registro 30, Campo 53**: Município de residência (condicional - quando CEP preenchido)

## Arquitetura

O sistema foi implementado com:

- **Normalização de dados**: Tabelas separadas para UFs e Municípios (evita duplicação)
- **Prisma ORM**: Integração com PostgreSQL para performance e confiabilidade
- **Fallback CSV**: Sistema funciona mesmo sem banco de dados usando CSV como fonte
- **Validação assíncrona**: Pipeline que suporta validações com consultas ao banco

## Configuração

### 1. Instalação das dependências

```bash
npm install
```

### 2. Configuração do banco (opcional, mas recomendado)

1. Inicie o PostgreSQL usando o docker-compose fornecido:

```bash
docker-compose up -d
```

2. Configure a variável de ambiente:

```bash
cp .env.example .env
# Ajuste DATABASE_URL se necessário
```

3. Execute as migrações do Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 3. Importação da tabela de municípios

1. Coloque o arquivo CSV `Tabela de Municípios 2025(Planilha1).csv` no diretório `./data/municipalities.csv`

2. Execute o seed para popular o banco:

```bash
npm run prisma:seed
```

Ou, se preferir usar apenas CSV (sem banco):

- O sistema detectará automaticamente o arquivo CSV no diretório `./data/` e usará como fallback

## Uso

### Validação automática

O sistema funciona automaticamente durante o processo de validação de arquivos:

```typescript
// O serviço de validação agora suporta validações assíncronas
const errors = await recordValidatorService.validateRecord(
  line,
  RecordTypeEnum.SCHOOL_IDENTIFICATION,
  lineNumber,
  version,
);
```

### Validações implementadas

#### Registro 00 - Campo 8 (Município)

- **Obrigatório**: Sim
- **Formato**: 7 dígitos numéricos
- **Validação**: Código deve existir na tabela auxiliar do INEP

#### Registro 30 - Campo 16 (Município de nascimento)

- **Obrigatório**: Condicional (quando nacionalidade = 1 - Brasileira)
- **Formato**: 7 dígitos numéricos
- **Validação**: Quando preenchido, código deve existir na tabela auxiliar do INEP

#### Registro 30 - Campo 53 (Município de residência)

- **Obrigatório**: Condicional (quando CEP preenchido)
- **Formato**: 7 dígitos numéricos
- **Validação**: Quando preenchido, código deve existir na tabela auxiliar do INEP

## Estrutura do banco de dados

```sql
-- Tabela de UFs (normalizada)
CREATE TABLE ufs (
  id SERIAL PRIMARY KEY,
  code VARCHAR(2) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Municípios
CREATE TABLE municipalities (
  id SERIAL PRIMARY KEY,
  code VARCHAR(7) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  uf_id INTEGER NOT NULL REFERENCES ufs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Monitoramento e debugging

### Verificar se o serviço está funcionando

```bash
# Verificar logs do sistema
npm run start:dev

# Abrir Prisma Studio para ver os dados
npm run prisma:studio
```

### Estatísticas da importação

O script de seed exibe estatísticas detalhadas:

- Número total de UFs importadas
- Número total de municípios importados
- Contagem de municípios por UF
- Verificação de integridade dos dados

## Fallback e recuperação

O sistema foi projetado para ser resiliente:

1. **Prisma disponível**: Usa o banco PostgreSQL (performance otimizada)
2. **Prisma não disponível**: Usa arquivo CSV diretamente (funcionalidade preservada)
3. **CSV não encontrado**: Reporta erro claro com caminhos esperados

## Performance

- **Cache em memória**: Códigos de municípios carregados uma vez na inicialização
- **Índices no banco**: Otimização para consultas por código
- **Batch processing**: Importação em lotes de 100 registros
- **Lazy loading**: Inicialização sob demanda

## Exemplo de erro de validação

```json
{
  "lineNumber": 15,
  "recordType": "00",
  "fieldName": "municipio",
  "fieldPosition": 8,
  "fieldValue": "1234567",
  "ruleName": "municipio_codigo_invalido",
  "errorMessage": "O código do município deve estar de acordo com a Tabela de Municípios do INEP",
  "severity": "error"
}
```
