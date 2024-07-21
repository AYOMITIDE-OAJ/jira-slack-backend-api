import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { SlackService } from './slack.service';

@Controller('slack')
export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  @Get('fetch/:channelName')
  async fetchSlackMessages(@Param('channelName') channelName: string) {
    const res = await this.slackService.fetchSlackMessages(channelName);

    return {
      data: res,
      message: 'Slack messages fetched and stored',
      status: HttpStatus.OK,
    };
  }

  @Get('fetch-channels')
  async fetchAllChannels() {
    const res = await this.slackService.fetchAllChannels();

    return {
      data: res,
      message: 'All Channels Fetched Successfully',
      status: HttpStatus.OK,
    };
  }
}
