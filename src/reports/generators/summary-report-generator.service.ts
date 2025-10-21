import { Injectable } from '@nestjs/common';
import { ValidationResult } from '../../common/interfaces/validation.interface';
import {
  ValidationSeverity,
  RecordTypeEnum,
} from '../../common/enums/record-types.enum';

export interface SummaryReportOptions {
  format: 'json' | 'html' | 'txt';
  includeCharts?: boolean;
  includeRecommendations?: boolean;
}

export interface SummaryStatistics {
  totalRecords: number;
  processedRecords: number;
  errorCount: number;
  warningCount: number;
  successRate: number;
  processingTime: number;
  errorsByRecordType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
  topErrorFields: Array<{ field: string; count: number }>;
  recommendations: string[];
}

@Injectable()
export class SummaryReportGeneratorService {
  async generateSummaryReport(
    validationResult: ValidationResult,
    options: SummaryReportOptions,
  ): Promise<string | Buffer> {
    const statistics = this.calculateStatistics(validationResult);
    const recommendations = this.generateRecommendations(statistics);

    switch (options.format) {
      case 'json':
        return this.generateJsonSummary(statistics, recommendations);
      case 'html':
        return this.generateHtmlSummary(statistics, recommendations, options);
      case 'txt':
        return this.generateTxtSummary(statistics, recommendations);
      default:
        throw new Error(
          `Formato de relatório resumo não suportado: ${options.format}`,
        );
    }
  }

  private calculateStatistics(
    validationResult: ValidationResult,
  ): SummaryStatistics {
    const errorsByRecordType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    const fieldErrorCounts: Record<string, number> = {};

    // Contar erros por tipo de registro
    validationResult.errors.forEach((error) => {
      errorsByRecordType[error.recordType] =
        (errorsByRecordType[error.recordType] || 0) + 1;
      errorsBySeverity[error.severity] =
        (errorsBySeverity[error.severity] || 0) + 1;
      fieldErrorCounts[error.fieldName] =
        (fieldErrorCounts[error.fieldName] || 0) + 1;
    });

    // Contar avisos por severidade
    validationResult.warnings.forEach((warning) => {
      errorsBySeverity[warning.severity] =
        (errorsBySeverity[warning.severity] || 0) + 1;
    });

    // Calcular top campos com erro
    const topErrorFields = Object.entries(fieldErrorCounts)
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const successRate =
      validationResult.totalRecords > 0
        ? ((validationResult.totalRecords - validationResult.errors.length) /
            validationResult.totalRecords) *
          100
        : 100;

    return {
      totalRecords: validationResult.totalRecords,
      processedRecords: validationResult.processedRecords,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length,
      successRate: Math.round(successRate * 100) / 100,
      processingTime: validationResult.processingTime,
      errorsByRecordType,
      errorsBySeverity,
      topErrorFields,
      recommendations: [],
    };
  }

  private generateRecommendations(statistics: SummaryStatistics): string[] {
    const recommendations: string[] = [];

    // Recomendações baseadas na taxa de sucesso
    if (statistics.successRate < 50) {
      recommendations.push(
        'Taxa de sucesso muito baixa. Revise completamente o arquivo antes do envio.',
      );
    } else if (statistics.successRate < 80) {
      recommendations.push(
        'Taxa de sucesso moderada. Corrija os erros identificados antes do envio.',
      );
    } else if (statistics.successRate < 95) {
      recommendations.push(
        'Taxa de sucesso boa. Apenas alguns ajustes são necessários.',
      );
    } else {
      recommendations.push(
        'Taxa de sucesso excelente! O arquivo está quase pronto para envio.',
      );
    }

    // Recomendações baseadas nos campos com mais erros
    if (statistics.topErrorFields.length > 0) {
      const topField = statistics.topErrorFields[0];
      if (topField.count > statistics.errorCount * 0.3) {
        recommendations.push(
          `O campo '${topField.field}' concentra muitos erros. Verifique sua formatação e valores.`,
        );
      }
    }

    // Recomendações baseadas no tipo de registro com mais erros
    const recordTypeWithMostErrors = Object.entries(
      statistics.errorsByRecordType,
    ).sort(([, a], [, b]) => b - a)[0];

    if (
      recordTypeWithMostErrors &&
      recordTypeWithMostErrors[1] > statistics.errorCount * 0.4
    ) {
      recommendations.push(
        `O tipo de registro '${recordTypeWithMostErrors[0]}' tem muitos erros. Revise a estrutura dos dados.`,
      );
    }

    // Recomendações baseadas no tempo de processamento
    if (statistics.processingTime > 10000) {
      recommendations.push(
        'Tempo de processamento alto. Considere otimizar o arquivo ou dividir em partes menores.',
      );
    }

    return recommendations;
  }

  private generateJsonSummary(
    statistics: SummaryStatistics,
    recommendations: string[],
  ): string {
    const report = {
      ...statistics,
      recommendations,
      generatedAt: new Date().toISOString(),
    };

    return JSON.stringify(report, null, 2);
  }

  private generateHtmlSummary(
    statistics: SummaryStatistics,
    recommendations: string[],
    options: SummaryReportOptions,
  ): string {
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Resumo - Validação Censo Escolar</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #2c3e50; margin-bottom: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db; }
        .stat-card.error { border-left-color: #e74c3c; }
        .stat-card.warning { border-left-color: #f39c12; }
        .stat-card.success { border-left-color: #27ae60; }
        .stat-value { font-size: 2em; font-weight: bold; color: #2c3e50; }
        .stat-label { color: #7f8c8d; margin-top: 5px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .recommendations { background: #e8f4f8; padding: 20px; border-radius: 8px; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        .recommendations li { margin-bottom: 10px; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #7f8c8d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Relatório Resumo - Validação Censo Escolar</h1>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card ${statistics.errorCount > 0 ? 'error' : 'success'}">
                <div class="stat-value">${statistics.errorCount}</div>
                <div class="stat-label">Erros Encontrados</div>
            </div>
            <div class="stat-card ${statistics.warningCount > 0 ? 'warning' : 'success'}">
                <div class="stat-value">${statistics.warningCount}</div>
                <div class="stat-label">Avisos</div>
            </div>
            <div class="stat-card success">
                <div class="stat-value">${statistics.successRate}%</div>
                <div class="stat-label">Taxa de Sucesso</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${statistics.totalRecords}</div>
                <div class="stat-label">Total de Registros</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${statistics.processingTime}ms</div>
                <div class="stat-label">Tempo de Processamento</div>
            </div>
        </div>

        <div class="section">
            <h2>Distribuição de Erros por Tipo de Registro</h2>
            <div class="chart-container">
                ${this.generateRecordTypeChart(statistics.errorsByRecordType)}
            </div>
        </div>

        <div class="section">
            <h2>Campos com Mais Erros</h2>
            <div class="chart-container">
                ${this.generateTopFieldsChart(statistics.topErrorFields)}
            </div>
        </div>

        <div class="section">
            <h2>Recomendações</h2>
            <div class="recommendations">
                <ul>
                    ${recommendations.map((rec) => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        </div>

        <div class="footer">
            <p>Relatório gerado automaticamente pelo Validador de Arquivos do Censo Escolar</p>
        </div>
    </div>
</body>
</html>`;

    return html;
  }

  private generateTxtSummary(
    statistics: SummaryStatistics,
    recommendations: string[],
  ): string {
    const lines: string[] = [];

    lines.push('='.repeat(80));
    lines.push('RELATÓRIO RESUMO - VALIDAÇÃO CENSO ESCOLAR');
    lines.push('='.repeat(80));
    lines.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
    lines.push('');

    // Estatísticas principais
    lines.push('ESTATÍSTICAS PRINCIPAIS:');
    lines.push('-'.repeat(40));
    lines.push(`Total de Registros: ${statistics.totalRecords}`);
    lines.push(`Registros Processados: ${statistics.processedRecords}`);
    lines.push(`Total de Erros: ${statistics.errorCount}`);
    lines.push(`Total de Avisos: ${statistics.warningCount}`);
    lines.push(`Taxa de Sucesso: ${statistics.successRate}%`);
    lines.push(`Tempo de Processamento: ${statistics.processingTime}ms`);
    lines.push('');

    // Erros por tipo de registro
    if (Object.keys(statistics.errorsByRecordType).length > 0) {
      lines.push('ERROS POR TIPO DE REGISTRO:');
      lines.push('-'.repeat(40));
      Object.entries(statistics.errorsByRecordType)
        .sort(([, a], [, b]) => b - a)
        .forEach(([recordType, count]) => {
          lines.push(`${recordType}: ${count} erros`);
        });
      lines.push('');
    }

    // Top campos com erro
    if (statistics.topErrorFields.length > 0) {
      lines.push('CAMPOS COM MAIS ERROS:');
      lines.push('-'.repeat(40));
      statistics.topErrorFields.forEach((field, index) => {
        lines.push(`${index + 1}. ${field.field}: ${field.count} erros`);
      });
      lines.push('');
    }

    // Recomendações
    if (recommendations.length > 0) {
      lines.push('RECOMENDAÇÕES:');
      lines.push('-'.repeat(40));
      recommendations.forEach((rec, index) => {
        lines.push(`${index + 1}. ${rec}`);
      });
      lines.push('');
    }

    lines.push('='.repeat(80));

    return lines.join('\n');
  }

  private generateRecordTypeChart(
    errorsByRecordType: Record<string, number>,
  ): string {
    const entries = Object.entries(errorsByRecordType).sort(
      ([, a], [, b]) => b - a,
    );
    if (entries.length === 0) return '<p>Nenhum erro encontrado.</p>';

    const maxValue = Math.max(...entries.map(([, count]) => count));

    return entries
      .map(([recordType, count]) => {
        const percentage = (count / maxValue) * 100;
        return `
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span><strong>${recordType}</strong></span>
            <span>${count} erros</span>
          </div>
          <div style="background: #ecf0f1; height: 20px; border-radius: 10px; overflow: hidden;">
            <div style="background: #e74c3c; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
          </div>
        </div>
      `;
      })
      .join('');
  }

  private generateTopFieldsChart(
    topFields: Array<{ field: string; count: number }>,
  ): string {
    if (topFields.length === 0)
      return '<p>Nenhum campo com erro encontrado.</p>';

    const maxValue = Math.max(...topFields.map((field) => field.count));

    return topFields
      .map((field, index) => {
        const percentage = (field.count / maxValue) * 100;
        return `
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span><strong>${field.field}</strong></span>
            <span>${field.count} erros</span>
          </div>
          <div style="background: #ecf0f1; height: 20px; border-radius: 10px; overflow: hidden;">
            <div style="background: #f39c12; height: 100%; width: ${percentage}%; transition: width 0.3s ease;"></div>
          </div>
        </div>
      `;
      })
      .join('');
  }
}
