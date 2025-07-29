import {
  ErrorCode,
  ErrorDetails,
  ErrorContext,
  RecoveryStrategy,
} from "./types.js";

export abstract class BaseError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly context: ErrorContext;
  public readonly recovery: RecoveryStrategy;
  public readonly userMessage: string;
  public readonly technicalDetails?: string;
  public readonly timestamp: string;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = this.constructor.name;
    this.code = details.code;
    this.statusCode = details.statusCode;
    this.context = details.context;
    this.recovery = details.recovery;
    this.userMessage = details.userMessage;
    this.technicalDetails = details.technicalDetails;
    this.timestamp = new Date().toISOString();

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.userMessage,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        context: this.context,
        recovery: this.recovery,
        technicalDetails: this.technicalDetails,
      },
    };
  }
}

// Specific error classes
export class ValidationError extends BaseError {
  constructor(
    message: string,
    context: ErrorContext,
    technicalDetails?: string
  ) {
    super({
      code: ErrorCode.INVALID_CONFIGURATION,
      message,
      statusCode: 400,
      context,
      recovery: {
        type: "manual",
        description: "Please check your input parameters and try again",
      },
      userMessage: message,
      technicalDetails,
    });
  }
}

export class AIServiceError extends BaseError {
  constructor(
    provider: string,
    model: string,
    originalError: string,
    context: ErrorContext
  ) {
    const message = `AI service error from ${provider}:${model}`;
    super({
      code: ErrorCode.AI_SERVICE_ERROR,
      message,
      statusCode: 502,
      context,
      recovery: {
        type: "retry",
        description: "Retry the request or try a different AI provider",
        autoRetry: true,
        maxRetries: 3,
        fallbackAction: "Switch to alternative AI provider",
      },
      userMessage: "AI service is temporarily unavailable. Please try again.",
      technicalDetails: originalError,
    });
  }
}

export class ProcessingError extends BaseError {
  constructor(
    operation: string,
    context: ErrorContext,
    technicalDetails?: string
  ) {
    super({
      code: ErrorCode.PROCESSING_FAILED,
      message: `Processing failed during ${operation}`,
      statusCode: 500,
      context,
      recovery: {
        type: "retry",
        description:
          "Retry the operation or contact support if the issue persists",
        autoRetry: false,
        maxRetries: 1,
      },
      userMessage: `Failed to process ${operation}. Please try again.`,
      technicalDetails,
    });
  }
}
