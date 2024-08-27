import {
  ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { ApplicationException } from './application-exception.abstract';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: any, host: ArgumentsHost): void {
    console.log('catch all exception: ', exception);

    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatusCode =
    exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message || 'Internal server error'
    let code = String(httpStatusCode);

    if (exception instanceof ApplicationException) {
      httpStatusCode = HttpStatus.BAD_REQUEST;
      code = exception.code;
      message = exception.message;
    }

    const responseBody = {
      code,
      message,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatusCode);
  }
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.log('catch http exception: ', exception);

    response
      .status(status)
      .json({
        code: String(status),
        message: exception.message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
  }
}