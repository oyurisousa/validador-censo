import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../../common/enums/record-types.enum';
import { ValidationError } from '../../../common/interfaces/validation.interface';

/**
 * Regra de validação para REGISTRO 91 - Admissão Após
 * FASE 2 do Censo Escolar (Situação do Aluno)
 *
 * Este registro é utilizado para informar a admissão de alunos após o início do ano letivo.
 * Contém 11 campos que registram informações sobre a nova matrícula do aluno.
 */
@Injectable()
export class StudentAdmissionAfterRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.STUDENT_ADMISSION_AFTER;

  protected readonly fields: FieldRule[] = [
    // Campo 1: Tipo de registro
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^91$/,
      type: 'code',
      description: 'Tipo de registro (sempre 91)',
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

    // Campo 3: Código da turma na entidade/escola (DESCONSIDERADO)
    {
      position: 2,
      name: 'codigo_turma_entidade',
      required: false,
      maxLength: 20,
      type: 'string',
      description: 'Código da turma na entidade/escola (desconsiderado)',
    },

    // Campo 4: Código da turma – INEP
    {
      position: 3,
      name: 'codigo_turma_inep',
      required: false,
      maxLength: 10,
      pattern: /^\d{1,10}$/,
      type: 'code',
      description: 'Código INEP da turma (até 10 dígitos)',
    },

    // Campo 5: Código de identificação única do aluno – INEP
    {
      position: 4,
      name: 'codigo_aluno_inep',
      required: true,
      minLength: 12,
      maxLength: 12,
      pattern: /^\d{12}$/,
      type: 'code',
      description: 'Código INEP do aluno (12 dígitos)',
    },

    // Campo 6: Código de identificação única do aluno na entidade/escola (DESCONSIDERADO)
    {
      position: 5,
      name: 'codigo_aluno_entidade',
      required: false,
      maxLength: 20,
      type: 'string',
      description: 'Código do aluno na entidade/escola (desconsiderado)',
    },

    // Campo 7: Código da matrícula (DEVE SER NULO)
    {
      position: 6,
      name: 'codigo_matricula',
      required: false,
      maxLength: 12,
      type: 'code',
      description: 'Código da matrícula (deve ser nulo)',
    },

    // Campo 8: Tipo de mediação didático pedagógico
    {
      position: 7,
      name: 'tipo_mediacao',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[123]$/,
      type: 'code',
      description:
        'Tipo de mediação didático pedagógico (1-Presencial, 2-Semipresencial, 3-EAD)',
    },

    // Campo 9: Código da modalidade
    {
      position: 8,
      name: 'codigo_modalidade',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1234]$/,
      type: 'code',
      description:
        'Código da modalidade (1-Regular, 2-Especial, 3-EJA, 4-Profissional)',
    },

    // Campo 10: Código da etapa
    {
      position: 9,
      name: 'codigo_etapa',
      required: false,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Código da etapa de ensino',
    },

    // Campo 11: Situação do aluno
    {
      position: 10,
      name: 'situacao_aluno',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1234567]$/,
      type: 'code',
      description: 'Situação do aluno (1-7)',
    },
  ];

  /**
   * Validações de negócio específicas do registro 91
   */
  protected validateBusinessRules(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const codigoTurmaInep = parts[3]?.trim() || '';
    const codigoMatricula = parts[6]?.trim() || '';
    const tipoMediacao = parts[7]?.trim() || '';
    const codigoModalidade = parts[8]?.trim() || '';
    const codigoEtapa = parts[9]?.trim() || '';
    const situacaoAluno = parts[10]?.trim() || '';

    // Regra 7.1: Código da matrícula deve ser nulo
    if (codigoMatricula) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_matricula',
        fieldPosition: 6,
        fieldDescription: 'Código da matrícula',
        fieldValue: codigoMatricula,
        ruleName: 'codigo_matricula_must_be_null',
        errorMessage: 'O campo "Código da matrícula" não pode ser preenchido.',
        severity: ValidationSeverity.ERROR,
      });
    }

    const turmaInformada = codigoTurmaInep !== '';

    // Regras condicionais para tipo de mediação
    if (!turmaInformada && !tipoMediacao) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'tipo_mediacao',
        fieldPosition: 7,
        fieldDescription: 'Tipo de mediação didático pedagógico',
        fieldValue: tipoMediacao,
        ruleName: 'tipo_mediacao_required_conditional',
        errorMessage:
          'O campo "Tipo de mediação didático pedagógico" deve ser preenchido quando o campo "Código da turma - INEP" não for preenchido.',
        severity: ValidationSeverity.ERROR,
      });
    }

    if (turmaInformada && tipoMediacao) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'tipo_mediacao',
        fieldPosition: 7,
        fieldDescription: 'Tipo de mediação didático pedagógico',
        fieldValue: tipoMediacao,
        ruleName: 'tipo_mediacao_must_be_null',
        errorMessage:
          'O campo "Tipo de mediação didático pedagógico" não pode ser preenchido quando o campo "Código da turma - INEP" for preenchido.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regras condicionais para modalidade
    if (!turmaInformada && !codigoModalidade) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_modalidade',
        fieldPosition: 8,
        fieldDescription: 'Código da modalidade',
        fieldValue: codigoModalidade,
        ruleName: 'codigo_modalidade_required_conditional',
        errorMessage:
          'O campo "Código da modalidade" deve ser preenchido quando o campo "Código da turma - INEP" não for preenchido.',
        severity: ValidationSeverity.ERROR,
      });
    }

    if (turmaInformada && codigoModalidade) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_modalidade',
        fieldPosition: 8,
        fieldDescription: 'Código da modalidade',
        fieldValue: codigoModalidade,
        ruleName: 'codigo_modalidade_must_be_null',
        errorMessage:
          'O campo "Código da modalidade" não pode ser preenchido quando o campo "Código da turma - INEP" for preenchido.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // EAD só permite modalidades 1, 3 ou 4
    if (
      tipoMediacao === '3' &&
      codigoModalidade &&
      !['1', '3', '4'].includes(codigoModalidade)
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_modalidade',
        fieldPosition: 8,
        fieldDescription: 'Código da modalidade',
        fieldValue: codigoModalidade,
        ruleName: 'ead_invalid_modality',
        errorMessage:
          'O campo "Código da modalidade" deve ser preenchido com 1, 3 ou 4 quando o campo "Mediação didático-pedagógica" for igual a 3 (Educação a Distância).',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regras condicionais para etapa
    if (!turmaInformada && !codigoEtapa) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_etapa',
        fieldPosition: 9,
        fieldDescription: 'Código da etapa',
        fieldValue: codigoEtapa,
        ruleName: 'codigo_etapa_required_conditional',
        errorMessage:
          'O campo "Código da etapa" deve ser preenchido quando o campo "Código da turma - INEP" não for preenchido.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Etapas não permitidas
    const etapasProibidas = ['3', '22', '23', '56', '64', '68', '72'];
    if (codigoEtapa && etapasProibidas.includes(codigoEtapa)) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_etapa',
        fieldPosition: 9,
        fieldDescription: 'Código da etapa',
        fieldValue: codigoEtapa,
        ruleName: 'forbidden_stage',
        errorMessage:
          'O campo "Código da etapa" foi preenchido com valor não permitido.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Semipresencial só permite etapas 69, 70 ou 71
    if (
      tipoMediacao === '2' &&
      codigoEtapa &&
      !['69', '70', '71'].includes(codigoEtapa)
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_etapa',
        fieldPosition: 9,
        fieldDescription: 'Código da etapa',
        fieldValue: codigoEtapa,
        ruleName: 'semipresencial_invalid_stage',
        errorMessage:
          'O campo "Etapa de Ensino" deve ser preenchido com 69, 70 ou 71 quando o campo "Mediação didático-pedagógica" for igual a 2 (Semipresencial).',
        severity: ValidationSeverity.ERROR,
      });
    }

    // EAD só permite etapas específicas
    const etapasEad = [
      '30',
      '31',
      '32',
      '33',
      '34',
      '35',
      '36',
      '37',
      '38',
      '39',
      '40',
      '70',
      '71',
      '73',
      '74',
      '67',
    ];
    if (
      tipoMediacao === '3' &&
      codigoEtapa &&
      !etapasEad.includes(codigoEtapa)
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_etapa',
        fieldPosition: 9,
        fieldDescription: 'Código da etapa',
        fieldValue: codigoEtapa,
        ruleName: 'ead_invalid_stage',
        errorMessage:
          'O campo "Etapa de Ensino" deve ser preenchido com etapas permitidas para EAD.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Educação Infantil não pode ter situações 4, 5, 6
    const situacoesProibidasInfantil = ['4', '5', '6'];
    const etapasEducacaoInfantil = ['1', '2'];
    if (
      codigoEtapa &&
      etapasEducacaoInfantil.includes(codigoEtapa) &&
      situacaoAluno &&
      situacoesProibidasInfantil.includes(situacaoAluno)
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'situacao_aluno',
        fieldPosition: 10,
        fieldDescription: 'Situação do aluno',
        fieldValue: situacaoAluno,
        ruleName: 'infantil_invalid_situation',
        errorMessage:
          'O campo "Situação do aluno" não pode ser preenchido com 4, 5 ou 6 para Educação Infantil.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Aprovado concluinte só para etapas finais
    const etapasConcluintes = [
      '27',
      '28',
      '29',
      '32',
      '33',
      '34',
      '37',
      '38',
      '39',
      '40',
      '41',
      '67',
      '70',
      '71',
      '73',
      '74',
    ];
    if (
      situacaoAluno === '6' &&
      codigoEtapa &&
      !etapasConcluintes.includes(codigoEtapa)
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'situacao_aluno',
        fieldPosition: 10,
        fieldDescription: 'Situação do aluno',
        fieldValue: situacaoAluno,
        ruleName: 'approved_graduate_invalid_stage',
        errorMessage:
          'O campo "Situação do aluno" (6-Aprovado concluinte) só é permitido para etapas finais.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Em andamento só para etapas específicas
    const etapasEmAndamento = [
      '1',
      '2',
      '39',
      '40',
      '65',
      '67',
      '68',
      '69',
      '70',
      '71',
      '73',
      '74',
    ];
    if (
      situacaoAluno === '7' &&
      codigoEtapa &&
      !etapasEmAndamento.includes(codigoEtapa)
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'situacao_aluno',
        fieldPosition: 10,
        fieldDescription: 'Situação do aluno',
        fieldValue: situacaoAluno,
        ruleName: 'in_progress_invalid_stage',
        errorMessage:
          'O campo "Situação do aluno" (7-Em andamento) só é permitido para etapas específicas.',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }
}
