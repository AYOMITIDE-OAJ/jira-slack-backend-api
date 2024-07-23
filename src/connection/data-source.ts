// import { ConfigService } from '@nestjs/config';
// import { JiraIssue } from 'src/modules/jira/entities';
// import { SlackMessage } from 'src/modules/slack/entities';
// import { DataSource } from 'typeorm';

// export const createDataSource = (configService: ConfigService) => {
//   return new DataSource({
//     type: 'postgres',
//     host: configService.get<string>('DATABASE_HOST'),
//     port: configService.get<number>('DATABASE_PORT'),
//     username: configService.get<string>('DATABASE_USER'),
//     password: configService.get<string>('DATABASE_PASS'),
//     database: configService.get<string>('DATABASE_NAME'),
//     entities: [SlackMessage, JiraIssue],
//     synchronize: true,
//   });
// };

import { ConfigService } from '@nestjs/config';
import { JiraIssue } from 'src/modules/jira/entities';
import { SlackMessage } from 'src/modules/slack/entities';
import { DataSource } from 'typeorm';
import { URL } from 'url';

export const createDataSource = (configService: ConfigService) => {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  let typeOrmConfig: any = {
    type: 'postgres',
    entities: [SlackMessage, JiraIssue],
    synchronize: true,
  };

  if (databaseUrl) {
    const dbUrl = new URL(databaseUrl);
    typeOrmConfig = {
      ...typeOrmConfig,
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port, 10),
      username: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1), // Remove the leading slash
      ssl: {
        rejectUnauthorized: false, // Adjust based on your security needs
      },
    };
  } else {
    typeOrmConfig = {
      ...typeOrmConfig,
      host: configService.get<string>('DATABASE_HOST'),
      port: configService.get<number>('DATABASE_PORT'),
      username: configService.get<string>('DATABASE_USER'),
      password: configService.get<string>('DATABASE_PASS'),
      database: configService.get<string>('DATABASE_NAME'),
    };
  }

  return new DataSource(typeOrmConfig);
};
