const { ValidationEngineService } = require('./dist/validation/engine/validation-engine.service.js');
const { Test } = require('@nestjs/testing');
const { ValidationModule } = require('./dist/validation/validation.module.js');

async function testRegistro20Duplicacao() {
  console.log('=== TESTE ESPECÍFICO REGISTRO 20 - VERIFICAÇÃO DE DUPLICAÇÃO ===\n');

  // Bootstrap do módulo de validação
  const moduleRef = await Test.createTestingModule({
    imports: [ValidationModule],
  }).compile();

  const validationEngine = moduleRef.get(ValidationEngineService);

  // Dados de teste com erro no registro 20 (classes)
  const testData = [
    '00|28000001|ESCOLA TESTE|1|||||||||||||||||||1||||||||||||||||||||||||||||||||||||',
    '20|1|TURMA001|TURMA A|1|1|||||||||1||||||||||||||1||||||||||||||||||||||||||||||||||||||||',  // Registro com erro: tipo mediação 1 (presencial) mas sem horários
  ];

  try {
    const result = await validationEngine.validateFile(
      testData.join('\n'),
      'test-registro-20.txt'
    );

    console.log(`📊 RESULTADO DA VALIDAÇÃO:`);
    console.log(`   Total de erros: ${result.errors.length}`);
    console.log(`   Total de warnings: ${result.warnings.length}\n`);

    // Filtrar erros do registro 20 especificamente
    const registro20Errors = result.errors.filter(error =>
      error.recordType === '20' &&
      error.ruleName === 'schedule_required_for_presencial'
    );

    console.log(`🔍 ERROS DO REGISTRO 20 (schedule_required_for_presencial):`);
    console.log(`   Quantidade: ${registro20Errors.length}\n`);

    if (registro20Errors.length > 1) {
      console.log('❌ PROBLEMA: ERRO DUPLICADO DETECTADO!');
      console.log('   Os seguintes erros são idênticos:\n');

      registro20Errors.forEach((error, index) => {
        console.log(`   ${index + 1}. Linha ${error.lineNumber} | Tipo ${error.recordType} | Campo: ${error.fieldName}`);
        console.log(`      Regra: ${error.ruleName}`);
        console.log(`      Mensagem: ${error.errorMessage}\n`);
      });

      return false; // Duplicação encontrada
    } else if (registro20Errors.length === 1) {
      console.log('✅ CORRETO: Apenas 1 erro encontrado (sem duplicação)');
      const error = registro20Errors[0];
      console.log(`   Linha ${error.lineNumber} | Tipo ${error.recordType} | Campo: ${error.fieldName}`);
      console.log(`   Regra: ${error.ruleName}`);
      console.log(`   Mensagem: ${error.errorMessage}\n`);

      return true; // Sem duplicação
    } else {
      console.log('⚠️  AVISO: Nenhum erro encontrado (pode não estar sendo validado)');
      return false;
    }

  } catch (error) {
    console.log('❌ ERRO NA VALIDAÇÃO:', error.message);
    return false;
  }
}

// Executar teste
testRegistro20Duplicacao()
  .then(success => {
    if (success) {
      console.log('🎉 TESTE PASSOU: Duplicação do registro 20 foi corrigida!');
      process.exit(0);
    } else {
      console.log('❌ TESTE FALHOU: Ainda há problemas de duplicação no registro 20');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('💥 ERRO NO TESTE:', error);
    process.exit(1);
  });
