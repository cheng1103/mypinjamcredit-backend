import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class LocalizedExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    // Extract or determine error key
    const exceptionResponse = exception.getResponse();
    const errorKey =
      typeof exceptionResponse === 'object' && 'errorKey' in exceptionResponse
        ? exceptionResponse['errorKey']
        : 'server_error';

    // In development, include detailed error information
    const isDevelopment = process.env.NODE_ENV !== 'production';

    response.status(status).json({
      statusCode: status,
      errorKey: errorKey,
      timestamp: new Date().toISOString(),
      ...(isDevelopment && { details: exceptionResponse }),
    });
  }
}
