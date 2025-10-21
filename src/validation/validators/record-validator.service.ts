import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../common/interfaces/validation.interface';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../common/enums/record-types.enum';
import { RecordRulesManagerService } from '../rules/record-rules-manager.service';

@Injectable()
export class RecordValidatorService {
  constructor(private readonly recordRulesManager: RecordRulesManagerService) {}
  async validateRecord(
    line: string,
    recordType: RecordTypeEnum,
    lineNumber: number,
    version: string,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validar estrutura básica da linha
    const structureErrors = this.validateLineStructure(
      line,
      recordType,
      lineNumber,
    );
    errors.push(...structureErrors);

    // Validar campos específicos usando o sistema de regras
    const parts = line.split('|');

    // Usar validação assíncrona para registros que precisam validar com o banco de dados
    if (
      recordType === RecordTypeEnum.SCHOOL_IDENTIFICATION ||
      recordType === RecordTypeEnum.PHYSICAL_PERSONS ||
      recordType === RecordTypeEnum.CLASSES
    ) {
      const fieldErrors = await this.recordRulesManager.validateRecordAsync(
        recordType,
        parts,
        lineNumber,
      );
      errors.push(...fieldErrors);
    } else {
      // Usar validação síncrona para outros registros
      const fieldErrors = this.recordRulesManager.validateRecord(
        recordType,
        parts,
        lineNumber,
      );
      errors.push(...fieldErrors);
    }

    return errors;
  }

  private validateLineStructure(
    line: string,
    recordType: RecordTypeEnum,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Verificar se a linha não está vazia
    if (!line || line.trim() === '') {
      errors.push({
        lineNumber,
        recordType,
        fieldName: 'line_content',
        fieldValue: '',
        ruleName: 'empty_line',
        errorMessage: 'Linha vazia não é permitida',
        severity: ValidationSeverity.ERROR,
      });
      return errors;
    }

    // Verificar se contém separadores pipe
    if (!line.includes('|')) {
      errors.push({
        lineNumber,
        recordType,
        fieldName: 'line_format',
        fieldValue: line.substring(0, 50),
        ruleName: 'pipe_separator',
        errorMessage: 'Linha deve conter separadores pipe (|)',
        severity: ValidationSeverity.ERROR,
      });
      return errors;
    }

    // Verificar se o primeiro campo é o tipo de registro correto
    const parts = line.split('|');
    const firstField = parts[0]?.trim();

    if (!firstField || firstField !== recordType) {
      errors.push({
        lineNumber,
        recordType,
        fieldName: 'record_type',
        fieldValue: firstField || '',
        ruleName: 'record_type_mismatch',
        errorMessage: `Tipo de registro esperado: ${recordType}, encontrado: ${firstField}`,
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  private async validateRecordFields(
    line: string,
    recordType: RecordTypeEnum,
    lineNumber: number,
    version: string,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const parts = line.split('|');

    switch (recordType) {
      case RecordTypeEnum.SCHOOL_IDENTIFICATION:
        return this.validateSchoolIdentification(parts, lineNumber);

      case RecordTypeEnum.SCHOOL_CHARACTERIZATION:
        return this.validateSchoolCharacterization(parts, lineNumber);

      case RecordTypeEnum.CLASSES:
        return this.validateClasses(parts, lineNumber);

      case RecordTypeEnum.PHYSICAL_PERSONS:
        return this.validatePhysicalPersons(parts, lineNumber);

      case RecordTypeEnum.SCHOOL_MANAGER_LINKS:
        return this.validateSchoolManagerLinks(parts, lineNumber);

      case RecordTypeEnum.SCHOOL_PROFESSIONAL_LINKS:
        return this.validateSchoolProfessionalLinks(parts, lineNumber);

      case RecordTypeEnum.STUDENT_ENROLLMENT:
        return this.validateStudentLinks(parts, lineNumber);

      case RecordTypeEnum.FILE_END:
        return this.validateFileEnd(parts, lineNumber);

      default:
        return [];
    }
  }

  private validateSchoolIdentification(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validar número mínimo de campos
    if (parts.length < 10) {
      errors.push({
        lineNumber,
        recordType: RecordTypeEnum.SCHOOL_IDENTIFICATION,
        fieldName: 'field_count',
        fieldValue: parts.length.toString(),
        ruleName: 'minimum_fields',
        errorMessage:
          'Registro de identificação da escola deve ter pelo menos 10 campos',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Validar campos obrigatórios específicos
    if (parts.length > 1 && (!parts[1] || parts[1].trim() === '')) {
      errors.push({
        lineNumber,
        recordType: RecordTypeEnum.SCHOOL_IDENTIFICATION,
        fieldName: 'school_code',
        fieldValue: parts[1] || '',
        ruleName: 'required_field',
        errorMessage: 'Código da escola é obrigatório',
        severity: ValidationSeverity.ERROR,
      });
    }

    if (parts.length > 2 && (!parts[2] || parts[2].trim() === '')) {
      errors.push({
        lineNumber,
        recordType: RecordTypeEnum.SCHOOL_IDENTIFICATION,
        fieldName: 'school_name',
        fieldValue: parts[2] || '',
        ruleName: 'required_field',
        errorMessage: 'Nome da escola é obrigatório',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  private validateSchoolCharacterization(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (parts.length < 5) {
      errors.push({
        lineNumber,
        recordType: RecordTypeEnum.SCHOOL_CHARACTERIZATION,
        fieldName: 'field_count',
        fieldValue: parts.length.toString(),
        ruleName: 'minimum_fields',
        errorMessage:
          'Registro de caracterização da escola deve ter pelo menos 5 campos',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  private validateClasses(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (parts.length < 8) {
      errors.push({
        lineNumber,
        recordType: RecordTypeEnum.CLASSES,
        fieldName: 'field_count',
        fieldValue: parts.length.toString(),
        ruleName: 'minimum_fields',
        errorMessage: 'Registro de turma deve ter pelo menos 8 campos',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  private validatePhysicalPersons(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (parts.length < 12) {
      errors.push({
        lineNumber,
        recordType: RecordTypeEnum.PHYSICAL_PERSONS,
        fieldName: 'field_count',
        fieldValue: parts.length.toString(),
        ruleName: 'minimum_fields',
        errorMessage: 'Registro de pessoa física deve ter pelo menos 12 campos',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Validar CPF se presente
    if (parts.length > 3 && parts[3] && parts[3].trim() !== '') {
      const cpf = parts[3].replace(/\D/g, '');
      if (cpf.length !== 11) {
        errors.push({
          lineNumber,
          recordType: RecordTypeEnum.PHYSICAL_PERSONS,
          fieldName: 'cpf',
          fieldValue: parts[3],
          ruleName: 'cpf_length',
          errorMessage: 'CPF deve ter 11 dígitos',
          severity: ValidationSeverity.ERROR,
        });
      }
    }

    return errors;
  }

  private validateSchoolManagerLinks(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (parts.length < 6) {
      errors.push({
        lineNumber,
        recordType: RecordTypeEnum.SCHOOL_MANAGER_LINKS,
        fieldName: 'field_count',
        fieldValue: parts.length.toString(),
        ruleName: 'minimum_fields',
        errorMessage:
          'Registro de vínculo de gestor deve ter pelo menos 6 campos',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  private validateSchoolProfessionalLinks(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (parts.length < 8) {
      errors.push({
        lineNumber,
        recordType: RecordTypeEnum.SCHOOL_PROFESSIONAL_LINKS,
        fieldName: 'field_count',
        fieldValue: parts.length.toString(),
        ruleName: 'minimum_fields',
        errorMessage:
          'Registro de vínculo de profissional deve ter pelo menos 8 campos',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  private validateStudentLinks(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (parts.length < 10) {
      errors.push({
        lineNumber,
        recordType: RecordTypeEnum.STUDENT_ENROLLMENT,
        fieldName: 'field_count',
        fieldValue: parts.length.toString(),
        ruleName: 'minimum_fields',
        errorMessage:
          'Registro de vínculo de aluno deve ter pelo menos 10 campos',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  private validateFileEnd(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (parts.length !== 1) {
      errors.push({
        lineNumber,
        recordType: RecordTypeEnum.FILE_END,
        fieldName: 'field_count',
        fieldValue: parts.length.toString(),
        ruleName: 'exact_fields',
        errorMessage:
          'Registro de final de arquivo deve ter exatamente 1 campo',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }
}
