import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../common/interfaces/validation.interface';
import { StructuralValidationContext } from './base-structural.rule';
import { FileStructureRule } from './structural-rules/file-structure.rule';
import { RecordSequenceRule } from './structural-rules/record-sequence.rule';
import { SchoolStructureRule } from './structural-rules/school-structure.rule';
import { CharacterEncodingRule } from './structural-rules/character-encoding.rule';
import { PhaseTwoStructureRule } from './structural-rules/phase-two-structure.rule';

/**
 * Gerenciador das regras estruturais
 * Coordena a execução de todas as validações estruturais
 */
@Injectable()
export class StructuralRulesManagerService {
  constructor(
    private readonly fileStructureRule: FileStructureRule,
    private readonly recordSequenceRule: RecordSequenceRule,
    private readonly schoolStructureRule: SchoolStructureRule,
    private readonly characterEncodingRule: CharacterEncodingRule,
    private readonly phaseTwoStructureRule: PhaseTwoStructureRule,
  ) {}

  /**
   * Executa todas as validações estruturais
   */
  validateStructure(
    records: string[],
    fileContent?: string,
    phase: '1' | '2' = '1',
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Construir contexto de validação
    const context = this.buildValidationContext(records, fileContent, phase);

    try {
      // FASE 2: Aplicar apenas regras da Fase 2
      if (phase === '2') {
        // Validar codificação (comum a ambas as fases)
        const charErrors = this.characterEncodingRule.validate(context);
        errors.push(...charErrors);

        // Aplicar regras específicas da Fase 2
        const phaseTwoErrors = this.phaseTwoStructureRule.validate(context);
        errors.push(...phaseTwoErrors);

        // Validar presença do registro 99 (fim de arquivo)
        if (!context.hasRecord99) {
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

        return errors;
      }

      // FASE 1: Aplicar regras da Fase 1
      // 1. Validar estrutura básica do arquivo
      const fileErrors = this.fileStructureRule.validate(context);
      errors.push(...fileErrors);

      // 2. Validar caracteres e codificação
      const charErrors = this.characterEncodingRule.validate(context);
      errors.push(...charErrors);

      // Se há erros críticos de estrutura de arquivo, não prosseguir
      const hasCriticalFileErrors = fileErrors.some(
        (error) =>
          error.ruleName.includes('field_count') ||
          error.ruleName.includes('missing_end_record') ||
          error.ruleName.includes('no_schools_found'),
      );

      if (hasCriticalFileErrors) {
        return errors;
      }

      // 3. Validar sequência de registros
      const sequenceErrors = this.recordSequenceRule.validate(context);
      errors.push(...sequenceErrors);

      // 4. Validar estrutura individual das escolas
      const schoolErrors = this.schoolStructureRule.validate(context);
      errors.push(...schoolErrors);
    } catch (error) {
      errors.push({
        lineNumber: 0,
        recordType: 'STRUCTURAL',
        fieldName: 'validation_error',
        fieldPosition: 0,
        fieldValue: '',
        ruleName: 'structural_validation_error',
        errorMessage: `Erro durante validação estrutural: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Constrói o contexto de validação estrutural
   */
  private buildValidationContext(
    records: string[],
    fileContent?: string,
    phase: '1' | '2' = '1',
  ): StructuralValidationContext {
    const schoolStructures = new Map();
    let hasRecord99 = false;
    let totalSchools = 0;
    let currentSchool: string | null = null;

    // FASE 2: Processar registros da segunda fase
    if (phase === '2') {
      for (let i = 0; i < records.length; i++) {
        const record = records[i].trim();
        if (!record) continue;

        const parts = record.split('|');
        const recordType = parts[0] || '';

        if (recordType === '99') {
          hasRecord99 = true;
          continue;
        }

        if (recordType === '89') {
          currentSchool = parts[1] || '';
          totalSchools++;

          if (!schoolStructures.has(currentSchool)) {
            schoolStructures.set(currentSchool, {
              schoolCode: currentSchool,
              situacaoFuncionamento: parts[2] || '',
              dependenciaAdministrativa: parts[5] || '',
              records: [],
              hasRecord89: false,
              record89Count: 0,
              totalStudentSituations: 0, // Registros 90
              totalComponentSituations: 0, // Registros 91
            });
          }

          const schoolStructure = schoolStructures.get(currentSchool)!;
          schoolStructure.hasRecord89 = true;
          schoolStructure.record89Count++;
          schoolStructure.records.push({
            type: recordType,
            lineNumber: i + 1,
            fieldCount: parts.length,
            schoolCode: currentSchool,
            data: parts,
          });
        } else if (currentSchool) {
          const schoolStructure = schoolStructures.get(currentSchool);
          if (schoolStructure) {
            switch (recordType) {
              case '90':
                schoolStructure.totalStudentSituations++;
                break;
              case '91':
                schoolStructure.totalComponentSituations++;
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
        fileContent,
        phase,
      };
    }

    // FASE 1: Processar registros da primeira fase (código original)
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
            classLineNumbers: new Map(), // ✅ Adicionar map de linhas
            totalStudents: 0,
            totalProfessionals: 0,
          });
        }

        const schoolStructure = schoolStructures.get(currentSchool)!;
        schoolStructure.hasRecord00 = true;
        schoolStructure.records.push({
          type: recordType,
          lineNumber: i + 1,
          fieldCount: parts.length,
          schoolCode: currentSchool,
          data: parts,
        });
      } else if (currentSchool) {
        const schoolStructure = schoolStructures.get(currentSchool);
        if (schoolStructure) {
          switch (recordType) {
            case '10':
              schoolStructure.hasRecord10 = true;
              break;
            case '20':
              schoolStructure.hasRecord20 = true;
              const classCode = parts[2] || '';
              schoolStructure.allClasses.add(classCode);
              // ✅ Rastrear o número da linha da turma
              if (
                classCode &&
                !schoolStructure.classLineNumbers.has(classCode)
              ) {
                schoolStructure.classLineNumbers.set(classCode, i + 1);
              }
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
      fileContent,
      phase,
    };
  }

  /**
   * Valida apenas a estrutura de caracteres e codificação
   */
  validateCharactersAndEncoding(content: string): ValidationError[] {
    const records = content.split('\n').filter((line) => line.trim() !== '');
    const context: StructuralValidationContext = {
      records,
      schoolStructures: new Map(),
      totalSchools: 0,
      hasRecord99: false,
      fileContent: content,
    };

    return this.characterEncodingRule.validate(context);
  }

  /**
   * Valida apenas a estrutura do arquivo
   */
  validateFileStructureOnly(
    records: string[],
    phase: '1' | '2' = '1',
  ): ValidationError[] {
    const context = this.buildValidationContext(records, undefined, phase);
    return this.fileStructureRule.validate(context);
  }

  /**
   * Valida apenas a sequência de registros
   */
  validateRecordSequenceOnly(
    records: string[],
    phase: '1' | '2' = '1',
  ): ValidationError[] {
    const context = this.buildValidationContext(records, undefined, phase);
    return this.recordSequenceRule.validate(context);
  }

  /**
   * Valida apenas as estruturas das escolas
   */
  validateSchoolStructuresOnly(
    records: string[],
    phase: '1' | '2' = '1',
  ): ValidationError[] {
    const context = this.buildValidationContext(records, undefined, phase);
    return this.schoolStructureRule.validate(context);
  }
}
