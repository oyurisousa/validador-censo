import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import { RecordTypeEnum } from '../../../common/enums/record-types.enum';
import { ValidationError } from '../../../common/interfaces/validation.interface';

export interface StudentEnrollmentSchoolContext {
  schoolCode: string;
  administrativeDependency?: number;
  classes: StudentEnrollmentClassContext[];
  persons: StudentEnrollmentPersonContext[];
}

export interface StudentEnrollmentClassContext {
  classCode: string;
  teachingMediation?: number;
  isRegular?: boolean;
  isComplementaryActivity?: boolean;
  stage?: number;
  specializedEducationalService?: boolean;
  differentiatedLocation?: number;
}

export interface StudentEnrollmentPersonContext {
  personCode: string;
  inepId?: string;
  residenceCountry?: number;
}

@Injectable()
export class StudentEnrollmentRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.STUDENT_ENROLLMENT;

  protected readonly fields: FieldRule[] = [
    // Campo 1: Tipo de registro
    {
      position: 0,
      name: 'record_type',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^60$/,
      type: 'code',
      description: 'Tipo de registro (sempre 60)',
    },
    // Campo 2: Código de escola - Inep
    {
      position: 1,
      name: 'school_code',
      required: true,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'Código INEP da escola (8 dígitos)',
    },
    // Campo 3: Código da pessoa física no sistema próprio
    {
      position: 2,
      name: 'person_code',
      required: true,
      minLength: 1,
      maxLength: 20,
      type: 'string',
      description: 'Código da pessoa física no sistema próprio',
    },
    // Campo 4: Identificação única (Inep)
    {
      position: 3,
      name: 'inep_id',
      required: false,
      minLength: 12,
      maxLength: 12,
      pattern: /^\d{12}$/,
      type: 'code',
      description: 'Identificação única (Inep)',
    },
    // Campo 5: Código da Turma na Entidade/Escola
    {
      position: 4,
      name: 'class_code',
      required: true,
      minLength: 1,
      maxLength: 20,
      type: 'string',
      description: 'Código da Turma na Entidade/Escola',
    },
    // Campo 6: Código da turma no INEP (não deve ser preenchido)
    {
      position: 5,
      name: 'inep_class_code',
      required: false,
      minLength: 0,
      maxLength: 0,
      type: 'string',
      description: 'Código da turma no INEP (não deve ser preenchido)',
    },
    // Campo 7: Código da Matrícula do(a) aluno(a) (não deve ser preenchido)
    {
      position: 6,
      name: 'enrollment_code',
      required: false,
      minLength: 0,
      maxLength: 0,
      type: 'string',
      description:
        'Código da Matrícula do(a) aluno(a) (não deve ser preenchido)',
    },
    // Campo 8: Turma multi
    {
      position: 7,
      name: 'multi_class',
      required: false,
      minLength: 0,
      maxLength: 2,
      pattern: /^(1|2|14|15|16|17|18|19|20|21|39|40|41|69|70)?$/,
      type: 'code',
      description: 'Turma multi (condicional baseado na etapa)',
    },
  ];

  getRecordType(): RecordTypeEnum {
    return RecordTypeEnum.STUDENT_ENROLLMENT;
  }

  getFieldMappings(): Record<string, string> {
    return {
      record_type: 'Tipo de registro',
      school_code: 'Código de escola - Inep',
      person_code: 'Código da pessoa física no sistema próprio',
      inep_id: 'Identificação única (Inep)',
      class_code: 'Código da Turma na Entidade/Escola',
      inep_class_code: 'Código da turma no INEP',
      enrollment_code: 'Código da Matrícula do(a) aluno(a)',
      multi_class: 'Turma multi',
      cognitive_functions: 'Desenvolvimento de funções cognitivas',
      autonomous_life: 'Desenvolvimento de vida autônoma',
      curriculum_enrichment: 'Enriquecimento curricular',
      accessible_computing: 'Ensino da informática acessível',
      libras_teaching: 'Ensino da Língua Brasileira de Sinais (Libras)',
      portuguese_second_language:
        'Ensino da Língua Portuguesa como Segunda Língua',
      soroban_techniques: 'Ensino das técnicas do cálculo no Soroban',
      braille_system: 'Ensino de Sistema Braille',
      orientation_mobility: 'Ensino de técnicas para orientação e mobilidade',
      alternative_communication:
        'Ensino de uso da Comunicação Alternativa e Aumentativa (CAA)',
      optical_resources: 'Ensino de uso de recursos ópticos e não ópticos',
      schooling_other_space:
        'Recebe escolarização em outro espaço (diferente da escola)',
      public_transport: 'Transporte escolar público',
      transport_authority: 'Poder Público responsável pelo transporte escolar',
      vehicle_bicycle: 'Rodoviário - Bicicleta',
      vehicle_microbus: 'Rodoviário - Microônibus',
      vehicle_bus: 'Rodoviário - Ônibus',
      vehicle_animal_traction: 'Rodoviário – Tração Animal',
      vehicle_vans: 'Rodoviário - Vans/Kombis',
      vehicle_other_road: 'Rodoviário - Outro',
      vehicle_water_5: 'Aquaviário - Capacidade de até 5 aluno(a)s',
      vehicle_water_15: 'Aquaviário - Capacidade entre 5 a 15 aluno(a)s',
      vehicle_water_35: 'Aquaviário - Capacidade entre 15 a 35 aluno(a)s',
      vehicle_water_above: 'Aquaviário - Capacidade acima de 35 aluno(a)s',
    };
  }

  getFieldValidations(): Record<string, any[]> {
    return {
      record_type: [
        { rule: 'required_field', message: 'Tipo de registro é obrigatório' },
        {
          rule: 'exact_value',
          value: '60',
          message: 'Tipo de registro deve ser 60',
        },
      ],
      school_code: [
        { rule: 'required_field', message: 'Código de escola é obrigatório' },
        {
          rule: 'exact_length',
          length: 8,
          message: 'Código de escola deve ter 8 caracteres',
        },
        {
          rule: 'pattern_validation',
          pattern: /^\d{8}$/,
          message: 'Código de escola deve ser numérico',
        },
      ],
      person_code: [
        { rule: 'required_field', message: 'Código da pessoa é obrigatório' },
        {
          rule: 'max_length',
          length: 20,
          message: 'Código da pessoa deve ter no máximo 20 caracteres',
        },
      ],
      inep_id: [
        {
          rule: 'exact_length',
          length: 12,
          message: 'Identificação única (Inep) deve ter 12 caracteres',
          when: (value: string) => value && value.trim() !== '',
        },
        {
          rule: 'pattern_validation',
          pattern: /^\d{12}$/,
          message: 'Identificação única (Inep) deve ser numérica',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      class_code: [
        { rule: 'required_field', message: 'Código da turma é obrigatório' },
        {
          rule: 'max_length',
          length: 20,
          message: 'Código da turma deve ter no máximo 20 caracteres',
        },
      ],
      inep_class_code: [
        {
          rule: 'should_not_be_filled',
          message: 'Código da turma no INEP não deve ser preenchido',
        },
      ],
      enrollment_code: [
        {
          rule: 'should_not_be_filled',
          message: 'Código da matrícula não deve ser preenchido',
        },
      ],
      multi_class: [
        {
          rule: 'pattern_validation',
          pattern: /^(1|2|14|15|16|17|18|19|20|21|39|40|41|69|70)$/,
          message: 'Turma multi deve ter valor válido',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      // Campos de atendimento educacional especializado (9-19)
      cognitive_functions: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      autonomous_life: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      curriculum_enrichment: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      accessible_computing: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      libras_teaching: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      portuguese_second_language: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      soroban_techniques: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      braille_system: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      orientation_mobility: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      alternative_communication: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      optical_resources: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      schooling_other_space: [
        {
          rule: 'pattern_validation',
          pattern: /^[123]$/,
          message: 'Deve ser 1, 2 ou 3',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      public_transport: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não utiliza) ou 1 (Utiliza)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      transport_authority: [
        {
          rule: 'pattern_validation',
          pattern: /^[12]$/,
          message: 'Deve ser 1 (Estadual) ou 2 (Municipal)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      // Campos de veículo (23-32)
      vehicle_bicycle: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      vehicle_microbus: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      vehicle_bus: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      vehicle_animal_traction: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      vehicle_vans: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      vehicle_other_road: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      vehicle_water_5: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      vehicle_water_15: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      vehicle_water_35: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
      vehicle_water_above: [
        {
          rule: 'pattern_validation',
          pattern: /^[01]$/,
          message: 'Deve ser 0 (Não) ou 1 (Sim)',
          when: (value: string) => value && value.trim() !== '',
        },
      ],
    };
  }

  validateWithContext(
    parts: string[],
    schoolContext?: StudentEnrollmentSchoolContext,
    classContext?: StudentEnrollmentClassContext,
    personContext?: StudentEnrollmentPersonContext,
    lineNumber?: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validação do código da escola (campo 2)
    if (schoolContext) {
      const schoolCodeFromRecord = parts[1] || '';
      if (schoolCodeFromRecord !== schoolContext.schoolCode) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'school_code',
          fieldPosition: 1,
          fieldValue: schoolCodeFromRecord,
          ruleName: 'school_code_mismatch',
          errorMessage:
            'O campo "Código de escola - Inep" está diferente do registro 00 antecedente.',
          severity: 'error',
        });
      }
    }

    // Validação do código da pessoa (campo 3)
    if (schoolContext) {
      const personCodeFromRecord = parts[2] || '';
      const personExists = schoolContext.persons.some(
        (p) => p.personCode === personCodeFromRecord,
      );

      if (!personExists) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'person_code',
          fieldPosition: 2,
          fieldValue: personCodeFromRecord,
          ruleName: 'person_not_found',
          errorMessage: 'Não há pessoa física com esse código nesta escola.',
          severity: 'error',
        });
      }
    }

    // Validação da identificação Inep (campo 4)
    if (personContext) {
      const inepIdFromRecord = parts[3] || '';
      if (
        inepIdFromRecord &&
        inepIdFromRecord.trim() !== '' &&
        inepIdFromRecord !== (personContext.inepId || '')
      ) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'inep_id',
          fieldPosition: 3,
          fieldValue: inepIdFromRecord,
          ruleName: 'inep_id_mismatch',
          errorMessage:
            'O campo está diferente da "Identificação Única (Inep)" do registro 30 correspondente.',
          severity: 'error',
        });
      }
    }

    // Validação do código da turma (campo 5)
    if (schoolContext) {
      const classCodeFromRecord = parts[4] || '';
      const classExists = schoolContext.classes.some(
        (c) => c.classCode === classCodeFromRecord,
      );

      if (!classExists) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'class_code',
          fieldPosition: 4,
          fieldValue: classCodeFromRecord,
          ruleName: 'class_not_found',
          errorMessage: 'Não há turma com esse código nesta escola.',
          severity: 'error',
        });
      }
    }

    // Validações condicionais baseadas no contexto da turma
    if (classContext) {
      this.validateMultiClass(parts, classContext, lineNumber, errors);
      this.validateSpecializedEducation(
        parts,
        classContext,
        lineNumber,
        errors,
      );
      this.validateSchoolingSpace(parts, classContext, lineNumber, errors);
      this.validateTransport(
        parts,
        classContext,
        personContext,
        lineNumber,
        errors,
      );
    }

    return errors;
  }

  private validateMultiClass(
    parts: string[],
    classContext: StudentEnrollmentClassContext,
    lineNumber: number | undefined,
    errors: ValidationError[],
  ): void {
    const multiClass = parts[7] || '';
    const stage = classContext.stage;

    // Etapas que exigem turma multi
    const stagesRequiringMulti = [3, 22, 23, 72, 56, 64];
    const shouldHaveMulti = stage && stagesRequiringMulti.includes(stage);

    if (shouldHaveMulti && (!multiClass || multiClass.trim() === '')) {
      errors.push({
        lineNumber: lineNumber || 0,
        recordType: '60',
        fieldName: 'multi_class',
        fieldPosition: 7,
        fieldValue: multiClass,
        ruleName: 'required_when_stage',
        errorMessage:
          'O campo não foi preenchido quando deveria ser preenchido.',
        severity: 'error',
      });
    }

    if (!shouldHaveMulti && multiClass && multiClass.trim() !== '') {
      errors.push({
        lineNumber: lineNumber || 0,
        recordType: '60',
        fieldName: 'multi_class',
        fieldPosition: 7,
        fieldValue: multiClass,
        ruleName: 'should_not_be_filled',
        errorMessage:
          'O campo foi preenchido quando deveria não ser preenchido.',
        severity: 'error',
      });
    }

    // Validar valores específicos por etapa
    if (multiClass && multiClass.trim() !== '' && stage) {
      let validValues: string[] = [];

      switch (stage) {
        case 3:
          validValues = ['1', '2'];
          break;
        case 22:
        case 23:
          validValues = ['14', '15', '16', '17', '18', '19', '20', '21', '41'];
          break;
        case 72:
          validValues = ['69', '70'];
          break;
        case 56:
          validValues = [
            '1',
            '2',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '41',
          ];
          break;
        case 64:
          validValues = ['39', '40'];
          break;
      }

      if (validValues.length > 0 && !validValues.includes(multiClass)) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'multi_class',
          fieldPosition: 7,
          fieldValue: multiClass,
          ruleName: 'invalid_value_for_stage',
          errorMessage: 'O campo foi preenchido com valor não permitido.',
          severity: 'error',
        });
      }
    }
  }

  private validateSpecializedEducation(
    parts: string[],
    classContext: StudentEnrollmentClassContext,
    lineNumber: number | undefined,
    errors: ValidationError[],
  ): void {
    const hasAEE = classContext.specializedEducationalService;
    const aeFields = parts.slice(8, 19); // Campos 9-19

    if (hasAEE) {
      // Verificar se pelo menos um campo está preenchido com 1
      const hasAtLeastOne = aeFields.some((field) => field === '1');

      if (!hasAtLeastOne) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'specialized_education_services',
          fieldPosition: 8,
          fieldValue: aeFields.join(', '),
          ruleName: 'at_least_one_required',
          errorMessage:
            '"Tipo de atendimento educacional especializado" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não).',
          severity: 'error',
        });
      }

      // Verificar se todos os campos estão preenchidos
      aeFields.forEach((field, index) => {
        if (!field || field.trim() === '') {
          const fieldNames = [
            'cognitive_functions',
            'autonomous_life',
            'curriculum_enrichment',
            'accessible_computing',
            'libras_teaching',
            'portuguese_second_language',
            'soroban_techniques',
            'braille_system',
            'orientation_mobility',
            'alternative_communication',
            'optical_resources',
          ];

          errors.push({
            lineNumber: lineNumber || 0,
            recordType: '60',
            fieldName: fieldNames[index],
            fieldPosition: 8 + index,
            fieldValue: field,
            ruleName: 'required_when_aee',
            errorMessage:
              'O campo não foi preenchido quando deveria ser preenchido.',
            severity: 'error',
          });
        }
      });
    } else {
      // Verificar se nenhum campo está preenchido
      aeFields.forEach((field, index) => {
        if (field && field.trim() !== '') {
          const fieldNames = [
            'cognitive_functions',
            'autonomous_life',
            'curriculum_enrichment',
            'accessible_computing',
            'libras_teaching',
            'portuguese_second_language',
            'soroban_techniques',
            'braille_system',
            'orientation_mobility',
            'alternative_communication',
            'optical_resources',
          ];

          errors.push({
            lineNumber: lineNumber || 0,
            recordType: '60',
            fieldName: fieldNames[index],
            fieldPosition: 8 + index,
            fieldValue: field,
            ruleName: 'should_not_be_filled',
            errorMessage:
              'O campo foi preenchido quando deveria não ser preenchido.',
            severity: 'error',
          });
        }
      });
    }
  }

  private validateSchoolingSpace(
    parts: string[],
    classContext: StudentEnrollmentClassContext,
    lineNumber: number | undefined,
    errors: ValidationError[],
  ): void {
    const schoolingSpace = parts[19] || ''; // Campo 20

    const isPresencial = classContext.teachingMediation === 1;
    const isCurricular = classContext.isRegular;
    const hasValidLocation =
      classContext.differentiatedLocation === 0 ||
      classContext.differentiatedLocation === 1;

    const shouldBeFilled = isPresencial && isCurricular && hasValidLocation;

    if (shouldBeFilled && (!schoolingSpace || schoolingSpace.trim() === '')) {
      errors.push({
        lineNumber: lineNumber || 0,
        recordType: '60',
        fieldName: 'schooling_other_space',
        fieldPosition: 19,
        fieldValue: schoolingSpace,
        ruleName: 'required_when_conditions',
        errorMessage:
          'O campo não foi preenchido quando deveria ser preenchido.',
        severity: 'error',
      });
    }

    if (!shouldBeFilled && schoolingSpace && schoolingSpace.trim() !== '') {
      if (!isCurricular) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'schooling_other_space',
          fieldPosition: 19,
          fieldValue: schoolingSpace,
          ruleName: 'should_not_be_filled',
          errorMessage:
            'O campo foi preenchido quando deveria não ser preenchido.',
          severity: 'error',
        });
      } else if (!isPresencial) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'schooling_other_space',
          fieldPosition: 19,
          fieldValue: schoolingSpace,
          ruleName: 'should_not_be_filled',
          errorMessage:
            'O campo foi preenchido quando deveria não ser preenchido.',
          severity: 'error',
        });
      } else if (!hasValidLocation) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'schooling_other_space',
          fieldPosition: 19,
          fieldValue: schoolingSpace,
          ruleName: 'should_not_be_filled',
          errorMessage:
            'O campo foi preenchido quando deveria não ser preenchido.',
          severity: 'error',
        });
      }
    }
  }

  private validateTransport(
    parts: string[],
    classContext: StudentEnrollmentClassContext,
    personContext: StudentEnrollmentPersonContext | undefined,
    lineNumber: number | undefined,
    errors: ValidationError[],
  ): void {
    const publicTransport = parts[20] || ''; // Campo 21
    const transportAuthority = parts[21] || ''; // Campo 22
    const vehicleFields = parts.slice(22, 32); // Campos 23-32

    const isPresencialOrSemi =
      classContext.teachingMediation === 1 ||
      classContext.teachingMediation === 2;
    const isCurricular = classContext.isRegular;
    const isBrazilResident = personContext?.residenceCountry === 76;

    const shouldHaveTransport =
      isPresencialOrSemi && isCurricular && isBrazilResident;

    // Validar campo de transporte público
    if (
      shouldHaveTransport &&
      (!publicTransport || publicTransport.trim() === '')
    ) {
      errors.push({
        lineNumber: lineNumber || 0,
        recordType: '60',
        fieldName: 'public_transport',
        fieldPosition: 20,
        fieldValue: publicTransport,
        ruleName: 'required_when_conditions',
        errorMessage:
          'O campo não foi preenchido quando deveria ser preenchido.',
        severity: 'error',
      });
    }

    if (
      !shouldHaveTransport &&
      publicTransport &&
      publicTransport.trim() !== ''
    ) {
      if (!isPresencialOrSemi) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'public_transport',
          fieldPosition: 20,
          fieldValue: publicTransport,
          ruleName: 'should_not_be_filled',
          errorMessage:
            'O campo foi preenchido quando deveria não ser preenchido.',
          severity: 'error',
        });
      } else if (!isCurricular) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'public_transport',
          fieldPosition: 20,
          fieldValue: publicTransport,
          ruleName: 'should_not_be_filled',
          errorMessage:
            'O campo foi preenchido quando deveria não ser preenchido.',
          severity: 'error',
        });
      } else if (!isBrazilResident) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'public_transport',
          fieldPosition: 20,
          fieldValue: publicTransport,
          ruleName: 'should_not_be_filled',
          errorMessage:
            'O campo foi preenchido quando deveria não ser preenchido.',
          severity: 'error',
        });
      }
    }

    // Validar autoridade do transporte
    const usesTransport = publicTransport === '1';

    if (
      usesTransport &&
      (!transportAuthority || transportAuthority.trim() === '')
    ) {
      errors.push({
        lineNumber: lineNumber || 0,
        recordType: '60',
        fieldName: 'transport_authority',
        fieldPosition: 21,
        fieldValue: transportAuthority,
        ruleName: 'required_when_transport',
        errorMessage:
          'O campo não foi preenchido quando deveria ser preenchido.',
        severity: 'error',
      });
    }

    if (
      !usesTransport &&
      transportAuthority &&
      transportAuthority.trim() !== ''
    ) {
      errors.push({
        lineNumber: lineNumber || 0,
        recordType: '60',
        fieldName: 'transport_authority',
        fieldPosition: 21,
        fieldValue: transportAuthority,
        ruleName: 'should_not_be_filled',
        errorMessage:
          'O campo foi preenchido quando deveria não ser preenchido.',
        severity: 'error',
      });
    }

    // Validar tipos de veículo
    if (usesTransport) {
      vehicleFields.forEach((field, index) => {
        if (!field || field.trim() === '') {
          const vehicleFieldNames = [
            'vehicle_bicycle',
            'vehicle_microbus',
            'vehicle_bus',
            'vehicle_animal_traction',
            'vehicle_vans',
            'vehicle_other_road',
            'vehicle_water_5',
            'vehicle_water_15',
            'vehicle_water_35',
            'vehicle_water_above',
          ];

          errors.push({
            lineNumber: lineNumber || 0,
            recordType: '60',
            fieldName: vehicleFieldNames[index],
            fieldPosition: 22 + index,
            fieldValue: field,
            ruleName: 'required_when_transport',
            errorMessage:
              'O campo não foi preenchido quando deveria ser preenchido.',
            severity: 'error',
          });
        }
      });

      // Verificar se todos são 0 (não permitido)
      const allZero = vehicleFields.every((field) => field === '0');
      if (allZero) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'vehicle_types',
          fieldPosition: 22,
          fieldValue: vehicleFields.join(', '),
          ruleName: 'at_least_one_vehicle_required',
          errorMessage:
            'Todas as opções de tipo de veículo utilizado no transporte escolar público foram preenchidas com 0 (Não).',
          severity: 'error',
        });
      }

      // Verificar incompatibilidades (todos rodoviários ou todos aquaviários = 1)
      const roadVehicles = vehicleFields.slice(0, 6);
      const waterVehicles = vehicleFields.slice(6, 10);

      const allRoadOne = roadVehicles.every((field) => field === '1');
      const allWaterOne = waterVehicles.every((field) => field === '1');

      if (allRoadOne) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'road_vehicles',
          fieldPosition: 22,
          fieldValue: roadVehicles.join(', '),
          ruleName: 'all_road_vehicles_selected',
          errorMessage:
            'Todas as opções de tipo de veículo utilizado no transporte escolar público rodoviário foram preenchidas com 1 (Sim).',
          severity: 'error',
        });
      }

      if (allWaterOne) {
        errors.push({
          lineNumber: lineNumber || 0,
          recordType: '60',
          fieldName: 'water_vehicles',
          fieldPosition: 28,
          fieldValue: waterVehicles.join(', '),
          ruleName: 'all_water_vehicles_selected',
          errorMessage:
            'Todas as opções de tipo de veículo utilizado no transporte escolar público aquaviário foram preenchidas com 1 (Sim).',
          severity: 'error',
        });
      }
    } else {
      // Não usa transporte - verificar se veículos não estão preenchidos
      vehicleFields.forEach((field, index) => {
        if (field && field.trim() !== '') {
          const vehicleFieldNames = [
            'vehicle_bicycle',
            'vehicle_microbus',
            'vehicle_bus',
            'vehicle_animal_traction',
            'vehicle_vans',
            'vehicle_other_road',
            'vehicle_water_5',
            'vehicle_water_15',
            'vehicle_water_35',
            'vehicle_water_above',
          ];

          errors.push({
            lineNumber: lineNumber || 0,
            recordType: '60',
            fieldName: vehicleFieldNames[index],
            fieldPosition: 22 + index,
            fieldValue: field,
            ruleName: 'should_not_be_filled',
            errorMessage:
              'O campo foi preenchido quando deveria não ser preenchido.',
            severity: 'error',
          });
        }
      });
    }
  }

  parseRecord(parts: string[]): any {
    if (parts.length < 32) {
      throw new Error('Registro 60 deve ter pelo menos 32 campos');
    }

    return {
      recordType: parts[0],
      schoolCode: parts[1],
      personCode: parts[2],
      inepId: parts[3],
      classCode: parts[4],
      inepClassCode: parts[5],
      enrollmentCode: parts[6],
      multiClass: parts[7],
      cognitiveFunctions: parts[8],
      autonomousLife: parts[9],
      curriculumEnrichment: parts[10],
      accessibleComputing: parts[11],
      librasTeaching: parts[12],
      portugueseSecondLanguage: parts[13],
      sorobanTechniques: parts[14],
      brailleSystem: parts[15],
      orientationMobility: parts[16],
      alternativeCommunication: parts[17],
      opticalResources: parts[18],
      schoolingOtherSpace: parts[19],
      publicTransport: parts[20],
      transportAuthority: parts[21],
      vehicleBicycle: parts[22],
      vehicleMicrobus: parts[23],
      vehicleBus: parts[24],
      vehicleAnimalTraction: parts[25],
      vehicleVans: parts[26],
      vehicleOtherRoad: parts[27],
      vehicleWater5: parts[28],
      vehicleWater15: parts[29],
      vehicleWater35: parts[30],
      vehicleWaterAbove: parts[31],
    };
  }
}
