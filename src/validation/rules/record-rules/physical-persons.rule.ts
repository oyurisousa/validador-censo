import { Injectable } from '@nestjs/common';
import { BaseRecordRule } from '../base-record.rule';
import { RecordTypeEnum } from '../../../common/enums/record-types.enum';

@Injectable()
export class PhysicalPersonsRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.PHYSICAL_PERSONS;

  protected readonly fields = [
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^30$/,
      type: 'code' as const,
      description: 'Tipo de registro (sempre 30)',
    },
    {
      position: 1,
      name: 'codigo_inep',
      required: true,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code' as const,
      description: 'Código INEP da escola (8 dígitos)',
    },
    {
      position: 2,
      name: 'cpf',
      required: false,
      minLength: 11,
      maxLength: 11,
      pattern: /^\d{11}$/,
      type: 'code' as const,
      description: 'CPF (11 dígitos)',
    },
    {
      position: 3,
      name: 'nome',
      required: true,
      minLength: 1,
      maxLength: 100,
      type: 'string' as const,
      description: 'Nome completo',
    },
    {
      position: 4,
      name: 'data_nascimento',
      required: false,
      minLength: 10,
      maxLength: 10,
      pattern: /^\d{2}\/\d{2}\/\d{4}$/,
      type: 'date' as const,
      description: 'Data de nascimento (DD/MM/AAAA)',
    },
    {
      position: 5,
      name: 'sexo',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[MF]$/,
      type: 'code' as const,
      description: 'Sexo (M ou F)',
    },
    {
      position: 6,
      name: 'cor_raca',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1-6]$/,
      type: 'code' as const,
      description: 'Cor/raça (1-6)',
    },
    {
      position: 7,
      name: 'nacionalidade',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1-4]$/,
      type: 'code' as const,
      description: 'Nacionalidade (1-4)',
    },
    {
      position: 8,
      name: 'pais_nascimento',
      required: false,
      minLength: 3,
      maxLength: 3,
      pattern: /^[A-Z]{3}$/,
      type: 'code' as const,
      description: 'País de nascimento (código ISO)',
    },
    {
      position: 9,
      name: 'municipio_nascimento',
      required: false,
      minLength: 7,
      maxLength: 7,
      pattern: /^\d{7}$/,
      type: 'code' as const,
      description: 'Município de nascimento (7 dígitos)',
    },
    {
      position: 10,
      name: 'estado_nascimento',
      required: false,
      minLength: 2,
      maxLength: 2,
      pattern: /^\d{2}$/,
      type: 'code' as const,
      description: 'Estado de nascimento (2 dígitos)',
    },
    {
      position: 11,
      name: 'deficiencia',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[0-9]$/,
      type: 'code' as const,
      description: 'Deficiência (0-9)',
    },
  ];

  // Validação específica para CPF
  protected validateFieldType(
    field: any,
    value: string,
    lineNumber: number,
  ): any[] {
    const errors = super.validateFieldType(field, value, lineNumber);

    // Validação específica para CPF
    if (field.name === 'cpf' && value && value.length === 11) {
      if (!this.isValidCPF(value)) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: field.name,
          fieldValue: value,
          ruleName: 'cpf_validation',
          errorMessage: 'CPF inválido',
          severity: 'error' as any,
        });
      }
    }

    return errors;
  }

  private isValidCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  }
}

