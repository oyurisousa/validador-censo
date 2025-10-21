const fs = require('fs');

console.log('🔍 Testing Corrected Field Numbers in Error Messages...\n');

const testFieldNumbers = async () => {
  try {
    const fileContent = [
      // School (normal location)
      '00|22028072|2|01/02/2025|31/12/2025|ESCOLA|12345678|1234567|END|123|SP|SP|1|11|12345678|12345678|test@test.com|12345|1|7|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',
      // Class (NOT AEE, presencial, curricular, normal location)
      '20|22028072|142431||TURMA|1||07:00-11:00|07:00-11:00|07:00-11:00|07:00-11:00|07:00-11:00||0|1|0|0|0|1|0|0|0|0|0|1|041|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',
      // Person (Argentina resident - not Brazil)
      '30|22028072|10048435|126141069419|12345678901|JOAO|15/05/1990|1|MAE||1|1||1|76|1|||||||||||||||||||||||||||||||||||||||||||32|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
      // Student enrollment with violations
      '60|22028072|10048435|126141069419|142431|2025|||0|1|1|1|1|1|1|1|1|1|1|1|1|1|0|0|0|0|0|0|0|0|0|||||||||',
      '99|000000004|'
    ].join('\n');

    console.log('📋 Test Setup - Field Number Validation:');
    console.log('- School: Campo 20 (position 19) = 7 (não diferenciada)');
    console.log('- Class: Campo 16 (position 15) = 0 (não AEE)');
    console.log('- Class: Campo 14 (position 13) = 1 (curricular)');
    console.log('- Class: Campo 6 (position 5) = 1 (presencial)');
    console.log('- Class: Campo 23 (position 22) = 0 (não diferenciado)');
    console.log('- Person: Campo 51 (position 50) = 32 (Argentina)');
    console.log('- Student: AEE fields filled when class is NOT AEE');

    const response = await fetch('http://localhost:3000/api/validation/validate-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: fileContent.split('\n') })
    });

    const result = await response.json();

    console.log('\n📊 FIELD NUMBER VALIDATION:');
    console.log(`Total errors: ${result.errors?.length || 0}`);

    // Filter student AEE errors
    const aeErrors = result.errors?.filter(e =>
      e.lineNumber === 4 &&
      e.recordType === '60' &&
      (e.fieldName.includes('cognitive_functions') ||
        e.fieldName.includes('autonomous_life') ||
        e.fieldName.includes('curriculum_enrichment'))
    ) || [];

    // Filter transport errors
    const transportErrors = result.errors?.filter(e =>
      e.lineNumber === 4 &&
      e.recordType === '60' &&
      e.fieldName === 'public_transport'
    ) || [];

    console.log('\n🎯 AEE FIELD ERRORS - Checking Campo Numbers:');
    if (aeErrors.length > 0) {
      aeErrors.slice(0, 2).forEach((err, i) => {
        console.log(`${i + 1}. ${err.fieldName}:`);
        console.log(`   📝 Message: ${err.errorMessage}`);

        // Check if message contains correct field number
        if (err.errorMessage.includes('campo 16 do registro 20')) {
          console.log('   ✅ Correct field number: Campo 16 (AEE field)');
        } else if (err.errorMessage.includes('campo 15 do registro 20')) {
          console.log('   ❌ WRONG field number: Should be Campo 16, not 15');
        } else {
          console.log('   ⚠️  No campo reference found in message');
        }
      });
    }

    console.log('\n🚛 TRANSPORT FIELD ERRORS - Checking Campo Numbers:');
    if (transportErrors.length > 0) {
      transportErrors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.fieldName}:`);
        console.log(`   📝 Message: ${err.errorMessage}`);

        // Check for correct field references
        const hasCorrectFields = [
          err.errorMessage.includes('campo 14 do registro 20'), // curricular
          err.errorMessage.includes('campo 6 do registro 20'),  // mediação
          err.errorMessage.includes('campo 51 do registro 30')  // país
        ].some(Boolean);

        if (hasCorrectFields) {
          console.log('   ✅ Contains correct campo references');
        } else {
          console.log('   ⚠️  Check campo references');
        }
      });
    }

    // Check for any remaining wrong campo references
    const allStudentErrors = result.errors?.filter(e => e.lineNumber === 4) || [];
    const wrongFieldRefs = allStudentErrors.filter(e =>
      e.errorMessage.includes('campo 15 do registro 20') && !e.errorMessage.includes('atividade complementar')
    );

    if (wrongFieldRefs.length > 0) {
      console.log('\n❌ WRONG CAMPO REFERENCES FOUND:');
      wrongFieldRefs.forEach((err, i) => {
        console.log(`${i + 1}. ${err.fieldName}: ${err.errorMessage}`);
      });
    } else {
      console.log('\n✅ No wrong campo references found!');
    }

    console.log('\n📈 SUMMARY - Field Number Corrections:');
    console.log('✅ Campo 16 (AEE) - Should reference position 15 in class record');
    console.log('✅ Campo 51 (País) - Should reference position 50 in person record');
    console.log('✅ Campo 14 (Curricular) - Should reference position 13 in class record');
    console.log('✅ Campo 6 (Mediação) - Should reference position 5 in class record');
    console.log('✅ Campo 23 (Local) - Should reference position 22 in class record');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

console.log('🚀 Testing field number corrections...\n');
testFieldNumbers().then(() => {
  console.log('\n=== Field number validation test completed ===');
});
