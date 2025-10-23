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
import { StructuralValidatorService } from '../validators/structural-validator.service';
import { SchoolManagerBondRule } from '../rules/record-rules/school-manager-bond.rule';
import { SchoolProfessionalBondRule } from '../rules/record-rules/school-professional-bond.rule';
import { StudentEnrollmentRule } from '../rules/record-rules/student-enrollment.rule';

// Interface para contexto de escola (registro 00)
interface SchoolContext {
  codigoInep: string;
  situacaoFuncionamento: string;
  dependenciaAdministrativa: string;
  localizacaoDiferenciada?: number; // Campo 20: Localização diferenciada
}

// Interface para contexto de pessoa (registro 30)
interface PersonContext {
  codigoPessoa: string;
  identificacaoInep?: string;
  paisResidencia?: number; // Campo 51: País de residência
  enrolledClasses?: string[]; // turmas onde a pessoa está matriculada como aluno
}

// Interface para contexto de turma (registro 20)
interface ClassContext {
  codigoTurma: string;
  mediacao?: number; // campo 6
  etapa?: number; // campo 26
  curricular?: boolean; // campo 14
  atendimentoEducacionalEspecializado?: boolean; // campo 16 - AEE (0-Não, 1-Sim)
  atividadeComplementar?: boolean; // campo 19
  itinerarioFormativo?: boolean; // campo 35
  itinerarioProfissional?: boolean; // campo 36
  // ADDED: store class-level differentiated location (campo 23)
  differentiatedLocation?: number; // campo 23: local de funcionamento (0,1,...)
  areasConhecimento?: { [key: string]: boolean }; // campos 43-69
}

@Injectable()
export class ValidationEngineService {
  constructor(
    private readonly fieldValidator: FieldValidatorService,
    private readonly recordValidator: RecordValidatorService,
    private readonly fileValidator: FileValidatorService,
    private readonly structuralValidator: StructuralValidatorService,
    private readonly schoolManagerBondRule: SchoolManagerBondRule,
    private readonly schoolProfessionalBondRule: SchoolProfessionalBondRule,
    private readonly studentEnrollmentRule: StudentEnrollmentRule,
  ) {}

  async validateFile(
    content: string,
    fileName: string,
    version: string = '2025',
    phase: '1' | '2' = '1',
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
      phase,
    );
    errors.push(...fileValidationErrors);

    // Validações estruturais gerais
    const structuralErrors = this.structuralValidator.validateStructure(
      lines,
      content,
      phase,
    );
    errors.push(...structuralErrors);

    // Validação de codificação
    const encodingErrors = this.structuralValidator.validateEncoding(content);
    errors.push(...encodingErrors);

    // Validação de caracteres
    const characterErrors =
      this.structuralValidator.validateCharacters(content);
    errors.push(...characterErrors);

    // Se há erros estruturais críticos (número de campos incorreto), não prosseguir
    const hasCriticalStructuralErrors = structuralErrors.some(
      (error) => error.ruleName === 'field_count_validation',
    );

    if (hasCriticalStructuralErrors) {
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      const finalErrors = errors.filter((e) => e.severity === 'error');
      const finalWarnings = errors.filter((e) => e.severity === 'warning');

      const fileMetadata: FileMetadata = {
        fileName,
        fileSize: content.length,
        totalLines: lines.length,
        encoding: 'ISO-8859-1',
        uploadDate: new Date(),
      };

      return {
        isValid: finalErrors.length === 0,
        totalRecords: lines.length,
        processedRecords: 0, // Não processou registros devido a erros estruturais
        processingTime,
        errors: finalErrors,
        warnings: finalWarnings,
        fileMetadata,
      };
    }

    // Usar validação com contexto para capturar regras condicionais
    const contextResult = await this.validateRecordsWithContext(
      lines,
      fileName,
      version,
    );

    // Combinar os erros das validações estruturais com os de contexto
    errors.push(...contextResult.errors);
    warnings.push(...contextResult.warnings);
    processedRecords = contextResult.processedRecords;

    const processingTime = Date.now() - startTime;

    const fileMetadata: FileMetadata = {
      fileName,
      fileSize: new TextEncoder().encode(content).length,
      totalLines: lines.length,
      encoding: 'ISO-8859-1',
      uploadDate: new Date(),
    };

    // Ordenar erros por lineNumber (erros de linha 0 vão por último)
    const sortedErrors = errors.sort((a, b) => {
      // Se um dos erros é de linha 0 (estrutural/global), ele vai para o final
      if (a.lineNumber === 0 && b.lineNumber !== 0) return 1;
      if (a.lineNumber !== 0 && b.lineNumber === 0) return -1;
      // Caso contrário, ordena por lineNumber crescente
      return a.lineNumber - b.lineNumber;
    });

    const sortedWarnings = warnings.sort((a, b) => {
      if (a.lineNumber === 0 && b.lineNumber !== 0) return 1;
      if (a.lineNumber !== 0 && b.lineNumber === 0) return -1;
      return a.lineNumber - b.lineNumber;
    });

    return {
      isValid: sortedErrors.length === 0,
      errors: sortedErrors,
      warnings: sortedWarnings,
      totalRecords: lines.length,
      processedRecords,
      processingTime,
      fileMetadata,
    };
  }

  async validateRecords(
    records: string[],
    fileName: string = 'records.txt',
    version: string = '2025',
    phase: '1' | '2' = '1',
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let processedRecords = 0;

    // Validação da estrutura dos registros (similar à validação de arquivo)
    const content = records.join('\n');
    const fileValidationErrors = await this.fileValidator.validateFile(
      content,
      fileName,
      phase,
    );
    errors.push(...fileValidationErrors);

    // Validação registro por registro
    for (let i = 0; i < records.length; i++) {
      const lineNumber = i + 1;
      const record = records[i].trim();

      if (record === '') continue;

      try {
        // Determinar tipo de registro
        const recordType = this.extractRecordType(record);

        if (!recordType) {
          errors.push({
            lineNumber,
            recordType: 'UNKNOWN',
            fieldName: 'record_type',
            fieldPosition: 0,
            fieldValue: record.substring(0, 10),
            ruleName: 'record_type_identification',
            errorMessage: 'Tipo de registro não identificado',
            severity: ValidationSeverity.ERROR,
          });
          continue;
        }

        // Validar registro
        const recordErrors = await this.recordValidator.validateRecord(
          record,
          recordType,
          lineNumber,
          version,
        );

        errors.push(...recordErrors.filter((e) => e.severity === 'error'));
        warnings.push(...recordErrors.filter((e) => e.severity === 'warning'));

        processedRecords++;
      } catch (error) {
        errors.push({
          lineNumber,
          recordType: 'UNKNOWN',
          fieldName: 'record_processing',
          fieldPosition: -1,
          fieldValue: record.substring(0, 50),
          ruleName: 'record_processing_error',
          errorMessage: `Erro ao processar registro: ${(error as Error).message}`,
          severity: ValidationSeverity.ERROR,
        });
      }
    }

    const processingTime = Date.now() - startTime;

    const fileMetadata: FileMetadata = {
      fileName,
      fileSize: new TextEncoder().encode(content).length,
      totalLines: records.length,
      encoding: 'ISO-8859-1',
      uploadDate: new Date(),
    };

    // Ordenar erros por lineNumber (erros de linha 0 vão por último)
    const sortedErrors = errors.sort((a, b) => {
      if (a.lineNumber === 0 && b.lineNumber !== 0) return 1;
      if (a.lineNumber !== 0 && b.lineNumber === 0) return -1;
      return a.lineNumber - b.lineNumber;
    });

    const sortedWarnings = warnings.sort((a, b) => {
      if (a.lineNumber === 0 && b.lineNumber !== 0) return 1;
      if (a.lineNumber !== 0 && b.lineNumber === 0) return -1;
      return a.lineNumber - b.lineNumber;
    });

    return {
      isValid: sortedErrors.length === 0,
      errors: sortedErrors,
      warnings: sortedWarnings,
      totalRecords: records.length,
      processedRecords,
      processingTime,
      fileMetadata,
    };
  }

  /**
   * Validates records with cross-reference context
   * This method maintains context from registro 00 and 30 to validate registro 40
   */
  async validateRecordsWithContext(
    records: string[],
    fileName: string = 'records.txt',
    version: string = '2025',
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    let processedRecords = 0;

    // Maps para manter contexto
    let schoolContext: SchoolContext | null = null;
    const personContexts = new Map<string, PersonContext>();
    const classContexts = new Map<string, ClassContext>();
    const managerBonds = new Set<string>(); // Códigos de pessoas já com vínculo gestor
    const professionalBonds = new Set<string>(); // Códigos de pessoas já com vínculo profissional

    // Primeira passada: coletar contextos dos registros 00, 20 e 30
    for (let i = 0; i < records.length; i++) {
      const record = records[i].trim();
      if (record === '') continue;

      const recordType = this.extractRecordType(record);
      const parts = record.split('|');

      if (recordType === RecordTypeEnum.SCHOOL_IDENTIFICATION) {
        // Captura dados do registro 00
        const localizacaoDiferenciada = parts[19] || ''; // Campo 20: Localização diferenciada
        schoolContext = {
          codigoInep: parts[1] || '',
          situacaoFuncionamento: parts[2] || '',
          dependenciaAdministrativa: parts[20] || '',
          localizacaoDiferenciada: localizacaoDiferenciada
            ? parseInt(localizacaoDiferenciada)
            : undefined,
        };
      } else if (recordType === RecordTypeEnum.CLASSES) {
        // Captura dados do registro 20
        const codigoTurma = (parts[2] || '').trim();
        classContexts.set(codigoTurma, {
          codigoTurma,
          mediacao: parts[5] ? parseInt(parts[5]) : undefined,
          etapa: parts[25] ? parseInt(parts[25]) : undefined,
          curricular: parts[13] === '1',
          atividadeComplementar: parts[18] === '1',
          atendimentoEducacionalEspecializado: parts[15] === '1', // Campo 16: AEE (0-Não, 1-Sim)
          itinerarioFormativo: parts[34] === '1',
          itinerarioProfissional: parts[35] === '1',
          // NEW: capture campo 23 (index 22) - local de funcionamento / local diferenciado
          differentiatedLocation:
            parts[22] !== undefined && parts[22] !== ''
              ? parseInt(parts[22])
              : undefined,
          // Areas de conhecimento (campos 43-69) - processar corretamente
          areasConhecimento: this.buildSubjectAreas(parts),
        });
      } else if (recordType === RecordTypeEnum.PHYSICAL_PERSONS) {
        // Captura dados do registro 30
        const codigoPessoa = parts[2] || '';
        const identificacaoInep = parts[3] || '';
        const paisResidencia = parts[50] || ''; // Campo 51: País de residência
        personContexts.set(codigoPessoa, {
          codigoPessoa,
          identificacaoInep: identificacaoInep || undefined,
          paisResidencia: paisResidencia ? parseInt(paisResidencia) : undefined,
          enrolledClasses: [],
        });
      }
    }

    // Segunda passada: validação com contexto
    for (let i = 0; i < records.length; i++) {
      const lineNumber = i + 1;
      const record = records[i].trim();

      if (record === '') continue;

      try {
        const recordType = this.extractRecordType(record);
        const parts = record.split('|');

        if (!recordType) {
          errors.push({
            lineNumber,
            recordType: 'UNKNOWN',
            fieldName: 'record_type',
            fieldPosition: 0,
            fieldValue: record.substring(0, 2),
            ruleName: 'invalid_record_type',
            errorMessage: 'Tipo de registro inválido',
            severity: 'error',
          });
          continue;
        }

        // Validação especial para registro 40 com contexto
        if (recordType === RecordTypeEnum.SCHOOL_MANAGER_LINKS) {
          const codigoPessoa = parts[2] || '';
          const personContext = personContexts.get(codigoPessoa);
          const existingBonds = Array.from(managerBonds);

          const contextErrors = this.schoolManagerBondRule.validateWithContext(
            parts,
            lineNumber,
            schoolContext || undefined,
            personContext,
            existingBonds,
          );

          errors.push(...contextErrors);

          // Adiciona pessoa aos vínculos se não houve erro
          if (contextErrors.length === 0) {
            managerBonds.add(codigoPessoa);
          }
        } else if (recordType === RecordTypeEnum.SCHOOL_PROFESSIONAL_LINKS) {
          // Validação especial para registro 50 com contexto
          const codigoPessoa = parts[2] || '';
          const codigoTurma = (parts[4] || '').trim();
          const personContext = personContexts.get(codigoPessoa);
          const classContext = classContexts.get(codigoTurma);

          // Sempre criar o contexto da escola (independente de ter pessoa/turma)
          const profSchoolContext = schoolContext
            ? {
                schoolCode: schoolContext.codigoInep || '',
                administrativeDependency:
                  schoolContext.dependenciaAdministrativa
                    ? parseInt(schoolContext.dependenciaAdministrativa)
                    : undefined,
                classes: Array.from(classContexts.values()).map((c) => ({
                  classCode: c.codigoTurma,
                  teachingMediation: c.mediacao,
                  isRegular: c.curricular,
                  isComplementaryActivity: c.atividadeComplementar,
                  stage: c.etapa,
                  hasFormativeItinerary: c.itinerarioFormativo,
                  hasProfessionalItinerary: c.itinerarioProfissional,
                  subjectAreas: c.areasConhecimento,
                })),
                persons: Array.from(personContexts.values()).map((p) => ({
                  personCode: p.codigoPessoa,
                  inepId: p.identificacaoInep,
                  enrolledClasses: p.enrolledClasses,
                })),
              }
            : undefined;

          const profPersonContext = personContext
            ? {
                personCode: personContext.codigoPessoa,
                inepId: personContext.identificacaoInep,
                enrolledClasses: personContext.enrolledClasses,
              }
            : undefined;

          const profClassContext = classContext
            ? {
                classCode: classContext.codigoTurma,
                teachingMediation: classContext.mediacao,
                isRegular: classContext.curricular,
                isComplementaryActivity: classContext.atividadeComplementar,
                stage: classContext.etapa,
                hasFormativeItinerary: classContext.itinerarioFormativo,
                hasProfessionalItinerary: classContext.itinerarioProfissional,
                subjectAreas: classContext.areasConhecimento,
              }
            : undefined;

          const contextErrors =
            this.schoolProfessionalBondRule.validateWithContext(
              parts,
              profSchoolContext,
              profClassContext,
              profPersonContext,
              lineNumber,
            );

          errors.push(...contextErrors);

          // Adiciona pessoa aos vínculos profissionais se não houve erro
          if (contextErrors.length === 0 && personContext) {
            professionalBonds.add(codigoPessoa);
          }
        } else if (recordType === RecordTypeEnum.STUDENT_ENROLLMENT) {
          // Validação especial para registro 60 com contexto
          const codigoPessoa = parts[2] || '';
          const codigoTurma = parts[4] || '';
          const personContext = personContexts.get(codigoPessoa);
          const classContext = classContexts.get(codigoTurma);

          // Sempre criar o contexto da escola (independente de ter pessoa/turma)
          const studentSchoolContext = schoolContext
            ? {
                schoolCode: schoolContext.codigoInep || '',
                administrativeDependency:
                  schoolContext.dependenciaAdministrativa
                    ? parseInt(schoolContext.dependenciaAdministrativa)
                    : undefined,
                classes: Array.from(classContexts.values()).map((c) => ({
                  classCode: c.codigoTurma,
                  teachingMediation: c.mediacao,
                  isRegular: c.curricular,
                  isComplementaryActivity: c.atividadeComplementar,
                  stage: c.etapa,
                  specializedEducationalService:
                    c.atendimentoEducacionalEspecializado || false,
                  // Prefer class-level differentiatedLocation (campo 23) when available,
                  // otherwise fall back to school-level localizacaoDiferenciada or default 7.
                  differentiatedLocation:
                    c.differentiatedLocation !== undefined
                      ? c.differentiatedLocation
                      : schoolContext?.localizacaoDiferenciada || 7,
                })),
                persons: Array.from(personContexts.values()).map((p) => ({
                  personCode: p.codigoPessoa,
                  inepId: p.identificacaoInep,
                  residenceCountry: p.paisResidencia || 76, // 76 = Brasil (padrão)
                })),
              }
            : undefined;

          const studentPersonContext = personContext
            ? {
                personCode: personContext.codigoPessoa,
                inepId: personContext.identificacaoInep,
                residenceCountry: personContext.paisResidencia || 76, // 76 = Brasil (padrão)
              }
            : undefined;

          const studentClassContext = classContext
            ? {
                classCode: classContext.codigoTurma,
                teachingMediation: classContext.mediacao,
                isRegular: classContext.curricular,
                isComplementaryActivity: classContext.atividadeComplementar,
                stage: classContext.etapa,
                specializedEducationalService:
                  classContext.atendimentoEducacionalEspecializado || false,
                // Use class-level differentiatedLocation when available, else school-level or default 7
                differentiatedLocation:
                  classContext.differentiatedLocation !== undefined
                    ? classContext.differentiatedLocation
                    : schoolContext?.localizacaoDiferenciada || 7, // 7 = Não diferenciada (padrão)
              }
            : undefined;

          const contextErrors = this.studentEnrollmentRule.validateWithContext(
            parts,
            studentSchoolContext,
            studentClassContext,
            studentPersonContext,
            lineNumber,
          );

          errors.push(...contextErrors);

          // Adiciona pessoa aos vínculos de alunos se não houve erro
          if (contextErrors.length === 0 && personContext) {
            // Aqui poderia adicionar lógica para rastrear matrículas de alunos se necessário
          }
        } else if (
          recordType === RecordTypeEnum.SCHOOL_IDENTIFICATION ||
          recordType === RecordTypeEnum.CLASSES ||
          recordType === RecordTypeEnum.PHYSICAL_PERSONS ||
          recordType === RecordTypeEnum.SCHOOL_CHARACTERIZATION ||
          recordType === RecordTypeEnum.FILE_END
        ) {
          // Validação normal para registros que não precisam de contexto especial
          const recordErrors = await this.recordValidator.validateRecord(
            record,
            recordType,
            lineNumber,
            version,
          );
          errors.push(...recordErrors);
        }

        processedRecords++;
      } catch (error) {
        errors.push({
          lineNumber,
          recordType: 'UNKNOWN',
          fieldName: 'record_processing',
          fieldPosition: 0,
          fieldValue: record,
          ruleName: 'processing_error',
          errorMessage: `Erro ao processar registro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          severity: 'error',
        });
      }
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Separar erros e avisos
    const finalErrors = errors.filter((e) => e.severity === 'error');
    const finalWarnings = errors.filter((e) => e.severity === 'warning');

    // Ordenar erros por lineNumber (erros de linha 0 vão por último)
    const sortedErrors = finalErrors.sort((a, b) => {
      if (a.lineNumber === 0 && b.lineNumber !== 0) return 1;
      if (a.lineNumber !== 0 && b.lineNumber === 0) return -1;
      return a.lineNumber - b.lineNumber;
    });

    const sortedWarnings = finalWarnings.sort((a, b) => {
      if (a.lineNumber === 0 && b.lineNumber !== 0) return 1;
      if (a.lineNumber !== 0 && b.lineNumber === 0) return -1;
      return a.lineNumber - b.lineNumber;
    });

    const fileMetadata: FileMetadata = {
      fileName,
      fileSize: records.join('\n').length,
      totalLines: records.length,
      encoding: 'ISO-8859-1',
      uploadDate: new Date(),
    };

    return {
      isValid: sortedErrors.length === 0,
      errors: sortedErrors,
      warnings: sortedWarnings,
      totalRecords: records.length,
      processedRecords,
      processingTime,
      fileMetadata,
    };
  }

  /**
   * Valida uma única linha sem contexto de outros registros
   * Útil para validação em tempo real no frontend
   *
   * VALIDAÇÕES EM ORDEM (com curto-circuito):
   * 1. Tipo de registro informado é válido?
   * 2. Linha tem o tipo de registro correto no primeiro campo?
   * 3. Linha tem a quantidade correta de campos?
   * 4. (Se tudo OK) Validar campos individuais
   */
  async validateSingleLine(
    line: string,
    recordTypeCode: string,
    version: string = '2025',
    phase: '1' | '2' = '1',
  ): Promise<{
    errors: ValidationError[];
    warnings: ValidationError[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validar se o tipo de registro é válido para a fase especificada
    const phase1RecordTypes = ['00', '10', '20', '30', '40', '50', '60'];
    const phase2RecordTypes = ['89', '90', '91'];
    const commonRecordTypes = ['99'];

    if (
      phase === '1' &&
      !phase1RecordTypes.includes(recordTypeCode) &&
      !commonRecordTypes.includes(recordTypeCode)
    ) {
      errors.push({
        lineNumber: 1,
        recordType: 'UNKNOWN',
        fieldName: 'record_type',
        fieldPosition: 0,
        fieldValue: recordTypeCode,
        ruleName: 'invalid_record_type_for_phase',
        errorMessage: `Tipo de registro ${recordTypeCode} não é válido para FASE 1 (Matrícula Inicial). Valores permitidos: ${[...phase1RecordTypes, ...commonRecordTypes].join(', ')}`,
        severity: ValidationSeverity.ERROR,
      });
      return { errors, warnings }; // ⛔ PARA AQUI
    }

    if (
      phase === '2' &&
      !phase2RecordTypes.includes(recordTypeCode) &&
      !commonRecordTypes.includes(recordTypeCode)
    ) {
      errors.push({
        lineNumber: 1,
        recordType: 'UNKNOWN',
        fieldName: 'record_type',
        fieldPosition: 0,
        fieldValue: recordTypeCode,
        ruleName: 'invalid_record_type_for_phase',
        errorMessage: `Tipo de registro ${recordTypeCode} não é válido para FASE 2 (Situação do Aluno). Valores permitidos: ${[...phase2RecordTypes, ...commonRecordTypes].join(', ')}`,
        severity: ValidationSeverity.ERROR,
      });
      return { errors, warnings }; // ⛔ PARA AQUI
    }

    // ====== VALIDAÇÃO 1: Tipo de registro informado é válido? ======
    const recordType = this.convertRecordTypeCodeToEnum(recordTypeCode);
    if (!recordType) {
      errors.push({
        lineNumber: 1,
        recordType: 'UNKNOWN',
        fieldName: 'record_type',
        fieldPosition: 0,
        fieldValue: recordTypeCode,
        ruleName: 'invalid_record_type',
        errorMessage: `Tipo de registro inválido: ${recordTypeCode}. Valores permitidos: ${[...phase1RecordTypes, ...phase2RecordTypes, ...commonRecordTypes].join(', ')}`,
        severity: ValidationSeverity.ERROR,
      });
      return { errors, warnings }; // ⛔ PARA AQUI
    }

    // Separar campos da linha
    const parts = line.split('|');

    // ====== VALIDAÇÃO 2: Tipo de registro na linha corresponde ao esperado? ======
    const actualRecordType = parts[0]?.trim() || '';
    if (actualRecordType !== recordTypeCode) {
      errors.push({
        lineNumber: 1,
        recordType: recordTypeCode,
        fieldName: 'record_type',
        fieldPosition: 0,
        fieldValue: actualRecordType,
        ruleName: 'record_type_mismatch',
        errorMessage: `Tipo de registro esperado: ${recordTypeCode}, mas a linha começa com: ${actualRecordType || '(vazio)'}`,
        severity: ValidationSeverity.ERROR,
      });
      return { errors, warnings }; // ⛔ PARA AQUI - não faz sentido validar campos se o tipo está errado
    }

    // ====== VALIDAÇÃO 3: Quantidade de campos está correta? ======
    const expectedFieldCount = this.getExpectedFieldCount(recordTypeCode);
    if (parts.length !== expectedFieldCount) {
      errors.push({
        lineNumber: 1,
        recordType: recordTypeCode,
        fieldName: 'field_count',
        fieldPosition: -1,
        fieldValue: parts.length.toString(),
        ruleName: 'field_count_validation',
        errorMessage: `Registro tipo ${recordTypeCode} deve ter ${expectedFieldCount} campos, mas foram encontrados ${parts.length} campos`,
        severity: ValidationSeverity.ERROR,
      });
      return { errors, warnings }; // ⛔ PARA AQUI - não faz sentido validar campos se a estrutura está errada
    }

    // ====== VALIDAÇÃO 4: Se passou nas validações críticas, validar campos ======
    try {
      const recordErrors = await this.recordValidator.validateRecord(
        line,
        recordType,
        1, // lineNumber
        version,
      );

      // Separar erros e warnings
      errors.push(...recordErrors.filter((e) => e.severity === 'error'));
      warnings.push(...recordErrors.filter((e) => e.severity === 'warning'));
    } catch (error) {
      errors.push({
        lineNumber: 1,
        recordType: recordTypeCode,
        fieldName: 'line_processing',
        fieldPosition: -1,
        fieldValue: line.substring(0, 50),
        ruleName: 'processing_error',
        errorMessage: `Erro ao processar linha: ${(error as Error).message}`,
        severity: ValidationSeverity.ERROR,
      });
    }

    return { errors, warnings };
  }

  /**
   * Retorna a quantidade esperada de campos para cada tipo de registro
   * Valores extraídos da contagem de "position:" em cada arquivo de regra
   */
  private getExpectedFieldCount(recordTypeCode: string): number {
    switch (recordTypeCode) {
      // FASE 1 - Matrícula Inicial
      case '00': // School Identification (school-identification.rule.ts)
        return 56;
      case '10': // School Characterization (school-characterization.rule.ts)
        return 187;
      case '20': // Classes (classes.rule.ts)
        return 70;
      case '30': // Physical Persons (physical-persons.rule.ts)
        return 108;
      case '40': // School Manager Bond (school-manager-bond.rule.ts)
        return 7;
      case '50': // School Professional Bond (school-professional-bond.rule.ts)
        return 38;
      case '60': // Student Enrollment (student-enrollment.rule.ts)
        return 32;

      // FASE 2 - Situação do Aluno
      case '89': // School Manager Situation (school-manager-situation.rule.ts)
        return 6;
      case '90': // Student Situation (student-situation.rule.ts)
        return 8;
      case '91': // Student Admission After (student-admission-after.rule.ts)
        return 11;

      // Comum às duas fases
      case '99': // File End (file-end.rule.ts)
        return 1;

      default:
        return 0;
    }
  }

  private convertRecordTypeCodeToEnum(code: string): RecordTypeEnum | null {
    switch (code) {
      // FASE 1 - Matrícula Inicial
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

      // FASE 2 - Situação do Aluno
      case '89':
        return RecordTypeEnum.SCHOOL_MANAGER_SITUATION;
      case '90':
        return RecordTypeEnum.STUDENT_SITUATION;
      case '91':
        return RecordTypeEnum.STUDENT_ADMISSION_AFTER;

      // Comum às duas fases
      case '99':
        return RecordTypeEnum.FILE_END;

      default:
        return null;
    }
  }

  private extractRecordType(line: string): RecordTypeEnum | null {
    const parts = line.split('|');
    if (parts.length === 0) return null;

    const recordTypeCode = parts[0].trim();
    return this.convertRecordTypeCodeToEnum(recordTypeCode);
  }

  /**
   * Builds subject areas mapping from record 20 fields 43-69
   * Maps field positions to knowledge area codes based on official CSV
   */
  private buildSubjectAreas(parts: string[]): { [key: string]: boolean } {
    const subjectAreas: { [key: string]: boolean } = {};

    // Mapping based on OFFICIAL documentation - fields 43-69 of record 20
    // Each field position maps to the corresponding knowledge area code from CSV
    const fieldToAreaMapping: { [fieldPosition: number]: string } = {
      42: '1', // Campo 43: Química
      43: '2', // Campo 44: Física
      44: '3', // Campo 45: Matemática
      45: '4', // Campo 46: Biologia
      46: '5', // Campo 47: Ciências
      47: '6', // Campo 48: Língua/Literatura Portuguesa
      48: '7', // Campo 49: Língua/Literatura Estrangeira – Inglês
      49: '8', // Campo 50: Língua/Literatura Estrangeira – Espanhol
      50: '9', // Campo 51: Língua/Literatura Estrangeira – outra
      51: '10', // Campo 52: Arte
      52: '11', // Campo 53: Educação Física
      53: '12', // Campo 54: História
      54: '13', // Campo 55: Geografia
      55: '14', // Campo 56: Filosofia
      56: '16', // Campo 57: Informática/Computação
      57: '17', // Campo 58: Áreas do conhecimento profissionalizantes
      58: '23', // Campo 59: Libras
      59: '25', // Campo 60: Áreas do conhecimento pedagógicas
      60: '26', // Campo 61: Ensino Religioso
      61: '27', // Campo 62: Língua Indígena
      62: '28', // Campo 63: Estudos Sociais
      63: '29', // Campo 64: Sociologia
      64: '30', // Campo 65: Língua/Literatura Estrangeira – Francês
      65: '31', // Campo 66: Língua Portuguesa como Segunda Língua
      66: '32', // Campo 67: Estágio curricular supervisionado
      67: '33', // Campo 68: Projeto de vida
      68: '99', // Campo 69: Outras áreas do conhecimento
    };

    // Process each field and check if it indicates the area is offered with teacher (value = "1")
    Object.entries(fieldToAreaMapping).forEach(([fieldPos, areaCode]) => {
      const fieldIndex = parseInt(fieldPos);
      const fieldValue = parts[fieldIndex];

      // Area is offered with teacher if field value is "1"
      // "0" = not offered, "2" = offered without teacher, "1" = offered with teacher
      if (fieldValue === '1') {
        subjectAreas[areaCode] = true;
      }
    });

    return subjectAreas;
  }
}
