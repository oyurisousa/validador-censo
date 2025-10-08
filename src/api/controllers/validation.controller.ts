import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ValidationEngineService } from '../../validation/engine/validation-engine.service';
import {
  ValidationRequestDto,
  ValidationResultDto,
} from '../../common/dto/validation.dto';
import { ValidationResult } from '../../common/interfaces/validation.interface';
import { ValidationGuard } from '../guards/validation.guard';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { ValidationLoggingInterceptor } from '../interceptors/validation-logging.interceptor';

@ApiTags('Validação')
@Controller('validation')
@UseGuards(RateLimitGuard)
export class ValidationController {
  constructor(private readonly validationEngine: ValidationEngineService) {}

  @Post('validate-line')
  @UseGuards(ValidationGuard)
  @UseInterceptors(ValidationLoggingInterceptor)
  @ApiOperation({
    summary: 'Validar linha individual sem contexto',
    description:
      'Valida uma única linha de registro (tipo 00-60) sem considerar contexto de outros registros. ' +
      'Valida apenas a estrutura e campos da linha específica.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        recordType: {
          type: 'string',
          description: 'Tipo do registro (00, 10, 20, 30, 40, 50, 60)',
          example: '30',
          enum: ['00', '10', '20', '30', '40', '50', '60'],
        },
        line: {
          type: 'string',
          description: 'Conteúdo da linha a ser validada',
          example:
            '30|12345678|DIR001|123456789012|12345678901|JOÃO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
        },
        version: {
          type: 'string',
          description: 'Versão do layout (padrão: 2025)',
          example: '2025',
        },
      },
      required: ['recordType', 'line'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Validação realizada com sucesso',
    schema: {
      type: 'object',
      properties: {
        isValid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'object' } },
        warnings: { type: 'array', items: { type: 'object' } },
        recordType: { type: 'string' },
        lineNumber: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: 429,
    description: 'Limite de requisições excedido',
  })
  async validateLine(
    @Body()
    request: {
      recordType: string;
      line: string;
      version?: string;
    },
  ): Promise<{
    isValid: boolean;
    errors: any[];
    warnings: any[];
    recordType: string;
    lineNumber: number;
  }> {
    if (!request.recordType) {
      throw new BadRequestException('Tipo de registro é obrigatório');
    }

    if (!request.line || request.line.trim().length === 0) {
      throw new BadRequestException('Linha é obrigatória');
    }

    const validRecordTypes = ['00', '10', '20', '30', '40', '50', '60'];
    if (!validRecordTypes.includes(request.recordType)) {
      throw new BadRequestException(
        `Tipo de registro inválido. Valores permitidos: ${validRecordTypes.join(', ')}`,
      );
    }

    // Validar sem contexto - apenas campos estruturais
    const result = await this.validationEngine.validateSingleLine(
      request.line,
      request.recordType,
      request.version || '2025',
    );

    return {
      isValid: result.errors.length === 0,
      errors: result.errors,
      warnings: result.warnings,
      recordType: request.recordType,
      lineNumber: 1,
    };
  }

  @Post('validate-file')
  @UseGuards(ValidationGuard)
  @UseInterceptors(ValidationLoggingInterceptor)
  @ApiOperation({
    summary: 'Validar arquivo completo com contexto',
    description:
      'Valida um arquivo completo do Censo Escolar (múltiplas linhas) considerando contexto entre registros, ' +
      'estrutura do arquivo e validações cruzadas.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        lines: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de linhas do arquivo (cada linha é um registro)',
          example: [
            '00|12345678|1|01/02/2025|31/12/2025|||||||||||||||||2|||||||||||||||||||||||||||||||||||||||||',
            '30|12345678|DIR001|123456789012|12345678901|JOÃO DA SILVA|15/05/1980|1|MARIA DA SILVA||1|1||1|76||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||',
            '40|12345678|DIR001|123456789012|1|4|1',
          ],
        },
        version: {
          type: 'string',
          description: 'Versão do layout (padrão: 2025)',
          example: '2025',
        },
      },
      required: ['lines'],
    },
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
  async validateFileWithContext(
    @Body() request: { lines: string[]; version?: string },
  ): Promise<ValidationResultDto> {
    // Validação 1: Lista de linhas é obrigatória
    if (!request.lines || !Array.isArray(request.lines)) {
      throw new BadRequestException(
        'Lista de linhas é obrigatória e deve ser um array',
      );
    }

    // Validação 2: Lista não pode estar vazia
    if (request.lines.length === 0) {
      throw new BadRequestException('Lista de linhas não pode estar vazia');
    }

    // Validação 3: Remover linhas vazias e converter array para string
    const validLines = request.lines.filter(
      (line) => line && line.trim().length > 0,
    );

    if (validLines.length === 0) {
      throw new BadRequestException(
        'Nenhuma linha válida encontrada no arquivo',
      );
    }

    // Converter array de linhas para string com quebras de linha
    const content = validLines.join('\n');

    const result = await this.validationEngine.validateFile(
      content,
      'file.txt',
      request.version || '2025',
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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'), ValidationLoggingInterceptor)
  @ApiOperation({
    summary: 'Upload e validação completa de arquivo',
    description:
      'Faz upload de um arquivo TXT e realiza validação completa com contexto entre registros, ' +
      'estrutura e validações cruzadas.',
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
      required: ['file'],
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
  async uploadAndValidate(
    @UploadedFile() file: Express.Multer.File,
    @Body('version') version?: string,
  ): Promise<ValidationResultDto> {
    // Validação 1: Arquivo obrigatório
    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    // Validação 2: Tipo de arquivo
    if (!file.originalname.endsWith('.txt')) {
      throw new BadRequestException('Apenas arquivos .txt são permitidos');
    }

    // Validação 3: Tamanho do arquivo (20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo permitido: 20MB. Tamanho atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Validação 4: Nome do arquivo
    const fileName = file.originalname.replace('.txt', '');
    if (fileName.length > 100) {
      throw new BadRequestException(
        'Nome do arquivo muito longo. Máximo: 100 caracteres',
      );
    }

    // Validar conteúdo do arquivo
    const content = file.buffer.toString('utf-8');

    if (!content || content.trim().length === 0) {
      throw new BadRequestException('Arquivo está vazio');
    }

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
}
