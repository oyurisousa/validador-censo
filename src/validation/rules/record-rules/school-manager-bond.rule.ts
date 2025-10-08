import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../../common/enums/record-types.enum';
import { ValidationError } from '../../../common/interfaces/validation.interface';

// Interface para dados do registro 00 necessários para validação do registro 40
interface SchoolContext {
  codigoInep: string;
  situacaoFuncionamento: string; // 1-Em atividade, 2-Paralisada, 3-Extinta
  dependenciaAdministrativa: string; // 1-federal, 2-estadual, 3-municipal, 4-privada
}

// Interface para dados do registro 30 necessários para validação do registro 40
interface PersonContext {
  codigoPessoa: string;
  identificacaoInep?: string;
}

@Injectable()
export class SchoolManagerBondRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.SCHOOL_MANAGER_LINKS;

  protected readonly fields: FieldRule[] = [
    // Campo 1: Tipo de registro
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^40$/,
      type: 'code',
      description: 'Tipo de registro (sempre 40)',
    },
    // Campo 2: Código de escola - Inep
    {
      position: 1,
      name: 'codigo_inep',
      required: true,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'Código INEP da escola (8 dígitos)',
    },
    // Campo 3: Código da pessoa física no sistema próprio
    {
      position: 2,
      name: 'codigo_pessoa_sistema',
      required: true,
      minLength: 1,
      maxLength: 20,
      type: 'string',
      description: 'Código da pessoa física no sistema próprio',
    },
    // Campo 4: Identificação única (Inep)
    {
      position: 3,
      name: 'identificacao_inep',
      required: false,
      minLength: 12,
      maxLength: 12,
      pattern: /^\d{12}$/,
      type: 'number',
      description: 'Identificação única (Inep) - 12 dígitos',
    },
    // Campo 5: Cargo
    {
      position: 4,
      name: 'cargo',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[12]$/,
      type: 'code',
      description: 'Cargo (1-Diretor(a), 2-Outro Cargo)',
    },
    // Campo 6: Critério de acesso ao cargo/função
    {
      position: 5,
      name: 'criterio_acesso_cargo',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1234567]$/,
      type: 'code',
      description: 'Critério de acesso ao cargo/função (1-7)',
      conditionalRequired: {
        field: 'cargo',
        values: ['1'],
      },
    },
    // Campo 7: Situação Funcional/Regime de contratação/Tipo de vínculo
    {
      position: 6,
      name: 'situacao_funcional',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1234]$/,
      type: 'code',
      description:
        'Situação funcional (1-Concursado/efetivo, 2-Temporário, 3-Terceirizado, 4-CLT)',
    },
  ];

  /**
   * Validates business rules for School Manager Bond (registro 40)
   */
  protected validateBusinessRules(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Regra 5: Validação de Critério de Acesso ao Cargo
    this.validateAccessCriteria(parts, lineNumber, errors);

    // Regra 6: Validação de Situação Funcional
    this.validateFunctionalStatus(parts, lineNumber, errors);

    return errors;
  }

  /**
   * Validates business rules with context from other records
   * This method should be called when context from registro 00 and 30 is available
   */
  validateWithContext(
    parts: string[],
    lineNumber: number,
    schoolContext?: SchoolContext,
    personContext?: PersonContext,
    existingBonds?: string[],
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validações básicas de campos
    const fieldErrors = super.validate(parts, lineNumber);
    errors.push(...fieldErrors);

    // Validações que dependem de contexto
    if (schoolContext) {
      // Regra 1: Validação de Código INEP vs Registro 00
      this.validateSchoolCodeWithContext(
        parts,
        lineNumber,
        errors,
        schoolContext,
      );

      // Regras 5 e 6 com contexto real
      this.validateAccessCriteriaWithContext(
        parts,
        lineNumber,
        errors,
        schoolContext,
      );
      this.validateFunctionalStatusWithContext(
        parts,
        lineNumber,
        errors,
        schoolContext,
      );
    } else {
      // Validações sem contexto (simuladas)
      this.validateAccessCriteria(parts, lineNumber, errors);
      this.validateFunctionalStatus(parts, lineNumber, errors);
    }

    if (personContext) {
      // Regra 2: Validação de Pessoa Física vs Registro 30
      this.validatePersonCodeWithContext(
        parts,
        lineNumber,
        errors,
        personContext,
      );

      // Regra 3: Validação de Identificação INEP vs Registro 30
      this.validatePersonIdentificationWithContext(
        parts,
        lineNumber,
        errors,
        personContext,
      );
    }

    if (existingBonds) {
      // Regra 4: Validação de Vínculos Duplicados
      this.validateDuplicateBondsWithContext(
        parts,
        lineNumber,
        errors,
        existingBonds,
      );
    }

    return errors;
  }

  // Validações com contexto de outros registros

  private validateSchoolCodeWithContext(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
    schoolContext: SchoolContext,
  ): void {
    const codigoInep = parts[1] || '';

    // Deve ser igual ao valor informado no campo 2 do registro 00
    if (codigoInep !== schoolContext.codigoInep) {
      errors.push(
        this.createError(
          lineNumber,
          'codigo_inep',
          'Código INEP da escola',
          1,
          codigoInep,
          'school_code_mismatch',
          'Código INEP deve ser igual ao informado no registro 00',
          ValidationSeverity.ERROR,
        ),
      );
    }
  }

  private validatePersonCodeWithContext(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
    personContext: PersonContext,
  ): void {
    const codigoPessoa = parts[2] || '';

    // Deve existir no registro 30
    if (codigoPessoa !== personContext.codigoPessoa) {
      errors.push(
        this.createError(
          lineNumber,
          'codigo_pessoa_sistema',
          'Código da pessoa física no sistema próprio',
          2,
          codigoPessoa,
          'person_not_found',
          'Não há pessoa física com esse código registrada no registro 30',
          ValidationSeverity.ERROR,
        ),
      );
    }
  }

  private validatePersonIdentificationWithContext(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
    personContext: PersonContext,
  ): void {
    const identificacaoInep = parts[3] || '';

    // Deve ser igual ao campo do registro 30 correspondente
    if (
      identificacaoInep &&
      personContext.identificacaoInep &&
      identificacaoInep !== personContext.identificacaoInep
    ) {
      errors.push(
        this.createError(
          lineNumber,
          'identificacao_inep',
          'Identificação única/INEP',
          3,
          identificacaoInep,
          'identification_mismatch',
          'Identificação única deve ser igual à informada no registro 30',
          ValidationSeverity.ERROR,
        ),
      );
    }
  }

  private validateDuplicateBondsWithContext(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
    existingBonds: string[],
  ): void {
    const codigoPessoa = parts[2] || '';

    // Verifica se a pessoa já tem vínculo como gestor
    if (existingBonds.includes(codigoPessoa)) {
      errors.push(
        this.createError(
          lineNumber,
          'codigo_pessoa_sistema',
          'Código da pessoa física no sistema próprio',
          2,
          codigoPessoa,
          'duplicate_manager_bond',
          'Pessoa física já possui vínculo como gestor escolar nesta escola',
          ValidationSeverity.ERROR,
        ),
      );
    }
  }

  private validateAccessCriteria(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const cargo = parts[4] || '';
    const criterioAcesso = parts[5] || '';

    // Validação básica sem contexto - apenas obrigatoriedade para diretores
    // As validações específicas de dependência administrativa serão feitas no método com contexto
    if (cargo === '1' && !criterioAcesso) {
      errors.push(
        this.createError(
          lineNumber,
          'criterio_acesso_cargo',
          'Critério de acesso ao cargo',
          5,
          criterioAcesso,
          'access_criteria_required_director',
          'Campo "Critério de acesso ao cargo" deve ser preenchido quando cargo = 1 (Diretor)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    if (cargo !== '1' && criterioAcesso) {
      errors.push(
        this.createError(
          lineNumber,
          'criterio_acesso_cargo',
          'Critério de acesso ao cargo',
          5,
          criterioAcesso,
          'access_criteria_not_allowed_non_director',
          'Campo "Critério de acesso ao cargo" não pode ser preenchido quando cargo não for 1 (Diretor)',
          ValidationSeverity.ERROR,
        ),
      );
    }
  }

  private validateAccessCriteriaWithContext(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
    schoolContext: SchoolContext,
  ): void {
    const cargo = parts[4] || '';
    const criterioAcesso = parts[5] || '';
    const { situacaoFuncionamento, dependenciaAdministrativa } = schoolContext;

    // Regra 1: Obrigatório quando cargo = 1 (Diretor) e situação = 1 (Ativa)
    if (cargo === '1' && situacaoFuncionamento === '1' && !criterioAcesso) {
      errors.push(
        this.createError(
          lineNumber,
          'criterio_acesso_cargo',
          'Critério de acesso ao cargo',
          5,
          criterioAcesso,
          'access_criteria_required_director_active',
          'Campo "Critério de acesso ao cargo" deve ser preenchido quando cargo = 1 (Diretor) e escola em atividade',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 2: Não pode ser preenchido quando cargo != 1
    if (cargo !== '1' && criterioAcesso) {
      errors.push(
        this.createError(
          lineNumber,
          'criterio_acesso_cargo',
          'Critério de acesso ao cargo',
          5,
          criterioAcesso,
          'access_criteria_not_allowed_non_director',
          'Campo "Critério de acesso ao cargo" não pode ser preenchido quando cargo não for 1 (Diretor)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 3: Não pode ser preenchido quando situação != 1 (Ativa)
    if (situacaoFuncionamento !== '1' && criterioAcesso) {
      errors.push(
        this.createError(
          lineNumber,
          'criterio_acesso_cargo',
          'Critério de acesso ao cargo',
          5,
          criterioAcesso,
          'access_criteria_not_allowed_inactive',
          'Campo "Critério de acesso ao cargo" não pode ser preenchido quando escola não estiver em atividade',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 4: Valor 1 (Proprietário) só para escolas privadas
    if (
      criterioAcesso === '1' &&
      ['1', '2', '3'].includes(dependenciaAdministrativa)
    ) {
      errors.push(
        this.createError(
          lineNumber,
          'criterio_acesso_cargo',
          'Critério de acesso ao cargo',
          5,
          criterioAcesso,
          'owner_criteria_public_school',
          'Critério "Ser proprietário" (1) não pode ser usado em escola pública (Federal, Estadual ou Municipal)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 5: Valores 4, 5, 6 não podem ser usados em escolas privadas
    if (
      ['4', '5', '6'].includes(criterioAcesso) &&
      dependenciaAdministrativa === '4'
    ) {
      errors.push(
        this.createError(
          lineNumber,
          'criterio_acesso_cargo',
          'Critério de acesso ao cargo',
          5,
          criterioAcesso,
          'public_criteria_private_school',
          'Critérios 4, 5, 6 (Concurso público, Processo eleitoral) não podem ser usados em escola privada',
          ValidationSeverity.ERROR,
        ),
      );
    }
  }

  private validateFunctionalStatus(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const cargo = parts[4] || '';
    const situacaoFuncional = parts[6] || '';

    // Validação básica sem contexto - apenas para cargos não diretores
    if (cargo !== '1' && situacaoFuncional) {
      errors.push(
        this.createError(
          lineNumber,
          'situacao_funcional',
          'Situação funcional',
          6,
          situacaoFuncional,
          'functional_status_not_allowed_non_director',
          'Campo "Situação Funcional" não pode ser preenchido quando cargo não for 1 (Diretor)',
          ValidationSeverity.ERROR,
        ),
      );
    }
  }

  private validateFunctionalStatusWithContext(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
    schoolContext: SchoolContext,
  ): void {
    const cargo = parts[4] || '';
    const situacaoFuncional = parts[6] || '';
    const { situacaoFuncionamento, dependenciaAdministrativa } = schoolContext;

    // Regra 1: Obrigatório quando cargo = 1, situação = 1 e dep. administrativa = 1, 2 ou 3
    if (
      cargo === '1' &&
      situacaoFuncionamento === '1' &&
      ['1', '2', '3'].includes(dependenciaAdministrativa) &&
      !situacaoFuncional
    ) {
      errors.push(
        this.createError(
          lineNumber,
          'situacao_funcional',
          'Situação funcional',
          6,
          situacaoFuncional,
          'functional_status_required_public_director',
          'Campo "Situação Funcional" deve ser preenchido para Diretor em escola pública ativa',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 2: Não pode ser preenchido quando cargo != 1
    if (cargo !== '1' && situacaoFuncional) {
      errors.push(
        this.createError(
          lineNumber,
          'situacao_funcional',
          'Situação funcional',
          6,
          situacaoFuncional,
          'functional_status_not_allowed_non_director',
          'Campo "Situação Funcional" não pode ser preenchido quando cargo não for 1 (Diretor)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 3: Não pode ser preenchido quando situação != 1
    if (situacaoFuncionamento !== '1' && situacaoFuncional) {
      errors.push(
        this.createError(
          lineNumber,
          'situacao_funcional',
          'Situação funcional',
          6,
          situacaoFuncional,
          'functional_status_not_allowed_inactive',
          'Campo "Situação Funcional" não pode ser preenchido quando escola não estiver em atividade',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 4: Não pode ser preenchido para escolas privadas
    if (dependenciaAdministrativa === '4' && situacaoFuncional) {
      errors.push(
        this.createError(
          lineNumber,
          'situacao_funcional',
          'Situação funcional',
          6,
          situacaoFuncional,
          'functional_status_not_allowed_private',
          'Campo "Situação Funcional" não pode ser preenchido para escola privada',
          ValidationSeverity.ERROR,
        ),
      );
    }
  }

  /**
   * Override validate method to include business rules
   */
  validate(parts: string[], lineNumber: number): ValidationError[] {
    // First run the standard field validation
    const fieldErrors = super.validate(parts, lineNumber);

    // Then run the business rules validation
    const businessErrors = this.validateBusinessRules(parts, lineNumber);

    return [...fieldErrors, ...businessErrors];
  }
}
