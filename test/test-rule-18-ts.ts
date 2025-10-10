import { SchoolStructureRule } from '../src/validation/rules/structural-rules/school-structure.rule';
import {
  StructuralValidationContext,
  SchoolStructure,
} from '../src/validation/rules/base-structural.rule';

// Teste para verificar se a regra 18 funciona corretamente
function testRule18() {
  console.log(
    '🔍 Testing Rule 18: Active schools must have all required records\n',
  );

  const schoolStructureRule = new SchoolStructureRule();

  // Criar estrutura de escola incompleta (apenas registro 00 com situação 1)
  const incompleteSchool: SchoolStructure = {
    schoolCode: '22028072',
    situacaoFuncionamento: '1', // Em atividade
    dependenciaAdministrativa: '1',
    records: [
      {
        type: '00',
        lineNumber: 1,
        fieldCount: 56,
        schoolCode: '22028072',
        data: [
          '00',
          '22028072',
          '1',
          '01/02/2025',
          '31/12/2025',
          'ESCOLA TESTE',
        ],
      },
    ],
    hasRecord00: true,
    hasRecord10: false, // MISSING - required for active school
    hasRecord20: false, // MISSING - required for active school
    hasRecord30: false, // MISSING - required for active school
    hasRecord40: false, // MISSING - required for active school
    hasRecord50: false,
    hasRecord60: false,
    record40Count: 0,
    classesWithStudents: new Set(),
    classesWithProfessionals: new Set(),
    allClasses: new Set(),
    classLineNumbers: new Map(),
    totalStudents: 0,
    totalProfessionals: 0,
  };

  const mockContext: StructuralValidationContext = {
    records: ['00|22028072|1|01/02/2025|31/12/2025|ESCOLA TESTE|...'],
    schoolStructures: new Map([['22028072', incompleteSchool]]),
    totalSchools: 1,
    hasRecord99: true,
    fileContent:
      '00|22028072|1|01/02/2025|31/12/2025|ESCOLA TESTE|...\n99|000000001|',
  };

  console.log('Test scenario:');
  console.log(`- School code: ${incompleteSchool.schoolCode}`);
  console.log(
    `- School status: ${incompleteSchool.situacaoFuncionamento} (1 = Active)`,
  );
  console.log(
    `- Has records: 00=${incompleteSchool.hasRecord00}, 10=${incompleteSchool.hasRecord10}, 20=${incompleteSchool.hasRecord20}, 30=${incompleteSchool.hasRecord30}, 40=${incompleteSchool.hasRecord40}`,
  );
  console.log('\n🧪 Running validation...');

  try {
    const errors = schoolStructureRule.validate(mockContext);

    console.log(`\n📊 Results: ${errors.length} errors found`);

    if (errors.length > 0) {
      console.log('\n✅ PASS - Errors correctly detected:');
      errors.forEach((error, index) => {
        console.log(
          `${index + 1}. [${error.severity}] ${error.ruleName}: ${error.errorMessage}`,
        );
        console.log(
          `   Field: ${error.fieldName}, Value: ${error.fieldValue}, Position: ${error.fieldPosition}`,
        );
      });

      // Check if the specific "incomplete_active_school" error is present
      const incompleteSchoolError = errors.find(
        (e) => e.ruleName === 'school_structure',
      );
      if (incompleteSchoolError) {
        console.log('\n🎯 Specific Rule 18 error found - EXCELLENT!');
        console.log(`   Message: ${incompleteSchoolError.errorMessage}`);
      } else {
        console.log(
          '\n⚠️  Rule 18 error not specifically identified by rule name',
        );
      }
    } else {
      console.log('\n❌ FAIL - No errors detected! Rule 18 is not working.');
    }
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Test with complete school for comparison
function testCompleteSchool() {
  console.log(
    '\n\n🔍 Testing complete school (should have no structural errors)\n',
  );

  const schoolStructureRule = new SchoolStructureRule();

  const completeSchool: SchoolStructure = {
    schoolCode: '22028072',
    situacaoFuncionamento: '1',
    dependenciaAdministrativa: '1',
    records: [],
    hasRecord00: true,
    hasRecord10: true, // Present
    hasRecord20: true, // Present
    hasRecord30: true, // Present
    hasRecord40: true, // Present
    hasRecord50: false,
    hasRecord60: false,
    record40Count: 1,
    classesWithStudents: new Set(),
    classesWithProfessionals: new Set(),
    allClasses: new Set(),
    classLineNumbers: new Map(),
    totalStudents: 0,
    totalProfessionals: 0,
  };

  const mockContext: StructuralValidationContext = {
    records: [],
    schoolStructures: new Map([['22028072', completeSchool]]),
    totalSchools: 1,
    hasRecord99: true,
    fileContent: '',
  };

  const errors = schoolStructureRule.validate(mockContext);
  console.log(
    `📊 Complete school results: ${errors.length} errors (should be 0)`,
  );

  if (errors.length === 0) {
    console.log('✅ PASS - Complete school has no structural errors');
  } else {
    console.log('❌ FAIL - Complete school should not have errors:');
    errors.forEach((error) => console.log(`- ${error.errorMessage}`));
  }
}

// Run tests
testRule18();
testCompleteSchool();
