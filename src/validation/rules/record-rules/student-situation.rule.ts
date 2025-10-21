import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../../common/enums/record-types.enum';
import { ValidationError } from '../../../common/interfaces/validation.interface';

/**
 * Regra de validação para REGISTRO 90 - Situação do Aluno na Turma
 * FASE 2 do Censo Escolar (Situação do Aluno)
 *
 * Este registro contém informações sobre a situação final dos alunos
 * em cada matrícula/turma ao final do ano letivo.
 */
@Injectable()
export class StudentSituationRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.STUDENT_SITUATION;

  protected readonly fields: FieldRule[] = [
    // Campo 1: Tipo de registro
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^90$/,
      type: 'code',
      description: 'Tipo de registro (sempre 90)',
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

    // Campo 3: Código da turma na entidade/escola (IGNORADO)
    {
      position: 2,
      name: 'codigo_turma_entidade',
      required: false,
      minLength: 0,
      maxLength: 20,
      type: 'string',
      description: 'Código da turma na entidade/escola (campo ignorado)',
    },

    // Campo 4: Código da turma – INEP
    {
      position: 3,
      name: 'codigo_turma_inep',
      required: true,
      minLength: 1,
      maxLength: 10,
      pattern: /^\d+$/,
      type: 'string',
      description: 'Código da turma INEP (máximo 10 dígitos)',
    },

    // Campo 5: Código de identificação única do aluno – INEP
    {
      position: 4,
      name: 'codigo_aluno_inep',
      required: true,
      minLength: 12,
      maxLength: 12,
      pattern: /^\d{12}$/,
      type: 'string',
      description: 'Código de identificação única do aluno INEP (12 dígitos)',
    },

    // Campo 6: Código de identificação única do aluno na entidade/escola (IGNORADO)
    {
      position: 5,
      name: 'codigo_aluno_entidade',
      required: false,
      minLength: 0,
      maxLength: 20,
      type: 'string',
      description:
        'Código de identificação única do aluno na entidade/escola (campo ignorado)',
    },

    // Campo 7: Código da matrícula
    {
      position: 6,
      name: 'codigo_matricula',
      required: true,
      minLength: 1,
      maxLength: 12,
      pattern: /^\d+$/,
      type: 'string',
      description: 'Código da matrícula (máximo 12 dígitos)',
    },

    // Campo 8: Situação do aluno
    {
      position: 7,
      name: 'situacao_aluno',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1-7]$/,
      type: 'code',
      description:
        'Situação do aluno (1-Transferido, 2-Deixou de frequentar, 3-Falecido, 4-Reprovado, 5-Aprovado, 6-Aprovado concluinte, 7-Em andamento)',
    },
  ];

  /**
   * Validações customizadas para o registro 90
   */
  protected validateBusinessRules(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validações básicas já são feitas pela BaseRecordRule
    // Aqui vamos adicionar validações específicas que não dependem de contexto externo

    // Validação adicional: Código da turma INEP não pode ter mais de 10 caracteres
    const codigoTurmaInep = parts[3] || '';
    if (codigoTurmaInep.length > 10) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_turma_inep',
        fieldPosition: 3,
        fieldDescription: 'Código da turma INEP',
        fieldValue: codigoTurmaInep,
        ruleName: 'turma_inep_max_length',
        errorMessage:
          'O campo "Código da turma – INEP" está maior que o especificado.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Validação adicional: Código da matrícula não pode ter mais de 12 caracteres
    const codigoMatricula = parts[6] || '';
    if (codigoMatricula.length > 12) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_matricula',
        fieldPosition: 6,
        fieldDescription: 'Código da matrícula',
        fieldValue: codigoMatricula,
        ruleName: 'matricula_max_length',
        errorMessage:
          'O campo "Código da matrícula" está maior que o especificado.',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  /**
   * Validações que requerem contexto externo
   * (verificar se escola, turma, aluno e matrícula existem e estão relacionados)
   *
   * Contexto necessário:
   * - Registro 89 antecedente (para validar código da escola)
   * - Dados da turma (para validar se é turma de escolarização, etapa, etc.)
   * - Dados do aluno (para validar vínculo com a turma)
   * - Dados da matrícula (para validar situação permitida por etapa)
   */
  async validateWithContext(
    parts: string[],
    lineNumber: number,
    context: {
      previousSchoolCode?: string; // Código da escola do registro 89 anterior
      classExists?: boolean; // Turma existe na escola?
      isSchoolingClass?: boolean; // É turma de escolarização?
      isExclusiveItinerary?: boolean; // É turma de itinerário formativo exclusivo?
      studentInClass?: boolean; // Aluno está vinculado à turma?
      enrollmentBelongsToStudent?: boolean; // Matrícula pertence ao aluno?
      enrollmentInClass?: boolean; // Matrícula está na turma?
      studentAdmittedAfter?: boolean; // Aluno foi admitido após?
      classStage?: number; // Etapa da turma/matrícula
      isInfantilEducation?: boolean; // É educação infantil?
    } = {},
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validação básica primeiro
    const basicErrors = this.validate(parts, lineNumber);
    errors.push(...basicErrors);

    const codigoEscola = parts[1] || '';
    const codigoTurmaInep = parts[3] || '';
    const codigoAlunoInep = parts[4] || '';
    const codigoMatricula = parts[6] || '';
    const situacaoAluno = parts[7] || '';

    // Regra 2.2: Código da escola deve ser igual ao do registro 89 antecedente
    if (
      context.previousSchoolCode &&
      codigoEscola !== context.previousSchoolCode
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_escola_inep',
        fieldPosition: 1,
        fieldDescription: 'Código INEP da escola',
        fieldValue: codigoEscola,
        ruleName: 'escola_diferente_registro_89',
        errorMessage:
          'O campo "Código de escola - INEP" está diferente do registro 89 antecedente.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 4.4: Turma deve existir na escola
    if (context.classExists === false) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_turma_inep',
        fieldPosition: 3,
        fieldDescription: 'Código da turma INEP',
        fieldValue: codigoTurmaInep,
        ruleName: 'turma_nao_existe_na_escola',
        errorMessage:
          'O código informado no campo "Código da turma – INEP" não pertence a uma turma existente na escola informada no campo "Código da escola – INEP".',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 4.5: Turma deve ser de escolarização
    if (context.isSchoolingClass === false) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_turma_inep',
        fieldPosition: 3,
        fieldDescription: 'Código da turma INEP',
        fieldValue: codigoTurmaInep,
        ruleName: 'turma_nao_escolarizacao',
        errorMessage:
          'O código informado no campo "Código da turma – INEP" não pertence a uma turma de escolarização.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 4.6: Turma não pode ser de itinerário formativo exclusivo
    if (context.isExclusiveItinerary === true) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_turma_inep',
        fieldPosition: 3,
        fieldDescription: 'Código da turma INEP',
        fieldValue: codigoTurmaInep,
        ruleName: 'turma_itinerario_exclusivo',
        errorMessage:
          'O código informado no campo "Código da turma – INEP" não pertence a uma turma de escolarização.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 5.4: Aluno deve estar vinculado à turma
    if (context.studentInClass === false) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_aluno_inep',
        fieldPosition: 4,
        fieldDescription: 'Código de identificação única do aluno INEP',
        fieldValue: codigoAlunoInep,
        ruleName: 'aluno_nao_vinculado_turma',
        errorMessage:
          'O código informado no campo "Código de identificação única do aluno – INEP" não pertence a um(a) aluno(a) vinculado(a) à turma informada no campo "Código da turma – INEP".',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 7.4: Matrícula deve pertencer ao aluno
    if (context.enrollmentBelongsToStudent === false) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_matricula',
        fieldPosition: 6,
        fieldDescription: 'Código da matrícula',
        fieldValue: codigoMatricula,
        ruleName: 'matricula_nao_pertence_aluno',
        errorMessage:
          'A matrícula informada no campo "Código da matrícula" não pertence ao aluno(a) informado no campo "Código de identificação única do aluno – INEP".',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 7.5: Matrícula deve pertencer à turma
    if (context.enrollmentInClass === false) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigo_matricula',
        fieldPosition: 6,
        fieldDescription: 'Código da matrícula',
        fieldValue: codigoMatricula,
        ruleName: 'matricula_nao_pertence_turma',
        errorMessage:
          'A matrícula informada no campo "Código da matrícula" não pertence à turma informada no campo "Código da turma – INEP".',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 8.3: Não pode ser 3, 4, 5, 6, 7 se aluno foi admitido após
    if (
      context.studentAdmittedAfter === true &&
      ['3', '4', '5', '6', '7'].includes(situacaoAluno)
    ) {
      const situacaoNomes: { [key: string]: string } = {
        '3': 'Falecido',
        '4': 'Reprovado',
        '5': 'Aprovado',
        '6': 'Aprovado concluinte',
        '7': 'Em andamento',
      };
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'situacao_aluno',
        fieldPosition: 7,
        fieldDescription: 'Situação do aluno',
        fieldValue: situacaoAluno,
        ruleName: 'situacao_aluno_admitido_apos',
        errorMessage: `O campo "Situação do aluno" não pode ser preenchido com ${situacaoAluno} (${situacaoNomes[situacaoAluno]}) porque o(a) aluno(a) foi admitido(a) após na escola.`,
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 8.4: Não pode ser 4, 5, 6 em educação infantil
    if (
      context.isInfantilEducation === true &&
      ['4', '5', '6'].includes(situacaoAluno)
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'situacao_aluno',
        fieldPosition: 7,
        fieldDescription: 'Situação do aluno',
        fieldValue: situacaoAluno,
        ruleName: 'situacao_educacao_infantil',
        errorMessage:
          'O campo "Situação do aluno" não pode ser preenchido com 4 (Reprovado), 5 (Aprovado) e 6 (Aprovado concluinte) quando a matrícula for de educação infantil.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 8.5: Situação 6 (Aprovado concluinte) só para etapas específicas
    const etapasConcluintes = [
      27, 28, 29, 32, 33, 34, 37, 38, 39, 40, 41, 67, 68, 70, 71, 73, 74,
    ];
    if (
      situacaoAluno === '6' &&
      context.classStage &&
      !etapasConcluintes.includes(context.classStage)
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'situacao_aluno',
        fieldPosition: 7,
        fieldDescription: 'Situação do aluno',
        fieldValue: situacaoAluno,
        ruleName: 'situacao_concluinte_etapa_invalida',
        errorMessage:
          'O campo "Situação do aluno" não pode ser preenchido com 6 (Aprovado concluinte) quando a etapa da matrícula for diferente de 27, 28, 29, 32, 33, 34, 37, 38, 39, 40, 41, 67, 68, 70, 71, 73 e 74.',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Regra 8.6: Situação 7 (Em andamento) só para etapas específicas
    const etapasEmAndamento = [1, 2, 39, 40, 65, 67, 68, 69, 70, 71, 73, 74];
    if (
      situacaoAluno === '7' &&
      context.classStage &&
      !etapasEmAndamento.includes(context.classStage)
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'situacao_aluno',
        fieldPosition: 7,
        fieldDescription: 'Situação do aluno',
        fieldValue: situacaoAluno,
        ruleName: 'situacao_em_andamento_etapa_invalida',
        errorMessage:
          'O campo "Situação do aluno" não pode ser preenchido com 7 (Em andamento) quando a etapa da matrícula for diferente de 1, 2, 39, 40, 65, 67, 68, 69, 70, 71, 73 e 74.',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }
}
