import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackMessage } from './modules/slack/entities';
import { JiraIssue } from './modules/jira/entities';
import { JiraModule } from './modules/jira/jira.module';
import { SlackModule } from './modules/slack/slack.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASS'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [SlackMessage, JiraIssue],
        synchronize: true,
      }),
    }),
    JiraModule,
    SlackModule,
  ],
  providers: [],
  controllers: [AppController],
})
export class AppModule {}
