const fs = require('fs');

console.log('🔍 Testing Improved Error Messages...\n');

// Test data with scenarios that trigger different validation rules
const testImprovedMessages = async () => {
  try {
    const fileContent = [
      // School (normal location)
      '00|22028072|2|01/02/2025|31/12/2025|ESCOLA|12345678|1234567|END|123|SP|SP|1|11|12345678|12345678|test@test.com|12345|1|7|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',
      // Class (not AEE, presencial, curricular, stage 1 - normal elementary)
      '20|22028072|142431||TURMA|1||07:00-11:00|07:00-11:00|07:00-11:00|07:00-11:00|07:00-11:00||0|1|0|0|0|1|0|0|0|0|0|1|041|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',
      // Person (Brazilian resident)
      '30|22028072|10048435|126141069419|12345678901|JOAO|15/05/1990|1|MAE||1|1||1|76|1|||||||||||||||||||||||||||||||||||||||||||76|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
      // Student enrollment with violations - This will trigger multiple specific error messages
      '60|22028072|10048435|126141069419|142431|2025|||1|1|1|1|1|1|1|1|1|1|1|1|1|0|0|0|0|0|0|0|0|0|||||||||',
      '99|000000004|'
    ].join('\n');

    console.log('📋 Test Setup - Invalid Student Record:');
    console.log('- School: Normal location (field 19=7)');
    console.log('- Class: NOT AEE, Presencial, Curricular, Stage 1 (Elementary)');
    console.log('- Person: Brazilian resident (field 50=76)');
    console.log('- Student: Multiple violations:');
    console.log('  * Multi-class filled for stage 1 (should be empty)');
    console.log('  * AEE fields filled when class is not AEE');
    console.log('  * Schooling space filled (field 19=1) when conditions not met');
    console.log('  * Transport fields empty when required');

    const response = await fetch('http://localhost:3000/api/validation/validate-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: fileContent.split('\n') })
    });

    const result = await response.json();

    console.log('\n📊 RESULTS:');
    console.log(`Total errors: ${result.errors?.length || 0}`);

    // Filter student errors (line 4)
    const studentErrors = result.errors?.filter(e => e.lineNumber === 4 && e.recordType === '60') || [];

    if (studentErrors.length > 0) {
      console.log('\n🎯 IMPROVED ERROR MESSAGES:');
      console.log('=====================================');

      studentErrors.forEach((err, i) => {
        console.log(`\n${i + 1}. ${err.fieldName} (${err.ruleName}):`);
        console.log(`   📝 Message: ${err.errorMessage}`);
        console.log(`   📍 Position: ${err.fieldPosition}, Value: "${err.fieldValue}"`);
      });

      // Check for specific improved messages
      const multiClassErrors = studentErrors.filter(e => e.fieldName === 'multi_class');
      const aeErrors = studentErrors.filter(e => e.fieldName.includes('cognitive_functions') || e.fieldName.includes('autonomous_life'));
      const schoolingErrors = studentErrors.filter(e => e.fieldName === 'schooling_other_space');
      const transportErrors = studentErrors.filter(e => e.fieldName === 'public_transport');

      console.log('\n📈 MESSAGE QUALITY ANALYSIS:');
      console.log('============================');

      if (multiClassErrors.length > 0) {
        console.log(`✅ Multi-class errors: ${multiClassErrors.length}`);
        multiClassErrors.forEach(err => {
          console.log(`   - ${err.errorMessage}`);
        });
      }

      if (aeErrors.length > 0) {
        console.log(`✅ AEE field errors: ${aeErrors.length}`);
        aeErrors.slice(0, 2).forEach(err => {
          console.log(`   - ${err.errorMessage}`);
        });
      }

      if (schoolingErrors.length > 0) {
        console.log(`✅ Schooling space errors: ${schoolingErrors.length}`);
        schoolingErrors.forEach(err => {
          console.log(`   - ${err.errorMessage}`);
        });
      }

      if (transportErrors.length > 0) {
        console.log(`✅ Transport errors: ${transportErrors.length}`);
        transportErrors.forEach(err => {
          console.log(`   - ${err.errorMessage}`);
        });
      }

      console.log('\n🔍 BEFORE vs AFTER:');
      console.log('====================');
      console.log('❌ BEFORE: "O campo foi preenchido quando deveria não ser preenchido."');
      console.log('✅ AFTER:  "O campo não pode ser preenchido quando a turma não oferece Atendimento Educacional Especializado (campo 15 do registro 20 deve ser 1-Sim)."');
      console.log('');
      console.log('❌ BEFORE: "O campo não foi preenchido quando deveria ser preenchido."');
      console.log('✅ AFTER:  "O campo é obrigatório para a etapa de ensino 1 (etapas que exigem: 3, 22, 23, 72, 56, 64)."');

    } else {
      console.log('❌ No student errors found - check test data');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

console.log('🚀 Testing improved error messages...\n');
testImprovedMessages().then(() => {
  console.log('\n=== Message improvement test completed ===');
});
