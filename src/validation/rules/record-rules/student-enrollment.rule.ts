import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../../common/enums/record-types.enum';
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
      pattern: /^$/,
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
      pattern: /^$/,
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
    // Campo 9: Desenvolvimento de funções cognitivas
    {
      position: 8,
      name: 'cognitive_functions',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Desenvolvimento de funções cognitivas (0-Não, 1-Sim)',
    },
    // Campo 10: Desenvolvimento de vida autônoma
    {
      position: 9,
      name: 'autonomous_life',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Desenvolvimento de vida autônoma (0-Não, 1-Sim)',
    },
    // Campo 11: Enriquecimento curricular
    {
      position: 10,
      name: 'curriculum_enrichment',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Enriquecimento curricular (0-Não, 1-Sim)',
    },
    // Campo 12: Ensino da informática acessível
    {
      position: 11,
      name: 'accessible_computing',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Ensino da informática acessível (0-Não, 1-Sim)',
    },
    // Campo 13: Ensino da Língua Brasileira de Sinais (Libras)
    {
      position: 12,
      name: 'libras_teaching',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description:
        'Ensino da Língua Brasileira de Sinais - Libras (0-Não, 1-Sim)',
    },
    // Campo 14: Ensino da Língua Portuguesa como Segunda Língua
    {
      position: 13,
      name: 'portuguese_second_language',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description:
        'Ensino da Língua Portuguesa como Segunda Língua (0-Não, 1-Sim)',
    },
    // Campo 15: Ensino das técnicas do cálculo no Soroban
    {
      position: 14,
      name: 'soroban_techniques',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Ensino das técnicas do cálculo no Soroban (0-Não, 1-Sim)',
    },
    // Campo 16: Ensino de Sistema Braille
    {
      position: 15,
      name: 'braille_system',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Ensino de Sistema Braille (0-Não, 1-Sim)',
    },
    // Campo 17: Ensino de técnicas para orientação e mobilidade
    {
      position: 16,
      name: 'orientation_mobility',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description:
        'Ensino de técnicas para orientação e mobilidade (0-Não, 1-Sim)',
    },
    // Campo 18: Ensino de uso da Comunicação Alternativa e Aumentativa (CAA)
    {
      position: 17,
      name: 'alternative_communication',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description:
        'Ensino de uso da Comunicação Alternativa e Aumentativa - CAA (0-Não, 1-Sim)',
    },
    // Campo 19: Ensino de uso de recursos ópticos e não ópticos
    {
      position: 18,
      name: 'optical_resources',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description:
        'Ensino de uso de recursos ópticos e não ópticos (0-Não, 1-Sim)',
    },
    // Campo 20: Recebe escolarização em outro espaço (diferente da escola)
    {
      position: 19,
      name: 'schooling_other_space',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[123]?$/,
      type: 'code',
      description:
        'Recebe escolarização em outro espaço (1-Não recebe, 2-Em hospital, 3-Em domicílio)',
    },
    // Campo 21: Transporte escolar público
    {
      position: 20,
      name: 'public_transport',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Transporte escolar público (0-Não utiliza, 1-Utiliza)',
    },
    // Campo 22: Poder Público responsável pelo transporte escolar
    {
      position: 21,
      name: 'transport_authority',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[12]?$/,
      type: 'code',
      description:
        'Poder Público responsável pelo transporte escolar (1-Estadual, 2-Municipal)',
    },
    // Campo 23: Rodoviário - Bicicleta
    {
      position: 22,
      name: 'vehicle_bicycle',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Rodoviário - Bicicleta (0-Não, 1-Sim)',
    },
    // Campo 24: Rodoviário - Microônibus
    {
      position: 23,
      name: 'vehicle_microbus',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Rodoviário - Microônibus (0-Não, 1-Sim)',
    },
    // Campo 25: Rodoviário - Ônibus
    {
      position: 24,
      name: 'vehicle_bus',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Rodoviário - Ônibus (0-Não, 1-Sim)',
    },
    // Campo 26: Rodoviário – Tração Animal
    {
      position: 25,
      name: 'vehicle_animal_traction',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Rodoviário - Tração Animal (0-Não, 1-Sim)',
    },
    // Campo 27: Rodoviário - Vans/Kombis
    {
      position: 26,
      name: 'vehicle_van',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Rodoviário - Vans/Kombis (0-Não, 1-Sim)',
    },
    // Campo 28: Rodoviário - Outro
    {
      position: 27,
      name: 'vehicle_other_road',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Rodoviário - Outro (0-Não, 1-Sim)',
    },
    // Campo 29: Aquaviário - Capacidade de até 5 aluno(a)s
    {
      position: 28,
      name: 'vehicle_water_5',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Aquaviário - Capacidade de até 5 alunos (0-Não, 1-Sim)',
    },
    // Campo 30: Aquaviário - Capacidade entre 5 a 15 aluno(a)s
    {
      position: 29,
      name: 'vehicle_water_15',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Aquaviário - Capacidade entre 5 a 15 alunos (0-Não, 1-Sim)',
    },
    // Campo 31: Aquaviário - Capacidade entre 15 a 35 aluno(a)s
    {
      position: 30,
      name: 'vehicle_water_35',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description:
        'Aquaviário - Capacidade entre 15 a 35 alunos (0-Não, 1-Sim)',
    },
    // Campo 32: Aquaviário - Capacidade acima de 35 aluno(a)s
    {
      position: 31,
      name: 'vehicle_water_above',
      required: false,
      minLength: 0,
      maxLength: 1,
      pattern: /^[01]?$/,
      type: 'code',
      description: 'Aquaviário - Capacidade acima de 35 alunos (0-Não, 1-Sim)',
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
      vehicle_van: 'Rodoviário - Vans/Kombis',
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
      vehicle_van: [
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

  /**
   * Override validate method to include intra-record business rules
   */
  validate(parts: string[], lineNumber: number): ValidationError[] {
    const fieldErrors = super.validate(parts, lineNumber);

    // Add intra-record conditional validations
    const businessErrors: ValidationError[] = [];

    // Validate transport fields when public transport = 1
    // This validation doesn't require context - it's purely intra-record
    this.validateTransportIntraRecord(parts, lineNumber, businessErrors);

    return [...fieldErrors, ...businessErrors];
  }

  /**
   * Validates transport-related fields within the same record (intra-record validation)
   * This checks if vehicle fields (23-32) are filled when public transport = 1
   */
  private validateTransportIntraRecord(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const publicTransport = parts[20] || ''; // Campo 21

    // If public transport is "1" (Yes), then vehicle fields become required
    if (publicTransport === '1') {
      const vehicleFields = [
        {
          index: 21,
          name: 'transport_authority',
          label: 'Poder público responsável pelo transporte',
        },
        {
          index: 22,
          name: 'vehicle_road_federal',
          label: 'Rodoviário - Federal',
        },
        {
          index: 23,
          name: 'vehicle_road_state',
          label: 'Rodoviário - Estadual',
        },
        {
          index: 24,
          name: 'vehicle_road_municipal',
          label: 'Rodoviário - Municipal',
        },
        {
          index: 25,
          name: 'vehicle_rail_metro',
          label: 'Ferroviário - Metrô',
        },
        {
          index: 26,
          name: 'vehicle_rail_train',
          label: 'Ferroviário - Trem',
        },
        {
          index: 27,
          name: 'vehicle_water',
          label: 'Aquaviário',
        },
        {
          index: 28,
          name: 'vehicle_bike',
          label: 'Bicicleta',
        },
        {
          index: 29,
          name: 'vehicle_animal',
          label: 'Tração animal',
        },
        {
          index: 30,
          name: 'vehicle_walking',
          label: 'A pé',
        },
        {
          index: 31,
          name: 'vehicle_other',
          label: 'Outros',
        },
      ];

      // Check if at least one vehicle field is filled
      const hasVehicleSelected = vehicleFields.some((field) => {
        const value = parts[field.index] || '';
        return value.trim() === '1';
      });

      if (!hasVehicleSelected) {
        // If no vehicle is selected, mark transport authority as required
        const transportAuthority = parts[21] || '';
        if (!transportAuthority || transportAuthority.trim() === '') {
          errors.push(
            this.createError(
              lineNumber,
              'transport_authority',
              'Poder público responsável pelo transporte',
              21,
              transportAuthority,
              'required_when_transport',
              'Campo obrigatório quando "Utiliza transporte escolar público" = 1.',
              ValidationSeverity.ERROR,
            ),
          );
        }

        // Also create an error suggesting at least one vehicle type should be selected
        errors.push(
          this.createError(
            lineNumber,
            'vehicle_selection',
            'Tipo de veículo utilizado no transporte escolar',
            22,
            '',
            'at_least_one_vehicle_required',
            'Quando "Utiliza transporte escolar público" = 1, pelo menos um tipo de veículo deve ser selecionado (campos 23-32).',
            ValidationSeverity.ERROR,
          ),
        );
      } else {
        // If vehicle is selected, transport authority becomes required
        const transportAuthority = parts[21] || '';
        if (!transportAuthority || transportAuthority.trim() === '') {
          errors.push(
            this.createError(
              lineNumber,
              'transport_authority',
              'Poder público responsável pelo transporte',
              21,
              transportAuthority,
              'required_when_transport',
              'Campo obrigatório quando "Utiliza transporte escolar público" = 1.',
              ValidationSeverity.ERROR,
            ),
          );
        }
      }
    }
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
        errors.push(
          this.createError(
            lineNumber || 0,
            'school_code',
            'Código de escola - Inep',
            1,
            schoolCodeFromRecord,
            'school_code_mismatch',
            'O campo "Código de escola - Inep" está diferente do registro 00 antecedente.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Validação do código da pessoa (campo 3)
    if (schoolContext) {
      const personCodeFromRecord = parts[2] || '';
      const personExists = schoolContext.persons.some(
        (p) => p.personCode === personCodeFromRecord,
      );

      if (!personExists) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'person_code',
            'Código de pessoa',
            2,
            personCodeFromRecord,
            'person_not_found',
            'Não há pessoa física com esse código nesta escola.',
            ValidationSeverity.ERROR,
          ),
        );
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
        errors.push(
          this.createError(
            lineNumber || 0,
            'inep_id',
            'Identificação Única (Inep)',
            3,
            inepIdFromRecord,
            'inep_id_mismatch',
            'O campo está diferente da "Identificação Única (Inep)" do registro 30 correspondente.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Validação do código da turma (campo 5)
    if (schoolContext) {
      const classCodeFromRecord = parts[4] || '';
      const classExists = schoolContext.classes.some(
        (c) => c.classCode === classCodeFromRecord,
      );

      if (!classExists) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'class_code',
            'Código da turma',
            4,
            classCodeFromRecord,
            'class_not_found',
            'Não há turma com esse código nesta escola.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Validações condicionais baseadas no contexto da turma
    if (classContext) {
      // Normalize fields that may arrive as string or number/boolean in the context
      const normalizedClassContext: StudentEnrollmentClassContext = {
        ...classContext,
        teachingMediation:
          classContext.teachingMediation !== undefined
            ? Number(classContext.teachingMediation)
            : undefined,
        stage:
          classContext.stage !== undefined
            ? Number(classContext.stage)
            : undefined,
        isRegular:
          typeof classContext.isRegular === 'boolean'
            ? classContext.isRegular
            : Boolean(Number((classContext as any).isRegular)),
        specializedEducationalService:
          typeof classContext.specializedEducationalService === 'boolean'
            ? classContext.specializedEducationalService
            : Boolean(
                Number((classContext as any).specializedEducationalService),
              ),
        differentiatedLocation:
          classContext.differentiatedLocation !== undefined
            ? Number(classContext.differentiatedLocation)
            : undefined,
      };

      const normalizedPersonContext = personContext
        ? {
            ...personContext,
            residenceCountry:
              personContext.residenceCountry !== undefined
                ? Number(personContext.residenceCountry)
                : undefined,
          }
        : undefined;

      this.validateMultiClass(
        parts,
        normalizedClassContext,
        lineNumber,
        errors,
      );
      this.validateSpecializedEducation(
        parts,
        normalizedClassContext,
        lineNumber,
        errors,
      );
      this.validateSchoolingSpace(
        parts,
        normalizedClassContext,
        lineNumber,
        errors,
      );
      this.validateTransport(
        parts,
        normalizedClassContext,
        normalizedPersonContext,
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
      errors.push(
        this.createError(
          lineNumber || 0,
          'multi_class',
          'Turma multi',
          7,
          multiClass,
          'required_when_stage',
          `O campo é obrigatório para a etapa de ensino ${stage} (etapas que exigem: 3, 22, 23, 72, 56, 64).`,
          ValidationSeverity.ERROR,
        ),
      );
    }

    if (!shouldHaveMulti && multiClass && multiClass.trim() !== '') {
      errors.push(
        this.createError(
          lineNumber || 0,
          'multi_class',
          'Turma multi',
          7,
          multiClass,
          'should_not_be_filled',
          `O campo não pode ser preenchido para a etapa de ensino ${stage || 'não informada'}. Só é obrigatório para etapas: 3, 22, 23, 72, 56, 64.`,
          ValidationSeverity.ERROR,
        ),
      );
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
        errors.push(
          this.createError(
            lineNumber || 0,
            'multi_class',
            'Turma multi',
            7,
            multiClass,
            'invalid_value_for_stage',
            'O campo foi preenchido com valor não permitido.',
            ValidationSeverity.ERROR,
          ),
        );
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
    const aeFields = parts.slice(8, 19).map((field) => field || ''); // Campos 9-19, preserva vazio

    if (hasAEE) {
      // Separar campos preenchidos de campos vazios
      const filledFields = aeFields.filter((field) => field.trim() !== '');

      // Verificar se pelo menos um campo preenchido está com 1
      const hasAtLeastOne = filledFields.some((field) => field === '1');

      // Só valida "todos são 0" se houver campos preenchidos e nenhum for "1"
      if (filledFields.length > 0 && !hasAtLeastOne) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'specialized_education_services',
            'Tipo de atendimento educacional especializado',
            8,
            filledFields.join(', '),
            'at_least_one_required',
            '"Tipo de atendimento educacional especializado" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não).',
            ValidationSeverity.ERROR,
          ),
        );
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
          const fieldDescriptions = [
            'Desenvolvimento de funções cognitivas',
            'Desenvolvimento da vida autônoma',
            'Enriquecimento curricular',
            'Ensino do uso da Informática acessível',
            'Ensino da Língua Brasileira de Sinais - Libras',
            'Ensino de Língua Portuguesa como Segunda Língua',
            'Ensino do uso do Soroban',
            'Ensino do Sistema Braille',
            'Orientação e mobilidade',
            'Comunicação alternativa e aumentativa',
            'Recursos ópticos e não ópticos',
          ];

          errors.push(
            this.createError(
              lineNumber || 0,
              fieldNames[index],
              fieldDescriptions[index],
              8 + index,
              field,
              'required_when_aee',
              'O campo é obrigatório quando a turma oferece Atendimento Educacional Especializado (campo 16 do registro 20 = 1-Sim).',
              ValidationSeverity.ERROR,
            ),
          );
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
          const fieldDescriptions = [
            'Desenvolvimento de funções cognitivas',
            'Desenvolvimento da vida autônoma',
            'Enriquecimento curricular',
            'Ensino do uso da Informática acessível',
            'Ensino da Língua Brasileira de Sinais - Libras',
            'Ensino de Língua Portuguesa como Segunda Língua',
            'Ensino do uso do Soroban',
            'Ensino do Sistema Braille',
            'Orientação e mobilidade',
            'Comunicação alternativa e aumentativa',
            'Recursos ópticos e não ópticos',
          ];

          errors.push(
            this.createError(
              lineNumber || 0,
              fieldNames[index],
              fieldDescriptions[index],
              8 + index,
              field,
              'should_not_be_filled',
              'O campo não pode ser preenchido quando a turma não oferece Atendimento Educacional Especializado (campo 16 do registro 20 deve ser 1-Sim).',
              ValidationSeverity.ERROR,
            ),
          );
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
    // classContext.differentiatedLocation may come as string ('0'/'1') or number (0/1).
    // Normalize to number to accept both formats.
    const differentiatedLocation = Number(classContext.differentiatedLocation);
    const hasValidLocation =
      differentiatedLocation === 0 || differentiatedLocation === 1;

    const shouldBeFilled = isPresencial && isCurricular && hasValidLocation;

    if (shouldBeFilled && (!schoolingSpace || schoolingSpace.trim() === '')) {
      errors.push(
        this.createError(
          lineNumber || 0,
          'schooling_other_space',
          'Escolarização em espaço diferente da escola',
          19,
          schoolingSpace,
          'required_when_conditions',
          'O campo é obrigatório quando a turma é curricular (campo 14=1), mediação presencial (campo 6=1) e local não diferenciado ou sala anexa (campo 23=0 ou 1).',
          ValidationSeverity.ERROR,
        ),
      );
    }

    if (!shouldBeFilled && schoolingSpace && schoolingSpace.trim() !== '') {
      if (!isCurricular) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'schooling_other_space',
            'Escolarização em espaço diferente da escola',
            19,
            schoolingSpace,
            'should_not_be_filled_non_curricular',
            'O campo não pode ser preenchido quando a turma não é curricular (campo 14 do registro 20 deve ser 1-Sim).',
            ValidationSeverity.ERROR,
          ),
        );
      } else if (!isPresencial) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'schooling_other_space',
            'Escolarização em espaço diferente da escola',
            19,
            schoolingSpace,
            'should_not_be_filled_non_presencial',
            'O campo não pode ser preenchido quando a mediação não é presencial (campo 6 do registro 20 deve ser 1-Presencial).',
            ValidationSeverity.ERROR,
          ),
        );
      } else if (!hasValidLocation) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'schooling_other_space',
            'Escolarização em espaço diferente da escola',
            19,
            schoolingSpace,
            'should_not_be_filled_invalid_location',
            'O campo não pode ser preenchido quando o local de funcionamento não é válido (campo 23 do registro 20 deve ser 0-Não diferenciado ou 1-Sala anexa).',
            ValidationSeverity.ERROR,
          ),
        );
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
      errors.push(
        this.createError(
          lineNumber || 0,
          'public_transport',
          'Utiliza transporte escolar público',
          20,
          publicTransport,
          'required_when_conditions',
          'O campo é obrigatório quando a mediação é presencial ou semipresencial, turma é curricular e aluno reside no Brasil.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    if (
      !shouldHaveTransport &&
      publicTransport &&
      publicTransport.trim() !== ''
    ) {
      if (!isPresencialOrSemi) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'public_transport',
            'Utiliza transporte escolar público',
            20,
            publicTransport,
            'should_not_be_filled_mediation',
            'O campo não pode ser preenchido quando a mediação não é presencial ou semipresencial (campo 6 do registro 20 deve ser 1-Presencial ou 2-Semipresencial).',
            ValidationSeverity.ERROR,
          ),
        );
      } else if (!isCurricular) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'public_transport',
            'Utiliza transporte escolar público',
            20,
            publicTransport,
            'should_not_be_filled_curricular',
            'O campo não pode ser preenchido quando a turma não é curricular (campo 14 do registro 20 deve ser 1-Sim).',
            ValidationSeverity.ERROR,
          ),
        );
      } else if (!isBrazilResident) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'public_transport',
            'Utiliza transporte escolar público',
            20,
            publicTransport,
            'should_not_be_filled_foreign',
            'O campo não pode ser preenchido quando o aluno não reside no Brasil (campo 51 do registro 30 deve ser 76-Brasil).',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Validar autoridade do transporte
    const usesTransport = publicTransport === '1';

    if (
      usesTransport &&
      (!transportAuthority || transportAuthority.trim() === '')
    ) {
      errors.push(
        this.createError(
          lineNumber || 0,
          'transport_authority',
          'Poder público responsável pelo transporte escolar',
          21,
          transportAuthority,
          'required_when_transport',
          'O campo é obrigatório quando o aluno utiliza transporte público (campo 20 = 1-Sim).',
          ValidationSeverity.ERROR,
        ),
      );
    }

    if (
      !usesTransport &&
      transportAuthority &&
      transportAuthority.trim() !== ''
    ) {
      errors.push(
        this.createError(
          lineNumber || 0,
          'transport_authority',
          'Poder público responsável pelo transporte escolar',
          21,
          transportAuthority,
          'should_not_be_filled',
          'O campo não pode ser preenchido quando o aluno não utiliza transporte público (campo 20 deve ser 1-Sim).',
          ValidationSeverity.ERROR,
        ),
      );
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
            'vehicle_van',
            'vehicle_other_road',
            'vehicle_water_5',
            'vehicle_water_15',
            'vehicle_water_35',
            'vehicle_water_above',
          ];
          const vehicleDescriptions = [
            'Bicicleta',
            'Microônibus',
            'Ônibus',
            'Tração animal',
            'Van/Kombi',
            'Outro veículo rodoviário',
            'Embarcação até 5 passageiros',
            'Embarcação de 5 a 15 passageiros',
            'Embarcação de 15 a 35 passageiros',
            'Embarcação acima de 35 passageiros',
          ];

          errors.push(
            this.createError(
              lineNumber || 0,
              vehicleFieldNames[index],
              vehicleDescriptions[index],
              22 + index,
              field,
              'required_when_transport',
              'O campo é obrigatório quando o aluno utiliza transporte público (campo 20 = 1-Sim). Pelo menos um tipo de veículo deve ser informado.',
              ValidationSeverity.ERROR,
            ),
          );
        }
      });

      // Verificar se todos os campos preenchidos são 0 (não permitido)
      const filledVehicleFields = vehicleFields.filter(
        (field) => field && field.trim() !== '',
      );
      const allZero =
        filledVehicleFields.length > 0 &&
        filledVehicleFields.every((field) => field === '0');
      if (allZero) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'vehicle_types',
            'Tipo de veículo utilizado no transporte escolar',
            22,
            filledVehicleFields.join(', '),
            'at_least_one_vehicle_required',
            'Todas as opções de tipo de veículo utilizado no transporte escolar público foram preenchidas com 0 (Não).',
            ValidationSeverity.ERROR,
          ),
        );
      }

      // Verificar incompatibilidades (todos rodoviários ou todos aquaviários = 1)
      const roadVehicles = vehicleFields.slice(0, 6);
      const waterVehicles = vehicleFields.slice(6, 10);

      const allRoadOne = roadVehicles.every((field) => field === '1');
      const allWaterOne = waterVehicles.every((field) => field === '1');

      if (allRoadOne) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'road_vehicles',
            'Veículos rodoviários utilizados no transporte escolar',
            22,
            roadVehicles.join(', '),
            'all_road_vehicles_selected',
            'Todas as opções de tipo de veículo utilizado no transporte escolar público rodoviário foram preenchidas com 1 (Sim).',
            ValidationSeverity.ERROR,
          ),
        );
      }

      if (allWaterOne) {
        errors.push(
          this.createError(
            lineNumber || 0,
            'water_vehicles',
            'Veículos aquaviários utilizados no transporte escolar',
            28,
            waterVehicles.join(', '),
            'all_water_vehicles_selected',
            'Todas as opções de tipo de veículo utilizado no transporte escolar público aquaviário foram preenchidas com 1 (Sim).',
            ValidationSeverity.ERROR,
          ),
        );
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
            'vehicle_van',
            'vehicle_other_road',
            'vehicle_water_5',
            'vehicle_water_15',
            'vehicle_water_35',
            'vehicle_water_above',
          ];
          const vehicleDescriptions = [
            'Bicicleta',
            'Microônibus',
            'Ônibus',
            'Tração animal',
            'Van/Kombi',
            'Outro veículo rodoviário',
            'Embarcação até 5 passageiros',
            'Embarcação de 5 a 15 passageiros',
            'Embarcação de 15 a 35 passageiros',
            'Embarcação acima de 35 passageiros',
          ];

          errors.push(
            this.createError(
              lineNumber || 0,
              vehicleFieldNames[index],
              vehicleDescriptions[index],
              22 + index,
              field,
              'should_not_be_filled',
              'O campo não pode ser preenchido quando o aluno não utiliza transporte público (campo 20 deve ser 1-Sim).',
              ValidationSeverity.ERROR,
            ),
          );
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
