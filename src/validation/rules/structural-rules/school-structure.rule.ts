import { Injectable } from '@nestjs/common';
import {
  BaseStructuralRule,
  StructuralValidationContext,
  SchoolStructure,
} from '../base-structural.rule';
import { ValidationError } from '../../../common/interfaces/validation.interface';
import { ValidationSeverity } from '../../../common/enums/record-types.enum';

/**
 * Regra para validação da estrutura individual de cada escola
 * Valida registros obrigatórios, limites e consistência por escola
 */
@Injectable()
export class SchoolStructureRule extends BaseStructuralRule {
  constructor() {
    super('school_structure', 'Validação da estrutura individual de escolas');
  }

  validate(context: StructuralValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [schoolCode, school] of context.schoolStructures) {
      // Validar estrutura da escola
      const schoolErrors = this.validateSchoolStructure(school);
      errors.push(...schoolErrors);

      // Validar limites da escola
      const limitErrors = this.validateSchoolLimits(school);
      errors.push(...limitErrors);

      // Validar relacionamentos da escola
      const relationshipErrors = this.validateSchoolRelationships(school);
      errors.push(...relationshipErrors);
    }

    return errors;
  }

  /**
   * Valida a estrutura básica da escola conforme situação de funcionamento
   */
  private validateSchoolStructure(school: SchoolStructure): ValidationError[] {
    const errors: ValidationError[] = [];
    const situacao = school.situacaoFuncionamento;

    // Verificar se há duplicação do registro 00
    if (school.records.filter((r) => r.type === '00').length > 1) {
      errors.push(
        this.createError(
          0,
          '00',
          'school_duplicate',
          1,
          school.schoolCode,
          'duplicate_school',
          `Estrutura da escola incorreta. A escola ${school.schoolCode} possui mais de um registro 00.`,
          ValidationSeverity.ERROR,
        ),
      );
    }

    if (situacao === '2' || situacao === '3') {
      // Escola Paralisada ou Extinta
      // Deve ter apenas 00, 30 e 40
      if (!school.hasRecord00 || !school.hasRecord30 || !school.hasRecord40) {
        errors.push(
          this.createError(
            0,
            '00',
            'school_structure',
            2,
            situacao,
            'incomplete_inactive_school',
            'Estrutura da escola incorreta, escola com estrutura diferente a sua situação de funcionamento. Escolas paralisadas/extintas devem ter apenas registros 00, 30 e 40.',
            ValidationSeverity.ERROR,
          ),
        );
      }

      // Não deve ter outros registros
      const invalidRecords: string[] = [];
      if (school.hasRecord10) invalidRecords.push('10');
      if (school.hasRecord20) invalidRecords.push('20');
      if (school.hasRecord50) invalidRecords.push('50');
      if (school.hasRecord60) invalidRecords.push('60');

      for (const recordType of invalidRecords) {
        errors.push(
          this.createError(
            0,
            recordType,
            'record_not_allowed',
            0,
            recordType,
            'invalid_record_for_inactive_school',
            `O registro ${recordType} declarado não faz parte do escopo do educacenso para escolas que não estão em atividade.`,
            ValidationSeverity.ERROR,
          ),
        );
      }
    } else if (situacao === '1') {
      // Escola Em atividade
      // Deve ter todos os registros principais
      const missingRecords: string[] = [];
      if (!school.hasRecord00) missingRecords.push('00');
      if (!school.hasRecord10) missingRecords.push('10');
      if (!school.hasRecord20) missingRecords.push('20');
      if (!school.hasRecord30) missingRecords.push('30');
      if (!school.hasRecord40) missingRecords.push('40');

      if (missingRecords.length > 0) {
        errors.push(
          this.createError(
            0,
            '00',
            'school_structure',
            2,
            situacao,
            'incomplete_active_school',
            `Estrutura da escola incorreta, escola com estrutura diferente a sua situação de funcionamento. Escolas em atividade devem ter registros: ${missingRecords.join(', ')}.`,
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    return errors;
  }

  /**
   * Valida limites de registros por escola
   */
  private validateSchoolLimits(school: SchoolStructure): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validar número de gestores (máximo 3 registros 40)
    if (school.record40Count > 3) {
      errors.push(
        this.createError(
          0,
          '40',
          'manager_limit',
          0,
          school.record40Count.toString(),
          'too_many_managers',
          'A escola não pode ter mais que três gestores escolares.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Validar limite de turmas por escola (máximo 1.500)
    if (school.allClasses.size > 1500) {
      errors.push(
        this.createError(
          0,
          '20',
          'class_limit',
          0,
          school.allClasses.size.toString(),
          'too_many_classes',
          'Número de turmas por escola (1.500 turmas) excedido.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }

  /**
   * Valida relacionamentos entre registros da escola
   */
  private validateSchoolRelationships(
    school: SchoolStructure,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validar que todas as turmas tenham alunos (se há registro 20, deve haver 60)
    if (school.hasRecord20 && school.allClasses.size > 0) {
      for (const classCode of school.allClasses) {
        if (!school.classesWithStudents.has(classCode)) {
          // Usar o número da linha da turma (ou 0 se não encontrado)
          const lineNumber = school.classLineNumbers.get(classCode) || 0;
          errors.push(
            this.createError(
              lineNumber,
              '20',
              'class_without_students',
              -1, // -1 = erro estrutural, não é sobre um campo específico
              classCode,
              'class_needs_students',
              'Turma informada sem aluno(a) vinculado a ela.',
              ValidationSeverity.ERROR,
              'Estrutura de vínculos da turma', // fieldDescription
            ),
          );
        }
      }
    }

    // Validar que todas as turmas tenham profissionais (se há registro 20, deve haver 50)
    if (school.hasRecord20 && school.allClasses.size > 0) {
      for (const classCode of school.allClasses) {
        if (!school.classesWithProfessionals.has(classCode)) {
          // Usar o número da linha da turma (ou 0 se não encontrado)
          const lineNumber = school.classLineNumbers.get(classCode) || 0;
          errors.push(
            this.createError(
              lineNumber,
              '20',
              'class_without_professionals',
              -1, // -1 = erro estrutural, não é sobre um campo específico
              classCode,
              'class_needs_professionals',
              'Turma informada sem profissional escolar em sala de aula vinculado a ela.',
              ValidationSeverity.ERROR,
              'Estrutura de vínculos da turma', // fieldDescription
            ),
          );
        }
      }
    }

    // Validar consistência: se há alunos (60), deve haver turmas (20)
    if (school.hasRecord60 && !school.hasRecord20) {
      errors.push(
        this.createError(
          0,
          '60',
          'students_without_classes',
          0,
          school.totalStudents.toString(),
          'students_need_classes',
          'Existem alunos matriculados mas não há turmas declaradas.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Validar consistência: se há profissionais (50), deve haver turmas (20)
    if (school.hasRecord50 && !school.hasRecord20) {
      errors.push(
        this.createError(
          0,
          '50',
          'professionals_without_classes',
          0,
          school.totalProfessionals.toString(),
          'professionals_need_classes',
          'Existem profissionais vinculados mas não há turmas declaradas.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }
}
