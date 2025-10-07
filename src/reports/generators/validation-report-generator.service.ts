import { Injectable } from '@nestjs/common';
import { ValidationResult } from '../../common/interfaces/validation.interface';
import { ValidationSeverity } from '../../common/enums/record-types.enum';

export interface ReportOptions {
  format: 'json' | 'pdf' | 'excel';
  includeWarnings?: boolean;
  includeSummary?: boolean;
  groupByRecordType?: boolean;
  groupBySeverity?: boolean;
}

@Injectable()
export class ValidationReportGeneratorService {
  async generateReport(
    validationResult: ValidationResult,
    options: ReportOptions,
  ): Promise<Buffer | string> {
    switch (options.format) {
      case 'json':
        return this.generateJsonReport(validationResult, options);
      case 'pdf':
        return this.generatePdfReport(validationResult, options);
      case 'excel':
        return this.generateExcelReport(validationResult, options);
      default:
        throw new Error(
          `Formato de relatório não suportado: ${options.format}`,
        );
    }
  }

  private async generateJsonReport(
    validationResult: ValidationResult,
    options: ReportOptions,
  ): Promise<string> {
    const report = {
      summary: {
        isValid: validationResult.isValid,
        totalRecords: validationResult.totalRecords,
        processedRecords: validationResult.processedRecords,
        totalErrors: validationResult.errors.length,
        totalWarnings: validationResult.warnings.length,
        processingTime: validationResult.processingTime,
        fileMetadata: validationResult.fileMetadata,
      },
      errors: validationResult.errors,
      warnings: options.includeWarnings ? validationResult.warnings : [],
      groupedData: this.groupValidationData(validationResult, options),
    };

    return JSON.stringify(report, null, 2);
  }

  private async generatePdfReport(
    validationResult: ValidationResult,
    options: ReportOptions,
  ): Promise<Buffer> {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();

    // Configurar o documento
    doc.fontSize(16).text('Relatório de Validação - Censo Escolar', 50, 50);
    doc
      .fontSize(12)
      .text(`Arquivo: ${validationResult.fileMetadata.fileName}`, 50, 80);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 50, 100);

    // Resumo
    doc.fontSize(14).text('Resumo', 50, 130);
    doc.fontSize(10);
    doc.text(
      `Status: ${validationResult.isValid ? 'VÁLIDO' : 'INVÁLIDO'}`,
      70,
      150,
    );
    doc.text(`Total de Registros: ${validationResult.totalRecords}`, 70, 170);
    doc.text(
      `Registros Processados: ${validationResult.processedRecords}`,
      70,
      190,
    );
    doc.text(`Total de Erros: ${validationResult.errors.length}`, 70, 210);
    doc.text(`Total de Avisos: ${validationResult.warnings.length}`, 70, 230);
    doc.text(
      `Tempo de Processamento: ${validationResult.processingTime}ms`,
      70,
      250,
    );

    // Erros
    if (validationResult.errors.length > 0) {
      doc.fontSize(14).text('Erros Encontrados', 50, 280);
      let yPosition = 300;

      validationResult.errors.forEach((error, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(10);
        doc.text(
          `${index + 1}. Linha ${error.lineNumber} - ${error.recordType}`,
          70,
          yPosition,
        );
        doc.text(`   Campo: ${error.fieldName}`, 90, yPosition + 15);
        doc.text(`   Valor: ${error.fieldValue}`, 90, yPosition + 30);
        doc.text(`   Regra: ${error.ruleName}`, 90, yPosition + 45);
        doc.text(`   Mensagem: ${error.errorMessage}`, 90, yPosition + 60);
        yPosition += 85;
      });
    }

    // Avisos (se solicitado)
    if (options.includeWarnings && validationResult.warnings.length > 0) {
      doc.addPage();
      doc.fontSize(14).text('Avisos', 50, 50);
      let yPosition = 70;

      validationResult.warnings.forEach((warning, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.fontSize(10);
        doc.text(
          `${index + 1}. Linha ${warning.lineNumber} - ${warning.recordType}`,
          70,
          yPosition,
        );
        doc.text(`   Campo: ${warning.fieldName}`, 90, yPosition + 15);
        doc.text(`   Valor: ${warning.fieldValue}`, 90, yPosition + 30);
        doc.text(`   Regra: ${warning.ruleName}`, 90, yPosition + 45);
        doc.text(`   Mensagem: ${warning.errorMessage}`, 90, yPosition + 60);
        yPosition += 85;
      });
    }

    return new Promise((resolve) => {
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.end();
    });
  }

  private async generateExcelReport(
    validationResult: ValidationResult,
    options: ReportOptions,
  ): Promise<Buffer> {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();

    // Planilha de Resumo
    const summarySheet = workbook.addWorksheet('Resumo');
    summarySheet.columns = [
      { header: 'Item', key: 'item', width: 30 },
      { header: 'Valor', key: 'value', width: 20 },
    ];

    summarySheet.addRows([
      {
        item: 'Status',
        value: validationResult.isValid ? 'VÁLIDO' : 'INVÁLIDO',
      },
      { item: 'Arquivo', value: validationResult.fileMetadata.fileName },
      {
        item: 'Tamanho (bytes)',
        value: validationResult.fileMetadata.fileSize,
      },
      { item: 'Total de Linhas', value: validationResult.totalRecords },
      {
        item: 'Registros Processados',
        value: validationResult.processedRecords,
      },
      { item: 'Total de Erros', value: validationResult.errors.length },
      { item: 'Total de Avisos', value: validationResult.warnings.length },
      {
        item: 'Tempo de Processamento (ms)',
        value: validationResult.processingTime,
      },
    ]);

    // Planilha de Erros
    if (validationResult.errors.length > 0) {
      const errorsSheet = workbook.addWorksheet('Erros');
      errorsSheet.columns = [
        { header: 'Linha', key: 'lineNumber', width: 10 },
        { header: 'Tipo de Registro', key: 'recordType', width: 15 },
        { header: 'Campo', key: 'fieldName', width: 20 },
        { header: 'Valor', key: 'fieldValue', width: 30 },
        { header: 'Regra', key: 'ruleName', width: 25 },
        { header: 'Mensagem', key: 'errorMessage', width: 50 },
      ];

      validationResult.errors.forEach((error) => {
        errorsSheet.addRow({
          lineNumber: error.lineNumber,
          recordType: error.recordType,
          fieldName: error.fieldName,
          fieldValue: error.fieldValue,
          ruleName: error.ruleName,
          errorMessage: error.errorMessage,
        });
      });

      // Aplicar formatação condicional para destacar erros
      errorsSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFE6E6' },
          };
        }
      });
    }

    // Planilha de Avisos (se solicitado)
    if (options.includeWarnings && validationResult.warnings.length > 0) {
      const warningsSheet = workbook.addWorksheet('Avisos');
      warningsSheet.columns = [
        { header: 'Linha', key: 'lineNumber', width: 10 },
        { header: 'Tipo de Registro', key: 'recordType', width: 15 },
        { header: 'Campo', key: 'fieldName', width: 20 },
        { header: 'Valor', key: 'fieldValue', width: 30 },
        { header: 'Regra', key: 'ruleName', width: 25 },
        { header: 'Mensagem', key: 'errorMessage', width: 50 },
      ];

      validationResult.warnings.forEach((warning) => {
        warningsSheet.addRow({
          lineNumber: warning.lineNumber,
          recordType: warning.recordType,
          fieldName: warning.fieldName,
          fieldValue: warning.fieldValue,
          ruleName: warning.ruleName,
          errorMessage: warning.errorMessage,
        });
      });

      // Aplicar formatação condicional para destacar avisos
      warningsSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF2CC' },
          };
        }
      });
    }

    // Planilha de Estatísticas por Tipo de Registro
    if (options.groupByRecordType) {
      const statsSheet = workbook.addWorksheet('Estatísticas por Tipo');
      const recordTypeStats = this.getRecordTypeStatistics(validationResult);

      statsSheet.columns = [
        { header: 'Tipo de Registro', key: 'recordType', width: 20 },
        { header: 'Total de Erros', key: 'errorCount', width: 15 },
        { header: 'Total de Avisos', key: 'warningCount', width: 15 },
        { header: 'Registros Processados', key: 'processedCount', width: 20 },
      ];

      Object.entries(recordTypeStats).forEach(([recordType, stats]) => {
        statsSheet.addRow({
          recordType,
          errorCount: (stats as any).errorCount,
          warningCount: (stats as any).warningCount,
          processedCount: (stats as any).processedCount,
        });
      });
    }

    return workbook.xlsx.writeBuffer();
  }

  private groupValidationData(
    validationResult: ValidationResult,
    options: ReportOptions,
  ): any {
    const grouped: any = {};

    if (options.groupByRecordType) {
      grouped.byRecordType = this.groupByRecordType(validationResult);
    }

    if (options.groupBySeverity) {
      grouped.bySeverity = this.groupBySeverity(validationResult);
    }

    return grouped;
  }

  private groupByRecordType(validationResult: ValidationResult): any {
    const grouped: any = {};

    // Agrupar erros por tipo de registro
    validationResult.errors.forEach((error) => {
      if (!grouped[error.recordType]) {
        grouped[error.recordType] = { errors: [], warnings: [] };
      }
      grouped[error.recordType].errors.push(error);
    });

    // Agrupar avisos por tipo de registro
    validationResult.warnings.forEach((warning) => {
      if (!grouped[warning.recordType]) {
        grouped[warning.recordType] = { errors: [], warnings: [] };
      }
      grouped[warning.recordType].warnings.push(warning);
    });

    return grouped;
  }

  private groupBySeverity(validationResult: ValidationResult): any {
    const grouped: any = {
      errors: validationResult.errors,
      warnings: validationResult.warnings,
    };

    return grouped;
  }

  private getRecordTypeStatistics(validationResult: ValidationResult): any {
    const stats: any = {};

    // Contar erros por tipo de registro
    validationResult.errors.forEach((error) => {
      if (!stats[error.recordType]) {
        stats[error.recordType] = {
          errorCount: 0,
          warningCount: 0,
          processedCount: 0,
        };
      }
      stats[error.recordType].errorCount++;
    });

    // Contar avisos por tipo de registro
    validationResult.warnings.forEach((warning) => {
      if (!stats[warning.recordType]) {
        stats[warning.recordType] = {
          errorCount: 0,
          warningCount: 0,
          processedCount: 0,
        };
      }
      stats[warning.recordType].warningCount++;
    });

    return stats;
  }
}
