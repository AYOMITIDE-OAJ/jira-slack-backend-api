import { Controller, Get, HttpStatus, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { JiraIssue } from './modules/jira/entities';
import { SlackMessage } from './modules/slack/entities';

@Controller()
export class AppController implements OnModuleInit {
  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
    @InjectRepository(JiraIssue)
    private jiraIssueRepository: Repository<JiraIssue>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @Get('patterns')
  async getPatterns() {
    const slackMessages = await this.slackMessageRepository
      .createQueryBuilder('message')
      .where('message.message LIKE :searchTerm', { searchTerm: '%JIRA-%' })
      .getMany();

    const jiraIssues = await this.jiraIssueRepository.find();

    const patterns = slackMessages.map((message) => {
      const mentionedIssues = message.message.match(/JIRA-\d+/g) || [];
      return {
        ...message,
        mentionedIssues: mentionedIssues.filter((issueId) =>
          jiraIssues.some((issue) => issue.issueId === issueId),
        ),
      };
    });

    return {
      data: patterns,
      message: 'Pattern fetched successfully',
      status: HttpStatus.OK,
    };
  }

  async onModuleInit() {
    try {
      await this.connection.query('SELECT 1'); // A simple query to check connection
      console.log('Database connection is successful.');
    } catch (error) {
      console.error('Database connection failed:', error);
    }
  }
}
