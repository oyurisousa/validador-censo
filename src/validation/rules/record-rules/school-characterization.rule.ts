import { Injectable } from '@nestjs/common';
import { RecordTypeEnum } from '../../../common/enums/record-types.enum';
import { BaseRecordRule, FieldRule } from '../base-record.rule';

@Injectable()
export class SchoolCharacterizationRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.SCHOOL_CHARACTERIZATION;

  // Exemplo com 3-4 campos; complete conforme o layout
  protected readonly fields: FieldRule[] = [
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^10$/,
      type: 'code',
      description: 'Tipo de registro (sempre 10)',
    },
    {
      position: 1,
      name: 'codigo_inep',
      required: true,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'Código INEP da escola (8 dígitos)',
    },
    {
      position: 2,
      name: 'situacao_funcionamento',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1-4]$/,
      type: 'code',
      description: 'Situação de funcionamento (1-4)',
    },
    {
      position: 3,
      name: 'dependencia_administrativa',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1-4]$/,
      type: 'code',
      description: 'Dependência administrativa (1-4)',
    },
  ];
}
