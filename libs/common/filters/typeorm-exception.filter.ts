import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';

    const error = exception.driverError as any;

    // PostgreSQL error codes
    if (error?.code) {
      switch (error.code) {
        case '23505': // unique_violation
          status = HttpStatus.CONFLICT;
          message = 'A record with this unique constraint already exists';
          break;
        case '23503': // foreign_key_violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Foreign key constraint failed';
          break;
        case '23502': // not_null_violation
          status = HttpStatus.BAD_REQUEST;
          message = 'Required field is missing';
          break;
        case '22P02': // invalid_text_representation
          status = HttpStatus.BAD_REQUEST;
          message = 'Invalid data format';
          break;
        default:
          this.logger.error(
            `Unhandled database error code: ${error.code}`,
            exception.stack
          );
      }
    }

    this.logger.error(`Database Error: ${message}`, exception.stack);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: 'Database Error',
      message,
    });
  }
}
