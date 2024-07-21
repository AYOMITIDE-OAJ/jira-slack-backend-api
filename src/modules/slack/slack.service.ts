import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { SlackMessage } from './entities';
import { ErrorHelper } from 'src/helpers/error.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SlackService {
  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
    private configService: ConfigService,
  ) {}

  async fetchSlackMessages() {
    const slackApiToken = this.configService.get<string>('SLACK_API_TOKEN');

    try {
      const response = await axios.get(
        'https://slack.com/api/conversations.history',
        {
          headers: { Authorization: `Bearer ${slackApiToken}` },
        },
      );

      const messages = response.data.messages;

      for (const message of messages) {
        const slackMessage = this.slackMessageRepository.create({
          userId: message.user,
          message: message.text,
          timestamp: new Date(parseFloat(message.ts) * 1000),
        });
        await this.slackMessageRepository.save(slackMessage);
      }
    } catch (error) {
      ErrorHelper.BadRequestException(error);
    }
  }
}
