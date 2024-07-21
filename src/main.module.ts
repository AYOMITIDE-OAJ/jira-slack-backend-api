import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackMessage } from './modules/slack/entities';
import { JiraIssue } from './modules/jira/entities';
import { JiraModule } from './modules/jira/jira.module';
import { SlackModule } from './modules/slack/slack.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'your_user',
      password: 'your_password',
      database: 'data_integration',
      entities: [SlackMessage, JiraIssue],
      synchronize: true,
    }),
    JiraModule,
    SlackModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
