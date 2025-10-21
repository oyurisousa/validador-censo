import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../common/interfaces/validation.interface';
import {
  ValidationSeverity,
  RecordTypeEnum,
} from '../../common/enums/record-types.enum';

export interface ErrorReportOptions {
  format: 'json' | 'csv' | 'txt';
  includeDetails?: boolean;
  sortBy?: 'line' | 'recordType' | 'severity' | 'field';
  filterBySeverity?: ValidationSeverity[];
  filterByRecordType?: RecordTypeEnum[];
}

@Injectable()
export class ErrorReportGeneratorService {
  async generateErrorReport(
    errors: ValidationError[],
    options: ErrorReportOptions,
  ): Promise<string | Buffer> {
    // Aplicar filtros
    let filteredErrors = this.applyFilters(errors, options);

    // Aplicar ordenação
    filteredErrors = this.applySorting(filteredErrors, options.sortBy);

    switch (options.format) {
      case 'json':
        return this.generateJsonErrorReport(filteredErrors, options);
      case 'csv':
        return this.generateCsvErrorReport(filteredErrors, options);
      case 'txt':
        return this.generateTxtErrorReport(filteredErrors, options);
      default:
        throw new Error(
          `Formato de relatório de erro não suportado: ${options.format}`,
        );
    }
  }

  private applyFilters(
    errors: ValidationError[],
    options: ErrorReportOptions,
  ): ValidationError[] {
    let filtered = [...errors];

    // Filtrar por severidade
    if (options.filterBySeverity && options.filterBySeverity.length > 0) {
      filtered = filtered.filter((error) =>
        options.filterBySeverity!.includes(
          error.severity as ValidationSeverity,
        ),
      );
    }

    // Filtrar por tipo de registro
    if (options.filterByRecordType && options.filterByRecordType.length > 0) {
      filtered = filtered.filter((error) =>
        options.filterByRecordType!.includes(
          error.recordType as RecordTypeEnum,
        ),
      );
    }

    return filtered;
  }

  private applySorting(
    errors: ValidationError[],
    sortBy?: string,
  ): ValidationError[] {
    if (!sortBy) return errors;

    return errors.sort((a, b) => {
      switch (sortBy) {
        case 'line':
          return a.lineNumber - b.lineNumber;
        case 'recordType':
          return a.recordType.localeCompare(b.recordType);
        case 'severity':
          return a.severity.localeCompare(b.severity);
        case 'field':
          return a.fieldName.localeCompare(b.fieldName);
        default:
          return 0;
      }
    });
  }

  private generateJsonErrorReport(
    errors: ValidationError[],
    options: ErrorReportOptions,
  ): string {
    const report = {
      summary: {
        totalErrors: errors.length,
        errorsBySeverity: this.getErrorsBySeverity(errors),
        errorsByRecordType: this.getErrorsByRecordType(errors),
        errorsByField: this.getErrorsByField(errors),
      },
      errors: options.includeDetails
        ? errors
        : this.getSimplifiedErrors(errors),
      generatedAt: new Date().toISOString(),
    };

    return JSON.stringify(report, null, 2);
  }

  private generateCsvErrorReport(
    errors: ValidationError[],
    options: ErrorReportOptions,
  ): string {
    const headers = [
      'Linha',
      'Tipo de Registro',
      'Campo',
      'Valor',
      'Regra',
      'Severidade',
      'Mensagem de Erro',
    ];

    const csvRows = [headers.join(',')];

    errors.forEach((error) => {
      const row = [
        error.lineNumber.toString(),
        `"${error.recordType}"`,
        `"${error.fieldName}"`,
        `"${error.fieldValue.replace(/"/g, '""')}"`,
        `"${error.ruleName}"`,
        `"${error.severity}"`,
        `"${error.errorMessage.replace(/"/g, '""')}"`,
      ];
      csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
  }

  private generateTxtErrorReport(
    errors: ValidationError[],
    options: ErrorReportOptions,
  ): string {
    const lines: string[] = [];

    lines.push('='.repeat(80));
    lines.push('RELATÓRIO DE ERROS - CENSO ESCOLAR');
    lines.push('='.repeat(80));
    lines.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
    lines.push(`Total de erros: ${errors.length}`);
    lines.push('');

    if (errors.length === 0) {
      lines.push('Nenhum erro encontrado!');
      return lines.join('\n');
    }

    // Resumo por severidade
    const errorsBySeverity = this.getErrorsBySeverity(errors);
    lines.push('RESUMO POR SEVERIDADE:');
    lines.push('-'.repeat(40));
    Object.entries(errorsBySeverity).forEach(([severity, count]) => {
      lines.push(`${severity.toUpperCase()}: ${count}`);
    });
    lines.push('');

    // Resumo por tipo de registro
    const errorsByRecordType = this.getErrorsByRecordType(errors);
    lines.push('RESUMO POR TIPO DE REGISTRO:');
    lines.push('-'.repeat(40));
    Object.entries(errorsByRecordType).forEach(([recordType, count]) => {
      lines.push(`${recordType}: ${count}`);
    });
    lines.push('');

    // Detalhes dos erros
    lines.push('DETALHES DOS ERROS:');
    lines.push('='.repeat(80));

    errors.forEach((error, index) => {
      lines.push(`\n${index + 1}. ERRO NA LINHA ${error.lineNumber}`);
      lines.push(`   Tipo de Registro: ${error.recordType}`);
      lines.push(`   Campo: ${error.fieldName}`);
      lines.push(`   Valor: ${error.fieldValue}`);
      lines.push(`   Regra: ${error.ruleName}`);
      lines.push(`   Severidade: ${error.severity.toUpperCase()}`);
      lines.push(`   Mensagem: ${error.errorMessage}`);
      lines.push('-'.repeat(60));
    });

    return lines.join('\n');
  }

  private getErrorsBySeverity(
    errors: ValidationError[],
  ): Record<string, number> {
    const counts: Record<string, number> = {};
    errors.forEach((error) => {
      counts[error.severity] = (counts[error.severity] || 0) + 1;
    });
    return counts;
  }

  private getErrorsByRecordType(
    errors: ValidationError[],
  ): Record<string, number> {
    const counts: Record<string, number> = {};
    errors.forEach((error) => {
      counts[error.recordType] = (counts[error.recordType] || 0) + 1;
    });
    return counts;
  }

  private getErrorsByField(errors: ValidationError[]): Record<string, number> {
    const counts: Record<string, number> = {};
    errors.forEach((error) => {
      counts[error.fieldName] = (counts[error.fieldName] || 0) + 1;
    });
    return counts;
  }

  private getSimplifiedErrors(errors: ValidationError[]): any[] {
    return errors.map((error) => ({
      line: error.lineNumber,
      recordType: error.recordType,
      field: error.fieldName,
      rule: error.ruleName,
      severity: error.severity,
      message: error.errorMessage,
    }));
  }
}
