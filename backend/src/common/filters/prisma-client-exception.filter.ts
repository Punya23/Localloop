import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P1001': {
        response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Database is temporarily unavailable. Please try again shortly.',
          error: 'Service Unavailable',
        });
        break;
      }
      case 'P2002': {
        const target = exception.meta?.target;
        const rawFields = Array.isArray(target)
          ? target
          : typeof target === 'string'
            ? [target]
            : [];
        const normalizedFields = rawFields.map((field) =>
          field
            .replace(/^users?_/, '')
            .replace(/_/g, ' ')
            .trim(),
        );
        const uniqueField = normalizedFields.length > 0 ? normalizedFields.join(', ') : 'field';
        const message = `A record with this ${uniqueField} already exists. Please use a different value.`;
        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          message: message,
          error: 'Conflict',
        });
        break;
      }
      default:
        // default 500 error code
        super.catch(exception, host);
        break;
    }
  }
}
