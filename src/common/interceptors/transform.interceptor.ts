import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { map, Observable } from 'rxjs';
import { IResponse } from 'src/interfaces';

export const responseMapper = (response: IResponse<any>) => ({
  data: response.data,
  status: response.status,
  message: response.message,
});

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, IResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, ip, url } = request;
    const timestamp = new Date().toISOString();

    Logger.log(`info ${timestamp} ip: ${ip} method: ${method} url: ${url}`);

    return next.handle().pipe(map(responseMapper));
  }
}
