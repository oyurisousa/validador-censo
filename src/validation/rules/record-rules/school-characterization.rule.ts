import { Injectable } from '@nestjs/common';
import { RecordTypeEnum } from '../../../common/enums/record-types.enum';
import { BaseRecordRule, FieldRule } from '../base-record.rule';
import { ValidationError } from '../../../common/interfaces/validation.interface';

@Injectable()
export class SchoolCharacterizationRule extends BaseRecordRule {
  protected readonly recordType = RecordTypeEnum.SCHOOL_CHARACTERIZATION;

  protected readonly fields: FieldRule[] = [
    // Campo 1: Tipo de registro
    {
      position: 0,
      name: 'tipo_registro',
      required: true,
      minLength: 2,
      maxLength: 2,
      pattern: /^10$/,
      type: 'code',
      description: 'Tipo de registro (sempre 10)',
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
    // Campo 3: Prédio escolar
    {
      position: 2,
      name: 'predio_escolar',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Prédio escolar (0-Não, 1-Sim)',
    },
    // Campo 4: Sala(s) em outra escola
    {
      position: 3,
      name: 'salas_outra_escola',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sala(s) em outra escola (0-Não, 1-Sim)',
    },
    // Campo 5: Galpão/rancho/paiol/barracão
    {
      position: 4,
      name: 'galpao_rancho_paiol',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Galpão/rancho/paiol/barracão (0-Não, 1-Sim)',
    },
    // Campo 6: Unidade de atendimento Socioeducativa
    {
      position: 5,
      name: 'unidade_socioeducativa',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Unidade de atendimento Socioeducativa (0-Não, 1-Sim)',
    },
    // Campo 7: Unidade Prisional
    {
      position: 6,
      name: 'unidade_prisional',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Unidade Prisional (0-Não, 1-Sim)',
    },
    // Campo 8: Outros
    {
      position: 7,
      name: 'outros_locais',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Outros (0-Não, 1-Sim)',
    },
    // Campo 9: Forma de ocupação do prédio
    {
      position: 8,
      name: 'forma_ocupacao_predio',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[123]$/,
      type: 'code',
      description:
        'Forma de ocupação do prédio (1-Próprio, 2-Alugado, 3-Cedido)',
      conditionalRequired: { field: 'predio_escolar', values: ['1'] },
    },
    // Campo 10: Prédio escolar compartilhado com outra escola
    {
      position: 9,
      name: 'predio_compartilhado',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Prédio escolar compartilhado com outra escola (0-Não, 1-Sim)',
      conditionalRequired: { field: 'predio_escolar', values: ['1'] },
    },
    // Campo 11: Código da escola com a qual compartilha (1)
    {
      position: 10,
      name: 'codigo_escola_compartilha_1',
      required: false,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'Código da escola com a qual compartilha (1) (8 dígitos)',
      conditionalRequired: { field: 'predio_compartilhado', values: ['1'] },
    },
    // Campo 12: Código da escola com a qual compartilha (2)
    {
      position: 11,
      name: 'codigo_escola_compartilha_2',
      required: false,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'Código da escola com a qual compartilha (2) (8 dígitos)',
    },
    // Campo 13: Código da escola com a qual compartilha (3)
    {
      position: 12,
      name: 'codigo_escola_compartilha_3',
      required: false,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'Código da escola com a qual compartilha (3) (8 dígitos)',
    },
    // Campo 14: Código da escola com a qual compartilha (4)
    {
      position: 13,
      name: 'codigo_escola_compartilha_4',
      required: false,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'Código da escola com a qual compartilha (4) (8 dígitos)',
    },
    // Campo 15: Código da escola com a qual compartilha (5)
    {
      position: 14,
      name: 'codigo_escola_compartilha_5',
      required: false,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'Código da escola com a qual compartilha (5) (8 dígitos)',
    },
    // Campo 16: Código da escola com a qual compartilha (6)
    {
      position: 15,
      name: 'codigo_escola_compartilha_6',
      required: false,
      minLength: 8,
      maxLength: 8,
      pattern: /^\d{8}$/,
      type: 'code',
      description: 'Código da escola com a qual compartilha (6) (8 dígitos)',
    },
    // Campo 17: Fornece água potável para o consumo humano
    {
      position: 16,
      name: 'fornece_agua_potavel',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Fornece água potável para o consumo humano (0-Não, 1-Sim)',
    },
    // Campo 18: Abastecimento de água - Rede pública
    {
      position: 17,
      name: 'abastecimento_rede_publica',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Abastecimento de água - Rede pública (0-Não, 1-Sim)',
    },
    // Campo 19: Poço artesiano
    {
      position: 18,
      name: 'poco_artesiano',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Poço artesiano (0-Não, 1-Sim)',
    },
    // Campo 20: Cacimba/cisterna/poço
    {
      position: 19,
      name: 'cacimba_cisterna_poco',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Cacimba/cisterna/poço (0-Não, 1-Sim)',
    },
    // Campo 21: Fonte/rio/igarapé/riacho/córrego
    {
      position: 20,
      name: 'fonte_rio_igarape',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Fonte/rio/igarapé/riacho/córrego (0-Não, 1-Sim)',
    },
    // Campo 22: Carro-pipa
    {
      position: 21,
      name: 'carro_pipa',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Carro-pipa (0-Não, 1-Sim)',
    },
    // Campo 23: Não há abastecimento de água
    {
      position: 22,
      name: 'nao_ha_abastecimento_agua',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Não há abastecimento de água (0-Não, 1-Sim)',
    },
    // Campo 24: Fonte de energia elétrica - Rede pública
    {
      position: 23,
      name: 'energia_rede_publica',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Fonte de energia elétrica - Rede pública (0-Não, 1-Sim)',
    },
    // Campo 25: Gerador movido a combustível fóssil
    {
      position: 24,
      name: 'gerador_combustivel_fossil',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Gerador movido a combustível fóssil (0-Não, 1-Sim)',
    },
    // Campo 26: Fontes de energia renováveis ou alternativas
    {
      position: 25,
      name: 'fontes_energia_renovaveis',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Fontes de energia renováveis ou alternativas (0-Não, 1-Sim)',
    },
    // Campo 27: Não há energia elétrica
    {
      position: 26,
      name: 'nao_ha_energia_eletrica',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Não há energia elétrica (0-Não, 1-Sim)',
    },
    // Campo 28: Esgotamento sanitário - Rede pública
    {
      position: 27,
      name: 'esgoto_rede_publica',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Esgotamento sanitário - Rede pública (0-Não, 1-Sim)',
    },
    // Campo 29: Fossa séptica
    {
      position: 28,
      name: 'fossa_septica',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Fossa séptica (0-Não, 1-Sim)',
    },
    // Campo 30: Fossa rudimentar/comum
    {
      position: 29,
      name: 'fossa_rudimentar',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Fossa rudimentar/comum (0-Não, 1-Sim)',
    },
    // Campo 31: Não há esgotamento sanitário
    {
      position: 30,
      name: 'nao_ha_esgotamento',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Não há esgotamento sanitário (0-Não, 1-Sim)',
    },
    // Campo 32: Destinação do lixo - Serviço de coleta
    {
      position: 31,
      name: 'lixo_servico_coleta',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Destinação do lixo - Serviço de coleta (0-Não, 1-Sim)',
    },
    // Campo 33: Queima
    {
      position: 32,
      name: 'lixo_queima',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Queima (0-Não, 1-Sim)',
    },
    // Campo 34: Enterra
    {
      position: 33,
      name: 'lixo_enterra',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Enterra (0-Não, 1-Sim)',
    },
    // Campo 35: Leva a uma destinação final licenciada pelo poder público
    {
      position: 34,
      name: 'lixo_destinacao_licenciada',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Leva a uma destinação final licenciada pelo poder público (0-Não, 1-Sim)',
    },
    // Campo 36: Descarta em outra área
    {
      position: 35,
      name: 'lixo_descarta_outra_area',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Descarta em outra área (0-Não, 1-Sim)',
    },
    // Campo 37: Tratamento do lixo - Separação do lixo/resíduos
    {
      position: 36,
      name: 'tratamento_separacao_lixo',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Separação do lixo/resíduos (0-Não, 1-Sim)',
    },
    // Campo 38: Reaproveitamento/reutilização
    {
      position: 37,
      name: 'tratamento_reaproveitamento',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Reaproveitamento/reutilização (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'tratamento_separacao_lixo',
        values: ['1', '0'],
      },
    },
    // Campo 39: Reciclagem
    {
      position: 38,
      name: 'tratamento_reciclagem',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Reciclagem (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'tratamento_separacao_lixo',
        values: ['1', '0'],
      },
    },
    // Campo 40: Não faz tratamento
    {
      position: 39,
      name: 'nao_faz_tratamento',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Não faz tratamento (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'tratamento_separacao_lixo',
        values: ['1', '0'],
      },
    },
    // Campo 41: Dependências físicas - Almoxarifado
    {
      position: 40,
      name: 'almoxarifado',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Almoxarifado (0-Não, 1-Sim)',
    },
    // Campo 42: Área de vegetação ou gramado
    {
      position: 41,
      name: 'area_vegetacao_gramado',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Área de vegetação ou gramado (0-Não, 1-Sim)',
    },
    // Campo 43: Auditório
    {
      position: 42,
      name: 'auditorio',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Auditório (0-Não, 1-Sim)',
    },
    // Campo 44: Banheiro
    {
      position: 43,
      name: 'banheiro',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Banheiro (0-Não, 1-Sim)',
    },
    // Campo 45: Banheiro acessível adequado ao uso de pessoas com deficiência
    {
      position: 44,
      name: 'banheiro_acessivel',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Banheiro acessível adequado ao uso de pessoas com deficiência (0-Não, 1-Sim)',
    },
    // Campo 46: Banheiro adequado à educação infantil
    {
      position: 45,
      name: 'banheiro_educacao_infantil',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Banheiro adequado à educação infantil (0-Não, 1-Sim)',
    },
    // Campo 47: Banheiro exclusivo para os funcionários
    {
      position: 46,
      name: 'banheiro_funcionarios',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Banheiro exclusivo para os funcionários (0-Não, 1-Sim)',
    },
    // Campo 48: Banheiro ou vestiário com chuveiro
    {
      position: 47,
      name: 'banheiro_vestiario_chuveiro',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Banheiro ou vestiário com chuveiro (0-Não, 1-Sim)',
    },
    // Campo 49: Biblioteca
    {
      position: 48,
      name: 'biblioteca',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Biblioteca (0-Não, 1-Sim)',
    },
    // Campo 50: Cozinha
    {
      position: 49,
      name: 'cozinha',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Cozinha (0-Não, 1-Sim)',
    },
    // Campo 51: Despensa
    {
      position: 50,
      name: 'despensa',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Despensa (0-Não, 1-Sim)',
    },
    // Campo 52: Dormitório de aluno(a)
    {
      position: 51,
      name: 'dormitorio_aluno',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Dormitório de aluno(a) (0-Não, 1-Sim)',
    },
    // Campo 53: Dormitório de professor(a)
    {
      position: 52,
      name: 'dormitorio_professor',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Dormitório de professor(a) (0-Não, 1-Sim)',
    },
    // Campo 54: Laboratório de ciências
    {
      position: 53,
      name: 'laboratorio_ciencias',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Laboratório de ciências (0-Não, 1-Sim)',
    },
    // Campo 55: Laboratório de informática
    {
      position: 54,
      name: 'laboratorio_informatica',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Laboratório de informática (0-Não, 1-Sim)',
    },
    // Campo 56: Laboratório específico para a educação profissional
    {
      position: 55,
      name: 'laboratorio_educacao_profissional',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Laboratório específico para a educação profissional (0-Não, 1-Sim)',
    },
    // Campo 57: Parque infantil
    {
      position: 56,
      name: 'parque_infantil',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Parque infantil (0-Não, 1-Sim)',
    },
    // Campo 58: Pátio coberto
    {
      position: 57,
      name: 'patio_coberto',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Pátio coberto (0-Não, 1-Sim)',
    },
    // Campo 59: Pátio descoberto
    {
      position: 58,
      name: 'patio_descoberto',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Pátio descoberto (0-Não, 1-Sim)',
    },
    // Campo 60: Piscina
    {
      position: 59,
      name: 'piscina',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Piscina (0-Não, 1-Sim)',
    },
    // Campo 61: Quadra de esportes coberta
    {
      position: 60,
      name: 'quadra_esportes_coberta',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Quadra de esportes coberta (0-Não, 1-Sim)',
    },
    // Campo 62: Quadra de esportes descoberta
    {
      position: 61,
      name: 'quadra_esportes_descoberta',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Quadra de esportes descoberta (0-Não, 1-Sim)',
    },
    // Campo 63: Refeitório
    {
      position: 62,
      name: 'refeitorio',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Refeitório (0-Não, 1-Sim)',
    },
    // Campo 64: Sala de repouso para aluno(a)
    {
      position: 63,
      name: 'sala_repouso_aluno',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sala de repouso para aluno(a) (0-Não, 1-Sim)',
    },
    // Campo 65: Sala/ateliê de artes
    {
      position: 64,
      name: 'sala_atelie_artes',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sala/ateliê de artes (0-Não, 1-Sim)',
    },
    // Campo 66: Sala de música/coral
    {
      position: 65,
      name: 'sala_musica_coral',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sala de música/coral (0-Não, 1-Sim)',
    },
    // Campo 67: Sala/estúdio de dança
    {
      position: 66,
      name: 'sala_estudio_danca',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sala/estúdio de dança (0-Não, 1-Sim)',
    },
    // Campo 68: Sala multiuso (música, dança e artes)
    {
      position: 67,
      name: 'sala_multiuso',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sala multiuso (música, dança e artes) (0-Não, 1-Sim)',
    },
    // Campo 69: Terreirão
    {
      position: 68,
      name: 'terreirao',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Terreirão (área para prática desportiva e recreação sem cobertura, sem piso e sem edificações) (0-Não, 1-Sim)',
    },
    // Campo 70: Viveiro/criação de animais
    {
      position: 69,
      name: 'viveiro_criacao_animais',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Viveiro/criação de animais (0-Não, 1-Sim)',
    },
    // Campo 71: Sala de diretoria
    {
      position: 70,
      name: 'sala_diretoria',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sala de diretoria (0-Não, 1-Sim)',
    },
    // Campo 72: Sala de leitura
    {
      position: 71,
      name: 'sala_leitura',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sala de leitura (0-Não, 1-Sim)',
    },
    // Campo 73: Sala de professores
    {
      position: 72,
      name: 'sala_professores',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sala de professores (0-Não, 1-Sim)',
    },
    // Campo 74: Sala de recursos multifuncionais para atendimento educacional especializado (AEE)
    {
      position: 73,
      name: 'sala_recursos_multifuncionais_aee',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Sala de recursos multifuncionais para atendimento educacional especializado (AEE) (0-Não, 1-Sim)',
    },
    // Campo 75: Sala de secretaria
    {
      position: 74,
      name: 'sala_secretaria',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sala de secretaria (0-Não, 1-Sim)',
    },
    // Campo 76: Salas de oficinas da educação profissional
    {
      position: 75,
      name: 'salas_oficinas_educacao_profissional',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Salas de oficinas da educação profissional (0-Não, 1-Sim)',
    },
    // Campo 77: Estúdio de gravação e edição
    {
      position: 76,
      name: 'estudio_gravacao_edicao',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Estúdio de gravação e edição (0-Não, 1-Sim)',
    },
    // Campo 78: Área de horta, plantio e/ou produção agrícola
    {
      position: 77,
      name: 'area_horta_plantio_producao',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Área de horta, plantio e/ou produção agrícola (0-Não, 1-Sim)',
    },
    // Campo 79: Nenhuma das dependências relacionadas
    {
      position: 78,
      name: 'nenhuma_dependencia',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Nenhuma das dependências relacionadas (0-Não, 1-Sim)',
    },
    // Campo 80: Recursos de acessibilidade - Corrimão e guarda-corpos
    {
      position: 79,
      name: 'acessibilidade_corrimao_guarda_corpos',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Corrimão e guarda-corpos (0-Não, 1-Sim)',
    },
    // Campo 81: Elevador
    {
      position: 80,
      name: 'acessibilidade_elevador',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Elevador (0-Não, 1-Sim)',
    },
    // Campo 82: Pisos táteis
    {
      position: 81,
      name: 'acessibilidade_pisos_tateis',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Pisos táteis (0-Não, 1-Sim)',
    },
    // Campo 83: Portas com vão livre de no mínimo 80 cm
    {
      position: 82,
      name: 'acessibilidade_portas_vao_livre',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Portas com vão livre de no mínimo 80 cm (0-Não, 1-Sim)',
    },
    // Campo 84: Rampas
    {
      position: 83,
      name: 'acessibilidade_rampas',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Rampas (0-Não, 1-Sim)',
    },
    // Campo 85: Sinalização/alarme luminoso
    {
      position: 84,
      name: 'acessibilidade_sinalizacao_luminosa',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sinalização/alarme luminoso (0-Não, 1-Sim)',
    },
    // Campo 86: Sinalização sonora
    {
      position: 85,
      name: 'acessibilidade_sinalizacao_sonora',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sinalização sonora (0-Não, 1-Sim)',
    },
    // Campo 87: Sinalização tátil
    {
      position: 86,
      name: 'acessibilidade_sinalizacao_tatil',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sinalização tátil (0-Não, 1-Sim)',
    },
    // Campo 88: Sinalização visual (piso/paredes)
    {
      position: 87,
      name: 'acessibilidade_sinalizacao_visual',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Sinalização visual (piso/paredes) (0-Não, 1-Sim)',
    },
    // Campo 89: Nenhum dos recursos de acessibilidade listados
    {
      position: 88,
      name: 'nenhum_recurso_acessibilidade',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Nenhum dos recursos de acessibilidade listados (0-Não, 1-Sim)',
    },
    // Campo 90: Quantidade de salas de aula utilizadas pela escola dentro do prédio escolar
    {
      position: 89,
      name: 'qtd_salas_dentro_predio',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Quantidade de salas de aula utilizadas pela escola dentro do prédio escolar',
      conditionalRequired: { field: 'predio_escolar', values: ['1'] },
    },
    // Campo 91: Quantidade de salas de aula utilizadas pela escola fora do prédio escolar
    {
      position: 90,
      name: 'qtd_salas_fora_predio',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Quantidade de salas de aula utilizadas pela escola fora do prédio escolar',
    },
    // Campo 92: Quantidade de salas de aula climatizadas
    {
      position: 91,
      name: 'qtd_salas_climatizadas',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Quantidade de salas de aula climatizadas (com ar-condicionado, aquecedor ou climatizador)',
    },
    // Campo 93: Quantidade de salas de aula com acessibilidade
    {
      position: 92,
      name: 'qtd_salas_acessibilidade',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Quantidade de salas de aula com acessibilidade para pessoas com deficiência ou mobilidade reduzida',
    },
    // Campo 94: Quantidade de salas de aula com Cantinho da Leitura
    {
      position: 93,
      name: 'qtd_salas_cantinho_leitura',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Quantidade de salas de aula com Cantinho da Leitura para a Educação Infantil e o Ensino fundamental (Anos iniciais)',
    },
    // Campo 95: Equipamentos - Antena parabólica
    {
      position: 94,
      name: 'equipamento_antena_parabolica',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Antena parabólica (0-Não, 1-Sim)',
    },
    // Campo 96: Computadores
    {
      position: 95,
      name: 'equipamento_computadores',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Computadores (0-Não, 1-Sim)',
    },
    // Campo 97: Copiadora
    {
      position: 96,
      name: 'equipamento_copiadora',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Copiadora (0-Não, 1-Sim)',
    },
    // Campo 98: Impressora
    {
      position: 97,
      name: 'equipamento_impressora',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Impressora (0-Não, 1-Sim)',
    },
    // Campo 99: Impressora Multifuncional
    {
      position: 98,
      name: 'equipamento_impressora_multifuncional',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Impressora Multifuncional (0-Não, 1-Sim)',
    },
    // Campo 100: Scanner
    {
      position: 99,
      name: 'equipamento_scanner',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Scanner (0-Não, 1-Sim)',
    },
    // Campo 101: Nenhum dos equipamentos listados
    {
      position: 100,
      name: 'nenhum_equipamento_listado',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Nenhum dos equipamentos listados (0-Não, 1-Sim)',
    },
    // Campo 102: Aparelho de DVD/Blu-ray
    {
      position: 101,
      name: 'qtd_aparelho_dvd_bluray',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Quantidade de aparelhos de DVD/Blu-ray',
    },
    // Campo 103: Aparelho de som
    {
      position: 102,
      name: 'qtd_aparelho_som',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Quantidade de aparelhos de som',
    },
    // Campo 104: Aparelho de Televisão
    {
      position: 103,
      name: 'qtd_aparelho_televisao',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Quantidade de aparelhos de televisão',
    },
    // Campo 105: Lousa digital
    {
      position: 104,
      name: 'qtd_lousa_digital',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Quantidade de lousas digitais',
    },
    // Campo 106: Projetor Multimídia (Data show)
    {
      position: 105,
      name: 'qtd_projetor_multimidia',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Quantidade de projetores multimídia (Data show)',
    },
    // Campo 107: Computadores de mesa (desktop)
    {
      position: 106,
      name: 'qtd_computadores_desktop',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Quantidade de computadores de mesa (desktop)',
    },
    // Campo 108: Computadores portáteis
    {
      position: 107,
      name: 'qtd_computadores_portateis',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Quantidade de computadores portáteis',
    },
    // Campo 109: Tablets
    {
      position: 108,
      name: 'qtd_tablets',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Quantidade de tablets',
    },
    // Campo 110: Internet para uso administrativo
    {
      position: 109,
      name: 'internet_uso_administrativo',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Internet para uso administrativo (0-Não, 1-Sim)',
    },
    // Campo 111: Internet para uso no processo de ensino e aprendizagem
    {
      position: 110,
      name: 'internet_uso_ensino_aprendizagem',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Internet para uso no processo de ensino e aprendizagem (0-Não, 1-Sim)',
    },
    // Campo 112: Internet para uso dos aluno(a)s
    {
      position: 111,
      name: 'internet_uso_alunos',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Internet para uso dos aluno(a)s (0-Não, 1-Sim)',
    },
    // Campo 113: Internet para uso da comunidade
    {
      position: 112,
      name: 'internet_uso_comunidade',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Internet para uso da comunidade (0-Não, 1-Sim)',
    },
    // Campo 114: Não possui acesso à internet
    {
      position: 113,
      name: 'nao_possui_internet',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Não possui acesso à internet (0-Não, 1-Sim)',
    },
    // Campo 115: Computadores da escola para acesso à internet
    {
      position: 114,
      name: 'computadores_escola_internet',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Computadores de mesa, portáteis e tablets da escola (0-Não, 1-Sim)',
      conditionalRequired: { field: 'internet_uso_alunos', values: ['1'] },
    },
    // Campo 116: Dispositivos pessoais
    {
      position: 115,
      name: 'dispositivos_pessoais_internet',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Dispositivos pessoais (computadores portáteis, celulares, tablets etc.) (0-Não, 1-Sim)',
      conditionalRequired: { field: 'internet_uso_alunos', values: ['1'] },
    },
    // Campo 117: Internet banda larga
    {
      position: 116,
      name: 'internet_banda_larga',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Internet banda larga (0-Não, 1-Sim)',
      conditionalRequired: { field: 'nao_possui_internet', values: ['0'] },
    },
    // Campo 118: Rede local - A cabo
    {
      position: 117,
      name: 'rede_local_cabo',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Rede local - A cabo (0-Não, 1-Sim)',
    },
    // Campo 119: Rede local - Wireless
    {
      position: 118,
      name: 'rede_local_wireless',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Rede local - Wireless (0-Não, 1-Sim)',
      conditionalRequired: { field: 'rede_local_cabo', values: ['1', '0'] },
    },
    // Campo 120: Não há rede local interligando computadores
    {
      position: 119,
      name: 'nao_ha_rede_local',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Não há rede local interligando computadores (0-Não, 1-Sim)',
      conditionalRequired: { field: 'rede_local_cabo', values: ['1', '0'] },
    },
    // Campo 121: Agrônomos, horticultores, técnicos
    {
      position: 120,
      name: 'qtd_agronomos_horticultores',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Agrônomos(as), horticultores(as), técnicos ou monitores(as) responsáveis pela gestão da área de horta',
    },
    // Campo 122: Auxiliares de secretaria
    {
      position: 121,
      name: 'qtd_auxiliares_secretaria',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Auxiliares de secretaria ou auxiliares administrativos, atendentes',
    },
    // Campo 123: Auxiliar de serviços gerais
    {
      position: 122,
      name: 'qtd_auxiliares_servicos_gerais',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Auxiliar de serviços gerais, porteiro(a), zelador(a), faxineiro(a), jardineiro(a)',
    },
    // Campo 124: Bibliotecário
    {
      position: 123,
      name: 'qtd_bibliotecarios',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Bibliotecário(a), auxiliar de biblioteca ou monitor(a) da sala de leitura',
    },
    // Campo 125: Bombeiro brigadista
    {
      position: 124,
      name: 'qtd_bombeiros_saude',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Bombeiro(a) brigadista, profissionais de assistência a saúde (urgência e emergência), enfermeiro(a), técnico(a) de enfermagem e socorrista',
    },
    // Campo 126: Coordenador de turno/disciplinar
    {
      position: 125,
      name: 'qtd_coordenadores_turno',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Coordenador(a) de turno/disciplinar',
    },
    // Campo 127: Fonoaudiólogo
    {
      position: 126,
      name: 'qtd_fonoaudiologos',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Fonoaudiólogo(a)',
    },
    // Campo 128: Nutricionista
    {
      position: 127,
      name: 'qtd_nutricionistas',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Nutricionista',
    },
    // Campo 129: Psicólogo escolar
    {
      position: 128,
      name: 'qtd_psicologos_escolares',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Psicólogo(a) escolar',
    },
    // Campo 130: Profissionais de preparação alimentar
    {
      position: 129,
      name: 'qtd_profissionais_alimentacao',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Profissionais de preparação e segurança alimentar, cozinheiro(a), merendeira e auxiliar de cozinha',
    },
    // Campo 131: Profissionais de apoio pedagógico
    {
      position: 130,
      name: 'qtd_profissionais_apoio_pedagogico',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Profissionais de apoio e supervisão pedagógica: (pedagogo(a), coordenador(a) pedagógico(a), orientador(a) educacional, supervisor(a) escolar e coordenador(a) de área de ensino',
    },
    // Campo 132: Secretário escolar
    {
      position: 131,
      name: 'qtd_secretarios_escolares',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Secretário(a) escolar',
    },
    // Campo 133: Segurança, guarda
    {
      position: 132,
      name: 'qtd_seguranças',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Segurança, guarda ou segurança patrimonial',
    },
    // Campo 134: Técnicos de laboratório
    {
      position: 133,
      name: 'qtd_tecnicos_laboratorio',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Técnicos(as), monitores(as), supervisores(as) ou auxiliares de laboratório(s), de apoio a tecnologias educacionais ou em multimeios/multimídias eletrônico-digitais',
    },
    // Campo 135: Vice-diretor
    {
      position: 134,
      name: 'qtd_vice_diretores',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Vice-diretor(a) ou diretor(a) adjunto(a), profissionais responsáveis pela gestão administrativa e/ou financeira',
    },
    // Campo 136: Orientador comunitário
    {
      position: 135,
      name: 'qtd_orientadores_comunitarios',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description: 'Orientador(a) comunitário(a) ou assistente social',
    },
    // Campo 137: Tradutor e Intérprete de Libras
    {
      position: 136,
      name: 'qtd_tradutores_libras',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Tradutor e Intérprete de Libras para atendimento em outros ambientes da escola que não seja sala de aula',
    },
    // Campo 138: Revisor de texto Braille
    {
      position: 137,
      name: 'qtd_revisores_braille',
      required: false,
      minLength: 1,
      maxLength: 4,
      pattern: /^[1-9]\d{0,3}$/,
      type: 'number',
      description:
        'Revisor de texto Braille, assistente vidente (assistente de revisão do texto em Braille)',
    },
    // Campo 139: Não há funcionários para as funções listadas
    {
      position: 138,
      name: 'nao_ha_funcionarios',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^1$/,
      type: 'code',
      description: 'Não há funcionários para as funções listadas (1-Sim)',
    },
    // Campo 140: Alimentação escolar para os aluno(a)s
    {
      position: 139,
      name: 'oferece_alimentacao_escolar',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Alimentação escolar para os aluno(a)s (0-Não oferece, 1-Oferece)',
    },
    // Campo 141: Acervo multimídia
    {
      position: 140,
      name: 'material_acervo_multimidia',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Acervo multimídia (0-Não, 1-Sim)',
    },
    // Campo 142: Brinquedos para educação infantil
    {
      position: 141,
      name: 'material_brinquedos_educacao_infantil',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Brinquedos para educação infantil (0-Não, 1-Sim)',
    },
    // Campo 143: Conjunto de materiais científicos
    {
      position: 142,
      name: 'material_conjunto_materiais_cientificos',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Conjunto de materiais científicos (0-Não, 1-Sim)',
    },
    // Campo 144: Equipamento para amplificação de som
    {
      position: 143,
      name: 'material_equipamento_amplificacao_som',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Equipamento para amplificação e difusão de som/áudio (0-Não, 1-Sim)',
    },
    // Campo 145: Equipamentos para horta/agricultura
    {
      position: 144,
      name: 'material_equipamentos_horta_agricultura',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Equipamentos e instrumentos para atividades em área de horta, plantio e/ou produção agrícola (0-Não, 1-Sim)',
    },
    // Campo 146: Instrumentos musicais
    {
      position: 145,
      name: 'material_instrumentos_musicais',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Instrumentos musicais para conjunto, banda/fanfarra e/ou aulas de música (0-Não, 1-Sim)',
    },
    // Campo 147: Jogos educativos
    {
      position: 146,
      name: 'material_jogos_educativos',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Jogos educativos (0-Não, 1-Sim)',
    },
    // Campo 148: Materiais para atividades culturais e artísticas
    {
      position: 147,
      name: 'material_atividades_culturais_artisticas',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Materiais para atividades culturais e artísticas (0-Não, 1-Sim)',
    },
    // Campo 149: Materiais para educação profissional
    {
      position: 148,
      name: 'material_educacao_profissional',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Materiais para educação profissional (0-Não, 1-Sim)',
    },
    // Campo 150: Materiais para prática desportiva
    {
      position: 149,
      name: 'material_pratica_desportiva',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Materiais para prática desportiva e recreação (0-Não, 1-Sim)',
    },
    // Campo 151: Materiais pedagógicos para educação bilíngue de surdos
    {
      position: 150,
      name: 'material_educacao_bilingue_surdos',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Materiais pedagógicos para a educação bilíngue de surdos (0-Não, 1-Sim)',
    },
    // Campo 152: Materiais pedagógicos para educação escolar indígena
    {
      position: 151,
      name: 'material_educacao_indigena',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Materiais pedagógicos para a educação escolar indígena (0-Não, 1-Sim)',
    },
    // Campo 153: Materiais pedagógicos para educação das relações étnico-raciais
    {
      position: 152,
      name: 'material_educacao_etnico_raciais',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Materiais pedagógicos para a educação das relações étnico-raciais (0-Não, 1-Sim)',
    },
    // Campo 154: Materiais pedagógicos para educação do campo
    {
      position: 153,
      name: 'material_educacao_campo',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Materiais pedagógicos para a educação do campo (0-Não, 1-Sim)',
    },
    // Campo 155: Materiais pedagógicos para educação escolar quilombola
    {
      position: 154,
      name: 'material_educacao_quilombola',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Materiais pedagógicos para a educação escolar quilombola (0-Não, 1-Sim)',
    },
    // Campo 156: Materiais pedagógicos para educação especial
    {
      position: 155,
      name: 'material_educacao_especial',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Materiais pedagógicos para a educação especial (0-Não, 1-Sim)',
    },
    // Campo 157: Nenhum dos instrumentos listados
    {
      position: 156,
      name: 'nenhum_instrumento_listado',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Nenhum dos instrumentos listados (0-Não, 1-Sim)',
    },
    // Campo 158: Escola indígena
    {
      position: 157,
      name: 'escola_indigena',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Escola indígena (0-Não, 1-Sim)',
    },
    // Campo 159: Língua indígena
    {
      position: 158,
      name: 'lingua_indigena',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Língua indígena (0-Não, 1-Sim)',
      conditionalRequired: { field: 'escola_indigena', values: ['1'] },
    },
    // Campo 160: Língua portuguesa
    {
      position: 159,
      name: 'lingua_portuguesa',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Língua portuguesa (0-Não, 1-Sim)',
      conditionalRequired: { field: 'escola_indigena', values: ['1'] },
    },
    // Campo 161: Código da língua indígena 1
    {
      position: 160,
      name: 'codigo_lingua_indigena_1',
      required: false,
      minLength: 1,
      maxLength: 5,
      pattern: /^\d{1,5}$/,
      type: 'code',
      description: 'Código da língua indígena 1',
      conditionalRequired: { field: 'lingua_indigena', values: ['1'] },
    },
    // Campo 162: Código da língua indígena 2
    {
      position: 161,
      name: 'codigo_lingua_indigena_2',
      required: false,
      minLength: 1,
      maxLength: 5,
      pattern: /^\d{1,5}$/,
      type: 'code',
      description: 'Código da língua indígena 2',
    },
    // Campo 163: Código da língua indígena 3
    {
      position: 162,
      name: 'codigo_lingua_indigena_3',
      required: false,
      minLength: 1,
      maxLength: 5,
      pattern: /^\d{1,5}$/,
      type: 'code',
      description: 'Código da língua indígena 3',
    },
    // Campo 164: Exame de seleção para ingresso
    {
      position: 163,
      name: 'exame_selecao_ingresso',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'A escola faz exame de seleção para ingresso de seus aluno(a)s (0-Não, 1-Sim)',
    },
    // Campo 165: Cota para autodeclarado preto, pardo ou indígena
    {
      position: 164,
      name: 'cota_autodeclarado_ppi',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Autodeclarado preto, pardo ou indígena (PPI) (0-Não, 1-Sim)',
      conditionalRequired: { field: 'exame_selecao_ingresso', values: ['1'] },
    },
    // Campo 166: Cota por condição de renda
    {
      position: 165,
      name: 'cota_condicao_renda',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Condição de renda (0-Não, 1-Sim)',
      conditionalRequired: { field: 'exame_selecao_ingresso', values: ['1'] },
    },
    // Campo 167: Cota para oriundo de escola pública
    {
      position: 166,
      name: 'cota_escola_publica',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Oriundo de escola pública (0-Não, 1-Sim)',
      conditionalRequired: { field: 'exame_selecao_ingresso', values: ['1'] },
    },
    // Campo 168: Cota para pessoa com deficiência
    {
      position: 167,
      name: 'cota_pessoa_deficiencia',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Pessoa com deficiência (PCD) (0-Não, 1-Sim)',
      conditionalRequired: { field: 'exame_selecao_ingresso', values: ['1'] },
    },
    // Campo 169: Cota para outros grupos
    {
      position: 168,
      name: 'cota_outros_grupos',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Outros grupos que não os listados (0-Não, 1-Sim)',
      conditionalRequired: { field: 'exame_selecao_ingresso', values: ['1'] },
    },
    // Campo 170: Sem reservas de vagas (ampla concorrência)
    {
      position: 169,
      name: 'sem_reservas_vagas',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Sem reservas de vagas para sistema de cotas (ampla concorrência) (0-Não, 1-Sim)',
      conditionalRequired: { field: 'exame_selecao_ingresso', values: ['1'] },
    },
    // Campo 171: Site/blog/página em redes sociais
    {
      position: 170,
      name: 'possui_site_blog_redes_sociais',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'A escola possui site ou blog ou página em redes sociais para comunicação institucional (0-Não, 1-Sim)',
    },
    // Campo 172: Compartilha espaços com a comunidade
    {
      position: 171,
      name: 'compartilha_espacos_comunidade',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'A escola compartilha espaços para atividades de integração escola-comunidade (0-Não, 1-Sim)',
    },
    // Campo 173: Usa espaços do entorno escolar
    {
      position: 172,
      name: 'usa_espacos_entorno_escolar',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'A escola usa espaços e equipamentos do entorno escolar para atividades regulares com os aluno(a)s (0-Não, 1-Sim)',
    },
    // Campo 174: Associação de Pais
    {
      position: 173,
      name: 'orgao_colegiado_associacao_pais',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Associação de Pais (0-Não, 1-Sim)',
    },
    // Campo 175: Associação de pais e mestres
    {
      position: 174,
      name: 'orgao_colegiado_associacao_pais_mestres',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Associação de pais e mestres (0-Não, 1-Sim)',
    },
    // Campo 176: Conselho escolar
    {
      position: 175,
      name: 'orgao_colegiado_conselho_escolar',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Conselho escolar (0-Não, 1-Sim)',
    },
    // Campo 177: Grêmio estudantil
    {
      position: 176,
      name: 'orgao_colegiado_gremio_estudantil',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Grêmio estudantil (0-Não, 1-Sim)',
    },
    // Campo 178: Outros órgãos colegiados
    {
      position: 177,
      name: 'orgao_colegiado_outros',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Outros órgãos colegiados (0-Não, 1-Sim)',
    },
    // Campo 179: Não há órgãos colegiados em funcionamento
    {
      position: 178,
      name: 'nao_ha_orgaos_colegiados',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Não há órgãos colegiados em funcionamento (0-Não, 1-Sim)',
    },
    // Campo 180: Projeto político pedagógico atualizado
    {
      position: 179,
      name: 'projeto_politico_pedagogico_atualizado',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[012]$/,
      type: 'code',
      description:
        'Projeto político pedagógico atualizado nos últimos 12 meses (0-Não, 1-Sim, 2-Não possui)',
    },
    // Campo 181: Desenvolve ações de educação ambiental
    {
      position: 180,
      name: 'desenvolve_educacao_ambiental',
      required: true,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'A escola desenvolve ações na área de educação ambiental (0-Não, 1-Sim)',
    },
    // Campo 182: Educação ambiental como conteúdo curricular
    {
      position: 181,
      name: 'educacao_ambiental_conteudo_curricular',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Como conteúdo dos componentes/campos de experiências presentes no currículo (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'desenvolve_educacao_ambiental',
        values: ['1'],
      },
    },
    // Campo 183: Educação ambiental como componente curricular específico
    {
      position: 182,
      name: 'educacao_ambiental_componente_especifico',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Como um componente curricular especial, específico, flexível ou eletivo (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'desenvolve_educacao_ambiental',
        values: ['1'],
      },
    },
    // Campo 184: Educação ambiental como eixo estruturante
    {
      position: 183,
      name: 'educacao_ambiental_eixo_estruturante',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Como um eixo estruturante do currículo (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'desenvolve_educacao_ambiental',
        values: ['1'],
      },
    },
    // Campo 185: Educação ambiental em eventos
    {
      position: 184,
      name: 'educacao_ambiental_eventos',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Em eventos (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'desenvolve_educacao_ambiental',
        values: ['1'],
      },
    },
    // Campo 186: Educação ambiental em projetos transversais
    {
      position: 185,
      name: 'educacao_ambiental_projetos_transversais',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description:
        'Em projetos transversais ou interdisciplinares (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'desenvolve_educacao_ambiental',
        values: ['1'],
      },
    },
    // Campo 187: Nenhuma das opções de educação ambiental
    {
      position: 186,
      name: 'educacao_ambiental_nenhuma_opcao',
      required: false,
      minLength: 1,
      maxLength: 1,
      pattern: /^[01]$/,
      type: 'code',
      description: 'Nenhuma das opções listadas (0-Não, 1-Sim)',
      conditionalRequired: {
        field: 'desenvolve_educacao_ambiental',
        values: ['1'],
      },
    },
  ];

  /**
   * Valida regras de negócio específicas para Caracterização da Escola
   */
  protected validateBusinessRules(
    parts: string[],
    lineNumber: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Regra 1: Campos 3-8 (Local de funcionamento da escola)
    // Pelo menos um deve ser preenchido com 1 (Sim)
    const locaisFuncionamento = [
      parts[2] || '0', // Campo 3 - Prédio escolar
      parts[3] || '0', // Campo 4 - Sala(s) em outra escola
      parts[4] || '0', // Campo 5 - Galpão/rancho/paiol/barracão
      parts[5] || '0', // Campo 6 - Casa do professor
      parts[6] || '0', // Campo 7 - Templo/igreja
      parts[7] || '0', // Campo 8 - Outros
    ];

    if (!locaisFuncionamento.some((valor) => valor === '1')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'local_funcionamento_validation',
        fieldPosition: 2,
        fieldValue: locaisFuncionamento.join('|'),
        ruleName: 'local_funcionamento_required',
        errorMessage: 'Pelo menos um local de funcionamento deve ser informado',
        severity: 'error',
      });
    }

    // Regra 2: Campos 11-16 (Código da escola com a qual compartilha)
    // Não pode haver dois códigos iguais
    const codigosEscolaCompartilha = [
      parts[10],
      parts[11],
      parts[12],
      parts[13],
      parts[14],
      parts[15],
    ].filter((codigo) => codigo && codigo.trim() !== '');

    const codigosUnicos = new Set(codigosEscolaCompartilha);
    if (codigosEscolaCompartilha.length > codigosUnicos.size) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'codigos_escola_compartilha_validation',
        fieldPosition: 10,
        fieldValue: codigosEscolaCompartilha.join('|'),
        ruleName: 'codigos_escola_compartilha_duplicated',
        errorMessage:
          'Não pode haver códigos de escola compartilhada duplicados',
        severity: 'error',
      });
    }

    // Regra 3: Campos 18-23 (Abastecimento de água)
    const abastecimentoAgua = [
      parts[17] || '0',
      parts[18] || '0',
      parts[19] || '0',
      parts[20] || '0',
      parts[21] || '0',
      parts[22] || '0',
    ];

    if (!abastecimentoAgua.some((valor) => valor === '1')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'abastecimento_agua_validation',
        fieldPosition: 17,
        fieldValue: abastecimentoAgua.join('|'),
        ruleName: 'abastecimento_agua_required',
        errorMessage:
          'Pelo menos uma opção de abastecimento de água deve ser informada',
        severity: 'error',
      });
    }

    // Regra 4: Campos 24-27 (Fonte de energia elétrica)
    const fonteEnergia = [
      parts[23] || '0',
      parts[24] || '0',
      parts[25] || '0',
      parts[26] || '0',
    ];

    if (!fonteEnergia.some((valor) => valor === '1')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'fonte_energia_validation',
        fieldPosition: 23,
        fieldValue: fonteEnergia.join('|'),
        ruleName: 'fonte_energia_required',
        errorMessage:
          'Pelo menos uma fonte de energia elétrica deve ser informada',
        severity: 'error',
      });
    }

    // Regra 5: Campos 28-31 (Esgotamento sanitário)
    const esgotamento = [
      parts[27] || '0',
      parts[28] || '0',
      parts[29] || '0',
      parts[30] || '0',
    ];

    if (!esgotamento.some((valor) => valor === '1')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'esgotamento_sanitario_validation',
        fieldPosition: 27,
        fieldValue: esgotamento.join('|'),
        ruleName: 'esgotamento_sanitario_required',
        errorMessage:
          'Pelo menos uma opção de esgotamento sanitário deve ser informada',
        severity: 'error',
      });
    }

    // Regra 6: Campos 32-36 (Destinação do lixo)
    const destinacaoLixo = [
      parts[31] || '0',
      parts[32] || '0',
      parts[33] || '0',
      parts[34] || '0',
      parts[35] || '0',
    ];

    if (!destinacaoLixo.some((valor) => valor === '1')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'destinacao_lixo_validation',
        fieldPosition: 31,
        fieldValue: destinacaoLixo.join('|'),
        ruleName: 'destinacao_lixo_required',
        errorMessage:
          'Pelo menos uma opção de destinação do lixo deve ser informada',
        severity: 'error',
      });
    }

    // Regra 7: Campos 37-40 (Tratamento do lixo/resíduos)
    const tratamentoLixo = [
      parts[36] || '0',
      parts[37] || '0',
      parts[38] || '0',
      parts[39] || '0',
    ];

    if (tratamentoLixo.every((valor) => valor === '0')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'tratamento_lixo_validation',
        fieldPosition: 36,
        fieldValue: tratamentoLixo.join('|'),
        ruleName: 'tratamento_lixo_required',
        errorMessage:
          'Pelo menos uma opção de tratamento de lixo deve ser informada',
        severity: 'error',
      });
    }

    // Regra 8: Campos 41-79 (Dependências físicas existentes)
    const dependenciasFisicas: string[] = [];
    for (let i = 40; i < 79; i++) {
      dependenciasFisicas.push(parts[i] || '0');
    }

    if (!dependenciasFisicas.some((valor) => valor === '1')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'dependencias_fisicas_validation',
        fieldPosition: 40,
        fieldValue: dependenciasFisicas.slice(0, 5).join('|') + '...',
        ruleName: 'dependencias_fisicas_required',
        errorMessage: 'Pelo menos uma dependência física deve ser informada',
        severity: 'error',
      });
    }

    // Regra 9: Campos 80-89 (Recursos de acessibilidade)
    const recursosAcessibilidade: string[] = [];
    for (let i = 79; i < 89; i++) {
      recursosAcessibilidade.push(parts[i] || '0');
    }

    if (!recursosAcessibilidade.some((valor) => valor === '1')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'recursos_acessibilidade_validation',
        fieldPosition: 79,
        fieldValue: recursosAcessibilidade.join('|'),
        ruleName: 'recursos_acessibilidade_required',
        errorMessage:
          'Pelo menos um recurso de acessibilidade deve ser informado',
        severity: 'error',
      });
    }

    // Regra 10: Campos 95-101 (Equipamentos técnicos e administrativos)
    const equipamentosTecnicos: string[] = [];
    for (let i = 94; i < 101; i++) {
      equipamentosTecnicos.push(parts[i] || '0');
    }

    if (equipamentosTecnicos.every((valor) => valor === '0')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'equipamentos_tecnicos_validation',
        fieldPosition: 94,
        fieldValue: equipamentosTecnicos.join('|'),
        ruleName: 'equipamentos_tecnicos_required',
        errorMessage:
          'Pelo menos um equipamento técnico/administrativo deve ser informado',
        severity: 'error',
      });
    }

    // Regra 11: Campos 110-114 (Acesso à internet)
    const acessoInternet: string[] = [];
    for (let i = 109; i < 114; i++) {
      acessoInternet.push(parts[i] || '0');
    }

    if (!acessoInternet.some((valor) => valor === '1')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'acesso_internet_validation',
        fieldPosition: 109,
        fieldValue: acessoInternet.join('|'),
        ruleName: 'acesso_internet_required',
        errorMessage:
          'Pelo menos uma opção de acesso à internet deve ser informada',
        severity: 'error',
      });
    }

    // Regra 12: Campos 118-120 (Rede local de computadores)
    const redeLocal = [parts[117] || '0', parts[118] || '0', parts[119] || '0'];

    if (redeLocal.every((valor) => valor === '0')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'rede_local_validation',
        fieldPosition: 117,
        fieldValue: redeLocal.join('|'),
        ruleName: 'rede_local_required',
        errorMessage: 'Pelo menos uma opção de rede local deve ser informada',
        severity: 'error',
      });
    }

    // Regra 13: Campos 121-139 (Total de profissionais)
    const totalProfissionais: string[] = [];
    for (let i = 120; i < 139; i++) {
      const valor = parts[i];
      if (valor && valor.trim() !== '') {
        totalProfissionais.push(valor);
      }
    }

    if (totalProfissionais.length === 0) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'total_profissionais_validation',
        fieldPosition: 120,
        fieldValue: '',
        ruleName: 'total_profissionais_required',
        errorMessage: 'Pelo menos um total de profissionais deve ser informado',
        severity: 'error',
      });
    }

    // Regra 14: Campo 139 (Não há funcionários) - validação especial
    const naoHaFuncionarios = parts[138] || '';
    if (naoHaFuncionarios && naoHaFuncionarios !== '1') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'nao_ha_funcionarios_validation',
        fieldPosition: 138,
        fieldValue: naoHaFuncionarios,
        ruleName: 'nao_ha_funcionarios_invalid_value',
        errorMessage: 'Campo "Não há funcionários" só aceita o valor 1 (Sim)',
        severity: 'error',
      });
    }

    // Regra 15: Campos 141-157 (Materiais socioculturais/pedagógicos)
    const materiaisPedagogicos: string[] = [];
    for (let i = 140; i < 157; i++) {
      materiaisPedagogicos.push(parts[i] || '0');
    }

    if (materiaisPedagogicos.every((valor) => valor === '0')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'materiais_pedagogicos_validation',
        fieldPosition: 140,
        fieldValue: materiaisPedagogicos.slice(0, 5).join('|') + '...',
        ruleName: 'materiais_pedagogicos_required',
        errorMessage: 'Pelo menos um material pedagógico deve ser informado',
        severity: 'error',
      });
    }

    // Regra 16: Campos 159-160 (Língua de ensino)
    const linguaIndigena = parts[158] || '0'; // Campo 159
    const linguaPortuguesa = parts[159] || '0'; // Campo 160

    if (linguaIndigena === '0' && linguaPortuguesa === '0') {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'lingua_ensino_validation',
        fieldPosition: 158,
        fieldValue: `${linguaIndigena}|${linguaPortuguesa}`,
        ruleName: 'lingua_ensino_required',
        errorMessage: 'Pelo menos uma língua de ensino deve ser informada',
        severity: 'error',
      });
    }

    // Regra 17: Campos 165-170 (Reserva de vagas por cotas)
    const fazExameSelecao = parts[163] || ''; // Campo 164
    if (fazExameSelecao === '1') {
      const reservaVagas: string[] = [];
      for (let i = 164; i < 170; i++) {
        reservaVagas.push(parts[i] || '0');
      }

      if (!reservaVagas.some((valor) => valor === '1')) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'reserva_vagas_validation',
          fieldPosition: 164,
          fieldValue: reservaVagas.join('|'),
          ruleName: 'reserva_vagas_required',
          errorMessage:
            'Pelo menos uma opção de reserva de vagas deve ser informada quando há exame de seleção',
          severity: 'error',
        });
      }
    }

    // Regra 18: Campos 174-179 (Órgãos colegiados)
    const orgaosColegiados: string[] = [];
    for (let i = 173; i < 179; i++) {
      orgaosColegiados.push(parts[i] || '0');
    }

    if (orgaosColegiados.every((valor) => valor === '0')) {
      errors.push({
        lineNumber,
        recordType: this.recordType,
        fieldName: 'orgaos_colegiados_validation',
        fieldPosition: 173,
        fieldValue: orgaosColegiados.join('|'),
        ruleName: 'orgaos_colegiados_required',
        errorMessage: 'Pelo menos um órgão colegiado deve ser informado',
        severity: 'error',
      });
    }

    // Regra 19: Campos 182-187 (Formas de educação ambiental)
    const desenvolveEducacaoAmbiental = parts[180] || ''; // Campo 181
    if (desenvolveEducacaoAmbiental === '1') {
      const formasEducacaoAmbiental: string[] = [];
      for (let i = 181; i < 187; i++) {
        formasEducacaoAmbiental.push(parts[i] || '0');
      }

      if (!formasEducacaoAmbiental.some((valor) => valor === '1')) {
        errors.push({
          lineNumber,
          recordType: this.recordType,
          fieldName: 'formas_educacao_ambiental_validation',
          fieldPosition: 181,
          fieldValue: formasEducacaoAmbiental.join('|'),
          ruleName: 'formas_educacao_ambiental_required',
          errorMessage:
            'Pelo menos uma forma de educação ambiental deve ser informada quando a escola desenvolve educação ambiental',
          severity: 'error',
        });
      }
    }

    return errors;
  }
}
