import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Error');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const { method, originalUrl, body, file } = request;

        this.logger.error(
          `Erro na requisição: ${method} ${originalUrl}`,
          error.stack,
        );

        // Log detalhado do erro
        this.logger.error(`Detalhes do erro:`, {
          message: error.message,
          status: error.status || 500,
          method,
          url: originalUrl,
          body: body ? JSON.stringify(body).substring(0, 500) : null,
          file: file
            ? {
                originalname: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
              }
            : null,
        });

        return throwError(() => error);
      }),
    );
  }
}
