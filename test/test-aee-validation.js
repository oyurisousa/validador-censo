const fs = require('fs');

console.log('Testing AEE (Atendimento Educacional Especializado) Validation...\n'      console.log('Total registro 60 errors across all lines:', allStudentErrors.length);

if (allStudentErrors.length > 0) {
  console.log('Sample registro 60 errors:');
  allStudentErrors.slice(0, 5).forEach((err, i) => {
    console.log(`${i + 1}. Line ${err.lineNumber}: ${err.fieldName} - ${err.ruleName}`);
  });
}

// Check for structural errors that might prevent processing
console.log('\n🚨 Checking for structural errors in other lines:');
const structuralErrors = result.errors?.filter(e => e.ruleName?.includes('field_count') || e.severity === 'error') || [];
console.log(`Structural errors found: ${structuralErrors.length}`);

if (structuralErrors.length > 0) {
  console.log('First few structural errors:');
  structuralErrors.slice(0, 8).forEach((err, i) => {
    console.log(`${i + 1}. Line ${err.lineNumber} (${err.recordType}): ${err.fieldName} - ${err.ruleName} - ${err.errorMessage}`);
  });
}

// Let's also check what record types were processed
const recordTypes = [...new Set(result.errors?.map(e => e.recordType) || [])];
console.log('\n📋 Record types with errors:', recordTypes);

// Check total records vs processed records
console.log(`\n📊 Processing stats:`);
console.log(`Total records: ${result.totalRecords}`);
console.log(`Processed records: ${result.processedRecords}`);
console.log(`Processing time: ${result.processingTime}ms`);

if (result.totalRecords !== result.processedRecords) {
  console.log('⚠️  Not all records were processed! This could explain missing validation.');
}ados do usuário
const classLine = '20|22028072|142431||AEET|1||13:00-17:30|13:00-17:30|13:00-17:30|13:00-17:30|13:00-17:30||0|0|1|||||||0||||||||||0|||||||||||||||||||||||||||||||||||||0';
const studentLine = '60|22028072|10048435|126141069419|142431||||1|0|0|0|0|0|0|0|0|0|0|||||||||||||';

console.log('Class Line (Registro 20):');
console.log(classLine);
console.log('\nField 16 (AEE): 1 (turma É AEE)');

console.log('\nStudent Line (Registro 60):');
console.log(studentLine);
console.log('\nFields 9-19 (AEE services): all 0 (should be REQUIRED when class is AEE)');

// Test: validate-file endpoint (full context validation)  
console.log('\n=== TEST: validate-file endpoint ===');
const testValidateFile = async () => {
  try {
    // Create a minimal file with school + person + AEE class + student enrollment
    const fileContent = [
      '00|22028072|2|01/02/2025|31/12/2025|ESCOLA AEE TESTE|12345678|1234567|ENDERECO TESTE|123|SAO PAULO|SP|1|1|1|1|1|1|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',
      '30|22028072|10048435|126141069419|12345678901|JOAO DA SILVA|15/05/1990|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
      classLine,
      studentLine,
      '99|000000004|'
    ].join('\n');

    const response = await fetch('http://localhost:3000/api/validation/validate-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lines: fileContent.split('\n')
      })
    });

    const result = await response.json();

    // Check if AEE-related errors are present in line 4 (student line)
    const line4Errors = result.lineErrors?.find(le => le.lineNumber === 4)?.errors || result.errors?.filter(e => e.lineNumber === 4) || [];

    // Look for AEE field errors
    const aeeFieldErrors = line4Errors.filter(error => {
      const aeeFields = [
        'cognitive_functions',
        'autonomous_life',
        'curriculum_enrichment',
        'accessible_computing',
        'libras_teaching',
        'portuguese_second_language',
        'soroban_techniques',
        'braille_system',
        'orientation_mobility',
        'alternative_communication',
        'optical_resources'
      ];
      return aeeFields.includes(error.fieldName);
    });

    // Look for "should_not_be_filled" vs "required_when_aee" errors
    const shouldNotBeFilled = aeeFieldErrors.filter(e => e.ruleName === 'should_not_be_filled');
    const requiredWhenAEE = aeeFieldErrors.filter(e => e.ruleName === 'required_when_aee');

    console.log('\n📊 ANALYSIS:');
    console.log(`Total AEE field errors: ${aeeFieldErrors.length}`);
    console.log(`"should_not_be_filled" errors: ${shouldNotBeFilled.length} ❌`);
    console.log(`"required_when_aee" errors: ${requiredWhenAEE.length} ✅`);

    if (shouldNotBeFilled.length > 0) {
      console.log('\n❌ PROBLEM: AEE fields incorrectly marked as "should not be filled"');
      console.log('This means the system thinks the class is NOT AEE, but it should be AEE=1');
      shouldNotBeFilled.forEach(err => {
        console.log(`  - ${err.fieldName}: ${err.errorMessage}`);
      });
    }

    if (requiredWhenAEE.length > 0) {
      console.log('\n✅ SUCCESS: AEE fields correctly marked as required!');
      console.log('This means the system correctly detected that class is AEE=1');
      requiredWhenAEE.forEach(err => {
        console.log(`  - ${err.fieldName}: ${err.errorMessage}`);
      });
    }

    if (aeeFieldErrors.length === 0) {
      console.log('\n⚠️  UNEXPECTED: No AEE field errors found');
      console.log('This could mean the AEE validation is not working at all');
    }

    // Show full response for debugging if needed
    console.log('\n🔍 Full Response (truncated):');
    console.log('Errors count:', result.errors?.length || 0);
    console.log('Line 4 errors count:', line4Errors.length);

    // Show all errors in line 4 for debugging
    if (line4Errors.length > 0) {
      console.log('\n📋 All Line 4 Errors:');
      line4Errors.forEach((err, i) => {
        console.log(`${i + 1}. ${err.fieldName} (pos ${err.fieldPosition}): ${err.ruleName} - ${err.errorMessage}`);
      });
    } else {
      console.log('\n🔍 No errors found in line 4. Checking if student enrollment validation is running...');

      // Check if there are any student enrollment related errors in any line
      const allStudentErrors = result.errors?.filter(e => e.recordType === '60') || [];
      console.log(`Total registro 60 errors across all lines: ${allStudentErrors.length}`);

      if (allStudentErrors.length > 0) {
        console.log('Sample registro 60 errors:');
        allStudentErrors.slice(0, 5).forEach((err, i) => {
          console.log(`${i + 1}. Line ${err.lineNumber}: ${err.fieldName} - ${err.ruleName}`);
        });
      }
    }

    // Show just the AEE-related errors for clarity
    if (aeeFieldErrors.length > 0) {
      console.log('\n📋 AEE Field Errors:');
      aeeFieldErrors.forEach(err => {
        console.log(`${err.fieldPosition}: ${err.fieldName} - ${err.ruleName} - ${err.errorMessage}`);
      });
    }

  } catch (error) {
    console.error('Error testing validate-file:', error.message);
  }
};

// Run test
const runTest = async () => {
  console.log('Starting AEE validation test...\n');
  await testValidateFile();
  console.log('\n=== Test completed ===');
};

runTest();
