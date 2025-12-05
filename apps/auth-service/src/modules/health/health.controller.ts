import { Controller, Get, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    @InjectDataSource('databaseConnection')
    private dataSource: DataSource
  ) {}

  @Get()
  async check() {
    this.logger.log('Health check requested');

    try {
      // Check database connection
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime(),
      };
    } catch (error) {
      this.logger.error('Health check failed', error);
      return {
        status: 'error',
        service: 'auth-service',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
