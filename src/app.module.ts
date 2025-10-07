import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ValidationModule } from './validation/validation.module';
import { FileProcessingModule } from './file-processing/file-processing.module';
import { ReportsModule } from './reports/reports.module';
import { ValidationController } from './api/controllers/validation.controller';
import { ReportsController } from './api/controllers/reports.controller';
import { LoggingMiddleware } from './api/middleware/logging.middleware';
import { ErrorLoggingInterceptor } from './api/interceptors/error-logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
    ]),
    ValidationModule,
    FileProcessingModule,
    ReportsModule,
  ],
  controllers: [AppController, ValidationController, ReportsController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorLoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
