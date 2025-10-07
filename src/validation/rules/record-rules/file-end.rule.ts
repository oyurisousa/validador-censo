import { Injectable } from '@nestjs/common';
import { RecordTypeEnum } from '../../../common/enums/record-types.enum';
import { BaseRecordRule, FieldRule } from '../base-record.rule';

@Injectable()
export class FileEndRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.FILE_END;

  // O registro 99 tem apenas um campo: o tipo de registro
  protected readonly fields: FieldRule[] = [
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^99$/,
      type: 'code',
      description: 'Tipo de registro (sempre 99)',
    },
  ];
}
