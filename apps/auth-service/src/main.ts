import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter, TypeOrmExceptionFilter } from '@reviews-monorepo/common';
import { LoggingMiddleware } from '@reviews-monorepo/logging';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    // Global exception filters
    app.useGlobalFilters(
      new AllExceptionsFilter(),
      new TypeOrmExceptionFilter()
    );

    // Apply logging middleware
    const loggingMiddleware = app.get(LoggingMiddleware);
    app.use(loggingMiddleware.use.bind(loggingMiddleware));

    const port = process.env.AUTH_PORT || 3001;
    await app.listen(port);

    logger.log(`� Auth Service is running on: http://localhost:${port}`);
    logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

bootstrap();
