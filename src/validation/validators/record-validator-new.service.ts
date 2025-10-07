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
    const fieldErrors = this.recordRulesManager.validateRecord(
      recordType,
      parts,
      lineNumber,
    );
    errors.push(...fieldErrors);

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
}
