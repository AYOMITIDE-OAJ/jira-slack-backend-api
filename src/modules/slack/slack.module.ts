import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { SlackController } from './slack.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlackMessage } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([SlackMessage])],
  providers: [SlackService],
  controllers: [SlackController],
})
export class SlackModule {}
