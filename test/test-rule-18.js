const fs = require('fs');

console.log('🔍 Testing Structural Rule 18 - All Records Required for Active Schools...\n');

const testRule18 = async () => {
  try {
    // Test case: School with situacao_funcionamento = 1 (active) but missing other required records
    const fileContent = [
      // Only registro 00 with situacao = 1 (Em atividade)
      '00|22028072|1|01/02/2025|31/12/2025|ESCOLA|12345678|1234567|END|123|SP|SP|1|11|12345678|12345678|test@test.com|12345|1|7|1|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',
      '99|000000001|'
    ].join('\n');

    console.log('📋 Test Setup - Rule 18 Validation:');
    console.log('- School situation: 1 (Em atividade)');
    console.log('- Records provided: 00, 99');
    console.log('- Missing required records: 10, 20, 30, 40');
    console.log('- Expected: Error about incomplete active school structure');

    const response = await fetch('http://localhost:3000/api/validation/validate-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: fileContent.split('\n') })
    });

    const result = await response.json();

    console.log('\n📊 RULE 18 VALIDATION RESULTS:');
    console.log(`Total errors: ${result.errors?.length || 0}`);

    // Look for structural errors about incomplete active school
    const structuralErrors = result.errors?.filter(e =>
      e.ruleName.includes('incomplete_active_school') ||
      e.errorMessage.includes('estrutura diferente a sua situação de funcionamento') ||
      e.errorMessage.includes('Todos os registros devem ser preenchidos')
    ) || [];

    if (structuralErrors.length > 0) {
      console.log('\n✅ RULE 18 DETECTED:');
      structuralErrors.forEach((err, i) => {
        console.log(`${i + 1}. Record ${err.recordType}:`);
        console.log(`   📝 Message: ${err.errorMessage}`);
        console.log(`   🔗 Rule: ${err.ruleName}`);
        console.log(`   📍 Line: ${err.lineNumber}`);
      });
    } else {
      console.log('\n❌ RULE 18 NOT DETECTED - Missing validation for incomplete active school');
    }

    // Check for any other structural errors
    const otherStructuralErrors = result.errors?.filter(e =>
      e.recordType === 'STRUCTURAL' ||
      e.lineNumber === 0 ||
      e.ruleName.includes('structure')
    ) || [];

    if (otherStructuralErrors.length > 0) {
      console.log('\n📋 OTHER STRUCTURAL ERRORS:');
      otherStructuralErrors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.ruleName}: ${err.errorMessage}`);
      });
    }

    // Check if registry 99 validation is working
    const reg99Errors = result.errors?.filter(e =>
      e.errorMessage.includes('registro 99') ||
      e.ruleName.includes('end_record')
    ) || [];

    if (reg99Errors.length > 0) {
      console.log('\n📄 REGISTRO 99 VALIDATION:');
      reg99Errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.errorMessage}`);
      });
    }

    console.log('\n📈 ANALYSIS:');
    console.log('Rule 18 states: "Todos os registros devem ser preenchidos quando');
    console.log('o campo 3 do registro 00 (Situação de funcionamento) for preenchido com 1 (Em atividade)."');
    console.log('');
    console.log('Required records for active schools: 00, 10, 20, 30, 40');
    console.log('Optional but expected: 50 (professionals), 60 (students)');

    if (structuralErrors.length > 0) {
      console.log('✅ Validation is working correctly!');
    } else {
      console.log('❌ Rule 18 validation needs to be implemented or fixed!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Test with a complete active school for comparison
const testCompleteActiveSchool = async () => {
  try {
    console.log('\n\n🔍 Testing Complete Active School (Should Pass)...\n');

    const fileContent = [
      // Complete active school
      '00|22028072|1|01/02/2025|31/12/2025|ESCOLA|12345678|1234567|END|123|SP|SP|1|11|12345678|12345678|test@test.com|12345|1|7|1|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',

      // School characterization (10) - minimal valid data
      '10|22028072|1|0|1|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',

      // Class (20) 
      '20|22028072|142431||TURMA|1||07:00-11:00|07:00-11:00|07:00-11:00|07:00-11:00|07:00-11:00||0|1|0|0|0|1|0|0|0|0|0|1|041|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',

      // Person (30)
      '30|22028072|10048435|126141069419|12345678901|JOAO|15/05/1990|1|MAE||1|1||1|76|1|||||||||||||||||||||||||||||||||||||||||||76|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',

      // Manager (40)
      '40|22028072|10048435|126141069419|1|01/01/2025||',

      // Professional (50) - optional but good to have
      '50|22028072|10048435|126141069419|142431||1|1|001|||||||||||||||||||||||||||||||||||||',

      // Student (60) - optional but good to have  
      '60|22028072|10048435|126141069419|142431|2025|||0|0|0|0|0|0|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|0|||||||||',

      '99|000000007|'
    ].join('\n');

    const response = await fetch('http://localhost:3000/api/validation/validate-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: fileContent.split('\n') })
    });

    const result = await response.json();

    console.log('📋 Complete Active School Results:');
    console.log(`Total errors: ${result.errors?.length || 0}`);

    const structuralErrors = result.errors?.filter(e =>
      e.ruleName.includes('incomplete_active_school') ||
      e.errorMessage.includes('estrutura diferente')
    ) || [];

    if (structuralErrors.length === 0) {
      console.log('✅ Complete school passes structural validation');
    } else {
      console.log('❌ Complete school still has structural errors:');
      structuralErrors.forEach(err => console.log(`   - ${err.errorMessage}`));
    }

  } catch (error) {
    console.error('❌ Complete school test failed:', error.message);
  }
};

console.log('🚀 Testing Rule 18: All records required for active schools...\n');
testRule18()
  .then(() => testCompleteActiveSchool())
  .then(() => {
    console.log('\n=== Rule 18 validation test completed ===');
  });
