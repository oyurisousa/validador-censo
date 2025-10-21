import { Injectable } from '@nestjs/common';
import {
  BaseStructuralRule,
  StructuralValidationContext,
} from '../base-structural.rule';
import { ValidationError } from '../../../common/interfaces/validation.interface';
import { ValidationSeverity } from '../../../common/enums/record-types.enum';

/**
 * Regra para validação da estrutura geral da Fase 2 (Situação do Aluno)
 * Valida regras específicas para registros 89, 90 e 91
 */
@Injectable()
export class PhaseTwoStructureRule extends BaseStructuralRule {
  private readonly PHASE_TWO_FIELD_COUNT = {
    '89': 6, // Regra 2
    '90': 8, // Regra 3
    '91': 11, // Regra 4
  };

  constructor() {
    super('phase_two_structure', 'Validação da estrutura da Fase 2');
  }

  validate(context: StructuralValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];

    // Só aplicar estas regras se estiver na Fase 2
    if (context.phase !== '2') {
      return errors;
    }

    // REGRA 1: Validação de codificação ISO-8859-1 (já implementada em character-encoding.rule.ts)
    // Não precisa implementar aqui

    // REGRA 2, 3, 4: Validar número de campos por tipo de registro
    const fieldCountErrors = this.validateRecordStructures(
      context.records,
      this.PHASE_TWO_FIELD_COUNT,
    );
    errors.push(...fieldCountErrors);

    // REGRA 5 e 6: Validar sequência de registros 90 e 91
    const sequenceErrors = this.validatePhaseTwoSequence(context.records);
    errors.push(...sequenceErrors);

    // REGRA 7 e 8: Validar estrutura das escolas (um e somente um registro 89 por escola)
    const schoolStructureErrors =
      this.validatePhaseTwoSchoolStructure(context);
    errors.push(...schoolStructureErrors);

    // REGRA 10: Validar caracteres (letras minúsculas e acentuação)
    const characterErrors = this.validatePhaseTwoCharacters(context.records);
    errors.push(...characterErrors);

    return errors;
  }

  /**
   * REGRA 5 e 6: Valida sequência de registros da Fase 2
   * - Registro 90 deve vir após 89 ou 90
   * - Registro 91 deve vir após 89, 90 ou 91
   */
  private validatePhaseTwoSequence(records: string[]): ValidationError[] {
    const errors: ValidationError[] = [];
    let previousRecordType: string | null = null;

    for (let i = 0; i < records.length; i++) {
      const line = records[i].trim();
      if (!line) continue;

      const parts = line.split('|');
      const recordType = parts[0] || '';
      const lineNumber = i + 1;

      // Ignorar registro 99
      if (recordType === '99') continue;

      // REGRA 5: Registro 90 deve vir após 89 ou 90
      if (recordType === '90') {
        if (previousRecordType !== '89' && previousRecordType !== '90') {
          errors.push(
            this.createError(
              lineNumber,
              recordType,
              'record_sequence',
              0,
              recordType,
              'invalid_90_sequence',
              'Registro 90 declarado em linha inadequada.',
              ValidationSeverity.ERROR,
            ),
          );
        }
      }

      // REGRA 6: Registro 91 deve vir após 89, 90 ou 91
      if (recordType === '91') {
        if (
          previousRecordType !== '89' &&
          previousRecordType !== '90' &&
          previousRecordType !== '91'
        ) {
          errors.push(
            this.createError(
              lineNumber,
              recordType,
              'record_sequence',
              0,
              recordType,
              'invalid_91_sequence',
              'Registro 91 declarado em linha inadequada.',
              ValidationSeverity.ERROR,
            ),
          );
        }
      }

      // Atualizar o tipo de registro anterior (ignorar linhas vazias)
      if (recordType) {
        previousRecordType = recordType;
      }
    }

    return errors;
  }

  /**
   * REGRA 7 e 8: Valida estrutura das escolas na Fase 2
   * - Deve haver um registro 89 para cada escola
   * - Não pode haver mais de um registro 89 por escola
   */
  private validatePhaseTwoSchoolStructure(
    context: StructuralValidationContext,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Mapear escolas e seus registros 89
    const schoolsWithRecord89 = new Map<string, number[]>();

    for (let i = 0; i < context.records.length; i++) {
      const line = context.records[i].trim();
      if (!line) continue;

      const parts = line.split('|');
      const recordType = parts[0] || '';
      const lineNumber = i + 1;

      if (recordType === '89') {
        // Campo 1 é o código da escola
        const schoolCode = parts[1] || '';

        if (!schoolsWithRecord89.has(schoolCode)) {
          schoolsWithRecord89.set(schoolCode, []);
        }
        schoolsWithRecord89.get(schoolCode)!.push(lineNumber);
      }
    }

    // Validar cada escola
    for (const [schoolCode, lineNumbers] of schoolsWithRecord89.entries()) {
      // REGRA 8: Não pode haver mais de um registro 89 por escola
      if (lineNumbers.length > 1) {
        // Reportar erro em todas as ocorrências duplicadas
        for (let i = 1; i < lineNumbers.length; i++) {
          errors.push(
            this.createError(
              lineNumbers[i],
              '89',
              'school_code',
              1,
              schoolCode,
              'duplicate_record_89',
              `Estrutura da escola incorreta. A escola ${schoolCode} possui mais de um registro 89.`,
              ValidationSeverity.ERROR,
            ),
          );
        }
      }
    }

    // REGRA 7: Deve haver um registro 89 para cada escola
    // Verificar se há registros 90 ou 91 sem um registro 89 correspondente
    const schoolsWithRecords = new Set<string>();

    for (let i = 0; i < context.records.length; i++) {
      const line = context.records[i].trim();
      if (!line) continue;

      const parts = line.split('|');
      const recordType = parts[0] || '';
      const lineNumber = i + 1;

      if (recordType === '90' || recordType === '91') {
        // Campo 1 é o código da escola
        const schoolCode = parts[1] || '';
        schoolsWithRecords.add(schoolCode);

        // Verificar se existe registro 89 para esta escola
        if (!schoolsWithRecord89.has(schoolCode)) {
          errors.push(
            this.createError(
              lineNumber,
              recordType,
              'school_code',
              1,
              schoolCode,
              'missing_record_89',
              'Estrutura da escola incorreta. Não foi encontrado o registro 89.',
              ValidationSeverity.ERROR,
            ),
          );
        }
      }
    }

    return errors;
  }

  /**
   * REGRA 10: Não pode haver letras minúsculas nem caracteres acentuados
   * Esta regra é mais específica para Fase 2 e sobrescreve a validação geral
   */
  private validatePhaseTwoCharacters(records: string[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (let i = 0; i < records.length; i++) {
      const line = records[i].trim();
      if (!line) continue;

      const parts = line.split('|');
      const recordType = parts[0] || '';
      const lineNumber = i + 1;

      // Ignorar registro 99
      if (recordType === '99') continue;

      // Apenas validar registros da Fase 2
      if (recordType !== '89' && recordType !== '90' && recordType !== '91') {
        continue;
      }

      // Verificar cada campo
      for (let fieldIndex = 1; fieldIndex < parts.length; fieldIndex++) {
        const fieldValue = parts[fieldIndex];

        if (!fieldValue) continue;

        // Verificar letras minúsculas
        const hasLowercase = /[a-z]/.test(fieldValue);

        // Verificar caracteres acentuados
        const hasAccents = /[\u00C0-\u00FF]/.test(fieldValue);

        if (hasLowercase || hasAccents) {
          // Determinar o nome do campo baseado no tipo de registro
          const fieldName = this.getFieldName(
            recordType,
            fieldIndex,
            fieldValue,
          );

          errors.push(
            this.createError(
              lineNumber,
              recordType,
              fieldName,
              fieldIndex,
              fieldValue,
              'invalid_characters_phase_two',
              `O campo "${fieldName}" do registro ${recordType} contém caractere(s) inválido(s).`,
              ValidationSeverity.ERROR,
            ),
          );
        }
      }
    }

    return errors;
  }

  /**
   * Obtém o nome do campo baseado no tipo de registro e posição
   */
  private getFieldName(
    recordType: string,
    fieldIndex: number,
    fieldValue: string,
  ): string {
    // Mapeamento básico de campos por tipo de registro
    const fieldMappings: Record<string, Record<number, string>> = {
      '89': {
        1: 'Código da Escola',
        2: 'Situação de Funcionamento',
        3: 'Ano',
        4: 'Código da Entidade/Mantenedora',
        5: 'Dependência Administrativa',
      },
      '90': {
        1: 'Código da Escola',
        2: 'Código do Aluno',
        3: 'Código da Turma',
        4: 'Situação do Aluno',
        5: 'Tipo de Atendimento Diferenciado',
        6: 'Nota Pós-Conselho',
        7: 'Percentual de Frequência',
      },
      '91': {
        1: 'Código da Escola',
        2: 'Código do Aluno',
        3: 'Código da Turma',
        4: 'Componente Curricular',
        5: 'Situação do Aluno',
        6: 'Nota Pós-Conselho 1º Bimestre',
        7: 'Nota Pós-Conselho 2º Bimestre',
        8: 'Nota Pós-Conselho 3º Bimestre',
        9: 'Nota Pós-Conselho 4º Bimestre',
        10: 'Percentual de Frequência',
      },
    };

    return (
      fieldMappings[recordType]?.[fieldIndex] || `Campo ${fieldIndex}`
    );
  }

  /**
   * Sobrescreve o método de validação de estrutura de registros
   * para usar as mensagens específicas da Fase 2
   */
  protected validateRecordStructures(
    records: string[],
    expectedFieldCounts: Record<string, number>,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (let i = 0; i < records.length; i++) {
      const line = records[i].trim();
      if (!line) continue;

      const parts = line.split('|');
      const recordType = parts[0] || '';
      const lineNumber = i + 1;

      // Verificar se é um registro que deve ser validado
      if (!expectedFieldCounts[recordType]) continue;

      const expectedCount = expectedFieldCounts[recordType];
      const actualCount = parts.length;

      if (actualCount !== expectedCount) {
        errors.push(
          this.createError(
            lineNumber,
            recordType,
            'field_count',
            0,
            actualCount.toString(),
            'incorrect_field_count',
            `Registro ${recordType} com número de campos diferente de ${expectedCount}, foram encontrados ${actualCount} campos.`,
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    return errors;
  }
}
