import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RecordTypeEnum, ValidationSeverity } from '../enums/record-types.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidationErrorDto {
  @ApiProperty({
    description: 'Número da linha onde ocorreu o erro',
    example: 1,
  })
  @IsNumber()
  lineNumber: number;

  @ApiProperty({
    description: 'Tipo de registro onde ocorreu o erro',
    enum: RecordTypeEnum,
    example: 'SCHOOL_IDENTIFICATION',
  })
  @IsEnum(RecordTypeEnum)
  recordType: string;

  @ApiProperty({
    description: 'Nome do campo que contém o erro',
    example: 'co_entidade',
  })
  @IsString()
  fieldName: string;

  @ApiPropertyOptional({
    description: 'Posição/número do campo (0-based)',
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  fieldPosition?: number;

  @ApiProperty({
    description: 'Valor do campo que causou o erro',
    example: '12345678',
  })
  @IsString()
  fieldValue: string;

  @ApiProperty({
    description: 'Nome da regra de validação que falhou',
    example: 'required_field',
  })
  @IsString()
  ruleName: string;

  @ApiProperty({
    description: 'Mensagem de erro detalhada',
    example: 'Campo obrigatório não foi preenchido',
  })
  @IsString()
  errorMessage: string;

  @ApiProperty({
    description: 'Severidade do erro',
    enum: ValidationSeverity,
    example: 'error',
  })
  @IsEnum(ValidationSeverity)
  severity: ValidationSeverity;
}

export class FileMetadataDto {
  @ApiProperty({
    description: 'Nome do arquivo validado',
    example: 'censo_escolar_2025.txt',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes',
    example: 1024,
  })
  @IsNumber()
  fileSize: number;

  @ApiProperty({
    description: 'Total de linhas no arquivo',
    example: 150,
  })
  @IsNumber()
  totalLines: number;

  @ApiProperty({
    description: 'Codificação do arquivo',
    example: 'utf-8',
  })
  @IsString()
  encoding: string;

  @ApiProperty({
    description: 'Data e hora do upload/processamento',
    example: '2025-10-07T11:41:12.335Z',
  })
  @IsString()
  uploadDate: string;
}

export class ValidationResultDto {
  @ApiProperty({
    description: 'Indica se o arquivo passou em todas as validações',
    example: false,
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Lista de erros encontrados durante a validação',
    type: [ValidationErrorDto],
    example: [
      {
        lineNumber: 1,
        recordType: 'SCHOOL_IDENTIFICATION',
        fieldName: 'co_entidade',
        fieldPosition: 2,
        fieldValue: '12345678',
        ruleName: 'required_field',
        errorMessage: 'Campo obrigatório não foi preenchido',
        severity: 'error',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationErrorDto)
  errors: ValidationErrorDto[];

  @ApiProperty({
    description: 'Lista de avisos encontrados durante a validação',
    type: [ValidationErrorDto],
    example: [],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidationErrorDto)
  warnings: ValidationErrorDto[];

  @ApiProperty({
    description: 'Total de registros no arquivo',
    example: 150,
  })
  @IsNumber()
  totalRecords: number;

  @ApiProperty({
    description: 'Número de registros processados com sucesso',
    example: 147,
  })
  @IsNumber()
  processedRecords: number;

  @ApiProperty({
    description: 'Tempo de processamento em milissegundos',
    example: 245,
  })
  @IsNumber()
  processingTime: number;

  @ApiProperty({
    description: 'Metadados do arquivo processado',
    type: FileMetadataDto,
  })
  @ValidateNested()
  @Type(() => FileMetadataDto)
  fileMetadata: FileMetadataDto;
}

export class ValidationRequestDto {
  @ApiPropertyOptional({
    description:
      'Caminho para o arquivo a ser validado (alternativo ao content)',
    example: '/path/to/censo_escolar_2025.txt',
  })
  @IsString()
  @IsOptional()
  filePath?: string;

  @ApiPropertyOptional({
    description:
      'Conteúdo do arquivo TXT a ser validado (alternativo ao filePath)',
    example: '00|12345678|ESCOLA EXEMPLO|...\n10|001|ALUNO EXEMPLO|...\n99',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Versão do layout do Censo Escolar',
    example: '2025',
    default: '2025',
  })
  @IsString()
  @IsOptional()
  version?: string;
}
