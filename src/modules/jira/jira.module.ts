import { Module } from '@nestjs/common';
import { JiraController } from './jira.controller';
import { JiraService } from './jira.service';
import { JiraIssue } from './entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([JiraIssue])],
  controllers: [JiraController],
  providers: [JiraService],
})
export class JiraModule {}
