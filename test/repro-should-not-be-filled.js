const fs = require('fs');
const path = require('path');

async function run() {
  const { ValidationEngineService } = require('../dist/src/validation/engine/validation-engine.service');
  const { FieldValidatorService } = require('../dist/src/validation/validators/field-validator.service');
  const { RecordValidatorService } = require('../dist/src/validation/validators/record-validator.service');
  const { FileValidatorService } = require('../dist/src/validation/validators/file-validator.service');
  const { StructuralValidatorService } = require('../dist/src/validation/validators/structural-validator.service');
  const { SchoolManagerBondRule } = require('../dist/src/validation/rules/record-rules/school-manager-bond.rule');
  const { SchoolProfessionalBondRule } = require('../dist/src/validation/rules/record-rules/school-professional-bond.rule');
  const { StudentEnrollmentRule } = require('../dist/src/validation/rules/record-rules/student-enrollment.rule');

  // Create instances like Nest would - using simple new
  const engine = new ValidationEngineService(
    new FieldValidatorService(),
    new RecordValidatorService(),
    new FileValidatorService(),
    new StructuralValidatorService(),
    new SchoolManagerBondRule(),
    new SchoolProfessionalBondRule(),
    new StudentEnrollmentRule(),
  );

  const lines = [];
  lines.push('20|22026533|143012||0ZBT|1||||||||1|0|0|||||||0|0|301|1||1|0|0|0|0|0||||||||||0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1|0');
  lines.push('60|22026533|1796860||143012||||0|0|0|0|0|0|0|0|0|0|0|1|0|||||||||||');

  const result = await engine.validateRecordsWithContext(lines);
  console.log(JSON.stringify(result.errors, null, 2));
}

run().catch(err => console.error(err));