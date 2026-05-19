import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
}

/**
 * Global response-envelope interceptor.
 *
 * Wraps every successful response in a consistent shape:
 *
 * ```json
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "data": <original response>,
 *   "timestamp": "2024-01-01T00:00:00.000Z"
 * }
 * ```
 *
 * Because the interceptor runs after the controller, the `data` field always
 * contains the raw value returned (or resolved) by the handler.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode as number;

    return next.handle().pipe(
      map((data) => ({
        success:   true,
        statusCode,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
