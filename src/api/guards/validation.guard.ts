import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const body = request.body;

    // Validar se o conteúdo não está vazio
    if (body.content && typeof body.content === 'string') {
      if (body.content.trim().length === 0) {
        throw new BadRequestException(
          'Conteúdo do arquivo não pode estar vazio',
        );
      }

      // Validar tamanho do conteúdo
      const maxSize = 20 * 1024 * 1024; // 20MB
      const contentSize = Buffer.byteLength(body.content, 'utf8');
      if (contentSize > maxSize) {
        throw new BadRequestException(
          `Conteúdo muito grande. Tamanho máximo permitido: 20MB. Tamanho atual: ${(contentSize / 1024 / 1024).toFixed(2)}MB`,
        );
      }
    }

    // Validar versão se fornecida
    if (body.version && typeof body.version !== 'string') {
      throw new BadRequestException('Versão deve ser uma string');
    }

    // Validar formato da versão (YYYY)
    if (body.version && !/^\d{4}$/.test(body.version)) {
      throw new BadRequestException(
        'Versão deve estar no formato YYYY (ex: 2025)',
      );
    }

    return true;
  }
}
