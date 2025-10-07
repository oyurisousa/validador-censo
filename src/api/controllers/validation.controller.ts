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
    description: 'Valida o conteúdo de um arquivo TXT do Censo Escolar',
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
    let content: string;
    let fileName: string;

    if (request.content) {
      content = request.content;
      fileName = 'uploaded_file.txt';
    } else if (request.filePath) {
      // Implementar leitura do arquivo do caminho fornecido
      const fs = require('fs').promises;
      content = await fs.readFile(request.filePath, 'utf-8');
      fileName = request.filePath.split('/').pop() || 'file.txt';
    } else {
      throw new BadRequestException(
        'Conteúdo do arquivo ou caminho do arquivo é obrigatório',
      );
    }

    const result = await this.validationEngine.validateFile(
      content,
      fileName,
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
}
