const fs = require('fs');

// Test data: Student enrollment record (type 60) with transport = 1 but no vehicle fields filled
// 32 fields total: type|school|person|inep|class|year|day|month|multiclass|stage|day2|month2|activity_type|specializing_type|hours|sunday|monday|tuesday|wednesday|thursday|friday|saturday|youth_adult|public_transport|authority|veh1|veh2|veh3|veh4|veh5|veh6|veh7
const testLine = '60|12345678|60001|123456789|456789|2025|1|2|0|41|1|2|1|1|4|0|1|1|1|1|1|0|0|1||||||||';
//                   ^type    ^school  ^person ^inep       ^class   ^year                                              ^transport=1 ^empty vehicle fields (fields 22-31)

console.log('Testing Student Enrollment Transport Validation...\n');

console.log('Test Line (Registro 60):');
console.log(testLine);
console.log('\nField 21 (Transport): 1 (should make vehicle fields required)');
console.log('Fields 22-32 (Vehicles): empty (should cause validation errors)\n');

// Test 1: validate-line endpoint (single record validation)
console.log('=== TEST 1: validate-line endpoint ===');
const testValidateLine = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/validation/validate-line', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recordType: '60',
        line: testLine
      })
    });

    const result = await response.json();
    console.log('Response:', JSON.stringify(result, null, 2));

    // Check if transport-related errors are present
    const transportErrors = result.errors?.filter(error =>
      error.fieldName?.includes('transport') ||
      error.fieldName?.includes('vehicle') ||
      error.code?.includes('transport') ||
      error.code?.includes('vehicle')
    );

    console.log('\nTransport-related errors found:', transportErrors?.length || 0);
    if (transportErrors?.length > 0) {
      console.log('✅ SUCCESS: Transport validation works in validate-line!');
      transportErrors.forEach(err => {
        console.log(`  - ${err.fieldName}: ${err.message}`);
      });
    } else {
      console.log('❌ PROBLEM: Transport validation NOT working in validate-line');
    }
  } catch (error) {
    console.error('Error testing validate-line:', error.message);
  }
};

// Test 2: validate-file endpoint (full context validation)  
console.log('\n=== TEST 2: validate-file endpoint ===');
const testValidateFile = async () => {
  try {
    // Create a minimal file with school identification + person + class + student enrollment
    const fileContent = [
      '00|12345678|2|01/02/2025|31/12/2025|ESCOLA TESTE|12345678|1234567|ENDERECO TESTE|123|SAO PAULO|SP|1|1|1|1|1|1|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|', // School identification (56 fields)
      '30|12345678|60001|123456789|12345678901|JOAO DA SILVA|15/05/1990|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||', // Person (120 fields)
      '20|12345678|456789|TURMA A|1|41|4|1|2|1|2|2025|1|1|||||||||||||||||||||||||||||||||||||||||||||||||||||', // Class (65 fields)  
      testLine,
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
    console.log('Response:', JSON.stringify(result, null, 2));

    // Check if transport-related errors are present in line 4 (our test line)
    const line4Errors = result.lineErrors?.find(le => le.lineNumber === 4)?.errors || result.errors?.filter(e => e.lineNumber === 4) || [];
    const transportErrors = line4Errors.filter(error =>
      error.fieldName?.includes('transport') ||
      error.fieldName?.includes('vehicle') ||
      error.code?.includes('transport') ||
      error.code?.includes('vehicle')
    );

    console.log('\nTransport-related errors found in line 4:', transportErrors?.length || 0);
    if (transportErrors?.length > 0) {
      console.log('✅ SUCCESS: Transport validation works in validate-file!');
      transportErrors.forEach(err => {
        console.log(`  - ${err.fieldName}: ${err.message}`);
      });
    } else {
      console.log('❌ PROBLEM: Transport validation NOT working in validate-file');
    }
  } catch (error) {
    console.error('Error testing validate-file:', error.message);
  }
};

// Run tests
const runTests = async () => {
  console.log('Starting tests...\n');
  await testValidateLine();
  await testValidateFile();
  console.log('\n=== Tests completed ===');
};

runTests();
