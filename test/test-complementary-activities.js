/**
 * Test script for complementary activities validation
 * Run with: node test/test-complementary-activities.js
 */

const testCases = [
  {
    description: 'Válido: Atividade complementar com código válido',
    line: '20|12345678|TURMA01|1234567890|TURMA A|1|08:00-12:00||||||0|1|0|11002||||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
    expected: 'Sem erros - código 11002 (Canto coral) existe na tabela',
  },
  {
    description: 'Erro: Atividade complementar com código inválido',
    line: '20|12345678|TURMA01|1234567890|TURMA A|1|08:00-12:00||||||0|1|0|99999||||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
    expected:
      'Erro: O código "99999" não está na Tabela de Tipo de Atividade Complementar do INEP',
  },
  {
    description:
      'Erro: Campo de atividade preenchido quando atividade complementar = 0',
    line: '20|12345678|TURMA01|1234567890|TURMA A|1|08:00-12:00||||||0|0|0|11002||||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
    expected:
      'Erro: Campo não pode ser preenchido quando "Atividade complementar" não for 1 (Sim)',
  },
  {
    description:
      'Erro: Atividade complementar = 1 mas nenhum código preenchido',
    line: '20|12345678|TURMA01|1234567890|TURMA A|1|08:00-12:00||||||0|1|0|||||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
    expected:
      'Erro: Atividade complementar = 1 mas nenhum tipo de atividade informado',
  },
  {
    description: 'Válido: Múltiplos códigos de atividades válidos',
    line: '20|12345678|TURMA01|1234567890|TURMA A|1|08:00-12:00||||||0|1|0|11002|12003|14001||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
    expected:
      'Sem erros - códigos 11002 (Canto coral), 12003 (Desenho), 14001 (Teatro)',
  },
  {
    description: 'Erro: Códigos duplicados de atividade complementar',
    line: '20|12345678|TURMA01|1234567890|TURMA A|1|08:00-12:00||||||0|1|0|11002|11002|||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
    expected: 'Erro: Não pode haver dois códigos de atividade iguais',
  },
];

console.log('='.repeat(80));
console.log('CASOS DE TESTE - VALIDAÇÃO DE ATIVIDADES COMPLEMENTARES');
console.log('='.repeat(80));
console.log('\nRegistro 20 - Turmas');
console.log('Campos 17-22: Códigos de atividades complementares\n');

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.description}`);
  console.log('-'.repeat(80));
  console.log(`Linha: ${testCase.line.substring(0, 100)}...`);
  console.log(`Esperado: ${testCase.expected}`);
});

console.log('\n' + '='.repeat(80));
console.log('\nPara executar o teste real, execute:');
console.log('npm run start:dev');
console.log(
  'e faça upload de um arquivo TXT contendo as linhas de teste acima.\n'
);
