import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '@reviews-monorepo/database';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly enabled: boolean;
  private readonly ignoreEndpoints: string[];
  private readonly logToDatabase: boolean;
  private readonly logRequestBody: boolean;
  private readonly logResponseBody: boolean;
  private readonly logHeaders: boolean;
  private readonly appName: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Log, 'databaseConnection')
    private readonly logRepository: Repository<Log>,
  ) {
    this.enabled = this.configService.get<boolean>('logging.enabled', true);
    this.ignoreEndpoints = this.configService.get<string[]>('logging.ignoreEndpoints', ['/health']);
    this.logToDatabase = this.configService.get<boolean>('logging.logToDatabase', false);
    this.logRequestBody = this.configService.get<boolean>('logging.logRequestBody', false);
    this.logResponseBody = this.configService.get<boolean>('logging.logResponseBody', false);
    this.logHeaders = this.configService.get<boolean>('logging.logHeaders', false);
    this.appName = this.configService.get<string>('app.name', 'app');

    this.logger.log(`HTTP Logging Middleware Initialized:`);
    this.logger.log(`  - Enabled: ${this.enabled}`);
    this.logger.log(`  - Database Logging: ${this.logToDatabase}`);
    this.logger.log(`  - App Name: ${this.appName}`);
    this.logger.log(`  - Ignore Endpoints: ${this.ignoreEndpoints.join(', ')}`);
  }

  use(req: Request, res: Response, next: NextFunction) {
    // Skip if logging disabled or endpoint ignored
    if (!this.enabled || this.ignoreEndpoints?.some(endpoint => req.path === endpoint || req.path.startsWith(endpoint))) {
      return next();
    }

    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log request
    const requestLog: string[] = [`→ ${method} ${originalUrl}`];

    if (this.logHeaders) {
      requestLog.push(`Headers: ${JSON.stringify(req.headers)}`);
    }

    if (this.logRequestBody && req.body && Object.keys(req.body).length > 0) {
      requestLog.push(`Body: ${JSON.stringify(req.body)}`);
    }

    this.logger.log(requestLog.join(' | '));

    // Capture response body if needed
    let responseBody: any;
    if (this.logResponseBody) {
      const originalSend = res.send;
      res.send = function (body: any) {
        responseBody = body;
        return originalSend.call(this, body);
      };
    }

    // Log response
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      const responseLog: string[] = [
        `← ${method} ${originalUrl}`,
        `${statusCode}`,
        `${responseTime}ms`,
        `${ip}`
      ];

      // Determine log level
      let level: string;
      if (statusCode >= 500) {
        level = 'error';
        this.logger.error(responseLog.join(' | '));
      } else if (statusCode >= 400) {
        level = 'warn';
        this.logger.warn(responseLog.join(' | '));
      } else {
        level = 'info';
        this.logger.log(responseLog.join(' | '));
      }

      // Save to database asynchronously (fire and forget)
      if (this.logToDatabase) {
        this.logger.debug(`Saving log to database for ${method} ${originalUrl}`);
        this.saveLogToDatabase({
          level,
          appName: this.appName,
          method,
          endpoint: originalUrl,
          userId: (req as any).user?.id, // From JWT if available
          ipAddress: ip,
          userAgent,
          statusCode,
          duration: responseTime,
          requestBody: this.logRequestBody ? req.body : undefined,
          responseBody: this.logResponseBody ? responseBody : undefined,
          headers: this.logHeaders ? req.headers : undefined,
        }).catch(error => {
          // Don't block the response if DB logging fails
          this.logger.error(`Failed to save log to database: ${error.message}`);
        });
      }
    });

    next();
  }

  /**
   * Save log to database asynchronously
   * This is a fire-and-forget operation to avoid blocking the response
   */
  private async saveLogToDatabase(logData: Partial<Log>): Promise<void> {
    try {
      const log = this.logRepository.create(logData);
      const saved = await this.logRepository.save(log);
      this.logger.debug(`Log saved to database with ID: ${saved.id}`);
    } catch (error) {
      // Log error but don't throw - we don't want to break the application
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      this.logger.error(`Database logging failed: ${errorMessage}`);
      this.logger.error(errorStack);
    }
  }
}
