export interface ValidationError {
  lineNumber: number;
  recordType: string;
  fieldName: string;
  fieldDescription?: string; // Descrição amigável do campo para mostrar ao usuário
  fieldPosition?: number; // Opcional temporariamente para compatibilidade
  fieldValue: string;
  ruleName: string;
  errorMessage: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  totalRecords: number;
  processedRecords: number;
  processingTime: number;
  fileMetadata: FileMetadata;
}

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  totalLines: number;
  encoding: string;
  uploadDate: Date;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  recordType: string;
  fieldName: string;
  ruleType: 'required' | 'format' | 'length' | 'range' | 'custom' | 'reference';
  parameters: Record<string, any>;
  isActive: boolean;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecordType {
  code: string;
  name: string;
  description: string;
  fields: FieldDefinition[];
  isActive: boolean;
}

export interface FieldDefinition {
  name: string;
  position: number;
  length: number;
  type: 'string' | 'number' | 'date' | 'boolean';
  isRequired: boolean;
  defaultValue?: string;
  validationRules: string[];
  description: string;
}
