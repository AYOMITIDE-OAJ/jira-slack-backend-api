import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as express from 'express';
import * as cors from 'cors';
import * as morgan from 'morgan';

import { AppModule } from './main.module';
import { ValidationPipe } from './common/pipes';
import { TransformInterceptor } from './common/interceptors';
import { HttpExceptionFilter } from './common/filters';
import { createDataSource } from './connection/data-source';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService>(ConfigService);
  const dataSource = createDataSource(configService);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('dev'));

  app.setGlobalPrefix('/api');

  // await dataSource.initialize();
  // await app.listen(configService.get<string>('PORT'));

  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');
    await app.listen(configService.get<string>('PORT'));
    console.log('Application is running on port 3000');
  } catch (error) {
    console.error('Error during Data Source initialization:', error);
  }
}
bootstrap();
