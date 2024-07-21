import { Controller, Get, HttpStatus } from '@nestjs/common';
import { JiraService } from './jira.service';

@Controller('jira')
export class JiraController {
  constructor(private readonly jiraService: JiraService) {}

  @Get('fetch')
  async fetchJiraIssues() {
    const res = await this.jiraService.fetchJiraIssues();

    return {
      data: res,
      message: 'Jira issues fetched and stored',
      status: HttpStatus.OK,
    };
  }
}
