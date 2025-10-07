import { Injectable } from '@nestjs/common';
import {
  ValidationResult,
  ValidationError,
  FileMetadata,
} from '../../common/interfaces/validation.interface';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../common/enums/record-types.enum';
import { FieldValidatorService } from '../validators/field-validator.service';
import { RecordValidatorService } from '../validators/record-validator.service';
import { FileValidatorService } from '../validators/file-validator.service';

@Injectable()
export class ValidationEngineService {
  constructor(
    private readonly fieldValidator: FieldValidatorService,
    private readonly recordValidator: RecordValidatorService,
    private readonly fileValidator: FileValidatorService,
  ) {}

  async validateFile(
    content: string,
    fileName: string,
    version: string = '2025',
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const lines = content.split('\n').filter((line) => line.trim() !== '');
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let processedRecords = 0;

    // Validação do arquivo como um todo
    const fileValidationErrors = await this.fileValidator.validateFile(
      content,
      fileName,
    );
    errors.push(...fileValidationErrors);

    // Validação linha por linha
    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i].trim();

      if (line === '') continue;

      try {
        // Determinar tipo de registro
        const recordType = this.extractRecordType(line);

        if (!recordType) {
          errors.push({
            lineNumber,
            recordType: 'UNKNOWN',
            fieldName: 'record_type',
            fieldValue: line.substring(0, 10),
            ruleName: 'record_type_identification',
            errorMessage: 'Tipo de registro não identificado',
            severity: ValidationSeverity.ERROR,
          });
          continue;
        }

        // Validar registro
        const recordErrors = await this.recordValidator.validateRecord(
          line,
          recordType,
          lineNumber,
          version,
        );

        errors.push(
          ...recordErrors.filter(
            (e) => e.severity === ValidationSeverity.ERROR,
          ),
        );
        warnings.push(
          ...recordErrors.filter(
            (e) => e.severity === ValidationSeverity.WARNING,
          ),
        );

        processedRecords++;
      } catch (error) {
        errors.push({
          lineNumber,
          recordType: 'UNKNOWN',
          fieldName: 'line_processing',
          fieldValue: line.substring(0, 50),
          ruleName: 'line_processing_error',
          errorMessage: `Erro ao processar linha: ${error.message}`,
          severity: ValidationSeverity.ERROR,
        });
      }
    }

    const processingTime = Date.now() - startTime;

    const fileMetadata: FileMetadata = {
      fileName,
      fileSize: new TextEncoder().encode(content).length,
      totalLines: lines.length,
      encoding: 'utf-8',
      uploadDate: new Date(),
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalRecords: lines.length,
      processedRecords,
      processingTime,
      fileMetadata,
    };
  }

  private extractRecordType(line: string): RecordTypeEnum | null {
    const parts = line.split('|');
    if (parts.length === 0) return null;

    const recordTypeCode = parts[0].trim();

    switch (recordTypeCode) {
      case '00':
        return RecordTypeEnum.SCHOOL_IDENTIFICATION;
      case '10':
        return RecordTypeEnum.SCHOOL_CHARACTERIZATION;
      case '20':
        return RecordTypeEnum.CLASSES;
      case '30':
        return RecordTypeEnum.PHYSICAL_PERSONS;
      case '40':
        return RecordTypeEnum.SCHOOL_MANAGER_LINKS;
      case '50':
        return RecordTypeEnum.SCHOOL_PROFESSIONAL_LINKS;
      case '60':
        return RecordTypeEnum.STUDENT_LINKS;
      case '99':
        return RecordTypeEnum.FILE_END;
      default:
        return null;
    }
  }
}
