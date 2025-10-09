const fs = require('fs');

console.log('🔍 DEBUG: Testing AEE Context Detection...\n');

// Simplified test with focus on AEE detection
const testAEEDetection = async () => {
  try {
    // Simple file: school + AEE class + person + student
    const simpleFile = [
      '00|22028072|2|01/02/2025|31/12/2025|ESCOLA|12345678|1234567|END|123|SP|SP|1|11|12345678|12345678|test@test.com|12345|1|7|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|', // Valid 56-field school
      '20|22028072|142431||TURMA|1||07:00-11:00|07:00-11:00|07:00-11:00|07:00-11:00|07:00-11:00||0|0|1|0|0|0|0|0|0|0|0|0|041|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|', // Valid 70-field class with AEE=1 at position 15
      '30|22028072|10048435|126141069419|12345678901|JOAO|15/05/1990|1|MAE||1|1||1|76|1|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||', // Valid 108-field person
      '60|22028072|10048435|126141069419|142431|2025|||0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|||||||||', // Valid 32-field student with all AEE fields = 0
      '99|000000004|'
    ].join('\n');

    console.log('📋 File structure:');
    console.log('Line 1 (00): School - 56 fields');
    console.log('Line 2 (20): Class with AEE=1 at field 16 (pos 15) - 70 fields');
    console.log('Line 3 (30): Person - 108 fields');
    console.log('Line 4 (60): Student with all AEE services = 0 - 32 fields');
    console.log('Line 5 (99): End');

    const response = await fetch('http://localhost:3000/api/validation/validate-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: simpleFile.split('\n') })
    });

    const result = await response.json();

    console.log('\n📊 RESULTS:');
    console.log(`Total errors: ${result.errors?.length || 0}`);
    console.log(`Total records: ${result.totalRecords}`);
    console.log(`Processed records: ${result.processedRecords}`);

    // Focus on line 4 (student enrollment)
    const line4Errors = result.errors?.filter(e => e.lineNumber === 4) || [];
    console.log(`\nLine 4 (registro 60) errors: ${line4Errors.length}`);

    if (line4Errors.length > 0) {
      console.log('✅ Student validation IS running. Errors found:');
      line4Errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.fieldName}: ${err.ruleName} - ${err.errorMessage}`);
      });

      // Look specifically for AEE errors
      const aeeErrors = line4Errors.filter(e =>
        e.ruleName === 'at_least_one_required' ||
        e.fieldName === 'specialized_education_services' ||
        e.ruleName === 'required_when_aee' ||
        ['cognitive_functions', 'autonomous_life', 'curriculum_enrichment', 'accessible_computing',
          'libras_teaching', 'portuguese_second_language', 'soroban_techniques', 'braille_system',
          'orientation_mobility', 'alternative_communication', 'optical_resources'].includes(e.fieldName)
      );

      if (aeeErrors.length > 0) {
        console.log('\n🎯 AEE-related errors found:');
        aeeErrors.forEach(err => {
          console.log(`✅ ${err.fieldName}: ${err.ruleName} - ${err.errorMessage}`);
        });
      } else {
        console.log('\n❌ No AEE-related errors found. This suggests AEE context is not being passed correctly.');
      }
    } else {
      console.log('❌ No student validation errors found. Checking why...');

      // Check if there are structural errors preventing validation
      const structuralErrors = result.errors?.filter(e => e.lineNumber <= 3) || [];
      console.log(`\nStructural errors in lines 1-3: ${structuralErrors.length}`);

      if (structuralErrors.length > 0) {
        console.log('❌ Structural errors may be preventing student validation:');
        structuralErrors.slice(0, 5).forEach((err, i) => {
          console.log(`${i + 1}. Line ${err.lineNumber}: ${err.fieldName} - ${err.ruleName}`);
        });
      } else {
        console.log('✅ No structural errors found. Student validation should be running...');
        console.log('🚨 This suggests a bug in the AEE context detection or validation logic.');
      }
    }

    // Show all record types that had errors for debugging
    const recordTypesWithErrors = [...new Set(result.errors?.map(e => e.recordType) || [])];
    console.log('\n📋 Record types with errors:', recordTypesWithErrors);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

console.log('🚀 Starting AEE context detection test...\n');
testAEEDetection().then(() => {
  console.log('\n=== Test completed ===');
});
