import 'reflect-metadata';
import { RecordTypeEnum, RuleType } from '../enums/record-types.enum';

export const VALIDATION_RULES_KEY = 'validation_rules';

export interface ValidationRuleConfig {
  fieldName: string;
  ruleType: RuleType;
  parameters?: Record<string, any>;
  message?: string;
  severity?: 'error' | 'warning' | 'info';
  recordTypes?: RecordTypeEnum[];
}

export function ValidateField(config: ValidationRuleConfig) {
  return (target: any, propertyKey: string) => {
    const existingRules =
      Reflect.getMetadata(VALIDATION_RULES_KEY, target) || [];
    const newRule = {
      ...config,
      propertyKey,
      target: target.constructor.name,
    };
    existingRules.push(newRule);
    Reflect.defineMetadata(VALIDATION_RULES_KEY, existingRules, target);
  };
}

export function ValidateRecord(recordType: RecordTypeEnum) {
  return (target: any) => {
    Reflect.defineMetadata('record_type', recordType, target);
  };
}

export function ValidateFile() {
  return (target: any) => {
    Reflect.defineMetadata('file_validator', true, target);
  };
}

// Decorators específicos para tipos de validação
export function Required(message?: string) {
  return ValidateField({
    fieldName: '',
    ruleType: RuleType.REQUIRED,
    message: message || 'Campo obrigatório',
    severity: 'error',
  });
}

export function MinLength(min: number, message?: string) {
  return ValidateField({
    fieldName: '',
    ruleType: RuleType.LENGTH,
    parameters: { min },
    message: message || `Mínimo de ${min} caracteres`,
    severity: 'error',
  });
}

export function MaxLength(max: number, message?: string) {
  return ValidateField({
    fieldName: '',
    ruleType: RuleType.LENGTH,
    parameters: { max },
    message: message || `Máximo de ${max} caracteres`,
    severity: 'error',
  });
}

export function ExactLength(length: number, message?: string) {
  return ValidateField({
    fieldName: '',
    ruleType: RuleType.LENGTH,
    parameters: { exact: length },
    message: message || `Deve ter exatamente ${length} caracteres`,
    severity: 'error',
  });
}

export function Format(pattern: RegExp, message?: string) {
  return ValidateField({
    fieldName: '',
    ruleType: RuleType.FORMAT,
    parameters: { pattern: pattern.source },
    message: message || 'Formato inválido',
    severity: 'error',
  });
}

export function Range(min: number, max: number, message?: string) {
  return ValidateField({
    fieldName: '',
    ruleType: RuleType.RANGE,
    parameters: { min, max },
    message: message || `Valor deve estar entre ${min} e ${max}`,
    severity: 'error',
  });
}

export function CustomValidator(
  validatorName: string,
  parameters?: Record<string, any>,
  message?: string,
) {
  return ValidateField({
    fieldName: '',
    ruleType: RuleType.CUSTOM,
    parameters: { validatorName, ...parameters },
    message: message || 'Validação customizada falhou',
    severity: 'error',
  });
}
