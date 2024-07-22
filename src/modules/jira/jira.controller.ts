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
      message: 'Jira Issues Fetched And Stored Successfully.',
      status: HttpStatus.OK,
    };
  }

  @Get('issues')
  async getAllSlackMessages() {
    const res = await this.jiraService.fetchAllJiraIssues();

    return {
      data: res,
      message: 'All Jira Issues Fetched Successfully',
      status: HttpStatus.OK,
    };
  }
}
