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
    description:
      'Nome técnico do campo que contém o erro (identificador único)',
    example: 'co_entidade',
  })
  @IsString()
  fieldName: string;

  @ApiPropertyOptional({
    description: 'Descrição amigável do campo para exibição ao usuário',
    example: 'Código INEP da Escola',
  })
  @IsString()
  @IsOptional()
  fieldDescription?: string;

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
        fieldDescription: 'Código INEP da Escola',
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
    description: 'Caminho para arquivo do sistema de arquivos (uso interno)',
    example: '/uploads/censo_escolar_2025.txt',
  })
  @IsString()
  @IsOptional()
  filePath?: string;

  @ApiPropertyOptional({
    description:
      'Conteúdo completo do arquivo como string única com quebras de linha (\\n) - FORMATO LEGADO',
    example:
      '00|12345678|ESCOLA EXEMPLO|3|1|0|Rua das Flores 123|Centro|12345000|27|1234567|São Paulo|SP|Brasil|123456789|escola@exemplo.com',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description:
      '🚀 FORMATO RECOMENDADO: Array de strings onde cada elemento é um registro completo. Exemplo: para 3 turmas, envie 3 elementos no array, cada um com registro "20|..."',
    example: [
      '00|12345678|ESCOLA MUNICIPAL EXEMPLO|3|1|0|Rua das Flores 123|Centro|12345000|27|1234567|São Paulo|SP|Brasil|11987654321|escola@exemplo.com.br',
      '10|12345678|001|Sala de Aula|1|1|1|0|1|35|30|1|1|1|0|0|1|1|1|1|1|1|1|1|1|1|1|1|1|1',
      '20|12345678|001|1|14|1|1|1|Turma 1º Ano A|1|1|30|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0',
      '30|12345678|ALU001|123456789012|12345678901|JOAO DA SILVA SANTOS|15/08/2015|1|MARIA DA SILVA|JOSE SANTOS|1|1||1|76|1234567|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|1||76|12345000|1234567|1|7',
      '99',
    ],
    isArray: true,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  records?: string[];

  @ApiPropertyOptional({
    description: 'Versão do layout do Censo Escolar',
    example: '2025',
    default: '2025',
  })
  @IsString()
  @IsOptional()
  version?: string;
}
