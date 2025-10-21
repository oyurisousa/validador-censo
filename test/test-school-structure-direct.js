const { SchoolStructureRule } = require('../src/validation/rules/structural-rules/school-structure.rule');

// Simular estrutura de escola incompleta (apenas registro 00 com situação 1)
const testSchoolStructure = () => {
  const schoolStructureRule = new SchoolStructureRule();

  const mockSchoolIncomplete = {
    schoolCode: '22028072',
    situacaoFuncionamento: '1', // Em atividade
    dependenciaAdministrativa: '1',
    records: [
      {
        type: '00',
        lineNumber: 1,
        fieldCount: 56,
        schoolCode: '22028072',
        data: ['00', '22028072', '1', '01/02/2025', '31/12/2025', 'ESCOLA']
      }
    ],
    hasRecord00: true,
    hasRecord10: false, // MISSING
    hasRecord20: false, // MISSING
    hasRecord30: false, // MISSING
    hasRecord40: false, // MISSING
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

  const mockContext = {
    records: ['00|22028072|1|01/02/2025|31/12/2025|ESCOLA|...', '99|000000001|'],
    schoolStructures: new Map([['22028072', mockSchoolIncomplete]]),
    totalSchools: 1,
    hasRecord99: true,
    fileContent: '00|22028072|1|01/02/2025|31/12/2025|ESCOLA|...\n99|000000001|'
  };

  console.log('🔍 Testing SchoolStructureRule directly...\n');
  console.log('School situation:', mockSchoolIncomplete.situacaoFuncionamento);
  console.log('Has records: 00=' + mockSchoolIncomplete.hasRecord00 + ', 10=' + mockSchoolIncomplete.hasRecord10 + ', 20=' + mockSchoolIncomplete.hasRecord20 + ', 30=' + mockSchoolIncomplete.hasRecord30 + ', 40=' + mockSchoolIncomplete.hasRecord40);

  try {
    const errors = schoolStructureRule.validate(mockContext);

    console.log('\n📊 Validation Results:');
    console.log(`Total errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n✅ Errors found:');
      errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.ruleName}: ${err.errorMessage}`);
      });
    } else {
      console.log('\n❌ No errors found - Rule 18 might not be working!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('This suggests the rule needs to be implemented in TypeScript/JavaScript');
  }
};

testSchoolStructure();
