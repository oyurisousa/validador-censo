const fs = require('fs');

console.log('🔍 Testing All Record Types for Generic Messages...\n');

const testAllRecordTypes = async () => {
  try {
    // Test data with multiple record types that can trigger generic errors
    const fileContent = [
      // School (00) - normal
      '00|22028072|1|01/02/2025|31/12/2025|ESCOLA|12345678|1234567|END|123|SP|SP|1|11|12345678|12345678|test@test.com|12345|1|7|1|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',

      // Classes (20) - with AEE and itinerary conditions
      '20|22028072|142431||TURMA|1||07:00-11:00|07:00-11:00|07:00-11:00|07:00-11:00|07:00-11:00||0|1|0|1|0|1|0|0|0|0|0|1|041|0|0|0|0|0|0|0|0|0|0|1|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|',

      // Person (30) - Brazil resident  
      '30|22028072|10048435|126141069419|12345678901|JOAO|15/05/1990|1|MAE||1|1||1|76|1|||||||||||||||||||||||||||||||||||||||||||76|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',

      // School Professional Bond (50) - with violations that should trigger specific errors
      '50|22028072|10048435|126141069419|142431|INVALID_CODE|5|1|001|002|003|004|005|||||||||||||||||||1|2|3|4|5|123|||||',

      // Student enrollment (60) - with AEE violations
      '60|22028072|10048435|126141069419|142431|2025|||0|1|1|1|1|1|1|1|1|1|1|1|1|0|0|0|0|0|0|0|0|0|||||||||',

      '99|000000005|'
    ].join('\n');

    console.log('📋 Test Setup - Multiple Record Types:');
    console.log('- School (00): Normal setup');
    console.log('- Class (20): AEE enabled, itinerary enabled');
    console.log('- Person (30): Brazilian resident');
    console.log('- Professional (50): Invalid function code, areas filled');
    console.log('- Student (60): AEE fields filled when not AEE class');

    const response = await fetch('http://localhost:3000/api/validation/validate-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: fileContent.split('\n') })
    });

    const result = await response.json();

    console.log('\n📊 GENERIC MESSAGE DETECTION:');
    console.log(`Total errors: ${result.errors?.length || 0}`);

    // Search for generic messages
    const genericMessages = [
      'O campo foi preenchido quando deveria não ser preenchido.',
      'O campo não foi preenchido quando deveria ser preenchido.'
    ];

    const foundGeneric = result.errors?.filter(e =>
      genericMessages.some(msg => e.errorMessage === msg)
    ) || [];

    if (foundGeneric.length > 0) {
      console.log('\n❌ GENERIC MESSAGES STILL FOUND:');
      foundGeneric.forEach((err, i) => {
        console.log(`${i + 1}. Line ${err.lineNumber}, Record ${err.recordType}:`);
        console.log(`   Field: ${err.fieldName}`);
        console.log(`   Message: ${err.errorMessage}`);
        console.log(`   Rule: ${err.ruleName}`);
      });
    } else {
      console.log('\n✅ NO GENERIC MESSAGES FOUND!');
    }

    // Check for improved messages in different record types
    const record50Errors = result.errors?.filter(e => e.recordType === '50') || [];
    const record60Errors = result.errors?.filter(e => e.recordType === '60') || [];

    console.log('\n🎯 SPECIFIC MESSAGE EXAMPLES:');

    if (record50Errors.length > 0) {
      console.log('\n📋 Record 50 (Professional Bond) Messages:');
      record50Errors.slice(0, 3).forEach((err, i) => {
        console.log(`${i + 1}. ${err.fieldName}: ${err.errorMessage}`);
      });
    }

    if (record60Errors.length > 0) {
      console.log('\n📋 Record 60 (Student Enrollment) Messages:');
      record60Errors.slice(0, 3).forEach((err, i) => {
        console.log(`${i + 1}. ${err.fieldName}: ${err.errorMessage}`);
      });
    }

    // Summary by record type
    const errorsByType = {};
    result.errors?.forEach(err => {
      errorsByType[err.recordType] = (errorsByType[err.recordType] || 0) + 1;
    });

    console.log('\n📈 ERRORS BY RECORD TYPE:');
    Object.entries(errorsByType).forEach(([type, count]) => {
      console.log(`- Record ${type}: ${count} errors`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

console.log('🚀 Testing all record types for generic messages...\n');
testAllRecordTypes().then(() => {
  console.log('\n=== All record types test completed ===');
});
