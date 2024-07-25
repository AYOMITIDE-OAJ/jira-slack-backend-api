import { Controller, Get, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JiraIssue } from './modules/jira/entities';
import { SlackMessage } from './modules/slack/entities';

@Controller('jira-slack/')
export class AppController {
  private logger = new Logger(AppController.name);
  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
    @InjectRepository(JiraIssue)
    private jiraIssueRepository: Repository<JiraIssue>,
  ) {}

  @Get('analytic-patterns')
  async getPatterns() {
    // Fetch all Jira issues & slack messages
    const jiraIssues = await this.jiraIssueRepository.find();
    const slackMsgs = await this.slackMessageRepository.find();

    // Initialize a map to keep track of issue mentions
    const issueMentionCount = new Map<string, number>();

    // Map Slack messages to find mentioned Jira issues by summary
    const patterns = slackMsgs.map((message) => {
      const mentionedIssues = jiraIssues.filter((issue) =>
        message.text.toLowerCase().includes(issue.summary.toLowerCase()),
      );

      // Increment mention count for each mentioned issue
      mentionedIssues.forEach((issue) => {
        const count = issueMentionCount.get(issue.summary) || 0;
        issueMentionCount.set(issue.summary, count + 1);
      });

      return {
        ...message,
        mentionedIssues: mentionedIssues.map((issue) => issue.summary),
      };
    });

    // Convert the map to an array for easier use in a chart
    const issueMentionData = Array.from(issueMentionCount.entries()).map(
      ([issue, count]) => ({
        issue,
        count,
      }),
    );

    this.logger.log('patterns', patterns);
    this.logger.log('issueMentionData', issueMentionData);

    // Return structured response with detailed analytics
    return {
      data: {
        patterns,
        issueMentionData,
      },
      message: 'Pattern fetched successfully',
      status: HttpStatus.OK,
    };
  }
}
