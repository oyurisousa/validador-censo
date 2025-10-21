import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ValidationLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Validation');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl } = request;
    const startTime = Date.now();

    this.logger.log(`Iniciando validação: ${method} ${originalUrl}`);

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - startTime;

        if (data && typeof data === 'object') {
          const { isValid, totalRecords, errors, warnings, processingTime } =
            data;

          this.logger.log(
            `Validação concluída: ${isValid ? 'VÁLIDA' : 'INVÁLIDA'} - ` +
              `${totalRecords} registros - ${errors?.length || 0} erros - ` +
              `${warnings?.length || 0} avisos - ${responseTime}ms`,
          );

          // Log detalhado apenas em desenvolvimento ou quando solicitado
          if (
            process.env.NODE_ENV === 'development' &&
            errors &&
            errors.length > 0
          ) {
            this.logger.debug(`Erros encontrados: ${errors.length}`);
            errors.slice(0, 3).forEach((error: any, index: number) => {
              this.logger.debug(
                `  ${index + 1}. Linha ${error.lineNumber} - ${error.fieldName}: ${error.errorMessage}`,
              );
            });
            if (errors.length > 3) {
              this.logger.debug(`  ... e mais ${errors.length - 3} erros`);
            }
          }
        }
      }),
    );
  }
}
