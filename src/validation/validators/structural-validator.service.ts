import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../common/interfaces/validation.interface';
import { RecordTypeEnum } from '../../common/enums/record-types.enum';

interface RecordStructure {
  type: string;
  lineNumber: number;
  fieldCount: number;
  schoolCode?: string;
}

interface SchoolStructure {
  schoolCode: string;
  situacaoFuncionamento: string;
  records: RecordStructure[];
  hasRecord00: boolean;
  hasRecord10: boolean;
  hasRecord20: boolean;
  hasRecord30: boolean;
  hasRecord40: boolean;
  hasRecord50: boolean;
  hasRecord60: boolean;
  record40Count: number;
  classesWithStudents: Set<string>;
  classesWithProfessionals: Set<string>;
  allClasses: Set<string>;
}

@Injectable()
export class StructuralValidatorService {
  private readonly EXPECTED_FIELD_COUNT = {
    '00': 56,
    '10': 187,
    '20': 70,
    '30': 108,
    '40': 7,
    '50': 38,
    '60': 32,
  };

  validateStructure(records: string[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const recordStructures: RecordStructure[] = [];
    const schoolStructures = new Map<string, SchoolStructure>();

    let hasRecord99 = false;
    let totalSchools = 0;
    let currentSchool: string | null = null;

    // Sempre validar regras gerais que independem da estrutura dos campos
    this.validateAlwaysRequiredRules(records, errors);

    // Primeira passada: analisar estrutura básica dos registros
    for (let i = 0; i < records.length; i++) {
      const lineNumber = i + 1;
      const record = records[i].trim();

      if (!record) continue;

      const parts = record.split('|');
      const recordType = parts[0] || '';

      // Verificar se é o registro de fim de arquivo
      if (recordType === '99') {
        hasRecord99 = true;
        continue;
      }

      // Validar número de campos esperados
      const expectedCount = this.EXPECTED_FIELD_COUNT[recordType];
      if (expectedCount && parts.length !== expectedCount) {
        errors.push({
          lineNumber,
          recordType,
          fieldName: 'field_count',
          fieldPosition: -1,
          fieldValue: parts.length.toString(),
          ruleName: 'field_count_validation',
          errorMessage: `Registro ${recordType} com número de campos diferente de ${expectedCount}, foram encontrados ${parts.length} campos.`,
          severity: 'error',
        });

        // Se o número de campos está errado, não validar outras regras para este registro
        continue;
      }

      const structure: RecordStructure = {
        type: recordType,
        lineNumber,
        fieldCount: parts.length,
      };

      if (recordType === '00') {
        currentSchool = parts[1] || '';
        structure.schoolCode = currentSchool;
        totalSchools++;

        if (!schoolStructures.has(currentSchool)) {
          schoolStructures.set(currentSchool, {
            schoolCode: currentSchool,
            situacaoFuncionamento: parts[2] || '',
            records: [],
            hasRecord00: false,
            hasRecord10: false,
            hasRecord20: false,
            hasRecord30: false,
            hasRecord40: false,
            hasRecord50: false,
            hasRecord60: false,
            record40Count: 0,
            classesWithStudents: new Set(),
            classesWithProfessionals: new Set(),
            allClasses: new Set(),
          });
        }

        const schoolStructure = schoolStructures.get(currentSchool)!;
        if (schoolStructure.hasRecord00) {
          errors.push({
            lineNumber,
            recordType: '00',
            fieldName: 'school_duplicate',
            fieldPosition: 1,
            fieldValue: currentSchool,
            ruleName: 'duplicate_school',
            errorMessage: `Estrutura da escola incorreta. A escola ${currentSchool} possui mais de um registro 00.`,
            severity: 'error',
          });
        }
        schoolStructure.hasRecord00 = true;
      } else if (currentSchool) {
        structure.schoolCode = currentSchool;
        const schoolStructure = schoolStructures.get(currentSchool);
        if (schoolStructure) {
          switch (recordType) {
            case '10':
              schoolStructure.hasRecord10 = true;
              break;
            case '20':
              schoolStructure.hasRecord20 = true;
              schoolStructure.allClasses.add(parts[2] || ''); // código da turma
              break;
            case '30':
              schoolStructure.hasRecord30 = true;
              break;
            case '40':
              schoolStructure.hasRecord40 = true;
              schoolStructure.record40Count++;
              break;
            case '50':
              schoolStructure.hasRecord50 = true;
              if (parts[4]) {
                // código da turma
                schoolStructure.classesWithProfessionals.add(parts[4]);
              }
              break;
            case '60':
              schoolStructure.hasRecord60 = true;
              if (parts[4]) {
                // código da turma
                schoolStructure.classesWithStudents.add(parts[4]);
              }
              break;
          }
        }
      }

      recordStructures.push(structure);
    }

    // Validar sequência de registros
    this.validateRecordSequence(recordStructures, errors);

    // Validar estrutura das escolas
    this.validateSchoolStructures(schoolStructures, errors);

    // Validar regras gerais
    this.validateGeneralRules(totalSchools, hasRecord99, errors);

    return errors;
  }

  /**
   * Validar regras que sempre devem ser verificadas independentemente de erros de estrutura
   */
  private validateAlwaysRequiredRules(
    records: string[],
    errors: ValidationError[],
  ): void {
    let hasRecord99 = false;
    let totalSchools = 0;

    // Verificar presença de registro 99 e contar escolas
    for (let i = 0; i < records.length; i++) {
      const record = records[i].trim();
      if (!record) continue;

      const parts = record.split('|');
      const recordType = parts[0] || '';

      if (recordType === '99') {
        hasRecord99 = true;
      } else if (recordType === '00') {
        totalSchools++;
      }
    }

    // Validar limite de escolas por arquivo (máximo 100)
    if (totalSchools > 100) {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'school_limit',
        fieldPosition: 0,
        fieldValue: totalSchools.toString(),
        ruleName: 'too_many_schools',
        errorMessage: 'Número de escola por arquivo (100 escolas) excedido.',
        severity: 'error',
      });
    }

    // Validar presença do registro 99
    if (!hasRecord99) {
      errors.push({
        lineNumber: 0,
        recordType: '99',
        fieldName: 'end_record',
        fieldPosition: 0,
        fieldValue: '',
        ruleName: 'missing_end_record',
        errorMessage: 'Arquivo incompleto. Não localizado o registro 99.',
        severity: 'error',
      });
    }
  }

  private validateRecordSequence(
    records: RecordStructure[],
    errors: ValidationError[],
  ): void {
    let previousRecordType: string | null = null;

    for (const record of records) {
      const { type, lineNumber } = record;

      if (type === '99') continue;

      let isValidSequence = false;
      let expectedAfter = '';

      switch (type) {
        case '00':
          // Deve vir no começo ou após 40 ou 60
          isValidSequence =
            previousRecordType === null ||
            previousRecordType === '40' ||
            previousRecordType === '60';
          expectedAfter = 'começo do arquivo, registro 40 ou registro 60';
          break;
        case '10':
          // Deve vir após 00
          isValidSequence = previousRecordType === '00';
          expectedAfter = 'registro 00';
          break;
        case '20':
          // Deve vir após 10 ou 20
          isValidSequence =
            previousRecordType === '10' || previousRecordType === '20';
          expectedAfter = 'registro 10 ou registro 20';
          break;
        case '30':
          // Deve vir após 00, 20 ou 30
          isValidSequence =
            previousRecordType === '00' ||
            previousRecordType === '20' ||
            previousRecordType === '30';
          expectedAfter = 'registro 00, registro 20 ou registro 30';
          break;
        case '40':
          // Deve vir após 30 ou 40
          isValidSequence =
            previousRecordType === '30' || previousRecordType === '40';
          expectedAfter = 'registro 30 ou registro 40';
          break;
        case '50':
          // Deve vir após 40 ou 50
          isValidSequence =
            previousRecordType === '40' || previousRecordType === '50';
          expectedAfter = 'registro 40 ou registro 50';
          break;
        case '60':
          // Deve vir após 50 ou 60
          isValidSequence =
            previousRecordType === '50' || previousRecordType === '60';
          expectedAfter = 'registro 50 ou registro 60';
          break;
      }

      if (!isValidSequence && previousRecordType) {
        errors.push({
          lineNumber,
          recordType: type,
          fieldName: 'record_sequence',
          fieldPosition: 0,
          fieldValue: type,
          ruleName: 'invalid_record_sequence',
          errorMessage: `Registro ${type} declarado em linha inadequada, após o registro ${previousRecordType}.`,
          severity: 'error',
        });
      }

      previousRecordType = type;
    }
  }

  private validateSchoolStructures(
    schoolStructures: Map<string, SchoolStructure>,
    errors: ValidationError[],
  ): void {
    for (const [schoolCode, school] of schoolStructures) {
      const situacao = school.situacaoFuncionamento;

      // Validar número de gestores (máximo 3 registros 40)
      if (school.record40Count > 3) {
        errors.push({
          lineNumber: 0,
          recordType: '40',
          fieldName: 'manager_limit',
          fieldPosition: 0,
          fieldValue: school.record40Count.toString(),
          ruleName: 'too_many_managers',
          errorMessage:
            'A escola não pode ter mais que três gestores escolares.',
          severity: 'error',
        });
      }

      // Validar estrutura baseada na situação de funcionamento
      if (situacao === '2' || situacao === '3') {
        // Paralisada ou Extinta
        // Deve ter apenas 00, 30 e 40
        if (!school.hasRecord00 || !school.hasRecord30 || !school.hasRecord40) {
          errors.push({
            lineNumber: 0,
            recordType: '00',
            fieldName: 'school_structure',
            fieldPosition: 2,
            fieldValue: situacao,
            ruleName: 'incomplete_inactive_school',
            errorMessage:
              'Estrutura da escola incorreta, escola com estrutura diferente a sua situação de funcionamento.',
            severity: 'error',
          });
        }

        // Não deve ter outros registros
        if (
          school.hasRecord10 ||
          school.hasRecord20 ||
          school.hasRecord50 ||
          school.hasRecord60
        ) {
          const invalidRecords: string[] = [];
          if (school.hasRecord10) invalidRecords.push('10');
          if (school.hasRecord20) invalidRecords.push('20');
          if (school.hasRecord50) invalidRecords.push('50');
          if (school.hasRecord60) invalidRecords.push('60');

          for (const recordType of invalidRecords) {
            errors.push({
              lineNumber: 0,
              recordType,
              fieldName: 'record_not_allowed',
              fieldPosition: 0,
              fieldValue: recordType,
              ruleName: 'invalid_record_for_inactive_school',
              errorMessage: `O registro ${recordType} declarado não faz parte do escopo do educacenso para escolas que não estão em atividade.`,
              severity: 'error',
            });
          }
        }
      } else if (situacao === '1') {
        // Em atividade
        // Deve ter todos os registros principais
        const missingRecords: string[] = [];
        if (!school.hasRecord00) missingRecords.push('00');
        if (!school.hasRecord10) missingRecords.push('10');
        if (!school.hasRecord20) missingRecords.push('20');
        if (!school.hasRecord30) missingRecords.push('30');
        if (!school.hasRecord40) missingRecords.push('40');

        if (missingRecords.length > 0) {
          errors.push({
            lineNumber: 0,
            recordType: '00',
            fieldName: 'school_structure',
            fieldPosition: 2,
            fieldValue: situacao,
            ruleName: 'incomplete_active_school',
            errorMessage:
              'Estrutura da escola incorreta, escola com estrutura diferente a sua situação de funcionamento.',
            severity: 'error',
          });
        }
      }

      // Validar que todas as turmas tenham alunos
      if (school.hasRecord20) {
        for (const classCode of school.allClasses) {
          if (!school.classesWithStudents.has(classCode)) {
            errors.push({
              lineNumber: 0,
              recordType: '20',
              fieldName: 'class_without_students',
              fieldPosition: 2,
              fieldValue: classCode,
              ruleName: 'class_needs_students',
              errorMessage: 'Turma informada sem aluno(a) vinculado a ela.',
              severity: 'error',
            });
          }
        }
      }

      // Validar que todas as turmas tenham profissionais
      if (school.hasRecord20) {
        for (const classCode of school.allClasses) {
          if (!school.classesWithProfessionals.has(classCode)) {
            errors.push({
              lineNumber: 0,
              recordType: '20',
              fieldName: 'class_without_professionals',
              fieldPosition: 2,
              fieldValue: classCode,
              ruleName: 'class_needs_professionals',
              errorMessage:
                'Turma informada sem profissional escolar em sala de aula vinculado a ela.',
              severity: 'error',
            });
          }
        }
      }

      // Validar limite de turmas por escola (máximo 1.500)
      if (school.allClasses.size > 1500) {
        errors.push({
          lineNumber: 0,
          recordType: '20',
          fieldName: 'class_limit',
          fieldPosition: 0,
          fieldValue: school.allClasses.size.toString(),
          ruleName: 'too_many_classes',
          errorMessage: 'Número de turmas por escola (1.500 turmas) excedido.',
          severity: 'error',
        });
      }
    }
  }

  private validateGeneralRules(
    totalSchools: number,
    hasRecord99: boolean,
    errors: ValidationError[],
  ): void {
    // Validar limite de escolas por arquivo (máximo 100)
    if (totalSchools > 100) {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'school_limit',
        fieldPosition: 0,
        fieldValue: totalSchools.toString(),
        ruleName: 'too_many_schools',
        errorMessage: 'Número de escola por arquivo (100 escolas) excedido.',
        severity: 'error',
      });
    }

    // Validar presença do registro 99
    if (!hasRecord99) {
      errors.push({
        lineNumber: 0,
        recordType: '99',
        fieldName: 'end_record',
        fieldPosition: 0,
        fieldValue: '',
        ruleName: 'missing_end_record',
        errorMessage: 'Arquivo incompleto. Não localizado o registro 99.',
        severity: 'error',
      });
    }
  }

  /**
   * Validar caracteres não permitidos nos campos
   */
  validateCharacters(content: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i];

      if (!line.trim()) continue;

      const parts = line.split('|');
      const recordType = parts[0] || '';

      if (recordType === '99') continue;

      // Verificar caracteres não permitidos
      const invalidCharsPattern = /[a-z\u00C0-\u00FF]/; // minúsculas e acentos

      for (let fieldIndex = 0; fieldIndex < parts.length; fieldIndex++) {
        const fieldValue = parts[fieldIndex];

        if (fieldValue && invalidCharsPattern.test(fieldValue)) {
          const invalidChars = fieldValue.match(invalidCharsPattern)?.[0] || '';

          errors.push({
            lineNumber,
            recordType,
            fieldName: `field_${fieldIndex}`,
            fieldPosition: fieldIndex,
            fieldValue: fieldValue,
            ruleName: 'invalid_characters',
            errorMessage: `O campo contém caractere(s) não permitido(s): "${invalidChars}".`,
            severity: 'error',
          });
        }
      }
    }

    return errors;
  }

  /**
   * Validar codificação de caracteres (ISO-8859-1)
   */
  validateEncoding(content: string): ValidationError[] {
    const errors: ValidationError[] = [];

    try {
      // Verificar se há caracteres que não são compatíveis com ISO-8859-1
      const encoder = new TextEncoder();
      const bytes = encoder.encode(content);

      // ISO-8859-1 permite apenas caracteres de 0x00 a 0xFF
      for (let i = 0; i < content.length; i++) {
        const charCode = content.charCodeAt(i);
        if (charCode > 255) {
          errors.push({
            lineNumber: 0,
            recordType: 'FILE',
            fieldName: 'encoding',
            fieldPosition: i,
            fieldValue: content.charAt(i),
            ruleName: 'invalid_encoding',
            errorMessage:
              'Para a geração do arquivo deve ser utilizado o padrão ISO-8859-1 de codificação de caracteres.',
            severity: 'error',
          });
        }
      }
    } catch (error) {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'encoding',
        fieldPosition: 0,
        fieldValue: '',
        ruleName: 'encoding_error',
        errorMessage: 'Erro ao validar codificação do arquivo.',
        severity: 'error',
      });
    }

    return errors;
  }
}
