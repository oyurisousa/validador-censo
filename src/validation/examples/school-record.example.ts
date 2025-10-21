import {
  ValidateRecord,
  Required,
  MinLength,
  MaxLength,
  Format,
  CustomValidator,
} from '../../common/decorators/validation.decorator';
import { RecordTypeEnum } from '../../common/enums/record-types.enum';

@ValidateRecord(RecordTypeEnum.SCHOOL_IDENTIFICATION)
export class SchoolIdentificationRecord {
  @Required('Código da escola é obrigatório')
  @MinLength(8, 'Código da escola deve ter pelo menos 8 caracteres')
  @MaxLength(8, 'Código da escola deve ter exatamente 8 caracteres')
  schoolCode: string;

  @Required('Nome da escola é obrigatório')
  @MinLength(1, 'Nome da escola não pode estar vazio')
  @MaxLength(255, 'Nome da escola deve ter no máximo 255 caracteres')
  schoolName: string;

  @Required('Código do município é obrigatório')
  @Format(/^\d{7}$/, 'Código do município deve ter 7 dígitos')
  municipalityCode: string;

  @Required('Código do estado é obrigatório')
  @Format(/^\d{2}$/, 'Código do estado deve ter 2 dígitos')
  stateCode: string;

  @Required('Código da região é obrigatório')
  @Format(/^\d{1}$/, 'Código da região deve ter 1 dígito')
  regionCode: string;

  @Required('Dependência administrativa é obrigatória')
  @Format(/^[1-4]$/, 'Dependência administrativa deve ser 1, 2, 3 ou 4')
  administrativeDependency: string;

  @Required('Localização é obrigatória')
  @Format(/^[1-2]$/, 'Localização deve ser 1 ou 2')
  location: string;

  @Required('Situação de funcionamento é obrigatória')
  @Format(/^[1-4]$/, 'Situação de funcionamento deve ser 1, 2, 3 ou 4')
  operatingStatus: string;

  @Required('Modalidade de ensino é obrigatória')
  @Format(/^[1-9]$/, 'Modalidade de ensino deve ser de 1 a 9')
  teachingModality: string;

  @Required('Código do INEP é obrigatório')
  @Format(/^\d{8}$/, 'Código do INEP deve ter 8 dígitos')
  inepCode: string;
}
