import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
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

  @Get('fetch-messages')
  async getAllSlackMessages(@Query('text') text: string) {
    const res = await this.slackService.fetchAllSlackMessages(text);

    return {
      data: res,
      message: 'All Channels Fetched Successfully',
      status: HttpStatus.OK,
    };
  }

  @Post('messages/send')
  async sendMessageToSlackChannel(
    @Body('channelName') channelName: string,
    @Body('message') message: string,
  ) {
    const res = await this.slackService.sendMessageToSlackChannel(
      channelName,
      message,
    );

    return {
      data: res,
      message: 'Message Sent To Slack Channel Successfully',
      status: HttpStatus.OK,
    };
  }

  @Get('seed-slack-repo')
  async seedSlackMessages() {
    const res = await this.slackService.seedSlackMessages();

    return {
      data: res,
      message: 'Slack Repo Seeded Successfully',
      status: HttpStatus.OK,
    };
  }
}
