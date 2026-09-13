import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApplicationException } from '@/core/application/error/application.exception';

@Catch()
export class ApplicationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApplicationExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object =
      'Ocurrió un error inesperado en el servidor.';
    let error = 'Internal Server Error';

    if (exception instanceof ApplicationException) {
      status = exception.codeError || HttpStatus.BAD_REQUEST;
      message = exception.message;
      error =
        status === 404
          ? 'Not Found'
          : status === 403
            ? 'Forbidden'
            : status === 401
              ? 'Unauthorized'
              : status >= 500
                ? 'Internal Server Error'
                : 'Bad Request';
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        message = (res as { message: string | object }).message;
      } else {
        message = exception.message;
      }
      error = exception.name;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const isProduction =
      process.env.APP_ENV === 'production' ||
      process.env.NODE_ENV === 'production';

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
      ...(!isProduction && exception instanceof Error
        ? { stack: exception.stack }
        : {}),
    });
  }
}
