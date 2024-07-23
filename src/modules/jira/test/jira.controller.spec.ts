import { Test, TestingModule } from '@nestjs/testing';
import { JiraController } from '../jira.controller';
import { JiraService } from '../jira.service';
import { HttpStatus } from '@nestjs/common';

interface JiraIssue {
  issueId: number;
  summary: string;
  status: string;
  createdAt: Date;
}

describe('JiraController', () => {
  let controller: JiraController;
  let service: JiraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JiraController],
      providers: [
        {
          provide: JiraService,
          useValue: {
            fetchJiraIssues: jest.fn(),
            fetchAllJiraIssues: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JiraController>(JiraController);
    service = module.get<JiraService>(JiraService);
  });

  describe('fetchJiraIssues', () => {
    it('should return fetched Jira issues successfully', async () => {
      const mockIssues: JiraIssue[] = [
        {
          issueId: 1,
          summary: 'Issue 1',
          status: 'Open',
          createdAt: new Date(),
        },
      ];
      jest
        .spyOn(service, 'fetchJiraIssues')
        .mockResolvedValue(mockIssues as any);

      const result = await controller.fetchJiraIssues();

      expect(result).toEqual({
        data: mockIssues,
        message: 'Jira Issues Fetched And Stored Successfully.',
        status: HttpStatus.OK,
      });
    });
  });

  describe('getAllSlackMessages', () => {
    it('should return all Jira issues successfully', async () => {
      const mockIssues: JiraIssue[] = [
        {
          issueId: 2,
          summary: 'Issue 2',
          status: 'Closed',
          createdAt: new Date(),
        },
      ];
      jest
        .spyOn(service, 'fetchAllJiraIssues')
        .mockResolvedValue(mockIssues as any);

      const result = await controller.getAllSlackMessages();

      expect(result).toEqual({
        data: mockIssues,
        message: 'All Jira Issues Fetched Successfully',
        status: HttpStatus.OK,
      });
    });
  });
});
