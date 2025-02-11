// lib/utils/__tests__/errorHandler.test.ts

import {
  APIError,
  NetworkError,
  ValidationError,
  withRetry,
  formatErrorResponse,
  logError,
} from '../errorHandler';

describe('Error Classes', () => {
  describe('APIError', () => {
    it('should create an APIError with correct properties', () => {
      const error = new APIError('API Failed', 500, true);
      expect(error.message).toBe('API Failed');
      expect(error.statusCode).toBe(500);
      expect(error.isRetryable).toBe(true);
      expect(error.name).toBe('APIError');
    });
  });

  describe('NetworkError', () => {
    it('should create a NetworkError with correct properties', () => {
      const error = new NetworkError('Network Failed');
      expect(error.message).toBe('Network Failed');
      expect(error.name).toBe('NetworkError');
    });
  });

  describe('ValidationError', () => {
    it('should create a ValidationError with correct properties', () => {
      const error = new ValidationError('Validation Failed');
      expect(error.message).toBe('Validation Failed');
      expect(error.name).toBe('ValidationError');
    });
  });
});

describe('withRetry', () => {
  it('should return successful operation result without retrying', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    const result = await withRetry(operation);
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry failed operation up to maxRetries times', async () => {
    const operation = jest.fn()
      .mockRejectedValueOnce(new Error('Attempt 1'))
      .mockRejectedValueOnce(new Error('Attempt 2'))
      .mockResolvedValue('success');

    const result = await withRetry(operation, { 
      maxRetries: 3,
      initialDelay: 100,
      maxDelay: 200,
    });

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should not retry on ValidationError', async () => {
    const operation = jest.fn().mockRejectedValue(new ValidationError('Invalid'));
    
    await expect(withRetry(operation)).rejects.toThrow('Invalid');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should not retry on non-retryable APIError', async () => {
    const operation = jest.fn().mockRejectedValue(
      new APIError('Not Found', 404, false)
    );
    
    await expect(withRetry(operation)).rejects.toThrow('Not Found');
    expect(operation).toHaveBeenCalledTimes(1);
  });
});

describe('formatErrorResponse', () => {
  it('should format APIError correctly', () => {
    const error = new APIError('API Failed', 500, true);
    const formatted = formatErrorResponse(error);
    expect(formatted).toEqual({
      error: {
        message: 'API Failed',
        statusCode: 500,
        type: 'api_error',
      },
    });
  });

  it('should format NetworkError correctly', () => {
    const error = new NetworkError('Network Failed');
    const formatted = formatErrorResponse(error);
    expect(formatted).toEqual({
      error: {
        message: 'Network Failed',
        type: 'network_error',
      },
    });
  });

  it('should format ValidationError correctly', () => {
    const error = new ValidationError('Validation Failed');
    const formatted = formatErrorResponse(error);
    expect(formatted).toEqual({
      error: {
        message: 'Validation Failed',
        type: 'validation_error',
      },
    });
  });

  it('should format unknown error correctly', () => {
    const error = new Error('Unknown Error');
    const formatted = formatErrorResponse(error);
    expect(formatted).toEqual({
      error: {
        message: 'Unknown Error',
        type: 'unknown_error',
      },
    });
  });

  it('should handle non-Error objects', () => {
    const formatted = formatErrorResponse('string error');
    expect(formatted).toEqual({
      error: {
        message: 'An unknown error occurred',
        type: 'unknown_error',
      },
    });
  });
});

describe('logError', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should log error with context', () => {
    const error = new APIError('Test Error', 500);
    const context = { service: 'test' };
    
    logError(error, context);
    
    const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(loggedData.error.message).toBe('Test Error');
    expect(loggedData.error.type).toBe('api_error');
    expect(loggedData.context).toEqual(context);
    expect(loggedData.timestamp).toBeDefined();
  });

  it('should log error without context', () => {
    const error = new Error('Simple Error');
    
    logError(error);
    
    const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(loggedData.error.message).toBe('Simple Error');
    expect(loggedData.error.type).toBe('unknown_error');
    expect(loggedData.context).toEqual({});
    expect(loggedData.timestamp).toBeDefined();
  });
}); 