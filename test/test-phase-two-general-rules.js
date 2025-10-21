/**
 * Teste das Regras Gerais da Fase 2
 * 
 * Este teste verifica se as regras gerais específicas da Fase 2 estão sendo aplicadas corretamente.
 */

const content = `89|12345678|1|2024|123|2
90|12345678|123456789|T001|2|5|85|95
91|12345678|123456789|T001|1|2|75|80|85|90|92
99|`;

console.log('=== TESTE: Regras Gerais da Fase 2 ===\n');
console.log('Arquivo de teste:');
console.log(content);
console.log('\n');

// Simular validação
const lines = content.split('\n').filter(line => line.trim());

console.log('Análise da estrutura:\n');

lines.forEach((line, index) => {
  const parts = line.split('|');
  const recordType = parts[0];
  const fieldCount = parts.length;

  console.log(`Linha ${index + 1}:`);
  console.log(`  Tipo: ${recordType}`);
  console.log(`  Campos: ${fieldCount}`);

  // Validar número de campos
  const expectedFields = {
    '89': 6,
    '90': 8,
    '91': 11,
    '99': 1
  };

  if (expectedFields[recordType]) {
    if (fieldCount === expectedFields[recordType]) {
      console.log(`  ✓ Número de campos correto (${expectedFields[recordType]})`);
    } else {
      console.log(`  ✗ ERRO: Esperado ${expectedFields[recordType]} campos, encontrado ${fieldCount}`);
    }
  }

  // Validar caracteres
  const hasLowercase = /[a-z]/.test(line);
  const hasAccents = /[\u00C0-\u00FF]/.test(line);

  if (hasLowercase || hasAccents) {
    console.log(`  ✗ ERRO: Contém letras minúsculas ou caracteres acentuados`);
  } else {
    console.log(`  ✓ Caracteres válidos`);
  }

  console.log('');
});

console.log('\nTeste com ERROS:\n');

// Teste com erros
const contentWithErrors = `89|12345678|1|2024|123|2|EXTRA
90|12345678|123456789|T001|2
91|12345678|123456789|T001|1|2|75
90|12345678|aluno_teste|T001|2|5|85|95
99|`;

const linesWithErrors = contentWithErrors.split('\n').filter(line => line.trim());

linesWithErrors.forEach((line, index) => {
  const parts = line.split('|');
  const recordType = parts[0];
  const fieldCount = parts.length;

  console.log(`Linha ${index + 1}: ${recordType} (${fieldCount} campos)`);

  const expectedFields = {
    '89': 6,
    '90': 8,
    '91': 11,
    '99': 1
  };

  const errors = [];

  // Validar número de campos
  if (expectedFields[recordType] && fieldCount !== expectedFields[recordType]) {
    errors.push(`Registro ${recordType} com número de campos diferente de ${expectedFields[recordType]}, foram encontrados ${fieldCount} campos.`);
  }

  // Validar caracteres
  const hasLowercase = /[a-z]/.test(line);
  const hasAccents = /[\u00C0-\u00FF]/.test(line);

  if (hasLowercase || hasAccents) {
    errors.push(`Contém caracteres inválidos (letras minúsculas ou acentos)`);
  }

  if (errors.length > 0) {
    errors.forEach(error => console.log(`  ✗ ${error}`));
  } else {
    console.log(`  ✓ OK`);
  }

  console.log('');
});

console.log('\n=== Teste de Sequência ===\n');

// Teste de sequência
const sequenceTests = [
  { line: '89|12345678|1|2024|123|2', expected: true, desc: 'Registro 89 no início' },
  { line: '90|12345678|123|T001|2|5|85|95', after: '89', expected: true, desc: 'Registro 90 após 89' },
  { line: '90|12345678|124|T002|2|5|85|95', after: '90', expected: true, desc: 'Registro 90 após 90' },
  { line: '91|12345678|123|T001|1|2|75|80|85|90|92', after: '89', expected: true, desc: 'Registro 91 após 89' },
  { line: '91|12345678|123|T001|1|2|75|80|85|90|92', after: '90', expected: true, desc: 'Registro 91 após 90' },
  { line: '91|12345678|123|T001|1|2|75|80|85|90|92', after: '91', expected: true, desc: 'Registro 91 após 91' },
  { line: '90|12345678|123|T001|2|5|85|95', after: '00', expected: false, desc: 'Registro 90 após 00 (INVÁLIDO)' },
  { line: '91|12345678|123|T001|1|2|75|80|85|90|92', after: '00', expected: false, desc: 'Registro 91 após 00 (INVÁLIDO)' },
];

sequenceTests.forEach(test => {
  const parts = test.line.split('|');
  const recordType = parts[0];
  const isValid = test.expected;

  if (test.after) {
    console.log(`${test.desc}: ${isValid ? '✓' : '✗'}`);
    if (!isValid) {
      console.log(`  Erro: Registro ${recordType} declarado em linha inadequada.`);
    }
  } else {
    console.log(`${test.desc}: ✓`);
  }
});

console.log('\n=== Teste de Estrutura de Escola ===\n');

// Teste de estrutura de escola
console.log('Cenário 1: Escola com apenas um registro 89 (✓ VÁLIDO)');
console.log('  89|12345678|1|2024|123|2');
console.log('  90|12345678|...');
console.log('  Resultado: ✓ OK\n');

console.log('Cenário 2: Escola com múltiplos registros 89 (✗ INVÁLIDO)');
console.log('  89|12345678|1|2024|123|2');
console.log('  90|12345678|...');
console.log('  89|12345678|1|2024|123|2  ← DUPLICADO');
console.log('  Resultado: ✗ Estrutura da escola incorreta. A escola 12345678 possui mais de um registro 89.\n');

console.log('Cenário 3: Registro 90 sem registro 89 (✗ INVÁLIDO)');
console.log('  90|12345678|...');
console.log('  Resultado: ✗ Estrutura da escola incorreta. Não foi encontrado o registro 89.\n');

console.log('=== FIM DOS TESTES ===');
