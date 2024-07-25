import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JiraIssue } from '../jira/entities';
import { SlackMessage } from '../slack/entities';
import { jiraIssuesData } from './data/jira';
import { slackMessageData } from './data/slack';

@Injectable()
export class SeederService implements OnModuleInit {
  private logger = new Logger(SeederService.name);
  constructor(
    @InjectRepository(JiraIssue)
    private readonly jiraIssueRepo: Repository<JiraIssue>,
    @InjectRepository(SlackMessage)
    private readonly slackMessageRepo: Repository<SlackMessage>,
  ) {}

  async onModuleInit() {
    // COMMENTED OUT - because seeding process is done and the data is one-time
    await this.seedJiraIssues();
    await this.seedSlackMessages();
  }

  async seedJiraIssues() {
    this.logger.log('[SEEDING-JIRA] - processing');

    const seedPromises = jiraIssuesData.map(async (data) => {
      const existingMessage = await this.jiraIssueRepo.findOne({
        where: { id: data.id },
      });
      if (!existingMessage) {
        return this.jiraIssueRepo.save(data);
      }
    });

    await Promise.all(seedPromises);
    this.logger.log('[SEEDING-JIRA] - done');
  }

  async seedSlackMessages() {
    this.logger.log('[SEEDING-SLACK] - processing');

    const seedPromises = slackMessageData.map(async (data) => {
      const existingMessage = await this.slackMessageRepo.findOne({
        where: { ts: data.ts },
      });
      if (!existingMessage) {
        return this.slackMessageRepo.save(data);
      }
    });

    await Promise.all(seedPromises);

    this.logger.log('[SEEDING-SLACK] - done');
  }
}
