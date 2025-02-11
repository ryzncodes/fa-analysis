/**
 * Custom error types for better error handling
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  factor: 2, // exponential factor
};

/**
 * Implements exponential backoff retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...defaultRetryOptions, ...options };
  console.log('withRetry: Starting with config:', config);

  try {
    console.log('withRetry: Attempting first operation');
    return await operation();
  } catch (error) {
    console.log('withRetry: Initial attempt failed, checking error type:', error);
    console.log('withRetry: Error instanceof ValidationError:', error instanceof ValidationError);
    console.log('withRetry: Error instanceof APIError:', error instanceof APIError);

    // Don't retry if it's a validation error or explicitly non-retryable
    if (
      error instanceof ValidationError ||
      (error instanceof APIError && !error.isRetryable)
    ) {
      console.log('withRetry: Error is non-retryable, throwing immediately');
      throw error;
    }

    // For retryable errors, implement retry logic
    let lastError = error;
    let delay = config.initialDelay;

    for (let attempt = 1; attempt <= config.maxRetries - 1; attempt++) {
      console.log(`withRetry: Starting retry attempt ${attempt} of ${config.maxRetries - 1}`);
      try {
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`withRetry: Executing retry attempt ${attempt}`);
        return await operation();
      } catch (retryError) {
        console.log(`withRetry: Retry attempt ${attempt} failed:`, retryError);
        lastError = retryError;
        delay = Math.min(delay * config.factor, config.maxDelay);
      }
    }

    console.log('withRetry: All retry attempts failed, throwing last error');
    throw lastError;
  }
}

/**
 * Format error for client response
 */
export function formatErrorResponse(error: unknown) {
  console.log('formatErrorResponse: Processing error:', error);
  console.log('formatErrorResponse: Error type:', error?.constructor?.name);
  console.log('formatErrorResponse: Error instanceof Error:', error instanceof Error);

  if (error instanceof Error) {
    console.log('formatErrorResponse: Error name:', error.name);

    // Check for specific error types
    if (error.constructor === APIError) {
      console.log('formatErrorResponse: Identified as APIError');
      const apiError = error as APIError;
      return {
        error: {
          message: apiError.message,
          statusCode: apiError.statusCode,
          type: 'api_error',
        },
      };
    }

    if (error.constructor === NetworkError) {
      console.log('formatErrorResponse: Identified as NetworkError');
      const networkError = error as NetworkError;
      return {
        error: {
          message: networkError.message,
          type: 'network_error',
        },
      };
    }

    if (error.constructor === ValidationError) {
      console.log('formatErrorResponse: Identified as ValidationError');
      const validationError = error as ValidationError;
      return {
        error: {
          message: validationError.message,
          type: 'validation_error',
        },
      };
    }

    console.log('formatErrorResponse: Treating as unknown error');
    return {
      error: {
        message: error.message,
        type: 'unknown_error',
      },
    };
  }

  // Non-Error object
  return {
    error: {
      message: 'An unknown error occurred',
      type: 'unknown_error',
    },
  };
}

/**
 * Log error with additional context
 */
export function logError(error: unknown, context: Record<string, unknown> = {}) {
  console.log('logError: Starting error logging');
  console.log('logError: Error type:', error?.constructor?.name);
  console.log('logError: Context:', context);
  
  const errorResponse = formatErrorResponse(error);
  const errorInfo = {
    timestamp: new Date().toISOString(),
    ...errorResponse,
    context,
  };

  console.error(JSON.stringify(errorInfo, null, 2));
} 