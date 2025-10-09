import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../../common/enums/record-types.enum';
import { ValidationError } from '../../../common/interfaces/validation.interface';

/**
 * Validation rules for Physical Persons (Record 30)
 *
 * IMPORTANT - CPF Validation Rules (Fixed):
 * 1. Required for school managers (registro 40) - always
 * 2. Required for classroom professionals (registro 50) - only if nationality is Brazilian (1 or 2)
 * 3. Required for students (registro 60) - only if enrolled in stages 69, 70, 72, 71, 67, 73, 74
 *
 * Previous implementation incorrectly required CPF for all Brazilian nationals regardless of their role.
 * The correct business rule is that CPF requirements depend on the person's role/bond type AND nationality/stage.
 */
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
    // Campo 57: Tipo de ensino médio cursado
    {
      position: 56,
      name: 'tipo_ensino_medio',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1234]$/,
      type: 'code',
      description:
        'Tipo de ensino médio (1-Formação geral, 2-Normal/magistério, 3-Curso técnico, 4-Magistério indígena)',
    },
    // Campo 58: Código do Curso 1
    {
      position: 57,
      name: 'codigo_curso_1',
      required: false,
      minLength: 8,
      maxLength: 8,
      type: 'string',
      description: 'Código do curso superior 1',
    },
    // Campo 59: Ano de Conclusão 1
    {
      position: 58,
      name: 'ano_conclusao_1',
      required: false,
      minLength: 4,
      maxLength: 4,
      pattern: /^\d{4}$/,
      type: 'number',
      description: 'Ano de conclusão do curso 1',
    },
    // Campo 60: Instituição de educação superior 1
    {
      position: 59,
      name: 'ies_1',
      required: false,
      minLength: 1,
      maxLength: 7,
      pattern: /^\d{1,7}$/,
      type: 'code',
      description: 'Código da IES 1',
    },
    // Campo 61: Código do Curso 2
    {
      position: 60,
      name: 'codigo_curso_2',
      required: false,
      minLength: 8,
      maxLength: 8,
      type: 'string',
      description: 'Código do curso superior 2',
    },
    // Campo 62: Ano de Conclusão 2
    {
      position: 61,
      name: 'ano_conclusao_2',
      required: false,
      minLength: 4,
      maxLength: 4,
      pattern: /^\d{4}$/,
      type: 'number',
      description: 'Ano de conclusão do curso 2',
    },
    // Campo 63: Instituição de educação superior 2
    {
      position: 62,
      name: 'ies_2',
      required: false,
      minLength: 1,
      maxLength: 7,
      pattern: /^\d{1,7}$/,
      type: 'code',
      description: 'Código da IES 2',
    },
    // Campo 64: Código do Curso 3
    {
      position: 63,
      name: 'codigo_curso_3',
      required: false,
      minLength: 8,
      maxLength: 8,
      type: 'string',
      description: 'Código do curso superior 3',
    },
    // Campo 65: Ano de Conclusão 3
    {
      position: 64,
      name: 'ano_conclusao_3',
      required: false,
      minLength: 4,
      maxLength: 4,
      pattern: /^\d{4}$/,
      type: 'number',
      description: 'Ano de conclusão do curso 3',
    },
    // Campo 66: Instituição de educação superior 3
    {
      position: 65,
      name: 'ies_3',
      required: false,
      minLength: 1,
      maxLength: 7,
      pattern: /^\d{1,7}$/,
      type: 'code',
      description: 'Código da IES 3',
    },
    // Campo 67: Área do conhecimento/componentes curriculares 1
    {
      position: 66,
      name: 'area_conhecimento_1',
      required: false,
      minLength: 1,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Área do conhecimento 1',
    },
    // Campo 68: Área do conhecimento/componentes curriculares 2
    {
      position: 67,
      name: 'area_conhecimento_2',
      required: false,
      minLength: 1,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Área do conhecimento 2',
    },
    // Campo 69: Área do conhecimento/componentes curriculares 3
    {
      position: 68,
      name: 'area_conhecimento_3',
      required: false,
      minLength: 1,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Área do conhecimento 3',
    },
    // Campo 70: Tipo de pós-graduação 1
    {
      position: 69,
      name: 'tipo_pos_1',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[123]$/,
      type: 'code',
      description:
        'Tipo de pós-graduação 1 (1-Especialização, 2-Mestrado, 3-Doutorado)',
    },
    // Campo 71: Área da pós-graduação 1
    {
      position: 70,
      name: 'area_pos_1',
      required: false,
      minLength: 1,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Área da pós-graduação 1',
    },
    // Campo 72: Ano de conclusão da pós-graduação 1
    {
      position: 71,
      name: 'ano_pos_1',
      required: false,
      minLength: 4,
      maxLength: 4,
      pattern: /^\d{4}$/,
      type: 'number',
      description: 'Ano de conclusão da pós-graduação 1',
    },
    // Campo 73: Tipo de pós-graduação 2
    {
      position: 72,
      name: 'tipo_pos_2',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[123]$/,
      type: 'code',
      description:
        'Tipo de pós-graduação 2 (1-Especialização, 2-Mestrado, 3-Doutorado)',
    },
    // Campo 74: Área da pós-graduação 2
    {
      position: 73,
      name: 'area_pos_2',
      required: false,
      minLength: 1,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Área da pós-graduação 2',
    },
    // Campo 75: Ano de conclusão da pós-graduação 2
    {
      position: 74,
      name: 'ano_pos_2',
      required: false,
      minLength: 4,
      maxLength: 4,
      pattern: /^\d{4}$/,
      type: 'number',
      description: 'Ano de conclusão da pós-graduação 2',
    },
    // Campo 76: Tipo de pós-graduação 3
    {
      position: 75,
      name: 'tipo_pos_3',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[123]$/,
      type: 'code',
      description:
        'Tipo de pós-graduação 3 (1-Especialização, 2-Mestrado, 3-Doutorado)',
    },
    // Campo 77: Área da pós-graduação 3
    {
      position: 76,
      name: 'area_pos_3',
      required: false,
      minLength: 1,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Área da pós-graduação 3',
    },
    // Campo 78: Ano de conclusão da pós-graduação 3
    {
      position: 77,
      name: 'ano_pos_3',
      required: false,
      minLength: 4,
      maxLength: 4,
      pattern: /^\d{4}$/,
      type: 'number',
      description: 'Ano de conclusão da pós-graduação 3',
    },
    // Campo 79: Tipo de pós-graduação 4
    {
      position: 78,
      name: 'tipo_pos_4',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[123]$/,
      type: 'code',
      description:
        'Tipo de pós-graduação 4 (1-Especialização, 2-Mestrado, 3-Doutorado)',
    },
    // Campo 80: Área da pós-graduação 4
    {
      position: 79,
      name: 'area_pos_4',
      required: false,
      minLength: 1,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Área da pós-graduação 4',
    },
    // Campo 81: Ano de conclusão da pós-graduação 4
    {
      position: 80,
      name: 'ano_pos_4',
      required: false,
      minLength: 4,
      maxLength: 4,
      pattern: /^\d{4}$/,
      type: 'number',
      description: 'Ano de conclusão da pós-graduação 4',
    },
    // Campo 82: Tipo de pós-graduação 5
    {
      position: 81,
      name: 'tipo_pos_5',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[123]$/,
      type: 'code',
      description:
        'Tipo de pós-graduação 5 (1-Especialização, 2-Mestrado, 3-Doutorado)',
    },
    // Campo 83: Área da pós-graduação 5
    {
      position: 82,
      name: 'area_pos_5',
      required: false,
      minLength: 1,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Área da pós-graduação 5',
    },
    // Campo 84: Ano de conclusão da pós-graduação 5
    {
      position: 83,
      name: 'ano_pos_5',
      required: false,
      minLength: 4,
      maxLength: 4,
      pattern: /^\d{4}$/,
      type: 'number',
      description: 'Ano de conclusão da pós-graduação 5',
    },
    // Campo 85: Tipo de pós-graduação 6
    {
      position: 84,
      name: 'tipo_pos_6',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[123]$/,
      type: 'code',
      description:
        'Tipo de pós-graduação 6 (1-Especialização, 2-Mestrado, 3-Doutorado)',
    },
    // Campo 86: Área da pós-graduação 6
    {
      position: 85,
      name: 'area_pos_6',
      required: false,
      minLength: 1,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Área da pós-graduação 6',
    },
    // Campo 87: Ano de conclusão da pós-graduação 6
    {
      position: 86,
      name: 'ano_pos_6',
      required: false,
      minLength: 4,
      maxLength: 4,
      pattern: /^\d{4}$/,
      type: 'number',
      description: 'Ano de conclusão da pós-graduação 6',
    },
    // Campo 88: Não tem pós-graduação concluída
    {
      position: 87,
      name: 'sem_pos_graduacao',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[1]$/,
      type: 'code',
      description: 'Não tem pós-graduação concluída (1-Sim)',
    },
    // Campo 89: Creche (0 a 3 anos)
    {
      position: 88,
      name: 'curso_creche',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Creche (0-Não, 1-Sim)',
    },
    // Campo 90: Pré-escola (4 e 5 anos)
    {
      position: 89,
      name: 'curso_pre_escola',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Pré-escola (0-Não, 1-Sim)',
    },
    // Campo 91: Anos iniciais do ensino fundamental
    {
      position: 90,
      name: 'curso_anos_iniciais',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Anos iniciais (0-Não, 1-Sim)',
    },
    // Campo 92: Anos finais do ensino fundamental
    {
      position: 91,
      name: 'curso_anos_finais',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Anos finais (0-Não, 1-Sim)',
    },
    // Campo 93: Ensino médio
    {
      position: 92,
      name: 'curso_ensino_medio',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Ensino médio (0-Não, 1-Sim)',
    },
    // Campo 94: Educação de jovens e adultos
    {
      position: 93,
      name: 'curso_eja',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso EJA (0-Não, 1-Sim)',
    },
    // Campo 95: Educação especial
    {
      position: 94,
      name: 'curso_educacao_especial',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Educação especial (0-Não, 1-Sim)',
    },
    // Campo 96: Educação Indígena
    {
      position: 95,
      name: 'curso_indigena',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Educação Indígena (0-Não, 1-Sim)',
    },
    // Campo 97: Educação do campo
    {
      position: 96,
      name: 'curso_campo',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Educação do campo (0-Não, 1-Sim)',
    },
    // Campo 98: Educação ambiental
    {
      position: 97,
      name: 'curso_ambiental',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Educação ambiental (0-Não, 1-Sim)',
    },
    // Campo 99: Educação em direitos humanos
    {
      position: 98,
      name: 'curso_direitos_humanos',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Direitos humanos (0-Não, 1-Sim)',
    },
    // Campo 100: Educação bilíngue de surdos
    {
      position: 99,
      name: 'curso_bilingue_surdos',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Bilíngue de surdos (0-Não, 1-Sim)',
    },
    // Campo 101: Educação e Tecnologia de Informação e Comunicação (TIC)
    {
      position: 100,
      name: 'curso_tic',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso TIC (0-Não, 1-Sim)',
    },
    // Campo 102: Gênero e diversidade sexual
    {
      position: 101,
      name: 'curso_genero',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Gênero e diversidade (0-Não, 1-Sim)',
    },
    // Campo 103: Direitos de criança e adolescente
    {
      position: 102,
      name: 'curso_direitos_crianca',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Direitos de criança (0-Não, 1-Sim)',
    },
    // Campo 104: Educação para as relações étnico-raciais e História e cultura afro-brasileira e africana
    {
      position: 103,
      name: 'curso_etnico_racial',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Relações étnico-raciais (0-Não, 1-Sim)',
    },
    // Campo 105: Gestão Escolar
    {
      position: 104,
      name: 'curso_gestao',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curso Gestão Escolar (0-Não, 1-Sim)',
    },
    // Campo 106: Outros
    {
      position: 105,
      name: 'curso_outros',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Outros cursos (0-Não, 1-Sim)',
    },
    // Campo 107: Nenhum
    {
      position: 106,
      name: 'curso_nenhum',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Nenhum curso específico (0-Não, 1-Sim)',
    },
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
        errors.push(
          this.createError(
            lineNumber,
            field.name,
            field.description || 'CPF',
            field.position,
            value,
            'cpf_validation',
            'CPF inválido',
            ValidationSeverity.ERROR,
          ),
        );
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

    // Regra 4: Validação de Povo Indígena
    this.validateIndigenousPeople(parts, lineNumber, errors);

    // Regra 5: Validação de Nacionalidade vs País
    this.validateCpfNationality(parts, lineNumber, errors);

    // Regra 6: Validação de Município de Nascimento
    this.validateBirthMunicipality(parts, lineNumber, errors);

    // Regra 7: Validação de Deficiências
    this.validateDisabilities(parts, lineNumber, errors);

    // Regra 8: Validação de Transtornos de Aprendizagem
    this.validateLearningDisorders(parts, lineNumber, errors);

    // Regra 9: Validação de Recursos Educacionais
    this.validateEducationalResources(parts, lineNumber, errors);

    // Regra 10: Validação de Residência
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
      errors.push(
        this.createError(
          lineNumber,
          'filiacao_validation',
          'Filiação',
          8,
          `filiacao:${filiacao}|filiacao1:${filiacao1}|filiacao2:${filiacao2}`,
          'filiation_required',
          'Campo "Filiação 1" ou "Filiação 2" deve ser preenchido quando Filiação = 1',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Filiações não podem ser preenchidas quando filiação = 0
    if (filiacao === '0' && (filiacao1 || filiacao2)) {
      errors.push(
        this.createError(
          lineNumber,
          'filiacao_validation',
          'Filiação',
          8,
          `filiacao:${filiacao}|filiacao1:${filiacao1}|filiacao2:${filiacao2}`,
          'filiation_not_allowed',
          'Filiações não podem ser preenchidas quando Filiação = 0',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Filiação 2 não pode ser igual à Filiação 1
    if (filiacao1 && filiacao2 && filiacao1 === filiacao2) {
      errors.push(
        this.createError(
          lineNumber,
          'filiacao_2',
          'Nome de filiação 2',
          9,
          filiacao2,
          'filiation_duplicate',
          'Filiação 2 não pode ser igual à Filiação 1',
          ValidationSeverity.ERROR,
        ),
      );
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
        errors.push(
          this.createError(
            lineNumber,
            'nome_completo',
            'Nome completo',
            5,
            nomeCompleto,
            'name_multiple_words',
            'Nome deve ter mais de uma palavra quando CPF não for preenchido',
            ValidationSeverity.ERROR,
          ),
        );
      }

      // As duas primeiras palavras não podem ter apenas um caractere cada
      if (
        palavras.length >= 2 &&
        palavras[0].length === 1 &&
        palavras[1].length === 1
      ) {
        errors.push(
          this.createError(
            lineNumber,
            'nome_completo',
            'Nome completo',
            5,
            nomeCompleto,
            'name_short_words',
            'As duas primeiras palavras do nome não podem ter apenas um caractere cada',
            ValidationSeverity.ERROR,
          ),
        );
      }

      // Não pode ter 4 ou mais caracteres iguais sequenciais
      for (let i = 0; i <= nomeCompleto.length - 4; i++) {
        const char = nomeCompleto[i];
        if (
          char === nomeCompleto[i + 1] &&
          char === nomeCompleto[i + 2] &&
          char === nomeCompleto[i + 3]
        ) {
          errors.push(
            this.createError(
              lineNumber,
              'nome_completo',
              'Nome completo',
              5,
              nomeCompleto,
              'name_repeated_chars',
              'Nome não pode ter 4 ou mais caracteres iguais sequenciais',
              ValidationSeverity.ERROR,
            ),
          );
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
        errors.push(
          this.createError(
            lineNumber,
            'data_nascimento',
            'Data de nascimento',
            6,
            dataNascimento,
            'birth_date_future',
            'Data de nascimento não pode ser posterior à data atual',
            ValidationSeverity.ERROR,
          ),
        );
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
    const paisNacionalidade = parts[14] || '';

    // País deve ser 76 (Brasil) para nacionalidade 1 ou 2
    if (['1', '2'].includes(nacionalidade) && paisNacionalidade !== '76') {
      errors.push(
        this.createError(
          lineNumber,
          'pais_nacionalidade',
          'País de nacionalidade',
          14,
          paisNacionalidade,
          'country_brazil_required',
          'País deve ser 76 (Brasil) para nacionalidade brasileira',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // País não pode ser 76 para nacionalidade 3 (estrangeira)
    if (nacionalidade === '3' && paisNacionalidade === '76') {
      errors.push(
        this.createError(
          lineNumber,
          'pais_nacionalidade',
          'País de nacionalidade',
          14,
          paisNacionalidade,
          'country_foreign_required',
          'País não pode ser 76 (Brasil) para nacionalidade estrangeira',
          ValidationSeverity.ERROR,
        ),
      );
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
      errors.push(
        this.createError(
          lineNumber,
          'povo_indigena',
          'Código do povo/etnia indígena',
          12,
          povoIndigena,
          'indigenous_people_race_required',
          'Povo indígena só pode ser preenchido quando cor/raça = 5 (Indígena)',
          ValidationSeverity.ERROR,
        ),
      );
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
      errors.push(
        this.createError(
          lineNumber,
          'municipio_nascimento',
          'Município de nascimento',
          15,
          municipioNascimento,
          'birth_municipality_required',
          'Município de nascimento é obrigatório para nacionalidade brasileira',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Município não pode ser preenchido para nacionalidade diferente de 1
    if (nacionalidade !== '1' && municipioNascimento) {
      errors.push(
        this.createError(
          lineNumber,
          'municipio_nascimento',
          'Município de nascimento',
          15,
          municipioNascimento,
          'birth_municipality_not_allowed',
          'Município de nascimento não pode ser preenchido para nacionalidade não brasileira',
          ValidationSeverity.ERROR,
        ),
      );
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
        errors.push(
          this.createError(
            lineNumber,
            'pessoa_deficiencia',
            'Pessoa com deficiência',
            16,
            pessoaDeficiencia,
            'disability_type_required',
            'Pelo menos um tipo de deficiência deve ser informado quando pessoa tem deficiência',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Validações de incompatibilidade entre deficiências
    if (deficiencias.cegueira === '1' && deficiencias.baixaVisao === '1') {
      errors.push(
        this.createError(
          lineNumber,
          'cegueira',
          'Cegueira',
          17,
          deficiencias.cegueira,
          'disability_incompatible',
          'Cegueira é incompatível com baixa visão',
          ValidationSeverity.ERROR,
        ),
      );
    }

    if (
      deficiencias.surdez === '1' &&
      deficiencias.deficienciaAuditiva === '1'
    ) {
      errors.push(
        this.createError(
          lineNumber,
          'surdez',
          'Surdez',
          20,
          deficiencias.surdez,
          'disability_incompatible',
          'Surdez é incompatível com deficiência auditiva',
          ValidationSeverity.ERROR,
        ),
      );
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
      errors.push(
        this.createError(
          lineNumber,
          'deficiencia_multipla',
          'Deficiência múltipla',
          25,
          deficiencias.deficienciaMultipla,
          'multiple_disability_required',
          'Deficiência múltipla deve ser 1 quando há duas ou mais deficiências',
          ValidationSeverity.ERROR,
        ),
      );
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
        errors.push(
          this.createError(
            lineNumber,
            'pessoa_transtorno_aprendizagem',
            'Pessoa com transtorno de aprendizagem',
            28,
            pessoaTranstorno,
            'learning_disorder_type_required',
            'Pelo menos um tipo de transtorno deve ser informado',
            ValidationSeverity.ERROR,
          ),
        );
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
        errors.push(
          this.createError(
            lineNumber,
            'recursos_educacionais',
            'Recursos educacionais',
            35,
            'nenhum_recurso_informado',
            'educational_resources_required',
            'Recursos educacionais devem ser informados quando há deficiência ou transtorno',
            ValidationSeverity.ERROR,
          ),
        );
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
      errors.push(
        this.createError(
          lineNumber,
          'cep',
          'CEP',
          51,
          cep,
          'cep_brazil_only',
          'CEP só pode ser preenchido para residência no Brasil',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Município obrigatório se CEP for preenchido
    if (cep && !municipioResidencia) {
      errors.push(
        this.createError(
          lineNumber,
          'municipio_residencia',
          'Município de residência',
          52,
          municipioResidencia,
          'municipality_required_with_cep',
          'Município de residência é obrigatório quando CEP for preenchido',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Zona obrigatória se país = 76 (Brasil)
    if (paisResidencia === '76' && !zonaResidencia) {
      errors.push(
        this.createError(
          lineNumber,
          'zona_residencia',
          'Zona de residência',
          53,
          zonaResidencia,
          'residence_zone_required',
          'Zona de residência é obrigatória para residência no Brasil',
          ValidationSeverity.ERROR,
        ),
      );
    }
  }

  /**
   * Validates business rules with context from other records
   * This method should be called when context from registro 40, 50, 60 is available
   */
  validateWithContext(
    parts: string[],
    lineNumber: number,
    schoolContext?: {
      codigoInep: string;
      managerBonds: string[]; // códigos de pessoas com vínculo gestor (registro 40)
      professionalBonds: string[]; // códigos de pessoas com vínculo profissional (registro 50)
      studentEnrollments: string[]; // códigos de pessoas com matrícula (registro 60)
      studentStages: Map<string, string[]>; // código da pessoa -> array das etapas de ensino (registro 60)
      existingPersonCodes: string[]; // códigos de pessoas já processadas nesta escola
    },
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validações básicas de campos
    const fieldErrors = super.validate(parts, lineNumber);
    errors.push(...fieldErrors);

    // Validações de regras de negócio
    const businessErrors = this.validateBusinessRules(parts, lineNumber);
    errors.push(...businessErrors);

    // Validações que dependem de contexto
    if (schoolContext) {
      // Regra CPF: Validar obrigatoriedade do CPF baseada em vínculos
      this.validateCpfRequirements(parts, lineNumber, errors, schoolContext);

      // Regra 3: A pessoa física deve ter vínculo (40, 50 ou 60)
      this.validatePersonBonds(parts, lineNumber, errors, schoolContext);

      // Regra 4: A pessoa física não pode aparecer duas vezes na mesma escola
      this.validatePersonDuplication(parts, lineNumber, errors, schoolContext);
    }

    return errors;
  }

  /**
   * Validates CPF requirements based on person's bonds and nationality
   * Regras do INEP para CPF:
   * 1. Obrigatório para gestores escolares (registro 40)
   * 2. Obrigatório para profissionais em sala de aula (registro 50) com nacionalidade brasileira (1 ou 2)
   * 3. Obrigatório para alunos nas etapas 69, 70, 72, 71, 67, 73 ou 74
   */
  private validateCpfRequirements(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
    schoolContext: {
      codigoInep: string;
      managerBonds: string[];
      professionalBonds: string[];
      studentEnrollments: string[];
      studentStages: Map<string, string[]>;
      existingPersonCodes: string[];
    },
  ): void {
    const codigoPessoa = parts[2] || '';
    const cpf = parts[4] || '';
    const nacionalidade = parts[13] || '';

    if (!codigoPessoa) return;

    const hasManagerBond = schoolContext.managerBonds.includes(codigoPessoa);
    const hasProfessionalBond =
      schoolContext.professionalBonds.includes(codigoPessoa);
    const hasStudentEnrollment =
      schoolContext.studentEnrollments.includes(codigoPessoa);

    // Regra 1: CPF obrigatório para gestores escolares (registro 40)
    if (hasManagerBond && !cpf) {
      errors.push(
        this.createError(
          lineNumber,
          'cpf',
          'CPF',
          4,
          `vinculo:gestor|cpf:${cpf}`,
          'cpf_required_manager',
          'CPF é obrigatório para pessoas com vínculo de gestor escolar (registro 40)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 2: CPF obrigatório para profissionais brasileiros (registro 50)
    if (hasProfessionalBond && ['1', '2'].includes(nacionalidade) && !cpf) {
      errors.push(
        this.createError(
          lineNumber,
          'cpf',
          'CPF',
          4,
          `vinculo:profissional|nacionalidade:${nacionalidade}|cpf:${cpf}`,
          'cpf_required_professional_brazilian',
          'CPF é obrigatório para profissionais escolares com nacionalidade brasileira (registro 50)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 3: CPF obrigatório para alunos em etapas específicas (registro 60)
    // Etapas que exigem CPF: 69, 70, 72, 71, 67, 73, 74
    if (hasStudentEnrollment && !cpf) {
      const studentStages = schoolContext.studentStages.get(codigoPessoa) || [];
      const cpfRequiredStages = ['69', '70', '72', '71', '67', '73', '74'];

      const hasStageRequiringCpf = studentStages.some((stage) =>
        cpfRequiredStages.includes(stage),
      );

      if (hasStageRequiringCpf) {
        const stagesRequiringCpf = studentStages.filter((stage) =>
          cpfRequiredStages.includes(stage),
        );

        errors.push(
          this.createError(
            lineNumber,
            'cpf',
            'CPF',
            4,
            `vinculo:aluno|etapas:${stagesRequiringCpf.join(',')}|cpf:${cpf}`,
            'cpf_required_student_stages',
            `CPF é obrigatório para alunos nas etapas ${stagesRequiringCpf.join(', ')} (registro 60)`,
            ValidationSeverity.ERROR,
          ),
        );
      }
    }
  }

  private validatePersonBonds(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
    schoolContext: {
      codigoInep: string;
      managerBonds: string[];
      professionalBonds: string[];
      studentEnrollments: string[];
      studentStages: Map<string, string[]>;
      existingPersonCodes: string[];
    },
  ): void {
    const codigoPessoa = parts[2] || '';

    if (!codigoPessoa) return; // Se não tem código, já vai dar erro na validação de campo obrigatório

    // Verificar se a pessoa tem pelo menos um vínculo (40, 50 ou 60)
    const hasManagerBond = schoolContext.managerBonds.includes(codigoPessoa);
    const hasProfessionalBond =
      schoolContext.professionalBonds.includes(codigoPessoa);
    const hasStudentEnrollment =
      schoolContext.studentEnrollments.includes(codigoPessoa);

    if (!hasManagerBond && !hasProfessionalBond && !hasStudentEnrollment) {
      errors.push(
        this.createError(
          lineNumber,
          'codigo_pessoa_sistema',
          'Código da pessoa física no sistema próprio',
          2,
          codigoPessoa,
          'person_without_bond',
          'A pessoa física deve ter vínculo de gestor escolar (registro 40), profissional escolar em sala de aula (registro 50) ou aluno(a) (registro 60)',
          ValidationSeverity.ERROR,
        ),
      );
    }
  }

  private validatePersonDuplication(
    parts: string[],
    lineNumber: number,
    errors: ValidationError[],
    schoolContext: {
      codigoInep: string;
      managerBonds: string[];
      professionalBonds: string[];
      studentEnrollments: string[];
      studentStages: Map<string, string[]>;
      existingPersonCodes?: string[]; // códigos de pessoas já processadas nesta escola
    },
  ): void {
    const codigoPessoa = parts[2] || '';

    if (!codigoPessoa) return;

    // Verificar se já existe uma pessoa com o mesmo código nesta escola
    if (schoolContext.existingPersonCodes?.includes(codigoPessoa)) {
      errors.push(
        this.createError(
          lineNumber,
          'codigo_pessoa_sistema',
          'Código da pessoa física no sistema próprio',
          2,
          codigoPessoa,
          'person_duplicate',
          'A pessoa física não pode aparecer duas vezes na mesma escola (código duplicado)',
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
