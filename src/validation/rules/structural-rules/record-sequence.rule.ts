import { Injectable } from '@nestjs/common';
import {
  BaseStructuralRule,
  StructuralValidationContext,
  RecordStructure,
} from '../base-structural.rule';
import { ValidationError } from '../../../common/interfaces/validation.interface';
import { ValidationSeverity } from '../../../common/enums/record-types.enum';

/**
 * Regra para validação da sequência de registros no arquivo
 * Valida se os registros estão na ordem correta conforme especificação
 */
@Injectable()
export class RecordSequenceRule extends BaseStructuralRule {
  constructor() {
    super('record_sequence', 'Validação da sequência de registros');
  }

  validate(context: StructuralValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];
    const recordStructures: RecordStructure[] = [];

    // Construir lista de estruturas de registros (exceto registro 99)
    for (let i = 0; i < context.records.length; i++) {
      const record = context.records[i].trim();
      if (!record) continue;

      const parts = record.split('|');
      const recordType = parts[0] || '';

      if (recordType === '99') continue;

      recordStructures.push({
        type: recordType,
        lineNumber: i + 1,
        fieldCount: parts.length,
        schoolCode: recordType === '00' ? parts[1] : undefined,
        data: parts,
      });
    }

    // Validar sequência de registros
    const sequenceErrors = this.validateRecordSequence(recordStructures);
    errors.push(...sequenceErrors);

    return errors;
  }

  /**
   * Valida a sequência de registros conforme regras do Censo
   */
  private validateRecordSequence(
    records: RecordStructure[],
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    let previousRecordType: string | null = null;

    for (const record of records) {
      const { type, lineNumber } = record;

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
        errors.push(
          this.createError(
            lineNumber,
            type,
            'record_sequence',
            0,
            type,
            'invalid_sequence',
            `Registro ${type} declarado em linha inadequada, após o registro ${previousRecordType}. Esperado após: ${expectedAfter}`,
            ValidationSeverity.ERROR,
          ),
        );
      }

      previousRecordType = type;
    }

    return errors;
  }
}
