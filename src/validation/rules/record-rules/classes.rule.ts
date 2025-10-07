import { Injectable } from '@nestjs/common';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import { RecordTypeEnum } from '../../../common/enums/record-types.enum';
import { ValidationError } from '../../../common/interfaces/validation.interface';

@Injectable()
export class ClassesRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.CLASSES;

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
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'horarios_validation',
          fieldPosition: 6, // Campo 6 que causa a regra
          fieldValue: tipoMediacao,
          ruleName: 'schedule_required_for_presencial',
          errorMessage:
            'Para tipo de mediação presencial, pelo menos um horário de funcionamento deve ser preenchido',
          severity: 'error',
        });
      }
    }

    // Regra 2: Pelo menos um dos campos de 14 a 16 deve ser preenchido com 1 (Sim)
    const typePositions = [13, 14, 15]; // Posições dos campos 14-16
    const hasValidType = typePositions.some(
      (position) => parts[position] === '1',
    );

    if (!hasValidType) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'tipo_turma_validation',
        fieldPosition: 14,
        fieldValue: `${parts[13]}|${parts[14]}|${parts[15]}`,
        ruleName: 'type_required',
        errorMessage:
          '"Tipo de turma" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não)',
        severity: 'error',
      });
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
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'atividade_complementar_validation',
          fieldPosition: 15,
          fieldValue: atividadeComplementar,
          ruleName: 'activity_type_required',
          errorMessage:
            'O campo "Atividade complementar" foi preenchido com 1 (Sim), porém a turma não informou o tipo de atividade complementar',
          severity: 'error',
        });
      }

      // Regra 4: Não pode haver dois códigos de atividade iguais
      const filledActivities = activityPositions
        .map((position) => parts[position])
        .filter((value) => value && value.trim() !== '');

      const uniqueActivities = new Set(filledActivities);

      if (filledActivities.length !== uniqueActivities.size) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'atividade_duplicada_validation',
          fieldPosition: 17,
          fieldValue: filledActivities.join('|'),
          ruleName: 'activity_duplicate',
          errorMessage:
            '"Tipo de atividade complementar" não foi preenchido corretamente. Não pode haver dois códigos do tipo de atividade iguais',
          severity: 'error',
        });
      }
    }

    // Regra 5: Não podem todos os campos de 28 a 32 serem preenchidos com 0 (Não)
    const organizationPositions = [27, 28, 29, 30, 31]; // Posições dos campos 28-32
    const allOrganizationZero = organizationPositions.every((position) => {
      const value = parts[position];
      return value === '0' || !value;
    });

    if (allOrganizationZero) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'organizacao_turma_validation',
        fieldPosition: 28,
        fieldValue: organizationPositions
          .map((pos) => parts[pos] || '')
          .join('|'),
        ruleName: 'organization_required',
        errorMessage:
          '"Formas de organização da turma" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não)',
        severity: 'error',
      });
    }

    // Regra 6: Não podem 2 ou mais dos campos de 28 a 32 serem preenchidos com 1 (Sim)
    const organizationOnes = organizationPositions.filter(
      (position) => parts[position] === '1',
    );

    if (organizationOnes.length >= 2) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'organizacao_exclusiva_validation',
        fieldPosition: 28,
        fieldValue: organizationPositions
          .map((pos) => parts[pos] || '')
          .join('|'),
        ruleName: 'organization_exclusive',
        errorMessage:
          '"Formas de organização da turma" não foi preenchido corretamente',
        severity: 'error',
      });
    }

    // Regra 7: Não podem todos os campos de 34 a 36 serem preenchidos com 0 (Não)
    const curricularPositions = [33, 34, 35]; // Posições dos campos 34-36
    const allCurricularZero = curricularPositions.every((position) => {
      const value = parts[position];
      return value === '0' || !value;
    });

    if (allCurricularZero) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'organizacao_curricular_validation',
        fieldPosition: 34,
        fieldValue: curricularPositions
          .map((pos) => parts[pos] || '')
          .join('|'),
        ruleName: 'curricular_required',
        errorMessage:
          '"Organização curricular da turma" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não)',
        severity: 'error',
      });
    }

    // Regra 8: Se itinerário de aprofundamento = 1, não podem todos os campos 37-40 serem 0
    const itinerarioAprofundamento = parts[34] || ''; // Campo 35 (posição 34)
    if (itinerarioAprofundamento === '1') {
      const itineraryPositions = [36, 37, 38, 39]; // Posições dos campos 37-40

      const allItineraryZero = itineraryPositions.every((position) => {
        const value = parts[position];
        return value === '0' || !value;
      });

      if (allItineraryZero) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'itinerario_areas_validation',
          fieldPosition: 37,
          fieldValue: itineraryPositions
            .map((pos) => parts[pos] || '')
            .join('|'),
          ruleName: 'itinerary_required',
          errorMessage:
            '"Área(s) do itinerário formativo" não foi preenchido corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não)',
          severity: 'error',
        });
      }
    }

    // Regra 9: Não podem todos os campos de 43 a 69 serem preenchidos com 0 (Não)
    const componentPositions = [
      42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
      60, 61, 62, 63, 64, 65, 66, 67, 68,
    ]; // Posições dos campos 43-69

    const allComponentsZero = componentPositions.every((position) => {
      const value = parts[position];
      return value === '0' || !value;
    });

    if (allComponentsZero) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'componentes_curriculares_validation',
        fieldPosition: 43,
        fieldValue: 'all_zero',
        ruleName: 'components_required',
        errorMessage:
          '"Áreas do conhecimento/componentes curriculares" não foram preenchidas corretamente. Não podem ser informadas todas as opções com valor igual a 0 (Não)',
        severity: 'error',
      });
    }

    return errors;
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
