import { Controller, Get, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JiraIssue } from './modules/jira/entities';
import { SlackMessage } from './modules/slack/entities';

@Controller()
export class AppController {
  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
    @InjectRepository(JiraIssue)
    private jiraIssueRepository: Repository<JiraIssue>,
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
}
