import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  getApiInfo() {
    return {
      name: 'Validador de Arquivos do Censo Escolar',
      version: '1.0.0',
      description:
        'API para validação de arquivos TXT do Censo Escolar do INEP',
      status: 'online',
      timestamp: new Date().toISOString(),
      endpoints: {
        validation: '/api/validation',
        reports: '/api/reports',
        docs: '/api/docs',
        health: '/api/health',
        status: '/api/status',
      },
      features: [
        'Validação de arquivos TXT do Censo Escolar',
        'Geração de relatórios em múltiplos formatos',
        'Validação de diferentes tipos de registros',
        'Sistema de regras configurável',
        'API REST completa com documentação Swagger',
      ],
    };
  }

  getHealth() {
    const memoryUsage = process.memoryUsage();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime,
      memory: {
        used: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`,
        total: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`,
        percentage: Math.round(
          (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
        ),
      },
      version: '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
    };
  }

  getStatus() {
    const memoryUsage = process.memoryUsage();
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    return {
      application: {
        name: 'Validador de Arquivos do Censo Escolar',
        version: '1.0.0',
        status: 'running',
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
      },
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(1)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(1)} MB`,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
