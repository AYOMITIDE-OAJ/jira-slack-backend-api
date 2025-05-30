import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

import { InjectRepository } from '@nestjs/typeorm';
import { SlackMessage } from './entities';
import { ErrorHelper } from 'src/helpers/error.utils';
import { slackMessageData } from '../seed/data/slack';

@Injectable()
export class SlackService {
  private logger = new Logger(SlackService.name);
  private slackApiToken = this.configService.get<string>('SLACK_API_TOKEN');
  private slackBaseUrl = 'https://slack.com/api';

  constructor(
    @InjectRepository(SlackMessage)
    private slackMessageRepository: Repository<SlackMessage>,
    private configService: ConfigService,
  ) {}

  async fetchAllChannels(): Promise<void> {
    try {
      const response = await axios.get(
        `${this.slackBaseUrl}/conversations.list`,
        {
          headers: { Authorization: `Bearer ${this.slackApiToken}` },
        },
      );

      if (!response.data.ok) {
        ErrorHelper.BadRequestException(response.data.error);
      }

      const channels = response.data.channels;
      const channelNames = channels.map((channel) => channel.name);

      return channelNames;
    } catch (error) {
      this.logger.error('Error fetching channels:', error);
    }
  }

  private async getChannelId(channelName: string): Promise<string> {
    const response = await axios.get(
      `${this.slackBaseUrl}/conversations.list`,
      {
        headers: { Authorization: `Bearer ${this.slackApiToken}` },
      },
    );

    if (!response.data.ok) {
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



  async fetchSlackMessages(channelName: string): Promise<void> {
    const channelId = await this.getChannelId(channelName);
    let hasMore = true;
    let cursor: string | undefined;

    while (hasMore) {
      try {
        const response = await axios.get(
          `${this.slackBaseUrl}/conversations.history`,
          {
            headers: { Authorization: `Bearer ${this.slackApiToken}` },
            params: {
              channel: channelId,
              cursor,
            },
          },
        );

        const messages = response.data.messages;
        hasMore = response.data.has_more;
        cursor = response.data.response_metadata?.next_cursor;

        for (const message of messages) {
          // Check if the message already exists in the database
          const existingMessage = await this.slackMessageRepository.findOne({
            where: {
              user: message.user,
              ts: message.ts,
            },
          });

          if (!existingMessage) {
            const slackMessage = this.slackMessageRepository.create({
              type: message.type,
              user: message.user,
              text: message.text,
              ts: message.ts,
              channel: message.channel,
            });
            await this.slackMessageRepository.save(slackMessage);
          } else {
            this.logger.log(
              `Message already exists in the database: USERID: ${message.user}`,
              message.text,
            );
          }
        }
      } catch (error) {
        this.logger.error('Failed to fetch Slack messages', error.stack);
        ErrorHelper.BadRequestException('Failed to fetch Slack messages');
      }
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES) // ensuring slack messages syncs every 5 minutes interval
  async handleCronSyncSlackMessages() {
    // log to validate cron-job is asynchronously pulling slack activites into database
    this.logger.log('[handleCronSyncSlackMessages]:: TRIGGERED');

    // channel name - random | general etc
    // await this.fetchSlackMessages('random');
  }

  async fetchAllSlackMessages(text?: string) {
    try {
      const query = this.slackMessageRepository.createQueryBuilder('message');

      // Apply search filter for text
      if (text) {
        query.andWhere('message.text LIKE :text', {
          text: `%${text}%`,
        });
      }

      return await query.getMany();
    } catch (error) {
      this.logger.log(error);
      ErrorHelper.BadRequestException(error);
    }
  }

  // handler to enable dashboard default user send message to slack channel via dashboard API
  async sendMessageToSlackChannel(
    channelName: string,
    message: string,
  ): Promise<void> {
    try {
      const channelId = await this.getChannelId(channelName);

      const response = await axios.post(
        `${this.slackBaseUrl}/chat.postMessage`,
        {
          channel: channelId,
          text: message,
        },
        {
          headers: { Authorization: `Bearer ${this.slackApiToken}` },
        },
      );

      if (!response.data.ok) {
        ErrorHelper.BadRequestException(response.data.error);
      }
      this.logger.log('Message sent successfully:', response.data.message.text);
      await this.fetchSlackMessages('random'); // can be made flexible

      return response.data;
    } catch (error) {
      this.logger.error('Error sending message to Slack:', error);
      throw error;
    }
  }

  async seedSlackMessages() {
    this.logger.log('[SEEDING-SLACK] - processing');

    const batchSize = 100; // Define your batch size
    for (let i = 0; i < slackMessageData.length; i += batchSize) {
      const batch = slackMessageData.slice(i, i + batchSize);

      const seedPromises = batch.map(async (data) => {
        const existingMessage = await this.slackMessageRepository.findOne({
          where: { ts: data.ts },
        });
        if (!existingMessage) {
          return this.slackMessageRepository.save(data);
        }
      });

      await Promise.all(seedPromises); // Process the batch concurrently
      this.logger.log('[SEEDING-SLACK] - processing...');
    }

    this.logger.log('[SEEDING-SLACK] - done');
  }
}
