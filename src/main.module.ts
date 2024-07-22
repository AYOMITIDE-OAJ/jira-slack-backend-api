import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { SlackMessage } from './modules/slack/entities';
import { JiraIssue } from './modules/jira/entities';
import { JiraModule } from './modules/jira/jira.module';
import { SlackModule } from './modules/slack/slack.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { createDataSource } from './connection/data-source';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([SlackMessage, JiraIssue]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dataSource = createDataSource(configService);
        return dataSource.options;
      },
    }),
    JiraModule,
    SlackModule,
  ],
  providers: [],
  controllers: [AppController],
})
export class AppModule {}
