import axios from 'axios';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { SlackMessage } from './entities';
import { ErrorHelper } from 'src/helpers/error.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SlackService {
  private logger = new Logger(SlackService.name);
  private slackApiToken = this.configService.get<string>('SLACK_API_TOKEN');

  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
    private configService: ConfigService,
  ) {}

  async fetchAllChannels(): Promise<void> {
    try {
      const response = await axios.get(
        'https://slack.com/api/conversations.list',
        {
          headers: { Authorization: `Bearer ${this.slackApiToken}` },
        },
      );

      if (!response.data.ok) {
        this.logger.error(`[conversations.list] error: ${response.data.error}`);
        ErrorHelper.BadRequestException(response.data.error);
      }

      const channels = response.data.channels;
      const channelNames = channels.map((channel) => channel.name);

      this.logger.log('Channels:', channelNames);

      return channelNames;
    } catch (error) {
      this.logger.error('Error fetching channels:', error);
    }
  }

  private async getChannelId(channelName: string): Promise<string> {
    const response = await axios.get(
      'https://slack.com/api/conversations.list',
      {
        headers: { Authorization: `Bearer ${this.slackApiToken}` },
      },
    );

    if (!response.data.ok) {
      this.logger.error(`[conversations.list] error: ${response.data.error}`);
      ErrorHelper.BadRequestException(response.data.error);
    }

    const channel = response.data.channels.find(
      (ch) => ch.name === channelName,
    );

    if (!channel) {
      ErrorHelper.NotFoundException(`Channel ${channelName} not found`);
    }

    return channel.id;
  }

  async fetchSlackMessages(channelName: string) {
    const channelId = await this.getChannelId(channelName);
    this.logger.log('[channelId]:', channelId);

    try {
      const response = await axios.get(
        'https://slack.com/api/conversations.history',
        {
          headers: { Authorization: `Bearer ${this.slackApiToken}` },
          params: { channel: channelId },
        },
      );

      this.logger.log('[response]:', response.data);

      const messages = response.data.messages;

      for (const message of messages) {
        const slackMessage = this.slackMessageRepository.create({
          userId: message.user,
          message: message.text,
          timestamp: new Date(parseFloat(message.ts) * 1000),
        });
        const savedMsg = await this.slackMessageRepository.save(slackMessage);
        this.logger.log('savedMessg', savedMsg.message);
      }
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }

  async fetchAllSlackMessages(): Promise<SlackMessage[]> {
    return await this.slackMessageRepository.find({});
  }
}
