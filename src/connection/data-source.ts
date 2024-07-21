import { ConfigService } from '@nestjs/config';
import { JiraIssue } from 'src/modules/jira/entities';
import { SlackMessage } from 'src/modules/slack/entities';
import { DataSource } from 'typeorm';

export const createDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get<string>('DATABASE_USER'),
    password: configService.get<string>('DATABASE_PASS'),
    database: configService.get<string>('DATABASE_NAME'),
    entities: [SlackMessage, JiraIssue],
    synchronize: true,
  });
};
