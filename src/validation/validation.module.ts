import { Module } from '@nestjs/common';
import { ValidationEngineService } from './engine/validation-engine.service';
import { FieldValidatorService } from './validators/field-validator.service';
import { RecordValidatorService } from './validators/record-validator.service';
import { FileValidatorService } from './validators/file-validator.service';
import { StructuralValidatorService } from './validators/structural-validator.service';
import { RecordRulesManagerService } from './rules/record-rules-manager.service';
import { StructuralRulesManagerService } from './rules/structural-rules-manager.service';
import { SchoolIdentificationRule } from './rules/record-rules/school-identification.rule';
import { SchoolCharacterizationRule } from './rules/record-rules/school-characterization.rule';
import { ClassesRule } from './rules/record-rules/classes.rule';
import { PhysicalPersonsRule } from './rules/record-rules/physical-persons.rule';
import { SchoolManagerBondRule } from './rules/record-rules/school-manager-bond.rule';
import { SchoolProfessionalBondRule } from './rules/record-rules/school-professional-bond.rule';
import { StudentEnrollmentRule } from './rules/record-rules/student-enrollment.rule';
import { FileEndRule } from './rules/record-rules/file-end.rule';
import { FileStructureRule } from './rules/structural-rules/file-structure.rule';
import { RecordSequenceRule } from './rules/structural-rules/record-sequence.rule';
import { SchoolStructureRule } from './rules/structural-rules/school-structure.rule';
import { CharacterEncodingRule } from './rules/structural-rules/character-encoding.rule';

@Module({
  providers: [
    // Engines
    ValidationEngineService,

    // Validators
    FieldValidatorService,
    RecordValidatorService,
    FileValidatorService,
    StructuralValidatorService,

    // Rule Managers
    RecordRulesManagerService,
    StructuralRulesManagerService,

    // Record Rules
    SchoolIdentificationRule,
    SchoolCharacterizationRule,
    ClassesRule,
    PhysicalPersonsRule,
    SchoolManagerBondRule,
    SchoolProfessionalBondRule,
    StudentEnrollmentRule,
    FileEndRule,

    // Structural Rules
    FileStructureRule,
    RecordSequenceRule,
    SchoolStructureRule,
    CharacterEncodingRule,
  ],
  exports: [
    ValidationEngineService,
    FieldValidatorService,
    RecordValidatorService,
    FileValidatorService,
    StructuralValidatorService,
    RecordRulesManagerService,
    StructuralRulesManagerService,
  ],
})
export class ValidationModule {}
