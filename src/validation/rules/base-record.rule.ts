import { ValidationError } from '../../common/interfaces/validation.interface';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../common/enums/record-types.enum';

export interface ConditionalRequired {
  field: string;
  values: string[];
  andField?: string;
  andValues?: string[];
}

export interface FieldRule {
  position: number;
  name: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  type: 'string' | 'number' | 'date' | 'code';
  description: string;
  conditionalRequired?: ConditionalRequired;
}

export abstract class BaseRecordRule {
  protected abstract fields: FieldRule[];
  protected abstract recordType: RecordTypeEnum;

  /**
   * Valida um registro completo
   */
  validate(parts: string[], lineNumber: number): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validar número de campos
    const fieldCountErrors = this.validateFieldCount(parts, lineNumber);
    errors.push(...fieldCountErrors);

    // Validar cada campo
    this.fields.forEach((field) => {
      const fieldValue = parts[field.position] || '';
      const fieldErrors = this.validateField(
        field,
        fieldValue,
        lineNumber,
        parts,
      );
      errors.push(...fieldErrors);
    });

    // Validar regras de negócio entre campos
    const businessRuleErrors = this.validateBusinessRules(parts, lineNumber);
    errors.push(...businessRuleErrors);

    return errors;
  }

  /**
   * Valida o número de campos do registro
   */
  protected validateFieldCount(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (parts.length < this.fields.length) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'field_count',
        fieldPosition: -1, // -1 indica erro geral do registro
        fieldValue: parts.length.toString(),
        ruleName: 'field_count_validation',
        errorMessage: `Registro ${this.recordType} deve ter pelo menos ${this.fields.length} campos`,
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  /**
   * Valida um campo específico
   */
  protected validateField(
    field: FieldRule,
    value: string,
    lineNumber: number,
    allParts: string[],
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Verificar se o campo é condicionalmente obrigatório
    const isConditionallyRequired = this.isConditionallyRequired(
      field,
      allParts,
    );
    const isRequired = field.required || isConditionallyRequired;

    // Validar campo obrigatório
    if (isRequired && (!value || value.trim() === '')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: field.name,
        fieldDescription: field.description,
        fieldPosition: field.position,
        fieldValue: value,
        ruleName: 'required_field',
        errorMessage: `${field.description} é obrigatório`,
        severity: ValidationSeverity.ERROR,
      });
      return errors; // Se é obrigatório e está vazio, não validar mais nada
    }

    // Se não é obrigatório e está vazio, não validar
    // EXCETO se maxLength é 0 (campo que não deve ser preenchido)
    if (
      !isRequired &&
      (!value || value.trim() === '') &&
      field.maxLength !== 0
    ) {
      return errors;
    }

    // Validar tamanho mínimo
    if (field.minLength && value.length < field.minLength) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: field.name,
        fieldDescription: field.description,
        fieldPosition: field.position,
        fieldValue: value,
        ruleName: 'min_length',
        errorMessage: `${field.description} deve ter pelo menos ${field.minLength} caracteres`,
        severity: ValidationSeverity.ERROR,
      });
    }

    // Validar tamanho máximo
    if (field.maxLength && value.length > field.maxLength) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: field.name,
        fieldDescription: field.description,
        fieldPosition: field.position,
        fieldValue: value,
        ruleName: 'max_length',
        errorMessage: `${field.description} deve ter no máximo ${field.maxLength} caracteres`,
        severity: ValidationSeverity.ERROR,
      });
    }

    // Validar padrão (regex)
    if (field.pattern && !field.pattern.test(value)) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: field.name,
        fieldDescription: field.description,
        fieldPosition: field.position,
        fieldValue: value,
        ruleName: 'pattern_validation',
        errorMessage: `${field.description} tem formato inválido`,
        severity: ValidationSeverity.ERROR,
      });
    }

    // Validações específicas por tipo
    const typeErrors = this.validateFieldType(field, value, lineNumber);
    errors.push(...typeErrors);

    return errors;
  }

  /**
   * Validações específicas por tipo de campo
   */
  protected validateFieldType(
    field: FieldRule,
    value: string,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    switch (field.type) {
      case 'number':
        if (isNaN(Number(value))) {
          errors.push({
            lineNumber,
            recordType: this.recordType,
            fieldName: field.name,
            fieldDescription: field.description,
            fieldPosition: field.position,
            fieldValue: value,
            ruleName: 'numeric_validation',
            errorMessage: `${field.description} deve ser numérico`,
            severity: ValidationSeverity.ERROR,
          });
        }
        break;

      case 'date': {
        // Validar formato DD/MM/YYYY
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = value.match(dateRegex);

        if (!match) {
          errors.push({
            lineNumber,
            recordType: this.recordType,
            fieldName: field.name,
            fieldDescription: field.description,
            fieldPosition: field.position,
            fieldValue: value,
            ruleName: 'date_validation',
            errorMessage: `${field.description} deve estar no formato DD/MM/YYYY`,
            severity: ValidationSeverity.ERROR,
          });
          break;
        }

        const [, day, month, year] = match;
        const date = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
        );

        // Verificar se a data é válida (evita datas como 31/02/2025)
        if (
          date.getDate() !== parseInt(day) ||
          date.getMonth() !== parseInt(month) - 1 ||
          date.getFullYear() !== parseInt(year)
        ) {
          errors.push({
            lineNumber,
            recordType: this.recordType,
            fieldName: field.name,
            fieldDescription: field.description,
            fieldPosition: field.position,
            fieldValue: value,
            ruleName: 'date_validation',
            errorMessage: `${field.description} deve ser uma data válida`,
            severity: ValidationSeverity.ERROR,
          });
        }
        break;
      }

      case 'code':
        // Validações específicas para códigos podem ser implementadas aqui
        break;
    }

    return errors;
  }

  /**
   * Obtém informações de um campo específico
   */
  getFieldInfo(position: number): FieldRule | undefined {
    return this.fields.find((field) => field.position === position);
  }

  /**
   * Obtém todos os campos do registro
   */
  getAllFields(): FieldRule[] {
    return [...this.fields];
  }

  /**
   * Obtém o tipo de registro
   */
  getRecordType(): RecordTypeEnum {
    return this.recordType;
  }

  /**
   * Verifica se um campo é condicionalmente obrigatório
   */
  protected isConditionallyRequired(
    field: FieldRule,
    allParts: string[],
  ): boolean {
    if (!field.conditionalRequired) {
      return false;
    }

    const { conditionalRequired } = field;

    // Encontrar o campo de referência
    const refField = this.fields.find(
      (f) => f.name === conditionalRequired.field,
    );
    if (!refField) {
      return false;
    }

    const refValue = allParts[refField.position] || '';

    // Verificar se o valor do campo de referência está na lista de valores
    const matchesMainCondition = conditionalRequired.values.includes(refValue);

    // Se não há campo adicional, retornar apenas a condição principal
    if (!conditionalRequired.andField || !conditionalRequired.andValues) {
      return matchesMainCondition;
    }

    // Verificar condição adicional
    const andField = this.fields.find(
      (f) => f.name === conditionalRequired.andField,
    );
    if (!andField) {
      return matchesMainCondition;
    }

    const andValue = allParts[andField.position] || '';
    const matchesAndCondition =
      conditionalRequired.andValues.includes(andValue);

    return matchesMainCondition && matchesAndCondition;
  }

  /**
   * Valida regras de negócio entre campos
   * Método que pode ser sobrescrito pelas classes filhas para implementar validações específicas
   */
  protected validateBusinessRules(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    // Implementação padrão vazia - classes filhas podem sobrescrever
    return [];
  }

  /**
   * Helper para criar erro de validação com descrição do campo
   */
  protected createFieldError(
    field: FieldRule,
    lineNumber: number,
    fieldValue: string,
    ruleName: string,
    errorMessage: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR,
  ): ValidationError {
    return {
      lineNumber,
      recordType: this.recordType,
      fieldName: field.name,
      fieldDescription: field.description,
      fieldPosition: field.position,
      fieldValue,
      ruleName,
      errorMessage,
      severity,
    };
  }

  /**
   * Helper para criar erro genérico de validação
   */
  protected createError(
    lineNumber: number,
    fieldName: string,
    fieldDescription: string | undefined,
    fieldPosition: number,
    fieldValue: string,
    ruleName: string,
    errorMessage: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR,
  ): ValidationError {
    return {
      lineNumber,
      recordType: this.recordType,
      fieldName,
      fieldDescription,
      fieldPosition,
      fieldValue,
      ruleName,
      errorMessage,
      severity,
    };
  }
}
