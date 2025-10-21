import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from '../../app.service';

@ApiTags('Sistema')
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Informações da API',
    description:
      'Retorna informações básicas sobre a API do Validador do Censo Escolar',
  })
  @ApiResponse({
    status: 200,
    description: 'Informações da API retornadas com sucesso',
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'Validador de Arquivos do Censo Escolar',
        },
        version: { type: 'string', example: '1.0.0' },
        description: {
          type: 'string',
          example: 'API para validação de arquivos TXT do Censo Escolar',
        },
        status: { type: 'string', example: 'online' },
        timestamp: { type: 'string', example: '2025-01-06T19:30:00.000Z' },
        endpoints: {
          type: 'object',
          properties: {
            validation: { type: 'string', example: '/api/validation' },
            reports: { type: 'string', example: '/api/reports' },
            docs: { type: 'string', example: '/api/docs' },
          },
        },
      },
    },
  })
  getApiInfo() {
    return this.appService.getApiInfo();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health Check',
    description: 'Verifica o status de saúde da aplicação',
  })
  @ApiResponse({
    status: 200,
    description: 'Aplicação saudável',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2025-01-06T19:30:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        memory: {
          type: 'object',
          properties: {
            used: { type: 'string', example: '45.2 MB' },
            total: { type: 'string', example: '128 MB' },
            percentage: { type: 'number', example: 35.3 },
          },
        },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('status')
  @ApiOperation({
    summary: 'Status do Sistema',
    description: 'Retorna informações detalhadas sobre o status do sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Status do sistema retornado com sucesso',
  })
  getStatus() {
    return this.appService.getStatus();
  }
}
