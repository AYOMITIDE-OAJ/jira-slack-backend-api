import axios from 'axios';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { SlackMessage } from './entities';
import { ErrorHelper } from 'src/helpers/error.utils';

@Injectable()
export class SlackService {
  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
  ) {}

  async fetchSlackMessages() {
    try {
      const response = await axios.get(
        'https://slack.com/api/conversations.history',
        {
          headers: { Authorization: `Bearer ${process.env.SLACK_API_TOKEN}` },
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
