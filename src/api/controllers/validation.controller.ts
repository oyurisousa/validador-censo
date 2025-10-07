import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  UseFilters,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ValidationEngineService } from '../../validation/engine/validation-engine.service';
import {
  ValidationRequestDto,
  ValidationResultDto,
} from '../../common/dto/validation.dto';
import { ValidationResult } from '../../common/interfaces/validation.interface';
import { FileUploadGuard } from '../guards/file-upload.guard';
import { ValidationGuard } from '../guards/validation.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { ValidationLoggingInterceptor } from '../interceptors/validation-logging.interceptor';

@ApiTags('Validação')
@Controller('validation')
@UseGuards(RateLimitGuard)
export class ValidationController {
  constructor(private readonly validationEngine: ValidationEngineService) {}

  @Post('validate')
  @UseGuards(ValidationGuard)
  @UseInterceptors(ValidationLoggingInterceptor)
  @ApiOperation({
    summary: 'Validar conteúdo do arquivo',
    description:
      'Valida registros do Censo Escolar. Suporta três formatos: lista de registros (recomendado), conteúdo concatenado ou arquivo do sistema.',
  })
  @ApiResponse({
    status: 200,
    description: 'Validação realizada com sucesso',
    type: ValidationResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: 429,
    description: 'Limite de requisições excedido',
  })
  async validateContent(
    @Body() request: ValidationRequestDto,
  ): Promise<ValidationResultDto> {
    let result: ValidationResult;
    let fileName: string;

    if (request.records && request.records.length > 0) {
      // Validação via lista de registros (formato preferido)
      fileName = 'records.txt';
      result = await this.validationEngine.validateRecords(
        request.records,
        fileName,
        request.version || '2025',
      );
    } else if (request.content) {
      // Validação via conteúdo concatenado (formato legado)
      fileName = 'uploaded_file.txt';
      result = await this.validationEngine.validateFile(
        request.content,
        fileName,
        request.version || '2025',
      );
    } else if (request.filePath) {
      // Validação via arquivo do sistema
      const content = await fs.readFile(request.filePath, 'utf-8');
      fileName = request.filePath.split('/').pop() || 'file.txt';
      result = await this.validationEngine.validateFile(
        content,
        fileName,
        request.version || '2025',
      );
    } else {
      throw new BadRequestException(
        'É obrigatório fornecer: records (lista de registros), content (conteúdo) ou filePath (caminho do arquivo)',
      );
    }

    // Converter Date para string para compatibilidade com DTO
    const resultDto = {
      ...result,
      fileMetadata: {
        ...result.fileMetadata,
        uploadDate: result.fileMetadata.uploadDate.toISOString(),
      },
    };

    return resultDto as ValidationResultDto;
  }

  @Post('upload')
  @UseGuards(FileUploadGuard)
  @UseInterceptors(FileInterceptor('file'), ValidationLoggingInterceptor)
  @ApiOperation({
    summary: 'Upload e validação de arquivo',
    description: 'Faz upload de um arquivo TXT e realiza a validação',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo TXT do Censo Escolar',
        },
        version: {
          type: 'string',
          description: 'Versão do layout (ex: 2025)',
          example: '2025',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo validado com sucesso',
    type: ValidationResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo inválido ou dados incorretos',
  })
  @ApiResponse({
    status: 429,
    description: 'Limite de requisições excedido',
  })
  async validateUploadedFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('version') version?: string,
  ): Promise<ValidationResultDto> {
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    if (!file.originalname.endsWith('.txt')) {
      throw new BadRequestException('Apenas arquivos .txt são permitidos');
    }

    const content = file.buffer.toString('utf-8');
    const result = await this.validationEngine.validateFile(
      content,
      file.originalname,
      version || '2025',
    );

    // Converter Date para string para compatibilidade com DTO
    const resultDto = {
      ...result,
      fileMetadata: {
        ...result.fileMetadata,
        uploadDate: result.fileMetadata.uploadDate.toISOString(),
      },
    };

    return resultDto as ValidationResultDto;
  }

  @Post('validate-with-context')
  @UseGuards(ValidationGuard, RateLimitGuard)
  @UseInterceptors(ValidationLoggingInterceptor)
  @ApiOperation({
    summary: 'Validação com contexto cruzado',
    description:
      'Realiza validação considerando contexto entre registros (00, 30, 40)',
  })
  @ApiBody({
    type: ValidationRequestDto,
    description: 'Lista de registros para validação com contexto',
    examples: {
      example1: {
        summary: 'Exemplo com registros 00, 30 e 40',
        value: {
          records: [
            '00|12345678|1|01/02/2025|31/12/2025|||||||||||||||||2|||||||||||||||||||||||||||||||||||||',
            '30|12345678|DIR001|123456789012|12345678901|JOÃO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
            '40|12345678|DIR001|123456789012|1|4|1',
          ],
          version: '2025',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Validação com contexto realizada com sucesso',
    type: ValidationResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  async validateWithContext(
    @Body() validationRequest: ValidationRequestDto,
  ): Promise<ValidationResultDto> {
    if (!validationRequest.records || validationRequest.records.length === 0) {
      throw new BadRequestException('Lista de registros não pode estar vazia');
    }

    const version = validationRequest.version || '2025';

    const result: ValidationResult =
      await this.validationEngine.validateRecordsWithContext(
        validationRequest.records,
        'context-validation.txt',
        version,
      );

    const resultDto = {
      isValid: result.isValid,
      totalRecords: result.totalRecords,
      processedRecords: result.processedRecords,
      processingTime: result.processingTime,
      errors: result.errors,
      warnings: result.warnings,
      fileMetadata: {
        fileName: result.fileMetadata.fileName,
        fileSize: result.fileMetadata.fileSize,
        totalLines: result.fileMetadata.totalLines,
        encoding: result.fileMetadata.encoding,
        uploadDate: result.fileMetadata.uploadDate.toISOString(),
      },
    };

    return resultDto as ValidationResultDto;
  }
}
