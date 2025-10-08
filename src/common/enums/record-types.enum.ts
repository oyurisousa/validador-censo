export enum RecordTypeEnum {
  SCHOOL_IDENTIFICATION = '00',
  SCHOOL_CHARACTERIZATION = '10',
  CLASSES = '20',
  PHYSICAL_PERSONS = '30',
  SCHOOL_MANAGER_LINKS = '40',
  SCHOOL_PROFESSIONAL_LINKS = '50',
  STUDENT_ENROLLMENT = '60',
  FILE_END = '99',
}

export enum RecordTypeName {
  SCHOOL_IDENTIFICATION = 'Identificação da Escola',
  SCHOOL_CHARACTERIZATION = 'Caracterização e Infraestrutura da Escola',
  CLASSES = 'Turmas',
  PHYSICAL_PERSONS = 'Pessoas Físicas',
  SCHOOL_MANAGER_LINKS = 'Vínculos de Gestores Escolares',
  SCHOOL_PROFESSIONAL_LINKS = 'Vínculos de Profissionais Escolares',
  STUDENT_ENROLLMENT = 'Vínculos de Alunos',
  FILE_END = 'Final do Arquivo',
}

export enum ValidationSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum RuleType {
  REQUIRED = 'required',
  FORMAT = 'format',
  LENGTH = 'length',
  RANGE = 'range',
  CUSTOM = 'custom',
  REFERENCE = 'reference',
}
