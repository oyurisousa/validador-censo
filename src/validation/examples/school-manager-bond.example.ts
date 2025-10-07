import { SchoolManagerBondRule } from '../rules/record-rules/school-manager-bond.rule';

/**
 * Exemplos de registros 40 (Vínculo de Gestor Escolar) para testes
 *
 * Estrutura dos campos:
 * 1. Tipo de registro (40)
 * 2. Código INEP da escola (8 dígitos)
 * 3. Código da pessoa física no sistema (max 20 chars)
 * 4. Identificação única INEP (12 dígitos, opcional)
 * 5. Cargo (1-Diretor, 2-Outro cargo)
 * 6. Critério de acesso ao cargo (1-7, condicional)
 * 7. Situação funcional (1-4, condicional)
 */

// Exemplo 1: Diretor de escola pública - Registro válido completo
export const validDirectorPublicSchool = [
  '40', // Tipo de registro
  '12345678', // Código INEP da escola
  'DIR001', // Código da pessoa no sistema
  '123456789012', // Identificação INEP
  '1', // Cargo: Diretor
  '4', // Critério: Concurso público específico
  '1', // Situação: Concursado/efetivo
];

// Exemplo 2: Outro cargo - Registro válido sem campos condicionais
export const validOtherPosition = [
  '40', // Tipo de registro
  '12345678', // Código INEP da escola
  'COORD001', // Código da pessoa no sistema
  '', // Identificação INEP (não obrigatório)
  '2', // Cargo: Outro cargo
  '', // Critério: Não aplicável para cargo != Diretor
  '', // Situação: Não aplicável para cargo != Diretor
];

// Exemplo 3: Diretor de escola privada - Registro válido
export const validDirectorPrivateSchool = [
  '40', // Tipo de registro
  '87654321', // Código INEP da escola
  'DIR002', // Código da pessoa no sistema
  '987654321098', // Identificação INEP
  '1', // Cargo: Diretor
  '1', // Critério: Proprietário (válido para escola privada)
  '', // Situação: Não aplicável para escola privada
];

// Exemplo 4: Registro inválido - Critério obrigatório não preenchido
export const invalidMissingCriteria = [
  '40', // Tipo de registro
  '12345678', // Código INEP da escola
  'DIR003', // Código da pessoa no sistema
  '456789123456', // Identificação INEP
  '1', // Cargo: Diretor
  '', // Critério: ERRO - obrigatório para diretor em escola ativa
  '1', // Situação: Concursado/efetivo
];

// Exemplo 5: Registro inválido - Campo preenchido incorretamente
export const invalidCriteriaForOtherPosition = [
  '40', // Tipo de registro
  '12345678', // Código INEP da escola
  'COORD002', // Código da pessoa no sistema
  '', // Identificação INEP
  '2', // Cargo: Outro cargo
  '4', // Critério: ERRO - não pode ser preenchido para cargo != Diretor
  '', // Situação: Não aplicável
];

/**
 * Função para testar os exemplos
 */
export function testSchoolManagerBondExamples(): void {
  const rule = new SchoolManagerBondRule();

  console.log('=== Testes de Registro 40 (Vínculo de Gestor Escolar) ===\n');

  // Teste 1: Registro válido - Diretor escola pública
  console.log('Teste 1: Diretor de escola pública (válido)');
  const errors1 = rule.validate(validDirectorPublicSchool, 1);
  console.log(`Erros encontrados: ${errors1.length}`);
  if (errors1.length > 0) {
    errors1.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
  console.log('');

  // Teste 2: Registro válido - Outro cargo
  console.log('Teste 2: Outro cargo (válido)');
  const errors2 = rule.validate(validOtherPosition, 2);
  console.log(`Erros encontrados: ${errors2.length}`);
  if (errors2.length > 0) {
    errors2.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
  console.log('');

  // Teste 3: Registro válido - Diretor escola privada
  console.log('Teste 3: Diretor de escola privada (válido)');
  const errors3 = rule.validate(validDirectorPrivateSchool, 3);
  console.log(`Erros encontrados: ${errors3.length}`);
  if (errors3.length > 0) {
    errors3.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
  console.log('');

  // Teste 4: Registro inválido - Critério obrigatório não preenchido
  console.log('Teste 4: Critério obrigatório não preenchido (inválido)');
  const errors4 = rule.validate(invalidMissingCriteria, 4);
  console.log(`Erros encontrados: ${errors4.length}`);
  if (errors4.length > 0) {
    errors4.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
  console.log('');

  // Teste 5: Registro inválido - Campo preenchido incorretamente
  console.log('Teste 5: Campo preenchido incorretamente (inválido)');
  const errors5 = rule.validate(invalidCriteriaForOtherPosition, 5);
  console.log(`Erros encontrados: ${errors5.length}`);
  if (errors5.length > 0) {
    errors5.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
  console.log('');
}

// Contextos de exemplo para testes com validações cruzadas
export const publicSchoolContext = {
  codigoInep: '12345678',
  situacaoFuncionamento: '1', // Em atividade
  dependenciaAdministrativa: '2', // Estadual
};

export const privateSchoolContext = {
  codigoInep: '87654321',
  situacaoFuncionamento: '1', // Em atividade
  dependenciaAdministrativa: '4', // Privada
};

export const personContext = {
  codigoPessoa: 'DIR001',
  identificacaoInep: '123456789012',
};

/**
 * Função para testar os exemplos com contexto de outros registros
 */
export function testSchoolManagerBondWithContext(): void {
  const rule = new SchoolManagerBondRule();

  console.log(
    '=== Testes de Registro 40 com Contexto de Outros Registros ===\n',
  );

  // Teste 1: Validação com contexto completo - escola pública válida
  console.log('Teste 1: Diretor escola pública com contexto válido');
  const errors1 = rule.validateWithContext(
    validDirectorPublicSchool,
    1,
    publicSchoolContext,
    personContext,
  );
  console.log(`Erros encontrados: ${errors1.length}`);
  if (errors1.length > 0) {
    errors1.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
  console.log('');

  // Teste 2: Validação com contexto - escola privada válida
  console.log('Teste 2: Diretor escola privada com contexto válido');
  const errors2 = rule.validateWithContext(
    validDirectorPrivateSchool,
    2,
    privateSchoolContext,
    { codigoPessoa: 'DIR002', identificacaoInep: '987654321098' },
  );
  console.log(`Erros encontrados: ${errors2.length}`);
  if (errors2.length > 0) {
    errors2.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
  console.log('');

  // Teste 3: Erro - código INEP diferente do registro 00
  console.log('Teste 3: Código INEP diferente do registro 00 (inválido)');
  const invalidRecord = [...validDirectorPublicSchool];
  invalidRecord[1] = '99999999'; // INEP diferente
  const errors3 = rule.validateWithContext(
    invalidRecord,
    3,
    publicSchoolContext,
    personContext,
  );
  console.log(`Erros encontrados: ${errors3.length}`);
  if (errors3.length > 0) {
    errors3.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
  console.log('');

  // Teste 4: Erro - critério público em escola privada
  console.log(
    'Teste 4: Critério de concurso público em escola privada (inválido)',
  );
  const invalidPrivateRecord = [...validDirectorPrivateSchool];
  invalidPrivateRecord[5] = '4'; // Concurso público em escola privada
  const errors4 = rule.validateWithContext(
    invalidPrivateRecord,
    4,
    privateSchoolContext,
    { codigoPessoa: 'DIR002', identificacaoInep: '987654321098' },
  );
  console.log(`Erros encontrados: ${errors4.length}`);
  if (errors4.length > 0) {
    errors4.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
  console.log('');

  // Teste 5: Erro - vínculos duplicados
  console.log('Teste 5: Vínculos duplicados de gestor (inválido)');
  const existingBonds = ['DIR001']; // Pessoa já tem vínculo
  const errors5 = rule.validateWithContext(
    validDirectorPublicSchool,
    5,
    publicSchoolContext,
    personContext,
    existingBonds,
  );
  console.log(`Erros encontrados: ${errors5.length}`);
  if (errors5.length > 0) {
    errors5.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
  console.log('');
}
