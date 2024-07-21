import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { AppModule } from './main.module';
import { ValidationPipe } from './common/pipes';
import { TransformInterceptor } from './common/interceptors';
import { HttpExceptionFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService>(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.setGlobalPrefix('/api');

  await app.listen(configService.get<string>('PORT'));
}
bootstrap();
