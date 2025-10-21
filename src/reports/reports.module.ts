import { Module } from '@nestjs/common';
import { ValidationReportGeneratorService } from './generators/validation-report-generator.service';
import { ErrorReportGeneratorService } from './generators/error-report-generator.service';
import { SummaryReportGeneratorService } from './generators/summary-report-generator.service';

@Module({
  providers: [
    ValidationReportGeneratorService,
    ErrorReportGeneratorService,
    SummaryReportGeneratorService,
  ],
  exports: [
    ValidationReportGeneratorService,
    ErrorReportGeneratorService,
    SummaryReportGeneratorService,
  ],
})
export class ReportsModule {}
