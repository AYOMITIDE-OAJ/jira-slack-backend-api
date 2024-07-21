import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JiraIssue } from './entities';
import { Repository } from 'typeorm';
import { ErrorHelper } from 'src/helpers/error.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JiraService {
  constructor(
    @InjectRepository(JiraIssue)
    private readonly jiraIssueRepository: Repository<JiraIssue>,
    private configService: ConfigService,
  ) {}

  async fetchJiraIssues() {
    const jiraEmail = this.configService.get<string>('JIRA_EMAIL');
    const jiraApiToken = this.configService.get<string>('JIRA_API_TOKEN');

    try {
      const response = await axios.get(
        'https://your-domain.atlassian.net/rest/api/2/search',
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`,
          },
        },
      );

      const issues = response.data.issues;

      for (const issue of issues) {
        const jiraIssue = this.jiraIssueRepository.create({
          issueId: issue.id,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          createdAt: new Date(issue.fields.created),
        });
        await this.jiraIssueRepository.save(jiraIssue);
      }
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }
}
