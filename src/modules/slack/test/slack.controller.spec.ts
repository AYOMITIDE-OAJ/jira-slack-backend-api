import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { SlackController } from '../slack.controller';
import { SlackService } from '../slack.service';

describe('SlackController', () => {
  let controller: SlackController;
  let service: SlackService;

  const mockSlackService = {
    fetchSlackMessages: jest
      .fn()
      .mockResolvedValue('mocked fetchSlackMessages response'),
    fetchAllChannels: jest
      .fn()
      .mockResolvedValue('mocked fetchAllChannels response'),
    fetchAllSlackMessages: jest
      .fn()
      .mockResolvedValue('mocked fetchAllSlackMessages response'),
    sendMessageToSlackChannel: jest
      .fn()
      .mockResolvedValue('mocked sendMessageToSlackChannel response'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SlackController],
      providers: [
        {
          provide: SlackService,
          useValue: mockSlackService,
        },
      ],
    }).compile();

    controller = module.get<SlackController>(SlackController);
    service = module.get<SlackService>(SlackService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should fetch Slack messages and store them', async () => {
    const result = await controller.fetchSlackMessages('channelName');
    expect(service.fetchSlackMessages).toHaveBeenCalledWith('channelName');
    expect(result).toEqual({
      data: 'mocked fetchSlackMessages response',
      message: 'Slack messages fetched and stored',
      status: HttpStatus.OK,
    });
  });

  it('should fetch all Slack channels', async () => {
    const result = await controller.fetchAllChannels();
    expect(service.fetchAllChannels).toHaveBeenCalled();
    expect(result).toEqual({
      data: 'mocked fetchAllChannels response',
      message: 'All Channels Fetched Successfully',
      status: HttpStatus.OK,
    });
  });

  it('should send a message to a Slack channel', async () => {
    const result = await controller.sendMessageToSlackChannel(
      'channelName',
      'message',
    );
    expect(service.sendMessageToSlackChannel).toHaveBeenCalledWith(
      'channelName',
      'message',
    );
    expect(result).toEqual({
      data: 'mocked sendMessageToSlackChannel response',
      message: 'Message Sent To Slack Channel Successfully',
      status: HttpStatus.OK,
    });
  });
});
