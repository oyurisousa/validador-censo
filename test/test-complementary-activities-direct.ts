import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ClassesRule } from '../src/validation/rules/record-rules/classes.rule';
import { ComplementaryActivityService } from '../src/validation/utils/complementary-activity.service';

async function testComplementaryActivities() {
  console.log(
    '🧪 Iniciando teste de validação de atividades complementares...\n',
  );

  // Criar o contexto da aplicação
  const app = await NestFactory.createApplicationContext(AppModule);

  // Obter os serviços
  const classesRule = app.get(ClassesRule);
  const activityService = app.get(ComplementaryActivityService);

  // Aguardar inicialização do serviço
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log(
    `📊 Total de atividades carregadas: ${activityService.getActivityCount()}\n`,
  );

  // Casos de teste
  const testCases = [
    {
      name: '✅ Válido: Código 11002 (Canto coral)',
      line: '20|12345678|TURMA01||TURMA A|1|08:00-12:00||||||0|1|0|11002||||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
      shouldHaveErrors: false,
    },
    {
      name: '❌ Erro: Código 99999 (inválido)',
      line: '20|12345678|TURMA02||TURMA B|1|08:00-12:00||||||0|1|0|99999||||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
      shouldHaveErrors: true,
      expectedError: 'invalid_activity_code',
    },
    {
      name: '❌ Erro: Campo preenchido com atividade complementar = 0',
      line: '20|12345678|TURMA03||TURMA C|1|08:00-12:00||||||0|0|0|11002||||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
      shouldHaveErrors: true,
      expectedError: 'activity_not_allowed',
    },
    {
      name: '❌ Erro: Atividade complementar = 1 sem código',
      line: '20|12345678|TURMA04||TURMA D|1|08:00-12:00||||||0|1|0|||||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
      shouldHaveErrors: true,
      expectedError: 'activity_type_required',
    },
    {
      name: '✅ Válido: Múltiplos códigos válidos (11002, 12003, 14001)',
      line: '20|12345678|TURMA05||TURMA E|1|08:00-12:00||||||0|1|0|11002|12003|14001||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
      shouldHaveErrors: false,
    },
    {
      name: '❌ Erro: Códigos duplicados (11002, 11002)',
      line: '20|12345678|TURMA06||TURMA F|1|08:00-12:00||||||0|1|0|11002|11002|||||0|0|||1|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
      shouldHaveErrors: true,
      expectedError: 'activity_duplicate',
    },
  ];

  console.log('🔍 Executando casos de teste:\n');
  console.log('='.repeat(80));

  for (const testCase of testCases) {
    const parts = testCase.line.split('|');
    const errors = await classesRule.validateAsync(parts, 1);

    // Filtrar apenas erros relacionados a atividades complementares
    const activityErrors = errors.filter(
      (err) =>
        err.ruleName.includes('activity') ||
        err.ruleName.includes('atividade') ||
        err.fieldName.includes('codigo_atividade'),
    );

    const hasErrors = activityErrors.length > 0;
    const passed = hasErrors === testCase.shouldHaveErrors;

    console.log(`\n${testCase.name}`);
    console.log('-'.repeat(80));
    console.log(`Status: ${passed ? '✅ PASSOU' : '❌ FALHOU'}`);

    if (activityErrors.length > 0) {
      console.log(`\nErros encontrados (${activityErrors.length}):`);
      activityErrors.forEach((err) => {
        console.log(`  - [${err.ruleName}] ${err.errorMessage}`);
      });
    } else {
      console.log('Nenhum erro encontrado.');
    }

    if (testCase.expectedError && hasErrors) {
      const hasExpectedError = activityErrors.some((err) =>
        err.ruleName.includes(testCase.expectedError),
      );
      if (!hasExpectedError) {
        console.log(
          `⚠️  Aviso: Erro esperado "${testCase.expectedError}" não foi encontrado`,
        );
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Teste concluído!\n');

  await app.close();
}

testComplementaryActivities().catch(console.error);
