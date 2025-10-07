import { Module } from '@nestjs/common';
import { ValidationEngineService } from './engine/validation-engine.service';
import { FieldValidatorService } from './validators/field-validator.service';
import { RecordValidatorService } from './validators/record-validator.service';
import { FileValidatorService } from './validators/file-validator.service';
import { RecordRulesManagerService } from './rules/record-rules-manager.service';
import { SchoolIdentificationRule } from './rules/record-rules/school-identification.rule';
import { SchoolCharacterizationRule } from './rules/record-rules/school-characterization.rule';
import { FileEndRule } from './rules/record-rules/file-end.rule';

@Module({
  providers: [
    ValidationEngineService,
    FieldValidatorService,
    RecordValidatorService,
    FileValidatorService,
    RecordRulesManagerService,
    SchoolIdentificationRule,
    SchoolCharacterizationRule,
    FileEndRule,
  ],
  exports: [
    ValidationEngineService,
    FieldValidatorService,
    RecordValidatorService,
    FileValidatorService,
    RecordRulesManagerService,
  ],
})
export class ValidationModule {}
