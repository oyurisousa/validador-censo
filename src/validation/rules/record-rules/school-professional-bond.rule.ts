import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import { ValidationError } from '../../../common/interfaces/validation.interface';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../../common/enums/record-types.enum';

// Knowledge areas/subjects table (commonly used codes)
const KNOWLEDGE_AREAS = {
  '01': 'Língua Portuguesa',
  '02': 'Matemática',
  '03': 'Ciências',
  '04': 'Geografia',
  '05': 'História',
  '06': 'Arte',
  '07': 'Educação Física',
  '08': 'Língua Estrangeira - Inglês',
  '09': 'Língua Estrangeira - Espanhol',
  '10': 'Língua Estrangeira - Francês',
  '11': 'Ensino Religioso',
  '12': 'Estudos Sociais',
  '13': 'Filosofia',
  '14': 'Sociologia',
  '15': 'Física',
  '16': 'Química',
  '17': 'Biologia',
  '18': 'Informática/Computação',
  '19': 'Libras',
  '20': 'Língua Indígena',
  '21': 'Outras',
  '22': 'Projeto de Vida',
  '23': 'Eletiva',
  '24': 'Trilha de Aprofundamento',
  '25': 'IFTP',
};

export interface ClassContext {
  classCode: string;
  inepCode?: string;
  teachingMediation?: number; // Field 6
  isRegular?: boolean; // Field 14
  isComplementaryActivity?: boolean; // Field 19
  stage?: number; // Field 26
  hasFormativeItinerary?: boolean; // Field 35
  hasProfessionalItinerary?: boolean; // Field 36
  subjectAreas?: { [key: string]: boolean }; // Fields 43-69 from record 20
  students?: Array<{
    personCode: string;
    hasHearingImpairment?: boolean;
    hasDeafness?: boolean;
    hasDeafBlindness?: boolean;
  }>;
}

export interface PersonContext {
  personCode: string;
  inepId?: string;
  hearingImpairment?: boolean;
  deafness?: boolean;
  deafBlindness?: boolean;
  enrolledClasses?: string[]; // Classes where person is enrolled as student
}

export interface SchoolContext {
  schoolCode: string;
  administrativeDependency?: number;
  classes?: ClassContext[];
  persons?: PersonContext[];
}

@Injectable()
export class SchoolProfessionalBondRule extends BaseRecordRule {
  protected recordType = RecordTypeEnum.SCHOOL_PROFESSIONAL_LINKS;

  protected fields: FieldRule[] = [
    {
      position: 0,
      name: 'record_type',
      required: true,
      maxLength: 2,
      pattern: /^50$/,
      type: 'string',
      description: 'Tipo de registro',
    },
    {
      position: 1,
      name: 'school_code',
      required: true,
      maxLength: 8,
      minLength: 8,
      pattern: /^\d{8}$/,
      type: 'number',
      description: 'Código de escola - Inep',
    },
    {
      position: 2,
      name: 'person_code',
      required: true,
      maxLength: 20,
      type: 'string',
      description: 'Código da pessoa física no sistema próprio',
    },
    {
      position: 3,
      name: 'inep_id',
      required: false,
      maxLength: 12,
      minLength: 12,
      pattern: /^\d{12}$/,
      type: 'number',
      description: 'Identificação única (Inep)',
    },
    {
      position: 4,
      name: 'class_code',
      required: true,
      maxLength: 20,
      type: 'string',
      description: 'Código da Turma na Entidade/Escola',
    },
    {
      position: 5,
      name: 'inep_class_code',
      required: false,
      maxLength: 10,
      type: 'number',
      description: 'Código da turma no INEP',
    },
    {
      position: 6,
      name: 'function',
      required: true,
      maxLength: 1,
      pattern: /^[123456789]$/,
      type: 'code',
      description: 'Função que exerce na turma',
    },
    {
      position: 7,
      name: 'functional_status',
      required: false,
      maxLength: 1,
      pattern: /^[1234]$/,
      type: 'code',
      description: 'Situação funcional/regime de contratação/tipo de vínculo',
      conditionalRequired: {
        field: 'function',
        values: ['1', '5', '6'],
        andField: 'administrative_dependency',
        andValues: ['1', '2', '3'],
      },
    },
    // Knowledge areas fields 8-32 (positions 8-32)
    ...Array.from({ length: 25 }, (_, i) => ({
      position: 8 + i,
      name: `knowledge_area_${i + 1}`,
      required: false,
      maxLength: 2,
      type: 'code' as const,
      description: `Código ${i + 1} - Área do conhecimento/componente curricular`,
    })),
    // Formative itinerary areas fields 33-36 (positions 33-36)
    {
      position: 33,
      name: 'languages_tech',
      required: false,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Linguagens e suas tecnologias',
    },
    {
      position: 34,
      name: 'mathematics_tech',
      required: false,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Matemática e suas tecnologias',
    },
    {
      position: 35,
      name: 'natural_sciences_tech',
      required: false,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Ciências da natureza e suas tecnologias',
    },
    {
      position: 36,
      name: 'human_sciences_tech',
      required: false,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Ciências humanas e sociais aplicadas',
    },
    // Professional itinerary field 37 (position 37)
    {
      position: 37,
      name: 'professional_itinerary',
      required: false,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Profissional escolar leciona no Itinerário de formação técnica e profissional (IFTP)',
    },
  ];

  validateWithContext(
    fields: string[],
    schoolContext?: SchoolContext,
    classContext?: ClassContext,
    personContext?: PersonContext,
    lineNumber: number = 0,
  ): ValidationError[] {
    const errors = this.validate(fields, lineNumber);

    // Always validate school code if we have school context (doesn't depend on class or person context)
    if (schoolContext) {
      errors.push(
        ...this.validateSchoolCodeWithContext(
          fields[1],
          schoolContext,
          lineNumber,
        ),
      );
    }

    // Only do other cross-reference validations if we have all contexts
    if (!schoolContext || !classContext || !personContext) {
      return errors;
    }

    // Cross-reference validations that require all contexts
    errors.push(
      ...this.validatePersonCodeWithContext(
        fields[2],
        schoolContext,
        personContext,
        lineNumber,
      ),
    );
    errors.push(
      ...this.validateInepIdWithContext(fields[3], personContext, lineNumber),
    );
    errors.push(
      ...this.validateClassCodeWithContext(
        fields[4],
        schoolContext,
        lineNumber,
      ),
    );
    errors.push(
      ...this.validateFunctionWithContext(
        fields[6],
        classContext,
        schoolContext,
        lineNumber,
      ),
    );
    errors.push(
      ...this.validateFunctionalStatusWithContext(
        fields[7],
        fields[6],
        schoolContext,
        lineNumber,
      ),
    );
    errors.push(
      ...this.validateKnowledgeAreasWithContext(
        fields.slice(8, 33),
        fields[6],
        classContext,
        lineNumber,
      ),
    );
    errors.push(
      ...this.validateFormativeItineraryAreasWithContext(
        fields.slice(33, 37),
        fields[6],
        classContext,
        lineNumber,
      ),
    );
    errors.push(
      ...this.validateProfessionalItineraryWithContext(
        fields[37],
        fields[6],
        classContext,
        lineNumber,
      ),
    );
    errors.push(
      ...this.validateStudentConflict(
        fields[2],
        fields[4],
        personContext,
        lineNumber,
      ),
    );
    errors.push(
      ...this.validateLibrasRequirements(fields[6], classContext, lineNumber),
    );

    return errors;
  }

  protected validateBusinessRules(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Field 5 (inep_class_code) should not be filled
    if (parts[5] && parts[5].trim() !== '') {
      errors.push(
        this.createError(
          lineNumber,
          'inep_class_code',
          'Código da turma no Inep',
          5,
          parts[5],
          'should_not_be_filled',
          'O campo foi preenchido quando deveria não ser preenchido.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Validate knowledge areas for duplicates
    const knowledgeAreas = parts
      .slice(8, 33)
      .filter((area) => area && area.trim() !== '');
    const uniqueAreas = new Set(knowledgeAreas);
    if (knowledgeAreas.length !== uniqueAreas.size) {
      errors.push(
        this.createError(
          lineNumber,
          'knowledge_areas',
          'Áreas do conhecimento/componentes curriculares',
          8,
          knowledgeAreas.join(', '),
          'duplicate_areas',
          '"Áreas do conhecimento/componentes curriculares que leciona" não foram preenchidas corretamente. Não podem ser informadas duas Áreas do conhecimento/componentes curriculares iguais.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Validate each knowledge area code
    knowledgeAreas.forEach((area, index) => {
      if (area && !KNOWLEDGE_AREAS[area]) {
        errors.push(
          this.createError(
            lineNumber,
            `knowledge_area_${index + 1}`,
            `Área do conhecimento/componente curricular ${index + 1}`,
            8 + index,
            area,
            'invalid_knowledge_area',
            'O campo foi preenchido com valor não permitido.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    });

    // Validate formative itinerary areas - cannot all be "0" (No)
    const formativeAreas = parts.slice(33, 37);
    const filledFormativeAreas = formativeAreas.filter(
      (area) => area && area.trim() !== '',
    );
    if (
      filledFormativeAreas.length > 0 &&
      filledFormativeAreas.every((area) => area === '0')
    ) {
      errors.push(
        this.createError(
          lineNumber,
          'formative_itinerary_areas',
          'Áreas do itinerário formativo',
          33,
          filledFormativeAreas.join(', '),
          'all_formative_areas_no',
          '"Área(s) do itinerário formativo" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não).',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }

  // Context validations
  private validateSchoolCodeWithContext(
    schoolCode: string,
    schoolContext: SchoolContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (schoolCode !== schoolContext.schoolCode) {
      errors.push(
        this.createError(
          lineNumber,
          'school_code',
          'Código de escola - Inep',
          1,
          schoolCode,
          'school_code_mismatch',
          'O campo "Código de escola - Inep" está diferente do registro 00 antecedente.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }

  private validatePersonCodeWithContext(
    personCode: string,
    schoolContext: SchoolContext,
    personContext: PersonContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const personExists = schoolContext.persons?.some(
      (p) => p.personCode === personCode,
    );
    if (!personExists) {
      errors.push(
        this.createError(
          lineNumber,
          'person_code',
          'Código da pessoa física no sistema próprio',
          2,
          personCode,
          'person_not_found',
          'Não há pessoa física com esse código nesta escola.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }

  private validateInepIdWithContext(
    inepId: string,
    personContext: PersonContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (inepId && inepId.trim() !== '' && inepId !== personContext.inepId) {
      errors.push(
        this.createError(
          lineNumber,
          'inep_id',
          'Identificação única/INEP',
          3,
          inepId,
          'inep_id_mismatch',
          'O campo está diferente da "Identificação Única (Inep)" do registro 30 correspondente.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }

  private validateClassCodeWithContext(
    classCode: string,
    schoolContext: SchoolContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const classExists = schoolContext.classes?.some(
      (c) => c.classCode === classCode,
    );
    if (!classExists) {
      errors.push(
        this.createError(
          lineNumber,
          'class_code',
          'Código da turma no sistema próprio',
          4,
          classCode,
          'class_not_found',
          'Não há turma com esse código nesta escola.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }

  private validateFunctionWithContext(
    functionCode: string,
    classContext: ClassContext,
    schoolContext: SchoolContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!functionCode) return errors;

    const teachingMediation = classContext.teachingMediation;
    const stage = classContext.stage;
    const isRegular = classContext.isRegular;
    const isComplementaryActivity = classContext.isComplementaryActivity;
    const hasProfessionalItinerary = classContext.hasProfessionalItinerary;

    // Rule 3: Functions 1,2,3,4,7,8 only for presential or semi-presential
    if (['1', '2', '3', '4', '7', '8'].includes(functionCode)) {
      if (teachingMediation !== 1 && teachingMediation !== 2) {
        errors.push(
          this.createError(
            lineNumber,
            'function',
            'Função',
            6,
            functionCode,
            'invalid_function_for_mediation',
            'O campo não pode ser preenchido com 1 (Docente), 2 (Auxiliar/Assistente educacional), 3 (Profissional/Monitor de atividade complementar), 4 (Tradutor-Intérprete de LIBRAS), 7 (Guia-Intérprete de Libras) ou 8 (Profissional de apoio escolar para aluno(a)s com deficiência) quando o tipo de mediação didático-pedagógica da turma não for presencial ou semipresencial.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Rule 4: Function 2 only for regular classes
    if (functionCode === '2' && !isRegular) {
      errors.push(
        this.createError(
          lineNumber,
          'function',
          'Função',
          6,
          functionCode,
          'invalid_function_for_class_type',
          'O campo não pode ser preenchido com 2 (Auxiliar/Assistente educacional) quando o tipo da turma não for Curricular (etapa de ensino).',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Rule 5: Function 3 only for complementary activity classes
    if (functionCode === '3' && !isComplementaryActivity) {
      errors.push(
        this.createError(
          lineNumber,
          'function',
          'Função',
          6,
          functionCode,
          'invalid_function_for_activity_type',
          'O campo não pode ser preenchido com 3 (Profissional/Monitor de atividade complementar) quando o tipo de atendimento da turma não for de atividade complementar.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Rule 6: Function 5 only for distance learning
    if (functionCode === '5' && teachingMediation !== 3) {
      errors.push(
        this.createError(
          lineNumber,
          'function',
          'Função',
          6,
          functionCode,
          'invalid_function_for_ead',
          'O campo não pode ser preenchido com 5 (Docente titular - coordenador de tutoria - EAD) quando o tipo de mediação didático-pedagógica da turma não for preenchido com 3 (Educação a distância).',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Rule 7: Function 6 only for distance learning
    if (functionCode === '6' && teachingMediation !== 3) {
      errors.push(
        this.createError(
          lineNumber,
          'function',
          'Função',
          6,
          functionCode,
          'invalid_tutor_function',
          'O campo não pode ser preenchido com 6 (Docente tutor) quando o tipo de mediação didático-pedagógica da turma não for preenchido com 3 (Educação a distância).',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Rule 8: Function 9 only for professional education
    if (functionCode === '9') {
      if (
        !hasProfessionalItinerary ||
        ![39, 40, 73, 74, 64, 67, 68].includes(stage || 0)
      ) {
        errors.push(
          this.createError(
            lineNumber,
            'function',
            'Função',
            6,
            functionCode,
            'invalid_instructor_function',
            'O campo não pode ser preenchido com 9 (Instrutor da Educação Profissional) quando a organização curricular da turma não for "Itinerário de formação técnica e profissional" e a etapa da turma não for 39, 40, 73, 74, 64, 67 e 68.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    return errors;
  }

  private validateFunctionalStatusWithContext(
    functionalStatus: string,
    functionCode: string,
    schoolContext: SchoolContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const isTeacherFunction = ['1', '5', '6'].includes(functionCode);
    const isPublicSchool = [1, 2, 3].includes(
      schoolContext.administrativeDependency || 0,
    );

    if (isTeacherFunction && isPublicSchool) {
      if (!functionalStatus || functionalStatus.trim() === '') {
        errors.push(
          this.createError(
            lineNumber,
            'functional_status',
            'Situação funcional/Regime de contratação/Tipo de vínculo',
            7,
            functionalStatus,
            'functional_status_required',
            'O campo não foi preenchido quando deveria ser preenchido.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    } else if (
      !isTeacherFunction &&
      functionalStatus &&
      functionalStatus.trim() !== ''
    ) {
      errors.push(
        this.createError(
          lineNumber,
          'functional_status',
          'Situação funcional/Regime de contratação/Tipo de vínculo',
          7,
          functionalStatus,
          'functional_status_not_allowed',
          'O campo foi preenchido quando deveria não ser preenchido.',
          ValidationSeverity.ERROR,
        ),
      );
    } else if (
      isTeacherFunction &&
      !isPublicSchool &&
      functionalStatus &&
      functionalStatus.trim() !== ''
    ) {
      errors.push(
        this.createError(
          lineNumber,
          'functional_status',
          'Situação funcional/Regime de contratação/Tipo de vínculo',
          7,
          functionalStatus,
          'functional_status_private_school',
          'O campo foi preenchido quando deveria não ser preenchido.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }

  private validateKnowledgeAreasWithContext(
    knowledgeAreas: string[],
    functionCode: string,
    classContext: ClassContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const isTeacherFunction = ['1', '5'].includes(functionCode);
    const stage = classContext.stage;
    const hasFormativeItinerary = classContext.hasFormativeItinerary;

    knowledgeAreas.forEach((area, index) => {
      if (area && area.trim() !== '') {
        // Rule: Only for teacher functions
        if (!isTeacherFunction) {
          errors.push(
            this.createError(
              lineNumber,
              `knowledge_area_${index + 1}`,
              `Área do conhecimento/componente curricular ${index + 1}`,
              8 + index,
              area,
              'knowledge_area_not_allowed',
              'O campo foi preenchido quando deveria não ser preenchido.',
              ValidationSeverity.ERROR,
            ),
          );
          return;
        }

        // Rule: Not for stages 1, 2, 3 (early childhood)
        if (!stage || [1, 2, 3].includes(stage)) {
          errors.push(
            this.createError(
              lineNumber,
              `knowledge_area_${index + 1}`,
              `Área do conhecimento/componente curricular ${index + 1}`,
              8 + index,
              area,
              'knowledge_area_invalid_stage',
              'O campo foi preenchido quando deveria não ser preenchido.',
              ValidationSeverity.ERROR,
            ),
          );
          return;
        }

        // Rule: Must be offered by the class
        if (classContext.subjectAreas && !classContext.subjectAreas[area]) {
          errors.push(
            this.createError(
              lineNumber,
              `knowledge_area_${index + 1}`,
              `Área do conhecimento/componente curricular ${index + 1}`,
              8 + index,
              area,
              'knowledge_area_not_offered',
              'O campo não pode ser preenchido com uma área do conhecimento/componente curricular que não foi informada na turma ou foi informada sem docente.',
              ValidationSeverity.ERROR,
            ),
          );
        }
      }
    });

    // Rule: First code is mandatory for teachers in certain conditions
    if (isTeacherFunction && stage && ![1, 2, 3].includes(stage)) {
      const firstArea = knowledgeAreas[0];
      const hasItineraryAreas = hasFormativeItinerary;

      if ((!firstArea || firstArea.trim() === '') && !hasItineraryAreas) {
        errors.push(
          this.createError(
            lineNumber,
            'knowledge_area_1',
            'Área do conhecimento/componente curricular 1',
            8,
            firstArea || '',
            'first_knowledge_area_required',
            'O campo não foi preenchido quando deveria ser preenchido.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    return errors;
  }

  private validateFormativeItineraryAreasWithContext(
    areas: string[],
    functionCode: string,
    classContext: ClassContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const isTeacherFunction = ['1', '5'].includes(functionCode);
    const hasFormativeItinerary = classContext.hasFormativeItinerary;

    areas.forEach((area, index) => {
      const fieldNames = [
        'languages_tech',
        'mathematics_tech',
        'natural_sciences_tech',
        'human_sciences_tech',
      ];

      if (area && area.trim() !== '') {
        // Must be teacher function
        if (!isTeacherFunction) {
          errors.push(
            this.createError(
              lineNumber,
              fieldNames[index],
              'Área do itinerário formativo',
              33 + index,
              area,
              'formative_area_not_allowed',
              'O campo foi preenchido quando deveria não ser preenchido.',
              ValidationSeverity.ERROR,
            ),
          );
        }

        // Must have formative itinerary
        if (!hasFormativeItinerary) {
          errors.push(
            this.createError(
              lineNumber,
              fieldNames[index],
              'Área do itinerário formativo',
              33 + index,
              area,
              'formative_area_no_itinerary',
              'O campo foi preenchido quando deveria não ser preenchido.',
              ValidationSeverity.ERROR,
            ),
          );
        }
      } else if (isTeacherFunction && hasFormativeItinerary) {
        // Must be filled when conditions are met
        errors.push(
          this.createError(
            lineNumber,
            fieldNames[index],
            'Área do itinerário formativo',
            33 + index,
            area || '',
            'formative_area_required',
            'O campo não foi preenchido quando deveria ser preenchido.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    });

    return errors;
  }

  private validateProfessionalItineraryWithContext(
    professionalItinerary: string,
    functionCode: string,
    classContext: ClassContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    const isValidFunction = ['1', '5', '9'].includes(functionCode);
    const hasProfessionalItinerary = classContext.hasProfessionalItinerary;

    if (professionalItinerary && professionalItinerary.trim() !== '') {
      // Must be valid function
      if (!isValidFunction) {
        errors.push(
          this.createError(
            lineNumber,
            'professional_itinerary',
            'Itinerário de formação técnica e profissional',
            37,
            professionalItinerary,
            'professional_itinerary_not_allowed',
            'O campo foi preenchido quando deveria não ser preenchido.',
            ValidationSeverity.ERROR,
          ),
        );
      }

      // Must have professional itinerary
      if (!hasProfessionalItinerary) {
        errors.push(
          this.createError(
            lineNumber,
            'professional_itinerary',
            'Itinerário de formação técnica e profissional',
            37,
            professionalItinerary,
            'professional_itinerary_no_class_support',
            'O campo foi preenchido quando deveria não ser preenchido.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    } else if (isValidFunction && hasProfessionalItinerary) {
      // Must be filled when conditions are met
      errors.push(
        this.createError(
          lineNumber,
          'professional_itinerary',
          'Itinerário de formação técnica e profissional',
          37,
          professionalItinerary || '',
          'professional_itinerary_required',
          'O campo não foi preenchido quando deveria ser preenchido.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }

  private validateStudentConflict(
    personCode: string,
    classCode: string,
    personContext: PersonContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (personContext.enrolledClasses?.includes(classCode)) {
      errors.push(
        this.createError(
          lineNumber,
          'class_code',
          'Código da turma no sistema próprio',
          4,
          classCode,
          'student_teacher_conflict',
          'O profissional escolar em sala de aula não pode ser vinculado a uma turma na qual ele é aluno.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }

  private validateLibrasRequirements(
    functionCode: string,
    classContext: ClassContext,
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    if (functionCode === '4') {
      // Libras translator
      const hasStudentWithHearingIssues = classContext.students?.some(
        (student) =>
          student.hasHearingImpairment ||
          student.hasDeafness ||
          student.hasDeafBlindness,
      );

      if (!hasStudentWithHearingIssues) {
        errors.push(
          this.createError(
            lineNumber,
            'function',
            'Função',
            6,
            functionCode,
            'libras_no_student_need',
            'O campo não pode ser preenchido com 4 (Tradutor-Intérprete de Libras) quando não há aluno(a) ou profissional escolar em sala de aula com surdez, surdocegueira ou deficiência auditiva vinculado à turma.',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    return errors;
  }
}
