import { Injectable } from '@nestjs/common';
import {
  ValidationError,
  ValidationRule,
} from '../../common/interfaces/validation.interface';
import {
  RecordTypeEnum,
  ValidationSeverity,
  RuleType,
} from '../../common/enums/record-types.enum';

@Injectable()
export class FieldValidatorService {
  async validateField(
    fieldName: string,
    fieldValue: string,
    rules: ValidationRule[],
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    for (const rule of rules) {
      if (!rule.isActive) continue;

      try {
        const error = await this.applyRule(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );
        if (error) {
          errors.push(error);
        }
      } catch (error) {
        errors.push({
          lineNumber,
          recordType,
          fieldName,
          fieldValue,
          ruleName: rule.name,
          errorMessage: `Erro na validação: ${error.message}`,
          severity: ValidationSeverity.ERROR,
        });
      }
    }

    return errors;
  }

  private async applyRule(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): Promise<ValidationError | null> {
    switch (rule.ruleType) {
      case RuleType.REQUIRED:
        return this.validateRequired(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );

      case RuleType.LENGTH:
        return this.validateLength(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );

      case RuleType.FORMAT:
        return this.validateFormat(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );

      case RuleType.RANGE:
        return this.validateRange(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );

      case RuleType.CUSTOM:
        return this.validateCustom(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );

      case RuleType.REFERENCE:
        return this.validateReference(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );

      default:
        return null;
    }
  }

  private validateRequired(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): ValidationError | null {
    if (!fieldValue || fieldValue.trim() === '') {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue: fieldValue || '',
        ruleName: rule.name,
        errorMessage: rule.parameters?.message || 'Campo obrigatório',
        severity: ValidationSeverity.ERROR,
      };
    }
    return null;
  }

  private validateLength(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): ValidationError | null {
    const { min, max, exact } = rule.parameters || {};
    const length = fieldValue ? fieldValue.length : 0;

    if (exact !== undefined && length !== exact) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage:
          rule.parameters?.message || `Deve ter exatamente ${exact} caracteres`,
        severity: ValidationSeverity.ERROR,
      };
    }

    if (min !== undefined && length < min) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage: rule.parameters?.message || `Mínimo de ${min} caracteres`,
        severity: ValidationSeverity.ERROR,
      };
    }

    if (max !== undefined && length > max) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage: rule.parameters?.message || `Máximo de ${max} caracteres`,
        severity: ValidationSeverity.ERROR,
      };
    }

    return null;
  }

  private validateFormat(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): ValidationError | null {
    const { pattern } = rule.parameters || {};

    if (!pattern) return null;

    const regex = new RegExp(pattern);
    if (!regex.test(fieldValue)) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage: rule.parameters?.message || 'Formato inválido',
        severity: ValidationSeverity.ERROR,
      };
    }

    return null;
  }

  private validateRange(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): ValidationError | null {
    const { min, max } = rule.parameters || {};
    const numericValue = parseFloat(fieldValue);

    if (isNaN(numericValue)) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage: 'Valor deve ser numérico',
        severity: ValidationSeverity.ERROR,
      };
    }

    if (min !== undefined && numericValue < min) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage:
          rule.parameters?.message || `Valor deve ser maior ou igual a ${min}`,
        severity: ValidationSeverity.ERROR,
      };
    }

    if (max !== undefined && numericValue > max) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage:
          rule.parameters?.message || `Valor deve ser menor ou igual a ${max}`,
        severity: ValidationSeverity.ERROR,
      };
    }

    return null;
  }

  private validateCustom(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): ValidationError | null {
    // Implementar validações customizadas específicas do Censo Escolar
    const { validatorName } = rule.parameters || {};

    switch (validatorName) {
      case 'cpf':
        return this.validateCPF(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );
      case 'cnpj':
        return this.validateCNPJ(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );
      case 'email':
        return this.validateEmail(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );
      case 'date':
        return this.validateDate(
          fieldName,
          fieldValue,
          rule,
          lineNumber,
          recordType,
        );
      default:
        return null;
    }
  }

  private validateReference(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): ValidationError | null {
    // Implementar validação de referência a tabelas auxiliares
    // Por exemplo, validar se um código de município existe na tabela de municípios
    return null;
  }

  private validateCPF(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): ValidationError | null {
    if (!fieldValue || fieldValue.trim() === '') return null;

    const cpf = fieldValue.replace(/\D/g, '');

    if (cpf.length !== 11) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage: 'CPF deve ter 11 dígitos',
        severity: ValidationSeverity.ERROR,
      };
    }

    // Validação básica de CPF (pode ser expandida)
    if (/^(\d)\1{10}$/.test(cpf)) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage: 'CPF inválido',
        severity: ValidationSeverity.ERROR,
      };
    }

    return null;
  }

  private validateCNPJ(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): ValidationError | null {
    if (!fieldValue || fieldValue.trim() === '') return null;

    const cnpj = fieldValue.replace(/\D/g, '');

    if (cnpj.length !== 14) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage: 'CNPJ deve ter 14 dígitos',
        severity: ValidationSeverity.ERROR,
      };
    }

    return null;
  }

  private validateEmail(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): ValidationError | null {
    if (!fieldValue || fieldValue.trim() === '') return null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(fieldValue)) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage: 'Email inválido',
        severity: ValidationSeverity.ERROR,
      };
    }

    return null;
  }

  private validateDate(
    fieldName: string,
    fieldValue: string,
    rule: ValidationRule,
    lineNumber: number,
    recordType: RecordTypeEnum,
  ): ValidationError | null {
    if (!fieldValue || fieldValue.trim() === '') return null;

    const date = new Date(fieldValue);
    if (isNaN(date.getTime())) {
      return {
        lineNumber,
        recordType,
        fieldName,
        fieldValue,
        ruleName: rule.name,
        errorMessage: 'Data inválida',
        severity: ValidationSeverity.ERROR,
      };
    }

    return null;
  }
}
