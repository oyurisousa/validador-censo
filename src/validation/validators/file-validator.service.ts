import { Injectable } from '@nestjs/common';
import { ValidationError } from '../../common/interfaces/validation.interface';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../common/enums/record-types.enum';

@Injectable()
export class FileValidatorService {
  async validateFile(
    content: string,
    fileName: string,
    phase: '1' | '2' = '1',
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    // Validar nome do arquivo
    const fileNameErrors = this.validateFileName(fileName);
    errors.push(...fileNameErrors);

    // Validar tamanho do arquivo
    const fileSizeErrors = this.validateFileSize(content);
    errors.push(...fileSizeErrors);

    // Validar estrutura geral do arquivo
    const structureErrors = this.validateFileStructure(content, phase);
    errors.push(...structureErrors);

    return errors;
  }

  private validateFileName(fileName: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Verificar se o nome não está vazio
    if (!fileName || fileName.trim() === '') {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'file_name',
        fieldValue: fileName || '',
        ruleName: 'file_name_required',
        errorMessage: 'Nome do arquivo é obrigatório',
        severity: ValidationSeverity.ERROR,
      });
      return errors;
    }

    // Verificar tamanho máximo (20 caracteres)
    if (fileName.length > 20) {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'file_name',
        fieldValue: fileName,
        ruleName: 'file_name_length',
        errorMessage: 'Nome do arquivo deve ter no máximo 20 caracteres',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Verificar se contém apenas caracteres permitidos
    const allowedPattern = /^[a-zA-Z0-9_]+\.txt$/;
    if (!allowedPattern.test(fileName)) {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'file_name',
        fieldValue: fileName,
        ruleName: 'file_name_format',
        errorMessage:
          'Nome do arquivo deve conter apenas letras, números, underscore e extensão .txt',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Verificar se não contém espaços
    if (fileName.includes(' ')) {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'file_name',
        fieldValue: fileName,
        ruleName: 'file_name_spaces',
        errorMessage: 'Nome do arquivo não pode conter espaços',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  private validateFileSize(content: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const fileSizeInBytes = Buffer.byteLength(content, 'utf8');
    const maxSizeInBytes = 20 * 1024 * 1024; // 20MB

    if (fileSizeInBytes > maxSizeInBytes) {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'file_size',
        fieldValue: `${(fileSizeInBytes / 1024 / 1024).toFixed(2)}MB`,
        ruleName: 'file_size_limit',
        errorMessage: `Arquivo excede o tamanho máximo de 20MB. Tamanho atual: ${(fileSizeInBytes / 1024 / 1024).toFixed(2)}MB`,
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }

  private validateFileStructure(
    content: string,
    phase: '1' | '2' = '1',
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Verificar se o arquivo não está vazio
    if (!content || content.trim() === '') {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'file_content',
        fieldValue: '',
        ruleName: 'file_empty',
        errorMessage: 'Arquivo não pode estar vazio',
        severity: ValidationSeverity.ERROR,
      });
      return errors;
    }

    const lines = content.split('\n').filter((line) => line.trim() !== '');

    if (lines.length === 0) {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'file_content',
        fieldValue: '',
        ruleName: 'file_no_lines',
        errorMessage: 'Arquivo deve conter pelo menos uma linha de dados',
        severity: ValidationSeverity.ERROR,
      });
      return errors;
    }

    // Verificar se o arquivo termina com registro 99
    const lastLine = lines[lines.length - 1].trim();
    if (!lastLine.startsWith('99|')) {
      errors.push({
        lineNumber: lines.length,
        recordType: 'FILE',
        fieldName: 'file_end',
        fieldValue: lastLine.substring(0, 10),
        ruleName: 'file_end_record',
        errorMessage:
          'Arquivo deve terminar com registro 99 (final do arquivo)',
        severity: ValidationSeverity.ERROR,
      });
    }

    // Verificar se há pelo menos um registro de escola (00) - SOMENTE PARA FASE 1
    if (phase === '1') {
      const hasSchoolRecord = lines.some((line) =>
        line.trim().startsWith('00|'),
      );
      if (!hasSchoolRecord) {
        errors.push({
          lineNumber: 0,
          recordType: 'FILE',
          fieldName: 'file_structure',
          fieldValue: '',
          ruleName: 'file_school_record',
          errorMessage:
            'Arquivo deve conter pelo menos um registro de identificação da escola (00)',
          severity: ValidationSeverity.ERROR,
        });
      }
    }

    // Verificar se há registros duplicados de final de arquivo
    const endRecords = lines.filter((line) => line.trim().startsWith('99|'));
    if (endRecords.length > 1) {
      errors.push({
        lineNumber: 0,
        recordType: 'FILE',
        fieldName: 'file_structure',
        fieldValue: '',
        ruleName: 'file_multiple_end',
        errorMessage:
          'Arquivo não pode conter múltiplos registros de final (99)',
        severity: ValidationSeverity.ERROR,
      });
    }

    return errors;
  }
}
