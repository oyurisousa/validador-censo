import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import {
  RecordTypeEnum,
  ValidationSeverity,
} from '../../../common/enums/record-types.enum';
import { ValidationError } from '../../../common/interfaces/validation.interface';
import { ComplementaryActivityService } from '../../utils/complementary-activity.service';
import { StepService } from '../../utils/step.service';

@Injectable()
export class ClassesRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.CLASSES;

  constructor(
    private readonly complementaryActivityService: ComplementaryActivityService,
    private readonly stepService: StepService,
  ) {
    super();
  }

  protected readonly fields: FieldRule[] = [
    // Campo 1: Tipo de registro
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^20$/,
      type: 'code',
      description: 'Tipo de registro (sempre 20)',
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
    // Campo 3: Código da Turma na Entidade/Escola
    {
      position: 2,
      name: 'codigo_turma_entidade',
      required: true,
      minLength: 1,
      maxLength: 20,
      type: 'string',
      description: 'Código da turma na entidade/escola',
    },
    // Campo 4: Código da Turma - Inep
    {
      position: 3,
      name: 'codigo_turma_inep',
      required: false,
      minLength: 1,
      maxLength: 10,
      pattern: /^\d{1,10}$/,
      type: 'number',
      description: 'Código da turma - INEP (não deve ser preenchido)',
    },
    // Campo 5: Nome da Turma
    {
      position: 4,
      name: 'nome_turma',
      required: true,
      minLength: 1,
      maxLength: 80,
      pattern: /^[ABCDEFGHIJKLMNOPQRSTUVWXYZ0-9ªº–\s]*$/,
      type: 'string',
      description: 'Nome da turma',
    },
    // Campo 6: Tipo de mediação didático-pedagógica
    {
      position: 5,
      name: 'tipo_mediacao_pedagogica',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[123]$/,
      type: 'code',
      description:
        'Tipo de mediação didático-pedagógica (1-Presencial, 2-Semipresencial, 3-EAD)',
    },
    // Campo 7: Domingo
    {
      position: 6,
      name: 'horario_domingo',
      required: false,
      minLength: 11,
      maxLength: 11,
      pattern:
        /^(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)-(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)$/,
      type: 'string',
      description: 'Horário de funcionamento no domingo (hh:mm-hh:mm)',
    },
    // Campo 8: Segunda-feira
    {
      position: 7,
      name: 'horario_segunda',
      required: false,
      minLength: 11,
      maxLength: 11,
      pattern:
        /^(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)-(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)$/,
      type: 'string',
      description: 'Horário de funcionamento na segunda-feira (hh:mm-hh:mm)',
    },
    // Campo 9: Terça-feira
    {
      position: 8,
      name: 'horario_terca',
      required: false,
      minLength: 11,
      maxLength: 11,
      pattern:
        /^(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)-(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)$/,
      type: 'string',
      description: 'Horário de funcionamento na terça-feira (hh:mm-hh:mm)',
    },
    // Campo 10: Quarta-feira
    {
      position: 9,
      name: 'horario_quarta',
      required: false,
      minLength: 11,
      maxLength: 11,
      pattern:
        /^(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)-(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)$/,
      type: 'string',
      description: 'Horário de funcionamento na quarta-feira (hh:mm-hh:mm)',
    },
    // Campo 11: Quinta-feira
    {
      position: 10,
      name: 'horario_quinta',
      required: false,
      minLength: 11,
      maxLength: 11,
      pattern:
        /^(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)-(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)$/,
      type: 'string',
      description: 'Horário de funcionamento na quinta-feira (hh:mm-hh:mm)',
    },
    // Campo 12: Sexta-feira
    {
      position: 11,
      name: 'horario_sexta',
      required: false,
      minLength: 11,
      maxLength: 11,
      pattern:
        /^(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)-(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)$/,
      type: 'string',
      description: 'Horário de funcionamento na sexta-feira (hh:mm-hh:mm)',
    },
    // Campo 13: Sábado
    {
      position: 12,
      name: 'horario_sabado',
      required: false,
      minLength: 11,
      maxLength: 11,
      pattern:
        /^(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)-(0[0-9]|1[0-9]|2[0-3]):(00|05|10|15|20|25|30|35|40|45|50|55)$/,
      type: 'string',
      description: 'Horário de funcionamento no sábado (hh:mm-hh:mm)',
    },
    // Campo 14: Curricular (etapa de ensino)
    {
      position: 13,
      name: 'tipo_turma_curricular',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Curricular (etapa de ensino) (0-Não, 1-Sim)',
    },
    // Campo 15: Atividade complementar
    {
      position: 14,
      name: 'tipo_turma_atividade_complementar',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Atividade complementar (0-Não, 1-Sim)',
    },
    // Campo 16: Atendimento educacional especializado - AEE
    {
      position: 15,
      name: 'tipo_turma_aee',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Atendimento educacional especializado - AEE (0-Não, 1-Sim)',
    },
    // Campo 17: Código 1 - Atividade complementar
    {
      position: 16,
      name: 'codigo_atividade_1',
      required: false,
      minLength: 5,
      maxLength: 5,
      pattern: /^\d{5}$/,
      type: 'code',
      description: 'Código 1 da atividade complementar',
      conditionalRequired: {
        field: 'tipo_turma_atividade_complementar',
        values: ['1'],
      },
    },
    // Campo 18: Código 2 - Atividade complementar
    {
      position: 17,
      name: 'codigo_atividade_2',
      required: false,
      minLength: 5,
      maxLength: 5,
      pattern: /^\d{5}$/,
      type: 'code',
      description: 'Código 2 da atividade complementar',
    },
    // Campo 19: Código 3 - Atividade complementar
    {
      position: 18,
      name: 'codigo_atividade_3',
      required: false,
      minLength: 5,
      maxLength: 5,
      pattern: /^\d{5}$/,
      type: 'code',
      description: 'Código 3 da atividade complementar',
    },
    // Campo 20: Código 4 - Atividade complementar
    {
      position: 19,
      name: 'codigo_atividade_4',
      required: false,
      minLength: 5,
      maxLength: 5,
      pattern: /^\d{5}$/,
      type: 'code',
      description: 'Código 4 da atividade complementar',
    },
    // Campo 21: Código 5 - Atividade complementar
    {
      position: 20,
      name: 'codigo_atividade_5',
      required: false,
      minLength: 5,
      maxLength: 5,
      pattern: /^\d{5}$/,
      type: 'code',
      description: 'Código 5 da atividade complementar',
    },
    // Campo 22: Código 6 - Atividade complementar
    {
      position: 21,
      name: 'codigo_atividade_6',
      required: false,
      minLength: 5,
      maxLength: 5,
      pattern: /^\d{5}$/,
      type: 'code',
      description: 'Código 6 da atividade complementar',
    },
    // Campo 23: Local de funcionamento diferenciado da turma
    {
      position: 22,
      name: 'local_funcionamento_diferenciado',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[0123]$/,
      type: 'code',
      description:
        'Local de funcionamento diferenciado da turma (0-Não diferenciado, 1-Sala anexa, 2-Socioeducativo, 3-Prisional)',
      conditionalRequired: {
        field: 'tipo_mediacao_pedagogica',
        values: ['1', '2'],
      },
    },
    // Campo 24: Turma de Educação Especial (classe especial)
    {
      position: 23,
      name: 'turma_educacao_especial',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Turma de Educação Especial (classe especial) (0-Não, 1-Sim)',
      conditionalRequired: { field: 'tipo_turma_curricular', values: ['1'] },
    },
    // Campo 25: Etapa agregada
    {
      position: 24,
      name: 'etapa_agregada',
      required: false,
      minLength: 3,
      maxLength: 3,
      pattern: /^\d{3}$/,
      type: 'code',
      description: 'Etapa agregada (código da tabela de etapas)',
      conditionalRequired: { field: 'tipo_turma_curricular', values: ['1'] },
    },
    // Campo 26: Etapa
    {
      position: 25,
      name: 'etapa',
      required: false,
      minLength: 1,
      maxLength: 2,
      pattern: /^\d{1,2}$/,
      type: 'code',
      description: 'Etapa de ensino específica',
    },
    // Campo 27: Código do curso
    {
      position: 26,
      name: 'codigo_curso',
      required: false,
      minLength: 1,
      maxLength: 8,
      pattern: /^\d{1,8}$/,
      type: 'code',
      description: 'Código do curso da educação profissional',
    },
    // Campo 28: Série/ano (séries anuais)
    {
      position: 27,
      name: 'organizacao_serie_ano',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Série/ano (séries anuais) (0-Não, 1-Sim)',
    },
    // Campo 29: Períodos semestrais
    {
      position: 28,
      name: 'organizacao_periodos_semestrais',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Períodos semestrais (0-Não, 1-Sim)',
    },
    // Campo 30: Ciclo(s)
    {
      position: 29,
      name: 'organizacao_ciclos',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Ciclo(s) (0-Não, 1-Sim)',
    },
    // Campo 31: Grupos não seriados com base na idade ou competência
    {
      position: 30,
      name: 'organizacao_grupos_nao_seriados',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Grupos não seriados com base na idade ou competência (0-Não, 1-Sim)',
    },
    // Campo 32: Módulos
    {
      position: 31,
      name: 'organizacao_modulos',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Módulos (0-Não, 1-Sim)',
    },
    // Campo 33: Turma de Formação por Alternância
    {
      position: 32,
      name: 'turma_formacao_alternancia',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Turma de Formação por Alternância (tempo-escola e tempo-comunidade) (0-Não, 1-Sim)',
    },
    // Campo 34: Formação geral básica
    {
      position: 33,
      name: 'organizacao_curricular_formacao_geral',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Formação geral básica (0-Não, 1-Sim)',
    },
    // Campo 35: Itinerário formativo de aprofundamento
    {
      position: 34,
      name: 'organizacao_curricular_itinerario_aprofundamento',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Itinerário formativo de aprofundamento (0-Não, 1-Sim)',
    },
    // Campo 36: Itinerário de formação técnica e profissional
    {
      position: 35,
      name: 'organizacao_curricular_itinerario_tecnico',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Itinerário de formação técnica e profissional (0-Não, 1-Sim)',
    },
    // Campo 37: Linguagens e suas tecnologias
    {
      position: 36,
      name: 'area_linguagens_tecnologias',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Linguagens e suas tecnologias (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'organizacao_curricular_itinerario_aprofundamento',
        values: ['1'],
      },
    },
    // Campo 38: Matemática e suas tecnologias
    {
      position: 37,
      name: 'area_matematica_tecnologias',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Matemática e suas tecnologias (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'organizacao_curricular_itinerario_aprofundamento',
        values: ['1'],
      },
    },
    // Campo 39: Ciências da natureza e suas tecnologias
    {
      position: 38,
      name: 'area_ciencias_natureza_tecnologias',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Ciências da natureza e suas tecnologias (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'organizacao_curricular_itinerario_aprofundamento',
        values: ['1'],
      },
    },
    // Campo 40: Ciências humanas e sociais aplicadas
    {
      position: 39,
      name: 'area_ciencias_humanas_sociais',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Ciências humanas e sociais aplicadas (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'organizacao_curricular_itinerario_aprofundamento',
        values: ['1'],
      },
    },
    // Campo 41: Tipo do curso do itinerário de formação técnica e profissional
    {
      position: 40,
      name: 'tipo_curso_tecnico_profissional',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[12]$/,
      type: 'code',
      description:
        'Tipo do curso (1-Curso técnico, 2-Qualificação profissional técnica)',
      conditionalRequired: {
        field: 'organizacao_curricular_itinerario_tecnico',
        values: ['1'],
      },
    },
    // Campo 42: Código do curso técnico
    {
      position: 41,
      name: 'codigo_curso_tecnico',
      required: false,
      minLength: 1,
      maxLength: 8,
      pattern: /^\d{1,8}$/,
      type: 'code',
      description: 'Código do curso técnico',
      conditionalRequired: {
        field: 'tipo_curso_tecnico_profissional',
        values: ['1'],
      },
    },
    // Campo 43: Química
    {
      position: 42,
      name: 'componente_quimica',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description: 'Química (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 44: Física
    {
      position: 43,
      name: 'componente_fisica',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description: 'Física (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 45: Matemática
    {
      position: 44,
      name: 'componente_matematica',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description: 'Matemática (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 46: Biologia
    {
      position: 45,
      name: 'componente_biologia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description: 'Biologia (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 47: Ciências
    {
      position: 46,
      name: 'componente_ciencias',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description: 'Ciências (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 48: Língua/Literatura Portuguesa
    {
      position: 47,
      name: 'componente_lingua_portuguesa',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Língua/Literatura Portuguesa (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 49: Língua/Literatura Estrangeira – Inglês
    {
      position: 48,
      name: 'componente_lingua_ingles',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Língua/Literatura Estrangeira – Inglês (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 50: Língua/Literatura Estrangeira – Espanhol
    {
      position: 49,
      name: 'componente_lingua_espanhol',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Língua/Literatura Estrangeira – Espanhol (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 51: Língua/Literatura Estrangeira – outra
    {
      position: 50,
      name: 'componente_lingua_outra',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Língua/Literatura Estrangeira – outra (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 52: Arte
    {
      position: 51,
      name: 'componente_arte',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Arte (Educação Artística, Teatro, Dança, Música, Artes Plásticas) (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 53: Educação Física
    {
      position: 52,
      name: 'componente_educacao_fisica',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Educação Física (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 54: História
    {
      position: 53,
      name: 'componente_historia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description: 'História (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 55: Geografia
    {
      position: 54,
      name: 'componente_geografia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description: 'Geografia (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 56: Filosofia
    {
      position: 55,
      name: 'componente_filosofia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description: 'Filosofia (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 57: Informática/Computação
    {
      position: 56,
      name: 'componente_informatica',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Informática/Computação (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 58: Áreas do conhecimento profissionalizantes
    {
      position: 57,
      name: 'componente_areas_profissionalizantes',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Áreas do conhecimento profissionalizantes (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 59: Libras
    {
      position: 58,
      name: 'componente_libras',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description: 'Libras (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 60: Áreas do conhecimento pedagógicas
    {
      position: 59,
      name: 'componente_areas_pedagogicas',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Áreas do conhecimento pedagógicas (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 61: Ensino Religioso
    {
      position: 60,
      name: 'componente_ensino_religioso',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Ensino Religioso (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 62: Língua Indígena
    {
      position: 61,
      name: 'componente_lingua_indigena',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Língua Indígena (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 63: Estudos Sociais
    {
      position: 62,
      name: 'componente_estudos_sociais',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Estudos Sociais (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 64: Sociologia
    {
      position: 63,
      name: 'componente_sociologia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description: 'Sociologia (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 65: Língua/Literatura Estrangeira – Francês
    {
      position: 64,
      name: 'componente_lingua_frances',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Língua/Literatura Estrangeira – Francês (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 66: Língua Portuguesa como Segunda Língua
    {
      position: 65,
      name: 'componente_portugues_segunda_lingua',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Língua Portuguesa como Segunda Língua (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 67: Estágio curricular supervisionado
    {
      position: 66,
      name: 'componente_estagio_supervisionado',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Estágio curricular supervisionado (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 68: Projeto de vida
    {
      position: 67,
      name: 'componente_projeto_vida',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Projeto de vida (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 69: Outras áreas do conhecimento
    {
      position: 68,
      name: 'componente_outras_areas',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Outras áreas do conhecimento (0-Não oferece, 1-Com docente, 2-Sem docente)',
    },
    // Campo 70: Turma de Educação Bilíngue de Surdos
    {
      position: 69,
      name: 'turma_bilingue_surdos',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Turma de Educação Bilíngue de Surdos (classe bilíngue de surdos) (0-Não, 1-Sim)',
    },
  ];

  /**
   * Validates complementary activity codes against the database
   */
  async validateComplementaryActivities(
    parts: string[],
    lineNumber: number,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const atividadeComplementar = parts[14] || ''; // Campo 15 (posição 14)

    // Se Atividade complementar não for 1 (Sim), verifica se campos 17-22 estão vazios
    if (atividadeComplementar !== '1') {
      const activityPositions = [16, 17, 18, 19, 20, 21]; // Posições dos campos 17-22
      const fieldNumbers = [17, 18, 19, 20, 21, 22]; // Números dos campos

      for (let i = 0; i < activityPositions.length; i++) {
        const position = activityPositions[i];
        const fieldNumber = fieldNumbers[i];
        const value = parts[position];

        if (value && value.trim() !== '') {
          errors.push(
            this.createError(
              lineNumber,
              `codigo_atividade_${i + 1}_nao_permitido`,
              `Código ${i + 1} - Atividade complementar`,
              fieldNumber,
              value,
              'activity_not_allowed',
              `O campo "Código ${i + 1} - Atividade complementar" não pode ser preenchido quando o campo "Atividade complementar" não for 1 (Sim)`,
              ValidationSeverity.ERROR,
            ),
          );
        }
      }

      return errors;
    }

    // Se Atividade complementar = 1, valida os códigos informados
    const activityPositions = [16, 17, 18, 19, 20, 21]; // Posições dos campos 17-22
    const fieldNumbers = [17, 18, 19, 20, 21, 22]; // Números dos campos

    for (let i = 0; i < activityPositions.length; i++) {
      const position = activityPositions[i];
      const fieldNumber = fieldNumbers[i];
      const activityCode = parts[position];

      // Se o código foi preenchido, valida contra o banco
      if (activityCode && activityCode.trim() !== '') {
        const isValid =
          await this.complementaryActivityService.isValidActivity(activityCode);

        if (!isValid) {
          errors.push(
            this.createError(
              lineNumber,
              `codigo_atividade_${i + 1}_invalido`,
              `Código ${i + 1} - Atividade complementar`,
              fieldNumber,
              activityCode,
              'invalid_activity_code',
              `O código "${activityCode}" não está na Tabela de Tipo de Atividade Complementar do INEP`,
              ValidationSeverity.ERROR,
            ),
          );
        }
      }
    }

    return errors;
  }

  /**
   * Validates step (etapa) codes against the database
   */
  async validateSteps(
    parts: string[],
    lineNumber: number,
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];
    const curricular = parts[13] || ''; // Campo 14 (posição 13)
    const etapaAgregada = parts[24] || ''; // Campo 25 (posição 24)
    const etapa = parts[25] || ''; // Campo 26 (posição 25)
    const formacaoGeralBasica = parts[33] || ''; // Campo 34 (posição 33)

    // Regra 1: Etapa agregada deve ser preenchida quando curricular = 1
    if (curricular === '1' && !etapaAgregada) {
      errors.push(
        this.createError(
          lineNumber,
          'etapa_agregada_required',
          'Etapa agregada',
          25,
          etapaAgregada,
          'aggregated_step_required_when_curricular',
          'O campo "Etapa agregada" deve ser preenchido quando o campo "Curricular (etapa de ensino)" for 1 (Sim)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 2: Etapa agregada não pode ser preenchida quando curricular ≠ 1
    if (curricular !== '1' && etapaAgregada && etapaAgregada.trim() !== '') {
      errors.push(
        this.createError(
          lineNumber,
          'etapa_agregada_not_allowed',
          'Etapa agregada',
          25,
          etapaAgregada,
          'aggregated_step_not_allowed_when_not_curricular',
          'O campo "Etapa agregada" não pode ser preenchido quando o campo "Curricular (etapa de ensino)" não for 1 (Sim)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 3: Quando preenchida, etapa agregada deve existir na tabela
    if (etapaAgregada && etapaAgregada.trim() !== '') {
      const isValid =
        await this.stepService.isValidAggregatedStep(etapaAgregada);
      if (!isValid) {
        errors.push(
          this.createError(
            lineNumber,
            'etapa_agregada_invalida',
            'Etapa agregada',
            25,
            etapaAgregada,
            'invalid_aggregated_step_code',
            `O código "${etapaAgregada}" não está na Tabela de Etapas do INEP`,
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Regra 4: Etapa não pode ser preenchida quando curricular ≠ 1
    if (curricular !== '1' && etapa && etapa.trim() !== '') {
      errors.push(
        this.createError(
          lineNumber,
          'etapa_not_allowed_curricular',
          'Etapa',
          26,
          etapa,
          'step_not_allowed_when_not_curricular',
          'O campo "Etapa" não pode ser preenchido quando o campo "Curricular (etapa de ensino)" não for 1 (Sim)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 5: Etapa deve ser preenchida em certos casos
    const etapasQueExigemEtapa = ['301', '302', '303', '306', '308'];
    if (
      etapasQueExigemEtapa.includes(etapaAgregada) &&
      (!etapa || etapa.trim() === '')
    ) {
      errors.push(
        this.createError(
          lineNumber,
          'etapa_required_for_aggregated',
          'Etapa',
          26,
          etapa,
          'step_required_for_aggregated_step',
          `O campo "Etapa" deve ser preenchido quando o campo "Etapa agregada" for ${etapaAgregada}`,
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 6: Etapa deve ser preenchida quando formação geral básica = 1
    if (formacaoGeralBasica === '1' && (!etapa || etapa.trim() === '')) {
      errors.push(
        this.createError(
          lineNumber,
          'etapa_required_formacao_geral',
          'Etapa',
          26,
          etapa,
          'step_required_when_formacao_geral',
          'O campo "Etapa" deve ser preenchido quando o campo "Formação geral básica" for 1 (Sim)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 7: Quando preenchida, etapa deve existir na tabela
    if (etapa && etapa.trim() !== '') {
      const isValid = await this.stepService.isValidStep(etapa);
      if (!isValid) {
        errors.push(
          this.createError(
            lineNumber,
            'etapa_invalida',
            'Etapa',
            26,
            etapa,
            'invalid_step_code',
            `O código "${etapa}" não está na Tabela de Etapas do INEP`,
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Regra 8: Validar compatibilidade entre etapa e etapa agregada
    if (
      etapa &&
      etapa.trim() !== '' &&
      etapaAgregada &&
      etapaAgregada.trim() !== ''
    ) {
      const isCompatible =
        await this.stepService.isStepCompatibleWithAggregated(
          etapa,
          etapaAgregada,
        );

      if (!isCompatible) {
        // Validações específicas por etapa agregada
        const expectedSteps: Record<string, string[]> = {
          '301': ['1', '2', '3'], // Educação Infantil
          '302': ['14', '15', '16', '17', '18', '19', '20', '21', '41'], // Ensino Fundamental
          '303': ['22', '23', '56'], // Multi e correção de fluxo
          '304': ['25', '26', '27', '28', '29'], // Ensino Médio (com formação geral)
          '305': ['35', '36', '37', '38'], // Ensino Médio - Normal/Magistério
          '306': ['69', '70', '72', '71', '74', '73', '67'], // EJA
          '308': ['39', '40', '64', '68'], // Educação Profissional
        };

        const expected = expectedSteps[etapaAgregada];
        if (expected) {
          errors.push(
            this.createError(
              lineNumber,
              'etapa_incompativel_agregada',
              'Etapa',
              26,
              etapa,
              'step_incompatible_with_aggregated',
              `A etapa "${etapa}" não é compatível com a etapa agregada "${etapaAgregada}". Etapas esperadas: ${expected.join(', ')}`,
              ValidationSeverity.ERROR,
            ),
          );
        }
      }
    }

    return errors;
  }

  /**
   * Validates business rules for Classes (registro 20)
   */
  protected validateBusinessRules(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Regra 1: Pelo menos um dos campos de 7 a 13 deve ser preenchido quando o campo 6 for 1 (Presencial)
    const tipoMediacao = parts[5] || ''; // Campo 6 (posição 5)
    if (tipoMediacao === '1') {
      const scheduleFields = [6, 7, 8, 9, 10, 11, 12]; // Posições dos campos 7-13

      const hasSchedule = scheduleFields.some((position) => {
        const value = parts[position];
        return value && value.trim() !== '';
      });

      if (!hasSchedule) {
        errors.push(
          this.createError(
            lineNumber,
            'horarios_validation',
            'Horários de funcionamento',
            6, // Campo 6 que causa a regra
            tipoMediacao,
            'schedule_required_for_presencial',
            'Para tipo de mediação presencial, pelo menos um horário de funcionamento deve ser preenchido',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Regra 2: Pelo menos um dos campos de 14 a 16 deve ser preenchido com 1 (Sim)
    const typePositions = [13, 14, 15]; // Posições dos campos 14-16
    const hasValidType = typePositions.some(
      (position) => parts[position] === '1',
    );

    if (!hasValidType) {
      errors.push(
        this.createError(
          lineNumber,
          'tipo_turma_validation',
          'Tipo de turma',
          14,
          `${parts[13]}|${parts[14]}|${parts[15]}`,
          'type_required',
          '"Tipo de turma" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 3: Se Atividade complementar = 1, pelo menos um dos campos 17-22 deve ser preenchido
    const atividadeComplementar = parts[14] || ''; // Campo 15 (posição 14)
    if (atividadeComplementar === '1') {
      const activityPositions = [16, 17, 18, 19, 20, 21]; // Posições dos campos 17-22

      const hasActivity = activityPositions.some((position) => {
        const value = parts[position];
        return value && value.trim() !== '';
      });

      if (!hasActivity) {
        errors.push(
          this.createError(
            lineNumber,
            'atividade_complementar_validation',
            'Atividade complementar',
            15,
            atividadeComplementar,
            'activity_type_required',
            'O campo "Atividade complementar" foi preenchido com 1 (Sim), porém a turma não informou o tipo de atividade complementar',
            ValidationSeverity.ERROR,
          ),
        );
      }

      // Regra 4: Não pode haver dois códigos de atividade iguais
      const filledActivities = activityPositions
        .map((position) => parts[position])
        .filter((value) => value && value.trim() !== '');

      const uniqueActivities = new Set(filledActivities);

      if (filledActivities.length !== uniqueActivities.size) {
        errors.push(
          this.createError(
            lineNumber,
            'atividade_duplicada_validation',
            'Tipo de atividade complementar',
            17,
            filledActivities.join('|'),
            'activity_duplicate',
            '"Tipo de atividade complementar" não foi preenchido corretamente. Não pode haver dois códigos do tipo de atividade iguais',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Regra 5: Não podem todos os campos de 28 a 32 serem preenchidos com 0 (Não)
    const organizationPositions = [27, 28, 29, 30, 31]; // Posições dos campos 28-32
    const organizationValues = organizationPositions.map(
      (pos) => parts[pos] || '',
    );
    const organizationFilled = organizationValues.filter(
      (value) => value !== '',
    );
    const allOrganizationZero =
      organizationFilled.length > 0 &&
      organizationFilled.every((value) => value === '0');

    if (allOrganizationZero) {
      errors.push(
        this.createError(
          lineNumber,
          'organizacao_turma_validation',
          'Formas de organização da turma',
          28,
          organizationPositions.map((pos) => parts[pos] || '').join('|'),
          'organization_required',
          '"Formas de organização da turma" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 6: Não podem 2 ou mais dos campos de 28 a 32 serem preenchidos com 1 (Sim)
    const organizationOnes = organizationPositions.filter(
      (position) => parts[position] === '1',
    );

    if (organizationOnes.length >= 2) {
      errors.push(
        this.createError(
          lineNumber,
          'organizacao_exclusiva_validation',
          'Formas de organização da turma',
          28,
          organizationPositions.map((pos) => parts[pos] || '').join('|'),
          'organization_exclusive',
          '"Formas de organização da turma" não foi preenchido corretamente',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 7: Não podem todos os campos de 34 a 36 serem preenchidos com 0 (Não)
    const curricularPositions = [33, 34, 35]; // Posições dos campos 34-36
    const curricularValues = curricularPositions.map((pos) => parts[pos] || '');
    const curricularFilled = curricularValues.filter((value) => value !== '');
    const allCurricularZero =
      curricularFilled.length > 0 &&
      curricularFilled.every((value) => value === '0');

    if (allCurricularZero) {
      errors.push(
        this.createError(
          lineNumber,
          'organizacao_curricular_validation',
          'Organização curricular da turma',
          34,
          curricularPositions.map((pos) => parts[pos] || '').join('|'),
          'curricular_required',
          '"Organização curricular da turma" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não)',
          ValidationSeverity.ERROR,
        ),
      );
    }

    // Regra 8: Se itinerário de aprofundamento = 1, não podem todos os campos 37-40 serem 0
    const itinerarioAprofundamento = parts[34] || ''; // Campo 35 (posição 34)
    if (itinerarioAprofundamento === '1') {
      const itineraryPositions = [36, 37, 38, 39]; // Posições dos campos 37-40
      const itineraryValues = itineraryPositions.map((pos) => parts[pos] || '');
      const itineraryFilled = itineraryValues.filter((value) => value !== '');
      const allItineraryZero =
        itineraryFilled.length > 0 &&
        itineraryFilled.every((value) => value === '0');

      if (allItineraryZero) {
        errors.push(
          this.createError(
            lineNumber,
            'itinerario_areas_validation',
            'Área(s) do itinerário formativo',
            37,
            itineraryPositions.map((pos) => parts[pos] || '').join('|'),
            'itinerary_required',
            '"Área(s) do itinerário formativo" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não)',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    // Regra 9: Campos 43-69 não podem ser preenchidos quando etapa = 1, 2 ou 3
    const etapa = parts[25] || ''; // Campo 26 (posição 25)
    const componentPositions = [
      42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
      60, 61, 62, 63, 64, 65, 66, 67, 68,
    ]; // Posições dos campos 43-69

    // Verifica se etapa é educação infantil (1, 2 ou 3)
    if (etapa === '1' || etapa === '2' || etapa === '3') {
      const filledComponents = componentPositions.filter((position) => {
        const value = parts[position];
        return value && value.trim() !== '' && value.trim() !== '0';
      });

      if (filledComponents.length > 0) {
        errors.push(
          this.createError(
            lineNumber,
            'componentes_nao_permitidos_educacao_infantil',
            'Áreas do conhecimento/componentes curriculares',
            43,
            etapa,
            'components_not_allowed_early_childhood',
            `Os campos de "Áreas do conhecimento/componentes curriculares" (campos 43-69) não podem ser preenchidos para etapa ${etapa} (Educação Infantil)`,
            ValidationSeverity.ERROR,
          ),
        );
      }
    } else {
      // Regra 10: Não podem todos os campos de 43 a 69 serem preenchidos com 0 (Não)
      const componentValues = componentPositions.map((pos) => parts[pos] || '');
      const componentsFilled = componentValues.filter((value) => value !== '');
      const allComponentsZero =
        componentsFilled.length > 0 &&
        componentsFilled.every((value) => value === '0');

      if (allComponentsZero) {
        errors.push(
          this.createError(
            lineNumber,
            'componentes_curriculares_validation',
            'Áreas do conhecimento/componentes curriculares',
            43,
            'all_zero',
            'components_required',
            '"Áreas do conhecimento/componentes curriculares" não foram preenchidas corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não)',
            ValidationSeverity.ERROR,
          ),
        );
      }
    }

    return errors;
  }

  /**
   * Validates the record asynchronously (includes database validations)
   */
  async validateAsync(
    parts: string[],
    lineNumber: number,
  ): Promise<ValidationError[]> {
    // First, run all synchronous validations
    const syncErrors = this.validate(parts, lineNumber);

    // Then, run async complementary activity validations
    const activityErrors = await this.validateComplementaryActivities(
      parts,
      lineNumber,
    );

    // Then, run async step validations
    const stepErrors = await this.validateSteps(parts, lineNumber);

    return [...syncErrors, ...activityErrors, ...stepErrors];
  }

  /**
   * Override validate method to include business rules
   */
  // Note: BusinessRules validation is already handled by super.validate()
  // No need to override validate() method since BaseRecordRule already calls validateBusinessRules()
}
