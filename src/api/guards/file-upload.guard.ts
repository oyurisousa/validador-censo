import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class FileUploadGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const file = request.file;

    if (!file) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    // Validar tipo de arquivo
    if (!file.originalname.endsWith('.txt')) {
      throw new BadRequestException('Apenas arquivos .txt são permitidos');
    }

    // Validar tamanho do arquivo (20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        `Arquivo muito grande. Tamanho máximo permitido: 20MB. Tamanho atual: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Validar nome do arquivo
    const fileName = file.originalname.replace('.txt', '');
    const allowedPattern = /^[a-zA-Z0-9_]+$/;
    if (!allowedPattern.test(fileName)) {
      throw new BadRequestException(
        'Nome do arquivo deve conter apenas letras, números e underscore',
      );
    }

    // Validar tamanho do nome (máximo 20 caracteres)
    if (fileName.length > 20) {
      throw new BadRequestException(
        'Nome do arquivo deve ter no máximo 20 caracteres',
      );
    }

    return true;
  }
}
