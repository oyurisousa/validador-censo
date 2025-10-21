import { Injectable } from '@nestjs/common';
import { RecordTypeEnum } from '../../common/enums/record-types.enum';

export interface ParsedRecord {
  lineNumber: number;
  recordType: RecordTypeEnum;
  fields: string[];
  rawLine: string;
}

export interface ParsedFile {
  records: ParsedRecord[];
  totalLines: number;
  encoding: string;
  fileName: string;
}

@Injectable()
export class TxtFileParserService {
  async parseFile(content: string, fileName: string): Promise<ParsedFile> {
    const lines = content.split('\n');
    const records: ParsedRecord[] = [];
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      const trimmedLine = line.trim();

      // Pular linhas vazias
      if (trimmedLine === '') continue;

      const record = this.parseLine(trimmedLine, lineNumber);
      if (record) {
        records.push(record);
      }
    }

    return {
      records,
      totalLines: lineNumber,
      encoding: 'utf-8',
      fileName,
    };
  }

  private parseLine(line: string, lineNumber: number): ParsedRecord | null {
    // Dividir a linha pelos separadores pipe
    const fields = line.split('|');

    if (fields.length === 0) return null;

    // Extrair tipo de registro
    const recordTypeCode = fields[0]?.trim();
    const recordType = this.getRecordType(recordTypeCode);

    if (!recordType) {
      return null;
    }

    return {
      lineNumber,
      recordType,
      fields: fields.map((field) => field.trim()),
      rawLine: line,
    };
  }

  private getRecordType(code: string): RecordTypeEnum | null {
    switch (code) {
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
        return RecordTypeEnum.STUDENT_ENROLLMENT;
      case '99':
        return RecordTypeEnum.FILE_END;
      default:
        return null;
    }
  }

  async parseFileFromPath(filePath: string): Promise<ParsedFile> {
    const fs = require('fs').promises;
    const content = await fs.readFile(filePath, 'utf-8');
    const fileName = filePath.split('/').pop() || 'unknown.txt';
    return this.parseFile(content, fileName);
  }
}
