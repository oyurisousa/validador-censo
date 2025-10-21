import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  Res,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ValidationReportGeneratorService } from '../../reports/generators/validation-report-generator.service';
import { ErrorReportGeneratorService } from '../../reports/generators/error-report-generator.service';
import { SummaryReportGeneratorService } from '../../reports/generators/summary-report-generator.service';
import { ValidationResultDto } from '../../common/dto/validation.dto';
import { RateLimitGuard } from '../guards/rate-limit.guard';

@ApiTags('Relatórios')
@Controller('reports')
@UseGuards(RateLimitGuard)
export class ReportsController {
  constructor(
    private readonly validationReportGenerator: ValidationReportGeneratorService,
    private readonly errorReportGenerator: ErrorReportGeneratorService,
    private readonly summaryReportGenerator: SummaryReportGeneratorService,
  ) {}

  @Post('validation')
  @ApiOperation({
    summary: 'Gerar relatório de validação',
    description: 'Gera relatório detalhado da validação em diferentes formatos',
  })
  @ApiQuery({
    name: 'format',
    enum: ['json', 'pdf', 'excel'],
    description: 'Formato do relatório',
    required: false,
  })
  @ApiQuery({
    name: 'includeWarnings',
    type: 'boolean',
    description: 'Incluir avisos no relatório',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório gerado com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Formato inválido ou dados incorretos',
  })
  async generateValidationReport(
    @Body() validationResult: ValidationResultDto,
    @Query('format') format: 'json' | 'pdf' | 'excel' = 'json',
    @Query('includeWarnings') includeWarnings: boolean = false,
    @Query('groupByRecordType') groupByRecordType: boolean = false,
    @Query('groupBySeverity') groupBySeverity: boolean = false,
    @Res() res: Response,
  ) {
    if (!['json', 'pdf', 'excel'].includes(format)) {
      throw new BadRequestException('Formato deve ser json, pdf ou excel');
    }

    const options = {
      format,
      includeWarnings,
      includeSummary: true,
      groupByRecordType,
      groupBySeverity,
    };

    const report = await this.validationReportGenerator.generateReport(
      validationResult as any,
      options,
    );

    const contentType = this.getContentType(format);
    const filename = this.getFilename('validation_report', format);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    if (format === 'json') {
      res.send(report);
    } else {
      res.send(report);
    }
  }

  @Post('errors')
  async generateErrorReport(
    @Body() body: { errors: any[]; options?: any },
    @Query('format') format: 'json' | 'csv' | 'txt' = 'json',
    @Query('includeDetails') includeDetails: boolean = true,
    @Query('sortBy')
    sortBy: 'line' | 'recordType' | 'severity' | 'field' = 'line',
    @Res() res: Response,
  ) {
    if (!['json', 'csv', 'txt'].includes(format)) {
      throw new BadRequestException('Formato deve ser json, csv ou txt');
    }

    const options = {
      format,
      includeDetails,
      sortBy,
      ...body.options,
    };

    const report = await this.errorReportGenerator.generateErrorReport(
      body.errors,
      options,
    );

    const contentType = this.getContentType(format);
    const filename = this.getFilename('error_report', format);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(report);
  }

  @Post('summary')
  async generateSummaryReport(
    @Body() validationResult: ValidationResultDto,
    @Query('format') format: 'json' | 'html' | 'txt' = 'json',
    @Query('includeCharts') includeCharts: boolean = true,
    @Query('includeRecommendations') includeRecommendations: boolean = true,
    @Res() res: Response,
  ) {
    if (!['json', 'html', 'txt'].includes(format)) {
      throw new BadRequestException('Formato deve ser json, html ou txt');
    }

    const options = {
      format,
      includeCharts,
      includeRecommendations,
    };

    const report = await this.summaryReportGenerator.generateSummaryReport(
      validationResult as any,
      options,
    );

    const contentType = this.getContentType(format);
    const filename = this.getFilename('summary_report', format);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    res.send(report);
  }

  @Get('formats')
  getSupportedFormats() {
    return {
      validation: ['json', 'pdf', 'excel'],
      errors: ['json', 'csv', 'txt'],
      summary: ['json', 'html', 'txt'],
    };
  }

  private getContentType(format: string): string {
    const contentTypes: Record<string, string> = {
      json: 'application/json',
      pdf: 'application/pdf',
      excel:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      txt: 'text/plain',
      html: 'text/html',
    };

    return contentTypes[format] || 'application/octet-stream';
  }

  private getFilename(baseName: string, format: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `${baseName}_${timestamp}.${format}`;
  }
}
