import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Public } from '@reviews-monorepo/auth';
import { DataSource } from 'typeorm';

@Controller('health')
 @Public()
export class HealthController {
  constructor(
    @InjectDataSource('databaseConnection')
    private readonly dataSource: DataSource
  ) {}

  @Get()
  async check() {
    try {
      // Check database connection
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'connected',
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }
}
