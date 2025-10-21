export enum RecordTypeEnum {
  // FASE 1 - Matrícula Inicial (00-60)
  SCHOOL_IDENTIFICATION = '00',
  SCHOOL_CHARACTERIZATION = '10',
  CLASSES = '20',
  PHYSICAL_PERSONS = '30',
  SCHOOL_MANAGER_LINKS = '40',
  SCHOOL_PROFESSIONAL_LINKS = '50',
  STUDENT_ENROLLMENT = '60',

  // FASE 2 - Situação do Aluno (89-91)
  SCHOOL_MANAGER_SITUATION = '89',
  STUDENT_SITUATION = '90',
  STUDENT_ADMISSION_AFTER = '91', // Admissão Após

  // Comum às duas fases
  FILE_END = '99',
}

export enum CensusPhaseEnum {
  INITIAL_ENROLLMENT = '1', // Fase 1: Matrícula Inicial
  SITUATION_UPDATE = '2', // Fase 2: Situação do Aluno
}

export enum RecordTypeName {
  // FASE 1 - Matrícula Inicial
  SCHOOL_IDENTIFICATION = 'Identificação da Escola',
  SCHOOL_CHARACTERIZATION = 'Caracterização e Infraestrutura da Escola',
  CLASSES = 'Turmas',
  PHYSICAL_PERSONS = 'Pessoas Físicas',
  SCHOOL_MANAGER_LINKS = 'Vínculos de Gestores Escolares',
  SCHOOL_PROFESSIONAL_LINKS = 'Vínculos de Profissionais Escolares',
  STUDENT_ENROLLMENT = 'Vínculos de Alunos',

  // FASE 2 - Situação do Aluno
  SCHOOL_MANAGER_SITUATION = 'Situação do Gestor Escolar',
  STUDENT_SITUATION = 'Situação do Aluno na Turma',
  STUDENT_ADMISSION_AFTER = 'Admissão Após',

  // Comum às duas fases
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
