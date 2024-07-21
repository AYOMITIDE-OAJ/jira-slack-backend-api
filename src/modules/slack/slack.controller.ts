import { Controller, Get, HttpStatus } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get('fetch')
  async fetchSlackMessages() {
    const res = await this.slackService.fetchSlackMessages();

    return {
      data: res,
      message: 'Slack messages fetched and stored',
      status: HttpStatus.OK,
    };
  }
}
