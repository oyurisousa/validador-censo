import { ValidationError } from '../../common/interfaces/validation.interface';
import { ValidationSeverity } from '../../common/enums/record-types.enum';

/**
 * Interface para estrutura de registro
 */
export interface RecordStructure {
  type: string;
  lineNumber: number;
  fieldCount: number;
  schoolCode?: string;
  data: string[];
}

/**
 * Interface para estrutura de escola
 */
export interface SchoolStructure {
  schoolCode: string;
  situacaoFuncionamento: string;
  dependenciaAdministrativa?: string;
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
  totalStudents: number;
  totalProfessionals: number;
}

/**
 * Interface para contexto de validação estrutural
 */
export interface StructuralValidationContext {
  records: string[];
  schoolStructures: Map<string, SchoolStructure>;
  totalSchools: number;
  hasRecord99: boolean;
  fileContent?: string;
}

/**
 * Classe base abstrata para validações estruturais
 * Diferente da BaseRecordRule, esta classe lida com validações que envolvem
 * múltiplos registros, estrutura do arquivo e relações entre elementos
 */
export abstract class BaseStructuralRule {
  protected readonly name: string;
  protected readonly description: string;

  constructor(name: string, description: string) {
    this.name = name;
    this.description = description;
  }

  /**
   * Método principal de validação estrutural
   */
  abstract validate(context: StructuralValidationContext): ValidationError[];

  /**
   * Valida a estrutura básica dos registros
   */
  protected validateRecordStructures(
    records: string[],
    expectedFieldCounts: Record<string, number>,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (let i = 0; i < records.length; i++) {
      const lineNumber = i + 1;
      const record = records[i].trim();

      if (!record) continue;

      const parts = record.split('|');
      const recordType = parts[0] || '';

      // Validar número de campos esperados
      const expectedCount = expectedFieldCounts[recordType];
      if (expectedCount && parts.length !== expectedCount) {
        errors.push({
          lineNumber,
          recordType,
          fieldName: 'field_count',
          fieldPosition: -1,
          fieldValue: parts.length.toString(),
          ruleName: `${this.name}_field_count`,
          errorMessage: `Registro ${recordType} com número de campos diferente de ${expectedCount}, foram encontrados ${parts.length} campos.`,
          severity: ValidationSeverity.ERROR,
        });
      }
    }

    return errors;
  }

  /**
   * Cria o contexto de validação estrutural
   */
  protected buildContext(records: string[]): StructuralValidationContext {
    const schoolStructures = new Map<string, SchoolStructure>();
    let hasRecord99 = false;
    let totalSchools = 0;
    let currentSchool: string | null = null;

    // Primeira passada: analisar estrutura básica
    for (let i = 0; i < records.length; i++) {
      const record = records[i].trim();
      if (!record) continue;

      const parts = record.split('|');
      const recordType = parts[0] || '';

      if (recordType === '99') {
        hasRecord99 = true;
        continue;
      }

      if (recordType === '00') {
        currentSchool = parts[1] || '';
        totalSchools++;

        if (!schoolStructures.has(currentSchool)) {
          schoolStructures.set(currentSchool, {
            schoolCode: currentSchool,
            situacaoFuncionamento: parts[2] || '',
            dependenciaAdministrativa: parts[20] || '',
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
            totalStudents: 0,
            totalProfessionals: 0,
          });
        }

        const schoolStructure = schoolStructures.get(currentSchool)!;
        schoolStructure.hasRecord00 = true;
      } else if (currentSchool) {
        const schoolStructure = schoolStructures.get(currentSchool);
        if (schoolStructure) {
          switch (recordType) {
            case '10':
              schoolStructure.hasRecord10 = true;
              break;
            case '20':
              schoolStructure.hasRecord20 = true;
              schoolStructure.allClasses.add(parts[2] || '');
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
              schoolStructure.totalProfessionals++;
              if (parts[4]) {
                schoolStructure.classesWithProfessionals.add(parts[4]);
              }
              break;
            case '60':
              schoolStructure.hasRecord60 = true;
              schoolStructure.totalStudents++;
              if (parts[4]) {
                schoolStructure.classesWithStudents.add(parts[4]);
              }
              break;
          }

          schoolStructure.records.push({
            type: recordType,
            lineNumber: i + 1,
            fieldCount: parts.length,
            schoolCode: currentSchool,
            data: parts,
          });
        }
      }
    }

    return {
      records,
      schoolStructures,
      totalSchools,
      hasRecord99,
    };
  }

  /**
   * Cria erro de validação estrutural
   */
  protected createError(
    lineNumber: number,
    recordType: string,
    fieldName: string,
    fieldPosition: number,
    fieldValue: string,
    ruleName: string,
    message: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR,
    fieldDescription?: string,
  ): ValidationError {
    return {
      lineNumber,
      recordType,
      fieldName,
      fieldDescription,
      fieldPosition,
      fieldValue,
      ruleName: `${this.name}_${ruleName}`,
      errorMessage: message,
      severity,
    };
  }

  /**
   * Obtém o nome da regra
   */
  getName(): string {
    return this.name;
  }

  /**
   * Obtém a descrição da regra
   */
  getDescription(): string {
    return this.description;
  }
}
