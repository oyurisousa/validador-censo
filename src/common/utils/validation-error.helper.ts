import { ValidationError } from '../interfaces/validation.interface';
import { RecordTypeEnum, ValidationSeverity } from '../enums/record-types.enum';

/**
 * Cria um objeto ValidationError com todos os campos obrigatórios
 */
export function createValidationError(
  lineNumber: number,
  recordType: string | RecordTypeEnum,
  fieldName: string,
  fieldPosition: number,
  fieldValue: string,
  ruleName: string,
  errorMessage: string,
  severity:
    | ValidationSeverity
    | 'error'
    | 'warning'
    | 'info' = ValidationSeverity.ERROR,
): ValidationError {
  return {
    lineNumber,
    recordType: recordType.toString(),
    fieldName,
    fieldPosition,
    fieldValue,
    ruleName,
    errorMessage,
    severity: severity as 'error' | 'warning' | 'info',
  };
}

/**
 * Cria um erro geral do arquivo (sem posição específica)
 */
export function createFileError(
  lineNumber: number,
  recordType: string,
  fieldName: string,
  fieldValue: string,
  ruleName: string,
  errorMessage: string,
  severity:
    | ValidationSeverity
    | 'error'
    | 'warning'
    | 'info' = ValidationSeverity.ERROR,
): ValidationError {
  return createValidationError(
    lineNumber,
    recordType,
    fieldName,
    -1, // -1 indica erro geral
    fieldValue,
    ruleName,
    errorMessage,
    severity,
  );
}
