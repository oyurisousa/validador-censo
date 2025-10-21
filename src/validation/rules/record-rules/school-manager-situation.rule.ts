import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../../common/enums/record-types.enum';
import { ValidationError } from '../../../common/interfaces/validation.interface';

/**
 * Regra de validação para REGISTRO 89 - Situação do Gestor Escolar
 * FASE 2 do Censo Escolar (Situação do Aluno)
 *
 * Este registro contém informações sobre a situação dos gestores escolares
 * ao final do ano letivo.
 */
@Injectable()
export class SchoolManagerSituationRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.SCHOOL_MANAGER_SITUATION;

  protected readonly fields: FieldRule[] = [
    // Campo 1: Tipo de registro
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^89$/,
      type: 'code',
      description: 'Tipo de registro (sempre 89)',
    },

    // Campo 2: Código da escola – INEP
    {
      position: 1,
      name: 'codigo_escola_inep',
      required: true,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'Código INEP da escola (8 dígitos)',
    },

    // Campo 3: Número do CPF do Gestor Escolar
    {
      position: 2,
      name: 'cpf_gestor',
      required: true,
      minLength: 11,
      maxLength: 11,
      pattern: /^\d{11}$/,
      type: 'string',
      description: 'CPF do Gestor Escolar (11 dígitos)',
    },

    // Campo 4: Nome do Gestor Escolar
    {
      position: 3,
      name: 'nome_gestor',
      required: true,
      minLength: 1,
      maxLength: 100,
      pattern: /^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÇ\s]+$/i,
      type: 'string',
      description: 'Nome do Gestor Escolar',
    },

    // Campo 5: Cargo do Gestor Escolar
    {
      position: 4,
      name: 'cargo_gestor',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[12]$/,
      type: 'code',
      description: 'Cargo do Gestor Escolar (1-Diretor, 2-Outro Cargo)',
    },

    // Campo 6: Endereço eletrônico (e-mail) do Gestor Escolar
    {
      position: 5,
      name: 'email_gestor',
      required: true,
      minLength: 1,
      maxLength: 50,
      pattern:
        /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
      type: 'string',
      description: 'E-mail do Gestor Escolar',
    },
  ];

  /**
   * Validações customizadas para o registro 89
   */
  protected validateBusinessRules(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Regra 1: Validação de CPF (não pode ser 00000000000 ou 00000000191)
    const cpf = parts[2] || '';
    if (cpf === '00000000000' || cpf === '00000000191') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'cpf_gestor',
        fieldPosition: 2,
        fieldDescription: 'CPF do Gestor Escolar',
        fieldValue: cpf,
        ruleName: 'cpf_invalid',
        errorMessage:
          'O campo "Número do CPF do Gestor Escolar" foi preenchido com valor inválido.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 2: Validação de caracteres permitidos no nome
    const nome = parts[3] || '';
    if (nome && !/^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÇ\s]+$/i.test(nome)) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'nome_gestor',
        fieldPosition: 3,
        fieldDescription: 'Nome do Gestor Escolar',
        fieldValue: nome,
        ruleName: 'nome_invalid_chars',
        errorMessage:
          'O campo "Nome do Gestor Escolar" foi preenchido com valor inválido.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 3: Validação de e-mail (caracteres permitidos)
    const email = parts[5] || '';
    const emailPattern = /^[A-Z0-9@.\-_]+$/i;
    if (email && !emailPattern.test(email)) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'email_gestor',
        fieldPosition: 5,
        fieldDescription: 'E-mail do Gestor Escolar',
        fieldValue: email,
        ruleName: 'email_invalid_chars',
        errorMessage:
          'O campo "Endereço eletrônico (e-mail) do Gestor Escolar" foi preenchido com valor inválido.',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  /**
   * Validações que requerem contexto externo
   * (ex: verificar se escola existe, se CPF está na Receita Federal, etc.)
   *
   * Nota: Estas validações precisariam de integração com APIs externas:
   * - Verificar se código INEP da escola existe no cadastro do INEP
   * - Verificar se escola não está "Extinta" ou "Faltante"
   * - Verificar CPF na base da Receita Federal
   * - Validar nome do gestor contra Receita Federal
   */
  async validateWithContext(
    parts: string[],
    lineNumber: number,
    context: {
      schoolExists?: boolean;
      schoolStatus?: string;
      cpfValid?: boolean;
      nameMatchesCPF?: boolean;
    } = {},
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validação básica primeiro
    const basicErrors = await this.validate(parts, lineNumber);
    errors.push(...basicErrors);

    // Campo 2: Validar se escola existe no cadastro INEP
    const codigoInep = parts[1] || '';
    if (context.schoolExists === false) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_escola_inep',
        fieldPosition: 1,
        fieldDescription: 'Código INEP da escola',
        fieldValue: codigoInep,
        ruleName: 'escola_inexistente',
        errorMessage: 'Escola inexistente.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Campo 2: Validar situação de funcionamento da escola
    if (context.schoolStatus === 'Extinta') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_escola_inep',
        fieldPosition: 1,
        fieldDescription: 'Código INEP da escola',
        fieldValue: codigoInep,
        ruleName: 'escola_extinta',
        errorMessage:
          'A escola informada não pode ter a situação de funcionamento igual a "Extinta".',
        severity: ValidationSeverity.ERROR,
      });
    }

    if (context.schoolStatus === 'Faltante') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_escola_inep',
        fieldPosition: 1,
        fieldDescription: 'Código INEP da escola',
        fieldValue: codigoInep,
        ruleName: 'escola_faltante',
        errorMessage: 'A escola informada não pode ser "Faltante".',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Campo 3: Validar CPF na base da Receita Federal
    const cpf = parts[2] || '';
    if (context.cpfValid === false) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'cpf_gestor',
        fieldPosition: 2,
        fieldDescription: 'CPF do Gestor Escolar',
        fieldValue: cpf,
        ruleName: 'cpf_nao_consta_receita',
        errorMessage:
          'O CPF informado no campo "Número do CPF do Gestor Escolar" não consta na Base da receita federal.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Campo 4: Validar nome contra base da Receita Federal
    const nome = parts[3] || '';
    if (context.nameMatchesCPF === false) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'nome_gestor',
        fieldPosition: 3,
        fieldDescription: 'Nome do Gestor Escolar',
        fieldValue: nome,
        ruleName: 'nome_diferente_receita',
        errorMessage:
          'Nome do gestor escolar está diferente do que está cadastrado na base da Receita Federal.',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }
}
