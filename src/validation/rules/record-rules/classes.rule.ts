import { Injectable } from '@nestjs/common';
import { BaseRecordRule } from '../base-record.rule';
import { RecordTypeEnum } from '../../../common/enums/record-types.enum';

@Injectable()
export class ClassesRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.CLASSES;

  protected readonly fields = [
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^20$/,
      type: 'code' as const,
      description: 'Tipo de registro (sempre 20)',
    },
    {
      position: 1,
      name: 'codigo_inep',
      required: true,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code' as const,
      description: 'Código INEP da escola (8 dígitos)',
    },
    {
      position: 2,
      name: 'codigo_turma',
      required: true,
      minLength: 1,
      maxLength: 20,
      type: 'string' as const,
      description: 'Código da turma',
    },
    {
      position: 3,
      name: 'nome_turma',
      required: true,
      minLength: 1,
      maxLength: 100,
      type: 'string' as const,
      description: 'Nome da turma',
    },
    {
      position: 4,
      name: 'etapa_ensino',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1-9]$/,
      type: 'code' as const,
      description: 'Etapa de ensino (1-9)',
    },
    {
      position: 5,
      name: 'modalidade_ensino',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1-9]$/,
      type: 'code' as const,
      description: 'Modalidade de ensino (1-9)',
    },
    {
      position: 6,
      name: 'tipo_atendimento',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1-5]$/,
      type: 'code' as const,
      description: 'Tipo de atendimento (1-5)',
    },
    {
      position: 7,
      name: 'localizacao_diferenciada',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1-3]$/,
      type: 'code' as const,
      description: 'Localização diferenciada (1-3)',
    },
  ];
}

