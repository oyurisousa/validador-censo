import { SchoolManagerBondRule } from '../src/validation/rules/record-rules/school-manager-bond.rule';

// Teste rápido para verificar validação cruzada
function testCrossValidation() {
  console.log('=== TESTE DE VALIDAÇÃO CRUZADA ===\n');

  const rule = new SchoolManagerBondRule();

  // Contexto da escola (registro 00)
  const schoolContext = {
    codigoInep: '12345678',
    situacaoFuncionamento: '1',
    dependenciaAdministrativa: '2'
  };

  // Contexto da pessoa (registro 30)
  const personContext = {
    codigoPessoa: 'DIR001',
    identificacaoInep: '123456789012'
  };

  console.log('1. Teste com códigos INEP iguais (deve passar):');
  const validRecord = ['40', '12345678', 'DIR001', '123456789012', '1', '4', '1'];
  const errors1 = rule.validateWithContext(validRecord, 1, schoolContext, personContext);
  console.log(`   Erros: ${errors1.length}`);
  if (errors1.length > 0) {
    errors1.forEach(error => console.log(`   - ${error.errorMessage}`));
  }
  console.log('');

  console.log('2. Teste com código INEP DIFERENTE (deve falhar):');
  const invalidRecord = ['40', '99999999', 'DIR001', '123456789012', '1', '4', '1'];
  const errors2 = rule.validateWithContext(invalidRecord, 2, schoolContext, personContext);
  console.log(`   Erros: ${errors2.length}`);
  if (errors2.length > 0) {
    errors2.forEach(error => console.log(`   - ${error.errorMessage}`));
  } else {
    console.log('   ❌ PROBLEMA: Deveria ter encontrado erro!');
  }
  console.log('');

  console.log('3. Teste com pessoa DIFERENTE (deve falhar):');
  const invalidPerson = ['40', '12345678', 'OUTRA001', '123456789012', '1', '4', '1'];
  const errors3 = rule.validateWithContext(invalidPerson, 3, schoolContext, personContext);
  console.log(`   Erros: ${errors3.length}`);
  if (errors3.length > 0) {
    errors3.forEach(error => console.log(`   - ${error.errorMessage}`));
  } else {
    console.log('   ❌ PROBLEMA: Deveria ter encontrado erro!');
  }
  console.log('');
}

// Executar teste
testCrossValidation();
