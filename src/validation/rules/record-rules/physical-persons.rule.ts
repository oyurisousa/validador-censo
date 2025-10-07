import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import { RecordTypeEnum } from '../../../common/enums/record-types.enum';
import { ValidationError } from '../../../common/interfaces/validation.interface';

@Injectable()
export class PhysicalPersonsRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.PHYSICAL_PERSONS;

  protected readonly fields: FieldRule[] = [
    // Campo 1: Tipo de registro
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^30$/,
      type: 'code',
      description: 'Tipo de registro (sempre 30)',
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
    // Campo 5: Número do CPF
    {
      position: 4,
      name: 'cpf',
      required: false,
      minLength: 11,
      maxLength: 11,
      pattern: /^\d{11}$/,
      type: 'code',
      description: 'Número do CPF (11 dígitos)',
    },
    // Campo 6: Nome completo
    {
      position: 5,
      name: 'nome_completo',
      required: true,
      minLength: 1,
      maxLength: 100,
      pattern: /^[ABCDEFGHIJKLMNOPQRSTUVWXYZ\s]*$/,
      type: 'string',
      description: 'Nome completo da pessoa física',
    },
    // Campo 7: Data de nascimento
    {
      position: 6,
      name: 'data_nascimento',
      required: true,
      minLength: 10,
      maxLength: 10,
      pattern: /^\d{2}\/\d{2}\/\d{4}$/,
      type: 'date',
      description: 'Data de nascimento (DD/MM/AAAA)',
    },
    // Campo 8: Filiação
    {
      position: 7,
      name: 'filiacao',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Filiação (0-Não declarado/Ignorado, 1-Filiação 1 e/ou Filiação 2)',
    },
    // Campo 9: Filiação 1 (preferencialmente o nome da mãe)
    {
      position: 8,
      name: 'filiacao_1',
      required: false,
      minLength: 1,
      maxLength: 100,
      pattern: /^[ABCDEFGHIJKLMNOPQRSTUVWXYZ\s]*$/,
      type: 'string',
      description: 'Filiação 1 (preferencialmente o nome da mãe)',
    },
    // Campo 10: Filiação 2 (preferencialmente o nome do pai)
    {
      position: 9,
      name: 'filiacao_2',
      required: false,
      minLength: 1,
      maxLength: 100,
      pattern: /^[ABCDEFGHIJKLMNOPQRSTUVWXYZ\s]*$/,
      type: 'string',
      description: 'Filiação 2 (preferencialmente o nome do pai)',
    },
    // Campo 11: Sexo
    {
      position: 10,
      name: 'sexo',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[12]$/,
      type: 'code',
      description: 'Sexo (1-Masculino, 2-Feminino)',
    },
    // Campo 12: Cor/Raça
    {
      position: 11,
      name: 'cor_raca',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[0-5]$/,
      type: 'code',
      description:
        'Cor/raça (0-Não declarada, 1-Branca, 2-Preta, 3-Parda, 4-Amarela, 5-Indígena)',
    },
    // Campo 13: Povo indígena
    {
      position: 12,
      name: 'povo_indigena',
      required: false,
      minLength: 1,
      maxLength: 3,
      pattern: /^\d{1,3}$/,
      type: 'code',
      description: 'Povo indígena (código da tabela)',
    },
    // Campo 14: Nacionalidade
    {
      position: 13,
      name: 'nacionalidade',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[123]$/,
      type: 'code',
      description:
        'Nacionalidade (1-Brasileira, 2-Brasileira nascido exterior/naturalizado, 3-Estrangeira)',
    },
    // Campo 15: País de nacionalidade
    {
      position: 14,
      name: 'pais_nacionalidade',
      required: true,
      minLength: 1,
      maxLength: 3,
      pattern: /^\d{1,3}$/,
      type: 'code',
      description: 'País de nacionalidade (código da tabela de países)',
    },
    // Campo 16: Município de nascimento
    {
      position: 15,
      name: 'municipio_nascimento',
      required: false,
      minLength: 7,
      maxLength: 7,
      pattern: /^\d{7}$/,
      type: 'code',
      description: 'Município de nascimento (7 dígitos)',
    },
    // Campo 17: Pessoa física com deficiência, transtorno do espectro autista e altas habilidades ou superdotação
    {
      position: 16,
      name: 'pessoa_deficiencia',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Pessoa física com deficiência, transtorno do espectro autista e altas habilidades (0-Não, 1-Sim)',
    },
    // Campos 18-28: Tipos de deficiência
    // Campo 18: Cegueira
    {
      position: 17,
      name: 'cegueira',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Cegueira (0-Não, 1-Sim)',
    },
    // Campo 19: Baixa visão
    {
      position: 18,
      name: 'baixa_visao',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Baixa visão (0-Não, 1-Sim)',
    },
    // Campo 20: Visão monocular
    {
      position: 19,
      name: 'visao_monocular',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Visão monocular (0-Não, 1-Sim)',
    },
    // Campo 21: Surdez
    {
      position: 20,
      name: 'surdez',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Surdez (0-Não, 1-Sim)',
    },
    // Campo 22: Deficiência auditiva
    {
      position: 21,
      name: 'deficiencia_auditiva',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Deficiência auditiva (0-Não, 1-Sim)',
    },
    // Campo 23: Surdocegueira
    {
      position: 22,
      name: 'surdocegueira',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Surdocegueira (0-Não, 1-Sim)',
    },
    // Campo 24: Deficiência física
    {
      position: 23,
      name: 'deficiencia_fisica',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Deficiência física (0-Não, 1-Sim)',
    },
    // Campo 25: Deficiência intelectual
    {
      position: 24,
      name: 'deficiencia_intelectual',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Deficiência intelectual (0-Não, 1-Sim)',
    },
    // Campo 26: Deficiência múltipla
    {
      position: 25,
      name: 'deficiencia_multipla',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Deficiência múltipla (0-Não, 1-Sim)',
    },
    // Campo 27: Transtorno do espectro autista
    {
      position: 26,
      name: 'transtorno_autista',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Transtorno do espectro autista (0-Não, 1-Sim)',
    },
    // Campo 28: Altas habilidades/superdotação
    {
      position: 27,
      name: 'altas_habilidades',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Altas habilidades/superdotação (0-Não, 1-Sim)',
    },
    // Campos 29-35: Transtornos que impactam o desenvolvimento da aprendizagem
    // Campo 29: Pessoa física com transtorno(s) que impacta(m) o desenvolvimento da aprendizagem
    {
      position: 28,
      name: 'pessoa_transtorno_aprendizagem',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Pessoa física com transtorno(s) que impacta(m) o desenvolvimento da aprendizagem (0-Não, 1-Sim)',
    },
    // Campo 30: Discalculia ou outro transtorno da matemática e raciocínio lógico
    {
      position: 29,
      name: 'discalculia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Discalculia ou outro transtorno da matemática e raciocínio lógico (0-Não, 1-Sim)',
    },
    // Campo 31: Disgrafia, Disortografia ou outro transtorno da escrita e ortografia
    {
      position: 30,
      name: 'disgrafia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Disgrafia, Disortografia ou outro transtorno da escrita e ortografia (0-Não, 1-Sim)',
    },
    // Campo 32: Dislalia ou outro transtorno da linguagem e comunicação
    {
      position: 31,
      name: 'dislalia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Dislalia ou outro transtorno da linguagem e comunicação (0-Não, 1-Sim)',
    },
    // Campo 33: Dislexia
    {
      position: 32,
      name: 'dislexia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Dislexia (0-Não, 1-Sim)',
    },
    // Campo 34: Transtorno do Déficit de Atenção com Hiperatividade (TDAH)
    {
      position: 33,
      name: 'tdah',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Transtorno do Déficit de Atenção com Hiperatividade (TDAH) (0-Não, 1-Sim)',
    },
    // Campo 35: Transtorno do Processamento Auditivo Central (TPAC)
    {
      position: 34,
      name: 'tpac',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Transtorno do Processamento Auditivo Central (TPAC) (0-Não, 1-Sim)',
    },
    // Campos 36-49: Recursos para uso em sala de aula e avaliações
    // Campo 36: Auxílio ledor
    {
      position: 35,
      name: 'auxilio_ledor',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Auxílio ledor (0-Não, 1-Sim)',
    },
    // Campo 37: Auxílio transcrição
    {
      position: 36,
      name: 'auxilio_transcricao',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Auxílio transcrição (0-Não, 1-Sim)',
    },
    // Campo 38: Guia-Intérprete
    {
      position: 37,
      name: 'guia_interprete',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Guia-Intérprete (0-Não, 1-Sim)',
    },
    // Campo 39: Tradutor-Intérprete de Libras
    {
      position: 38,
      name: 'tradutor_libras',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Tradutor-Intérprete de Libras (0-Não, 1-Sim)',
    },
    // Campo 40: Leitura Labial
    {
      position: 39,
      name: 'leitura_labial',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Leitura Labial (0-Não, 1-Sim)',
    },
    // Campo 41: Prova Ampliada (Fonte 18)
    {
      position: 40,
      name: 'prova_ampliada_18',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Prova Ampliada (Fonte 18) (0-Não, 1-Sim)',
    },
    // Campo 42: Prova superampliada (Fonte 24)
    {
      position: 41,
      name: 'prova_superampliada_24',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Prova superampliada (Fonte 24) (0-Não, 1-Sim)',
    },
    // Campo 43: CD com áudio para deficiente visual
    {
      position: 42,
      name: 'cd_audio',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'CD com áudio para deficiente visual (0-Não, 1-Sim)',
    },
    // Campo 44: Prova de Língua Portuguesa como Segunda Língua para surdos e deficientes auditivos
    {
      position: 43,
      name: 'prova_portugues_segunda_lingua',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Prova de Língua Portuguesa como Segunda Língua (0-Não, 1-Sim)',
    },
    // Campo 45: Prova em Vídeo em Libras
    {
      position: 44,
      name: 'prova_video_libras',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Prova em Vídeo em Libras (0-Não, 1-Sim)',
    },
    // Campo 46: Material didático em Braille
    {
      position: 45,
      name: 'material_braille',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Material didático em Braille (0-Não, 1-Sim)',
    },
    // Campo 47: Prova em Braille
    {
      position: 46,
      name: 'prova_braille',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Prova em Braille (0-Não, 1-Sim)',
    },
    // Campo 48: Tempo adicional
    {
      position: 47,
      name: 'tempo_adicional',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Tempo adicional (0-Não, 1-Sim)',
    },
    // Campo 49: Nenhum
    {
      position: 48,
      name: 'recurso_nenhum',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Nenhum recurso (0-Não, 1-Sim)',
    },
    // Campos 50-108: Demais campos (continuando numeração)
    // Campo 50: Número da matrícula da certidão de nascimento
    {
      position: 49,
      name: 'certidao_nascimento',
      required: false,
      minLength: 32,
      maxLength: 32,
      type: 'string',
      description:
        'Número da matrícula da certidão de nascimento (32 caracteres)',
    },
    // Campo 51: País de residência
    {
      position: 50,
      name: 'pais_residencia',
      required: false,
      minLength: 1,
      maxLength: 3,
      pattern: /^\d{1,3}$/,
      type: 'code',
      description: 'País de residência (código da tabela)',
    },
    // Campo 52: CEP
    {
      position: 51,
      name: 'cep',
      required: false,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'CEP (8 dígitos)',
    },
    // Campo 53: Município de residência
    {
      position: 52,
      name: 'municipio_residencia',
      required: false,
      minLength: 7,
      maxLength: 7,
      pattern: /^\d{7}$/,
      type: 'code',
      description: 'Município de residência (7 dígitos)',
    },
    // Campo 54: Localização/Zona de residência
    {
      position: 53,
      name: 'zona_residencia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[12]$/,
      type: 'code',
      description: 'Localização/Zona de residência (1-Urbana, 2-Rural)',
    },
    // Campo 55: Localização diferenciada de residência
    {
      position: 54,
      name: 'localizacao_diferenciada',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[12378]$/,
      type: 'code',
      description:
        'Localização diferenciada (1-Assentamento, 2-Terra indígena, 3-Quilombola, 7-Não diferenciada, 8-Povos tradicionais)',
    },
    // Campo 56: Maior nível de escolaridade concluído
    {
      position: 55,
      name: 'escolaridade',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1267]$/,
      type: 'code',
      description:
        'Escolaridade (1-Não concluiu fundamental, 2-Fundamental, 6-Superior, 7-Médio)',
    },
    // Campos adicionais 57-107 (implementação resumida para os campos principais)
    // Campos de escolaridade, pós-graduação e outros cursos seguirão o mesmo padrão
    // Campo 108: Endereço Eletrônico (e-mail)
    {
      position: 107,
      name: 'email',
      required: false,
      minLength: 1,
      maxLength: 100,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      type: 'string',
      description: 'Endereço eletrônico (e-mail)',
    },
  ];

  // Validação específica para CPF
  protected validateFieldType(
    field: FieldRule,
    value: string,
    lineNumber: number,
  ): ValidationError[] {
    const errors = super.validateFieldType(field, value, lineNumber);

    // Validação específica para CPF
    if (field.name === 'cpf' && value && value.length === 11) {
      if (!this.isValidCPF(value)) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: field.name,
          fieldPosition: field.position,
          fieldValue: value,
          ruleName: 'cpf_validation',
          errorMessage: 'CPF inválido',
          severity: 'error',
        });
      }
    }

    return errors;
  }

  private isValidCPF(cpf: string): boolean {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    // Validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  /**
   * Validates business rules for Physical Persons (registro 30)
   * Comprehensive implementation covering all major business rule categories
   */
  protected validateBusinessRules(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Regra 1: Validação de Filiação
    this.validateFiliation(parts, lineNumber, errors);

    // Regra 2: Validação de Nome Completo
    this.validateFullName(parts, lineNumber, errors);

    // Regra 3: Validação de Data de Nascimento
    this.validateBirthDate(parts, lineNumber, errors);

    // Regra 4: Validação de CPF vs Nacionalidade
    this.validateCpfNationality(parts, lineNumber, errors);

    // Regra 5: Validação de Povo Indígena
    this.validateIndigenousPeople(parts, lineNumber, errors);

    // Regra 6: Validação de Nacionalidade vs País
    this.validateNationalityCountry(parts, lineNumber, errors);

    // Regra 7: Validação de Município de Nascimento
    this.validateBirthMunicipality(parts, lineNumber, errors);

    // Regra 8: Validação de Deficiências
    this.validateDisabilities(parts, lineNumber, errors);

    // Regra 9: Validação de Transtornos de Aprendizagem
    this.validateLearningDisorders(parts, lineNumber, errors);

    // Regra 10: Validação de Recursos Educacionais
    this.validateEducationalResources(parts, lineNumber, errors);

    // Regra 11: Validação de Residência
    this.validateResidence(parts, lineNumber, errors);

    return errors;
  }

  private validateFiliation(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const filiacao = parts[7] || '';
    const filiacao1 = parts[8] || '';
    const filiacao2 = parts[9] || '';

    // Quando filiação for 1, pelo menos uma das filiações deve ser preenchida
    if (filiacao === '1' && !filiacao1 && !filiacao2) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'filiacao_validation',
        fieldPosition: 8,
        fieldValue: `filiacao:${filiacao}|filiacao1:${filiacao1}|filiacao2:${filiacao2}`,
        ruleName: 'filiation_required',
        errorMessage:
          'Campo "Filiação 1" ou "Filiação 2" deve ser preenchido quando Filiação = 1',
        severity: 'error',
      });
    }

    // Filiações não podem ser preenchidas quando filiação = 0
    if (filiacao === '0' && (filiacao1 || filiacao2)) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'filiacao_validation',
        fieldPosition: 8,
        fieldValue: `filiacao:${filiacao}|filiacao1:${filiacao1}|filiacao2:${filiacao2}`,
        ruleName: 'filiation_not_allowed',
        errorMessage: 'Filiações não podem ser preenchidas quando Filiação = 0',
        severity: 'error',
      });
    }

    // Filiação 2 não pode ser igual à Filiação 1
    if (filiacao1 && filiacao2 && filiacao1 === filiacao2) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'filiacao_2',
        fieldPosition: 9,
        fieldValue: filiacao2,
        ruleName: 'filiation_duplicate',
        errorMessage: 'Filiação 2 não pode ser igual à Filiação 1',
        severity: 'error',
      });
    }
  }

  private validateFullName(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const nomeCompleto = parts[5] || '';
    const cpf = parts[4] || '';

    // Se não tem CPF, nome deve ter mais de uma palavra
    if (!cpf && nomeCompleto) {
      const palavras = nomeCompleto.trim().split(/\s+/);
      if (palavras.length < 2) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'nome_completo',
          fieldPosition: 5,
          fieldValue: nomeCompleto,
          ruleName: 'name_multiple_words',
          errorMessage:
            'Nome deve ter mais de uma palavra quando CPF não for preenchido',
          severity: 'error',
        });
      }

      // As duas primeiras palavras não podem ter apenas um caractere cada
      if (
        palavras.length >= 2 &&
        palavras[0].length === 1 &&
        palavras[1].length === 1
      ) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'nome_completo',
          fieldPosition: 5,
          fieldValue: nomeCompleto,
          ruleName: 'name_short_words',
          errorMessage:
            'As duas primeiras palavras do nome não podem ter apenas um caractere cada',
          severity: 'error',
        });
      }

      // Não pode ter 4 ou mais caracteres iguais sequenciais
      for (let i = 0; i <= nomeCompleto.length - 4; i++) {
        const char = nomeCompleto[i];
        if (
          char === nomeCompleto[i + 1] &&
          char === nomeCompleto[i + 2] &&
          char === nomeCompleto[i + 3]
        ) {
          errors.push({
            lineNumber,
            recordType: this.recordType,
            fieldName: 'nome_completo',
            fieldPosition: 5,
            fieldValue: nomeCompleto,
            ruleName: 'name_repeated_chars',
            errorMessage:
              'Nome não pode ter 4 ou mais caracteres iguais sequenciais',
            severity: 'error',
          });
          break;
        }
      }
    }
  }

  private validateBirthDate(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const dataNascimento = parts[6] || '';

    if (dataNascimento && /^\d{2}\/\d{2}\/\d{4}$/.test(dataNascimento)) {
      const [day, month, year] = dataNascimento.split('/').map(Number);
      const birthDate = new Date(year, month - 1, day);

      // Data não pode ser posterior à data atual
      if (birthDate > new Date()) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'data_nascimento',
          fieldPosition: 6,
          fieldValue: dataNascimento,
          ruleName: 'birth_date_future',
          errorMessage:
            'Data de nascimento não pode ser posterior à data atual',
          severity: 'error',
        });
      }

      // Validações de idade por tipo de vínculo seriam implementadas aqui
      // baseadas nos registros de vínculos (40, 50, 60) relacionados
    }
  }

  private validateCpfNationality(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const nacionalidade = parts[13] || '';
    const cpf = parts[4] || '';

    // CPF obrigatório para brasileiros (nacionalidade 1 ou 2)
    if (['1', '2'].includes(nacionalidade) && !cpf) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'cpf',
        fieldPosition: 4,
        fieldValue: `nacionalidade:${nacionalidade}|cpf:${cpf}`,
        ruleName: 'cpf_required_brazilian',
        errorMessage:
          'CPF é obrigatório para pessoas com nacionalidade brasileira',
        severity: 'error',
      });
    }
  }

  private validateIndigenousPeople(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const corRaca = parts[11] || '';
    const povoIndigena = parts[12] || '';

    // Povo indígena só pode ser preenchido se cor/raça = 5 (indígena)
    if (povoIndigena && corRaca !== '5') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'povo_indigena',
        fieldPosition: 12,
        fieldValue: povoIndigena,
        ruleName: 'indigenous_people_race_required',
        errorMessage:
          'Povo indígena só pode ser preenchido quando cor/raça = 5 (Indígena)',
        severity: 'error',
      });
    }
  }

  private validateNationalityCountry(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const nacionalidade = parts[13] || '';
    const paisNacionalidade = parts[14] || '';

    // País deve ser 76 (Brasil) para nacionalidade 1 ou 2
    if (['1', '2'].includes(nacionalidade) && paisNacionalidade !== '76') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'pais_nacionalidade',
        fieldPosition: 14,
        fieldValue: paisNacionalidade,
        ruleName: 'country_brazil_required',
        errorMessage: 'País deve ser 76 (Brasil) para nacionalidade brasileira',
        severity: 'error',
      });
    }

    // País não pode ser 76 para nacionalidade 3 (estrangeira)
    if (nacionalidade === '3' && paisNacionalidade === '76') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'pais_nacionalidade',
        fieldPosition: 14,
        fieldValue: paisNacionalidade,
        ruleName: 'country_foreign_required',
        errorMessage:
          'País não pode ser 76 (Brasil) para nacionalidade estrangeira',
        severity: 'error',
      });
    }
  }

  private validateBirthMunicipality(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const nacionalidade = parts[13] || '';
    const municipioNascimento = parts[15] || '';

    // Município obrigatório para nacionalidade 1 (brasileira)
    if (nacionalidade === '1' && !municipioNascimento) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'municipio_nascimento',
        fieldPosition: 15,
        fieldValue: municipioNascimento,
        ruleName: 'birth_municipality_required',
        errorMessage:
          'Município de nascimento é obrigatório para nacionalidade brasileira',
        severity: 'error',
      });
    }

    // Município não pode ser preenchido para nacionalidade diferente de 1
    if (nacionalidade !== '1' && municipioNascimento) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'municipio_nascimento',
        fieldPosition: 15,
        fieldValue: municipioNascimento,
        ruleName: 'birth_municipality_not_allowed',
        errorMessage:
          'Município de nascimento não pode ser preenchido para nacionalidade não brasileira',
        severity: 'error',
      });
    }
  }

  private validateDisabilities(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const pessoaDeficiencia = parts[16] || '';

    // Campos de deficiência (posições 17-27)
    const deficiencias = {
      cegueira: parts[17] || '',
      baixaVisao: parts[18] || '',
      visaoMonocular: parts[19] || '',
      surdez: parts[20] || '',
      deficienciaAuditiva: parts[21] || '',
      surdocegueira: parts[22] || '',
      deficienciaFisica: parts[23] || '',
      deficienciaIntelectual: parts[24] || '',
      deficienciaMultipla: parts[25] || '',
      transtornoAutista: parts[26] || '',
      altasHabilidades: parts[27] || '',
    };

    // Se pessoa_deficiencia = 1, pelo menos uma deficiência deve ser 1
    if (pessoaDeficiencia === '1') {
      const hasDeficiency = Object.values(deficiencias).some(
        (def) => def === '1',
      );
      if (!hasDeficiency) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'pessoa_deficiencia',
          fieldPosition: 16,
          fieldValue: pessoaDeficiencia,
          ruleName: 'disability_type_required',
          errorMessage:
            'Pelo menos um tipo de deficiência deve ser informado quando pessoa tem deficiência',
          severity: 'error',
        });
      }
    }

    // Validações de incompatibilidade entre deficiências
    if (deficiencias.cegueira === '1' && deficiencias.baixaVisao === '1') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'cegueira',
        fieldPosition: 17,
        fieldValue: deficiencias.cegueira,
        ruleName: 'disability_incompatible',
        errorMessage: 'Cegueira é incompatível com baixa visão',
        severity: 'error',
      });
    }

    if (
      deficiencias.surdez === '1' &&
      deficiencias.deficienciaAuditiva === '1'
    ) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'surdez',
        fieldPosition: 20,
        fieldValue: deficiencias.surdez,
        ruleName: 'disability_incompatible',
        errorMessage: 'Surdez é incompatível com deficiência auditiva',
        severity: 'error',
      });
    }

    // Deficiência múltipla deve ser 1 quando há duas ou mais deficiências
    const deficienciasCount = [
      deficiencias.cegueira,
      deficiencias.baixaVisao,
      deficiencias.visaoMonocular,
      deficiencias.surdez,
      deficiencias.deficienciaAuditiva,
      deficiencias.deficienciaFisica,
      deficiencias.deficienciaIntelectual,
    ].filter((def) => def === '1').length;

    if (deficienciasCount >= 2 && deficiencias.deficienciaMultipla !== '1') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'deficiencia_multipla',
        fieldPosition: 25,
        fieldValue: deficiencias.deficienciaMultipla,
        ruleName: 'multiple_disability_required',
        errorMessage:
          'Deficiência múltipla deve ser 1 quando há duas ou mais deficiências',
        severity: 'error',
      });
    }
  }

  private validateLearningDisorders(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const pessoaTranstorno = parts[28] || '';

    // Campos de transtornos (posições 29-34)
    const transtornos = [
      parts[29] || '', // discalculia
      parts[30] || '', // disgrafia
      parts[31] || '', // dislalia
      parts[32] || '', // dislexia
      parts[33] || '', // tdah
      parts[34] || '', // tpac
    ];

    // Se pessoa_transtorno = 1, pelo menos um transtorno deve ser 1
    if (pessoaTranstorno === '1') {
      const hasDisorder = transtornos.some((transtorno) => transtorno === '1');
      if (!hasDisorder) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'pessoa_transtorno_aprendizagem',
          fieldPosition: 28,
          fieldValue: pessoaTranstorno,
          ruleName: 'learning_disorder_type_required',
          errorMessage: 'Pelo menos um tipo de transtorno deve ser informado',
          severity: 'error',
        });
      }
    }
  }

  private validateEducationalResources(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const pessoaDeficiencia = parts[16] || '';
    const pessoaTranstorno = parts[28] || '';
    const recursoNenhum = parts[48] || '';

    // Se há deficiência ou transtorno, deve ter pelo menos um recurso (exceto "nenhum")
    if (
      (pessoaDeficiencia === '1' || pessoaTranstorno === '1') &&
      recursoNenhum !== '1'
    ) {
      const recursos: number[] = [];
      for (let i = 35; i <= 47; i++) {
        if (parts[i] === '1') recursos.push(i);
      }

      if (recursos.length === 0) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'recursos_educacionais',
          fieldPosition: 35,
          fieldValue: 'nenhum_recurso_informado',
          ruleName: 'educational_resources_required',
          errorMessage:
            'Recursos educacionais devem ser informados quando há deficiência ou transtorno',
          severity: 'error',
        });
      }
    }
  }

  private validateResidence(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
  ): void {
    const paisResidencia = parts[50] || '';
    const cep = parts[51] || '';
    const municipioResidencia = parts[52] || '';
    const zonaResidencia = parts[53] || '';

    // CEP só pode ser preenchido se país = 76 (Brasil)
    if (cep && paisResidencia !== '76') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'cep',
        fieldPosition: 51,
        fieldValue: cep,
        ruleName: 'cep_brazil_only',
        errorMessage: 'CEP só pode ser preenchido para residência no Brasil',
        severity: 'error',
      });
    }

    // Município obrigatório se CEP for preenchido
    if (cep && !municipioResidencia) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'municipio_residencia',
        fieldPosition: 52,
        fieldValue: municipioResidencia,
        ruleName: 'municipality_required_with_cep',
        errorMessage:
          'Município de residência é obrigatório quando CEP for preenchido',
        severity: 'error',
      });
    }

    // Zona obrigatória se país = 76 (Brasil)
    if (paisResidencia === '76' && !zonaResidencia) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'zona_residencia',
        fieldPosition: 53,
        fieldValue: zonaResidencia,
        ruleName: 'residence_zone_required',
        errorMessage:
          'Zona de residência é obrigatória para residência no Brasil',
        severity: 'error',
      });
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
