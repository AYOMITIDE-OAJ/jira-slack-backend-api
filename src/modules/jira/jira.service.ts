import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JiraIssue } from './entities';
import { Repository } from 'typeorm';

@Injectable()
export class JiraService {
  constructor(
    @InjectRepository(JiraIssue)
    private readonly jiraIssueRepository: Repository<JiraIssue>,
  ) {}
}
