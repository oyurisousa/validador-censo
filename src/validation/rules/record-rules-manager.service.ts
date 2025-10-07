import { Injectable } from '@nestjs/common';
import { SchoolIdentificationRule } from './record-rules/school-identification.rule';
import { SchoolCharacterizationRule } from './record-rules/school-characterization.rule';
import { ClassesRule } from './record-rules/classes.rule';
import { PhysicalPersonsRule } from './record-rules/physical-persons.rule';
import { SchoolManagerBondRule } from './record-rules/school-manager-bond.rule';
import { SchoolProfessionalBondRule } from './record-rules/school-professional-bond.rule';
import { FileEndRule } from './record-rules/file-end.rule';
import { BaseRecordRule } from './base-record.rule';
import { RecordTypeEnum } from 'src/common/enums/record-types.enum';
import type { ValidationError } from 'src/common/interfaces/validation.interface';

@Injectable()
export class RecordRulesManagerService {
  private readonly rules: Map<RecordTypeEnum, BaseRecordRule> = new Map();

  constructor(
    private readonly schoolIdentificationRule: SchoolIdentificationRule,
    private readonly schoolCharacterizationRule: SchoolCharacterizationRule,
    private readonly classesRule: ClassesRule,
    private readonly physicalPersonsRule: PhysicalPersonsRule,
    private readonly schoolManagerBondRule: SchoolManagerBondRule,
    private readonly schoolProfessionalBondRule: SchoolProfessionalBondRule,
    private readonly fileEndRule: FileEndRule,
  ) {
    this.initializeRules();
  }

  private initializeRules(): void {
    // Registrar todas as regras
    this.rules.set(
      RecordTypeEnum.SCHOOL_IDENTIFICATION,
      this.schoolIdentificationRule,
    );
    this.rules.set(
      RecordTypeEnum.SCHOOL_CHARACTERIZATION,
      this.schoolCharacterizationRule,
    );
    this.rules.set(RecordTypeEnum.CLASSES, this.classesRule);
    this.rules.set(RecordTypeEnum.PHYSICAL_PERSONS, this.physicalPersonsRule);
    this.rules.set(
      RecordTypeEnum.SCHOOL_MANAGER_LINKS,
      this.schoolManagerBondRule,
    );
    this.rules.set(
      RecordTypeEnum.SCHOOL_PROFESSIONAL_LINKS,
      this.schoolProfessionalBondRule,
    );

    this.rules.set(RecordTypeEnum.FILE_END, this.fileEndRule);

    // TODO: Adicionar outras regras conforme implementadas
    // this.rules.set(RecordTypeEnum.STUDENT_LINKS, this.studentLinksRule);
  }

  /**
   * Valida um registro usando as regras específicas
   */
  validateRecord(
    recordType: RecordTypeEnum,
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const rule = this.rules.get(recordType);

    if (!rule) {
      return [
        {
          lineNumber,
          recordType,
          fieldName: 'record_type',
          fieldPosition: 0, // Tipo de registro é sempre a primeira posição
          fieldValue: recordType,
          ruleName: 'unsupported_record_type',
          errorMessage: `Tipo de registro ${recordType} não é suportado`,
          severity: 'error',
        },
      ];
    }

    return rule.validate(parts, lineNumber);
  }

  /**
   * Verifica se um tipo de registro é suportado
   */
  isRecordTypeSupported(recordType: RecordTypeEnum): boolean {
    return this.rules.has(recordType);
  }

  /**
   * Obtém informações de um campo específico
   */
  getFieldInfo(recordType: RecordTypeEnum, position: number) {
    const rule = this.rules.get(recordType);
    return rule?.getFieldInfo(position);
  }

  /**
   * Obtém todos os campos de um tipo de registro
   */
  getAllFields(recordType: RecordTypeEnum) {
    const rule = this.rules.get(recordType);
    return rule?.getAllFields() || [];
  }

  /**
   * Lista todos os tipos de registros suportados
   */
  getSupportedRecordTypes(): RecordTypeEnum[] {
    return Array.from(this.rules.keys());
  }
}
