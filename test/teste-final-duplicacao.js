const { ValidationEngineService } = require('./dist/validation/engine/validation-engine.service.js');
const { Test } = require('@nestjs/testing');
const { ValidationModule } = require('./dist/validation/validation.module.js');

async function testeDuplicacaoCompleto() {
  console.log('=== TESTE FINAL COMPLETO - VERIFICAÇÃO DE TODAS AS DUPLICAÇÕES ===\n');

  const moduleRef = await Test.createTestingModule({
    imports: [ValidationModule],
  }).compile();

  const validationEngine = moduleRef.get(ValidationEngineService);

  // Dados de teste completos com vários tipos de registro
  const testData = [
    '00|28000001|ESCOLA TESTE|1|||||||||||||||||||1||||||||||||||||||||||||||||||||||||',
    '20|1|TURMA001|TURMA A|1|1|||||||||1||||||||||||||1||||||||||||||||||||||||||||||||||||||||',
    '30|1|PESSOA001||11122233344||JOAO DA SILVA|||||||||||||||||||||||||||||||||||||||||||||||||||||||76|1|||||||||||||||||||||||||||||||||||||||||||||||||',
    '40|1|PESSOA001|1||1|||',
    '50|1|PESSOA001||TURMA001|||||||||||||||||||||||||||||||||||||||||||',
    '60|1|PESSOA001||TURMA001||||||||||||||||||||||||||||||||||||||||||||||',
  ];

  try {
    const result = await validationEngine.validateFile(
      testData.join('\n'),
      'test-completo.txt'
    );

    console.log(`📊 RESULTADO GERAL:`);
    console.log(`   Total de erros: ${result.errors.length}`);
    console.log(`   Total de warnings: ${result.warnings.length}\n`);

    // Verificar duplicações por tipo de erro
    const errorsByRule = {};
    const duplicateErrors = [];

    result.errors.forEach(error => {
      const key = `${error.lineNumber}_${error.recordType}_${error.ruleName}_${error.fieldName}`;

      if (errorsByRule[key]) {
        errorsByRule[key].push(error);
        if (errorsByRule[key].length === 2) {
          duplicateErrors.push({
            rule: error.ruleName,
            line: error.lineNumber,
            recordType: error.recordType,
            fieldName: error.fieldName,
            count: errorsByRule[key].length
          });
        }
      } else {
        errorsByRule[key] = [error];
      }
    });

    console.log(`🔍 ANÁLISE DE DUPLICAÇÕES:`);

    if (duplicateErrors.length > 0) {
      console.log(`   ❌ DUPLICAÇÕES ENCONTRADAS: ${duplicateErrors.length}\n`);

      duplicateErrors.forEach((dup, index) => {
        console.log(`   ${index + 1}. Linha ${dup.line} | Tipo ${dup.recordType} | Regra: ${dup.rule}`);
        console.log(`      Campo: ${dup.fieldName} | Ocorrências: ${dup.count}`);

        // Mostrar os erros duplicados
        const key = `${dup.line}_${dup.recordType}_${dup.rule}_${dup.fieldName}`;
        const duplicates = errorsByRule[key];
        duplicates.forEach((err, i) => {
          console.log(`      ${i + 1}. "${err.errorMessage}"`);
        });
        console.log('');
      });

      return false;
    } else {
      console.log(`   ✅ NENHUMA DUPLICAÇÃO ENCONTRADA!`);
      console.log(`   Todos os ${result.errors.length} erros são únicos.\n`);

      // Mostrar resumo por tipo de registro
      const errorsByRecordType = {};
      result.errors.forEach(error => {
        if (!errorsByRecordType[error.recordType]) {
          errorsByRecordType[error.recordType] = 0;
        }
        errorsByRecordType[error.recordType]++;
      });

      console.log(`📈 RESUMO POR TIPO DE REGISTRO:`);
      Object.entries(errorsByRecordType).forEach(([recordType, count]) => {
        console.log(`   Registro ${recordType}: ${count} erro(s)`);
      });

      return true;
    }

  } catch (error) {
    console.log(`❌ ERRO NA VALIDAÇÃO: ${error.message}`);
    return false;
  }
}

// Executar teste completo
testeDuplicacaoCompleto()
  .then(success => {
    if (success) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
      console.log('✅ Sistema de validação está funcionando corretamente sem duplicações');
      process.exit(0);
    } else {
      console.log('\n❌ AINDA HÁ PROBLEMAS DE DUPLICAÇÃO');
      console.log('⚠️  Verifique os erros reportados acima');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 ERRO NO TESTE:', error);
    process.exit(1);
  });
