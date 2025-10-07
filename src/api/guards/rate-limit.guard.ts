import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly requests = new Map<string, RateLimitInfo>();
  private readonly maxRequests = 100; // 100 requests por janela
  private readonly windowMs = 15 * 60 * 1000; // 15 minutos

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientId = this.getClientId(request);
    const now = Date.now();

    const rateLimitInfo = this.requests.get(clientId);

    if (!rateLimitInfo || now > rateLimitInfo.resetTime) {
      // Nova janela de tempo
      this.requests.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (rateLimitInfo.count >= this.maxRequests) {
      throw new HttpException(
        `Limite de requisições excedido. Máximo ${this.maxRequests} requisições por ${this.windowMs / 1000 / 60} minutos`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    rateLimitInfo.count++;
    return true;
  }

  private getClientId(request: Request): string {
    // Usar IP do cliente como identificador
    const forwarded = request.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.toString().split(',')[0] : request.ip;
    return ip || 'unknown';
  }

  // Limpar entradas expiradas periodicamente
  private cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}
