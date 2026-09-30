import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const rawMessage =
      exception instanceof HttpException
        ? undefined
        : exception instanceof Error
          ? exception.message
          : String(exception);

    const isPoolExhausted =
      typeof rawMessage === 'string' &&
      (rawMessage.includes('EMAXCONN') ||
        rawMessage.includes('max clients') ||
        rawMessage.includes('Too many database connections') ||
        rawMessage.includes('remaining connection slots'));

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : isPoolExhausted
          ? HttpStatus.SERVICE_UNAVAILABLE
          : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = isPoolExhausted
      ? 'Database is busy (connection pool exhausted). Retry in a moment.'
      : 'Internal server error';
    let code = isPoolExhausted ? 'DB_POOL_EXHAUSTED' : 'INTERNAL_ERROR';

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      const body = exceptionResponse as Record<string, unknown>;
      if (Array.isArray(body.message)) {
        message = body.message.join(', ');
      } else if (typeof body.message === 'string') {
        message = body.message;
      }
      if (typeof body.error === 'string') {
        code = body.error.toUpperCase().replace(/\s+/g, '_');
      }
    } else if (exception instanceof Error && !isPoolExhausted) {
      message = exception.message;
    }

    if (!(exception instanceof HttpException)) {
      this.logger.error(rawMessage || message);
    }

    // Ensure CORS-friendly JSON even on unexpected DB/process failures.
    if (!response.headersSent) {
      response.status(status).json({
        success: false,
        message,
        error: { code },
      });
    }
  }
}
