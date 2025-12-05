import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from '@reviews-monorepo/database';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        ConfigModule,
        TypeOrmModule.forFeature([Log], 'databaseConnection'),
      ],
      providers: [LoggingMiddleware],
      exports: [LoggingMiddleware],
    };
  }
}
