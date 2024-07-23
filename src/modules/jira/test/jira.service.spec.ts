import { Test, TestingModule } from '@nestjs/testing';
import { JiraService } from '../jira.service';
import { Repository } from 'typeorm';
import { JiraIssue } from '../entities';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ErrorHelper } from 'src/helpers/error.utils';

jest.mock('axios');
jest.mock('src/helpers/error.utils');

describe('JiraService', () => {
  let service: JiraService;
  let repository: Repository<JiraIssue>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JiraService,
        {
          provide: Repository,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JiraService>(JiraService);
    repository = module.get<Repository<JiraIssue>>(Repository);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('fetchJiraIssues', () => {
    it('should fetch and store Jira issues', async () => {
      const mockIssues = [
        {
          id: 1,
          fields: {
            summary: 'Issue 1',
            status: { name: 'Open' },
            created: '2024-01-01T00:00:00Z',
          },
        },
      ];

      (axios.get as jest.Mock).mockResolvedValue({
        data: { issues: mockIssues },
      });
      (configService.get as jest.Mock).mockImplementation((key) => {
        const config = {
          JIRA_EMAIL: 'test@example.com',
          JIRA_API_TOKEN: 'token',
          JIRA_DOMAIN: 'test.atlassian.net',
        };
        return config[key];
      });

      const existingIssue = undefined;
      (repository.findOne as jest.Mock).mockResolvedValue(existingIssue);
      (repository.create as jest.Mock).mockReturnValue(mockIssues[0]);
      (repository.save as jest.Mock).mockResolvedValue(mockIssues[0]);

      const result = await service.fetchJiraIssues();

      expect(result).toEqual([
        {
          issueId: 1,
          summary: 'Issue 1',
          status: 'Open',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
      ]);
      expect(axios.get).toHaveBeenCalledWith(
        'https://test.atlassian.net/rest/api/2/search',
        expect.objectContaining({
          params: { startAt: 0, maxResults: 100 },
        }),
      );
    });

    it('should handle errors and call ErrorHelper.BadRequestException', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const errorHelperSpy = jest.spyOn(ErrorHelper, 'BadRequestException');

      await expect(service.fetchJiraIssues()).rejects.toThrow('Network error');
      expect(errorHelperSpy).toHaveBeenCalled();
    });
  });

  describe('fetchAllJiraIssues', () => {
    it('should return all Jira issues from the repository', async () => {
      const mockIssues = [
        {
          issueId: 1,
          summary: 'Issue 1',
          status: 'Open',
          createdAt: new Date('2024-01-01T00:00:00Z'),
        },
      ];
      (repository.find as jest.Mock).mockResolvedValue(mockIssues);

      const result = await service.fetchAllJiraIssues();

      expect(result).toEqual(mockIssues);
    });
  });
});
