import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { JiraIssue } from './entities';
import { Repository } from 'typeorm';
import { ErrorHelper } from 'src/helpers/error.utils';
import { ConfigService } from '@nestjs/config';
import { jiraIssuesData } from '../seed/data/jira';

@Injectable()
export class JiraService {
  private logger = new Logger(JiraService.name);

  constructor(
    @InjectRepository(JiraIssue)
    private readonly jiraIssueRepository: Repository<JiraIssue>,
    private configService: ConfigService,
  ) {}

  async fetchAllJiraIssues(summary?: string) {
    try {
      const query = this.jiraIssueRepository.createQueryBuilder('issue');

      // Apply search filter for summary
      if (summary) {
        query.andWhere('issue.summary LIKE :summary', {
          summary: `%${summary}%`,
        });
      }

      return await query.getMany();
    } catch (error) {
      this.logger.log(error);
      ErrorHelper.BadRequestException(error);
    }
  }

  async fetchJiraIssues() {
    const jiraEmail = this.configService.get<string>('JIRA_EMAIL');
    const jiraApiToken = this.configService.get<string>('JIRA_API_TOKEN');
    const jiraDomain = this.configService.get<string>('JIRA_DOMAIN');

    try {
      const response = await axios.get(
        `https://${jiraDomain}/rest/api/2/search`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${jiraEmail}:${jiraApiToken}`).toString('base64')}`,
          },
        },
      );

      const issues = response.data.issues;

      // return issues;

      for (const issue of issues) {
        this.logger.log('issues', issues);
        // Check if the issue already exists in the database
        const existingIssue = await this.jiraIssueRepository.findOne({
          where: { id: issue.id },
        });

        if (!existingIssue) {
          const jiraIssue = this.jiraIssueRepository.create({
            id: issue.id,
            created: new Date(issue.fields.created),
            updated: new Date(issue.fields.updated),
            status: { name: issue.fields.status.name },
            assignee: {
              displayName: issue.fields.assignee.displayName,
              emailAddress: issue.fields.assignee.emailAddress,
            },
            priority: { name: issue.fields.priority.name },
            summary: issue.fields.summary,
          });

          await this.jiraIssueRepository.save(jiraIssue);
          return jiraIssue;
        } else {
          this.logger.log('Issue already exists:', existingIssue.summary);
        }
      }
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }

  async seedJiraIssues() {
    this.logger.log('[SEEDING-JIRA] - processing');

    const batchSize = 100; // Define your batch size

    for (let i = 0; i < jiraIssuesData.length; i += batchSize) {
      const batch = jiraIssuesData.slice(i, i + batchSize);

      const seedPromises = batch.map(async (data) => {
        const existingIssue = await this.jiraIssueRepository.findOne({
          where: { id: data.id },
        });
        if (!existingIssue) {
          return this.jiraIssueRepository.save(data);
        }
      });

      await Promise.all(seedPromises); // Process the batch concurrently
    }

    this.logger.log('[SEEDING-JIRA] - done');
  }
}
