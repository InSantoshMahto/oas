import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

/**
 * Global HTTP exception filter.
 *
 * Transforms every thrown HttpException (and unexpected errors) into a
 * consistent JSON envelope:
 *
 * ```json
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "error": "Not Found",
 *   "message": "Cat #99 not found",
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "path": "/api/v1/cats/99"
 * }
 * ```
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res  = exception.getResponse();
      error      = exception.name.replace(/Exception$/, '');

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = resObj['message'] ?? message;
        error   = resObj['error']   ?? error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    const body: ErrorResponse = {
      success:    false,
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path:      request.url,
    };

    response.status(statusCode).json(body);
  }
}
