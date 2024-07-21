import { Test, TestingModule } from '@nestjs/testing';
import { Observable } from 'rxjs';
import { TransformInterceptor, responseMapper } from '.';

const mockHttpArgumentsHost = jest.fn().mockImplementation(() => ({
  getRequest: jest.fn().mockResolvedValue({
    method: 'GET',
    ip: '::1',
    url: '/users',
  }),
}));

const mockArgumentsHost = {
  getClass: jest.fn(),
  getHandler: jest.fn(),
  switchToHttp: mockHttpArgumentsHost,
  getArgByIndex: jest.fn(),
  getArgs: jest.fn(),
  getType: jest.fn(),
  switchToRpc: jest.fn(),
  switchToWs: jest.fn(),
};

const mockPipe = jest.fn().mockImplementation(
  () =>
    new Observable((observer) => {
      observer.next({
        data: {
          id: 1,
          name: 'John Doe',
        },
        status: 200,
        message: 'OK',
      });
      observer.complete();
    }),
);

const mockNext = {
  handle: jest.fn().mockImplementation(() => ({
    pipe: mockPipe,
  })),
};

describe('Bad Request Exception Filter', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransformInterceptor],
    }).compile();

    interceptor = module.get(TransformInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform a request response', () => {
    const result = interceptor.intercept(mockArgumentsHost, mockNext);
    expect(mockNext.handle).toBeCalled();
    expect(mockPipe).toBeCalledWith(expect.any(Function));
    result
      .subscribe((res) => {
        expect(res.data).toBeDefined();
        expect(res.status).toBe(200);
        expect(res.message).toBe('OK');

        expect(responseMapper(res)).toStrictEqual(res);
      })
      .unsubscribe();
    expect(result).toBeInstanceOf(Observable);
  });
});
