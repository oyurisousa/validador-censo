import { Injectable } from '@nestjs/common';
import {
  BaseStructuralRule,
  StructuralValidationContext,
} from '../base-structural.rule';
import { ValidationError } from '../../../common/interfaces/validation.interface';
import { ValidationSeverity } from '../../../common/enums/record-types.enum';

/**
 * Regra para validação da estrutura geral do arquivo
 * Valida presença de registros obrigatórios, limite de escolas, etc.
 */
@Injectable()
export class FileStructureRule extends BaseStructuralRule {
  private readonly EXPECTED_FIELD_COUNT = {
    '00': 56,
    '10': 187,
    '20': 70,
    '30': 108,
    '40': 7,
    '50': 38,
    '60': 32,
  };

  constructor() {
    super('file_structure', 'Validação da estrutura geral do arquivo');
  }

  validate(context: StructuralValidationContext): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validar número de campos por tipo de registro
    const fieldCountErrors = this.validateRecordStructures(
      context.records,
      this.EXPECTED_FIELD_COUNT,
    );
    errors.push(...fieldCountErrors);

    // Validar presença do registro 99 (fim de arquivo)
    if (!context.hasRecord99) {
      errors.push(
        this.createError(
          0,
          '99',
          'end_record',
          0,
          '',
          'missing_end_record',
          'Arquivo incompleto. Não localizado o registro 99.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Validar limite de escolas por arquivo (máximo 100)
    if (context.totalSchools > 100) {
      errors.push(
        this.createError(
          0,
          'FILE',
          'school_limit',
          0,
          context.totalSchools.toString(),
          'too_many_schools',
          'Número de escola por arquivo (100 escolas) excedido.',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Validar que existe pelo menos uma escola
    if (context.totalSchools === 0) {
      errors.push(
        this.createError(
          0,
          'FILE',
          'no_schools',
          0,
          '0',
          'no_schools_found',
          'Arquivo não contém nenhuma escola (registro 00).',
          ValidationSeverity.ERROR,
        ),
      );
    }

    return errors;
  }
}
