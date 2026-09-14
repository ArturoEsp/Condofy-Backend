import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from '@/core/infrastructure/persistence/prisma/generated/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error en la operación de base de datos.';
    let error = 'Database Error';

    switch (exception.code) {
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[]) || [];
        const fieldInfo = target.length > 0 ? ` (${target.join(', ')})` : '';
        message = `Ya existe un registro con este identificador único${fieldInfo}.`;
        error = 'Conflict';
        break;
      }
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        message =
          (exception.meta?.cause as string) ||
          'El registro solicitado no fue encontrado.';
        error = 'Not Found';
        break;
      }
      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        const fieldName = (exception.meta?.field_name as string) || '';
        message = `Violación de relación foránea${fieldName ? ` en el campo ${fieldName}` : ''}.`;
        error = 'Bad Request';
        break;
      }
      case 'P2014': {
        status = HttpStatus.BAD_REQUEST;
        message = 'El cambio violaría una relación obligatoria requerida.';
        error = 'Bad Request';
        break;
      }
      default: {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Ocurrió un error inesperado en la base de datos.';
        error = 'Internal Server Error';
        break;
      }
    }

    const isProduction =
      process.env.APP_ENV === 'production' ||
      process.env.NODE_ENV === 'production';

    this.logger.error(
      `[${request.method}] ${request.url} - Code: ${exception.code} - ${exception.message}`,
      !isProduction ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
      ...(!isProduction
        ? { prismaCode: exception.code, clientVersion: exception.clientVersion }
        : {}),
    });
  }
}
