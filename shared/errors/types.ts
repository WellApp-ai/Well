// Centralized error types for all modules
export enum ErrorCode {
  // Validation Errors (400-499)
  INVALID_FILE_FORMAT = "INVALID_FILE_FORMAT",
  MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
  INVALID_CONFIGURATION = "INVALID_CONFIGURATION",
  UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION",

  // Authentication/Authorization (401-403)
  INVALID_API_KEY = "INVALID_API_KEY",
  INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",

  // Resource Errors (404-409)
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  STYLE_NOT_FOUND = "STYLE_NOT_FOUND",
  MODEL_NOT_FOUND = "MODEL_NOT_FOUND",

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

  // External Service Errors (500-503)
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
  NETWORK_TIMEOUT = "NETWORK_TIMEOUT",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Processing Errors (500)
  PROCESSING_FAILED = "PROCESSING_FAILED",
  GENERATION_FAILED = "GENERATION_FAILED",
  PARSING_FAILED = "PARSING_FAILED",
  VALIDATION_FAILED = "VALIDATION_FAILED",

  // System Errors (500)
  INTERNAL_ERROR = "INTERNAL_ERROR",
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  DEPENDENCY_ERROR = "DEPENDENCY_ERROR",
}

export interface ErrorContext {
  operation: string;
  module: "extractor" | "generator" | "fraud-detector";
  timestamp: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface RecoveryStrategy {
  type: "retry" | "fallback" | "manual" | "ignore";
  description: string;
  autoRetry?: boolean;
  maxRetries?: number;
  fallbackAction?: string;
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  context: ErrorContext;
  recovery: RecoveryStrategy;
  userMessage: string;
  technicalDetails?: string;
  relatedErrors?: ErrorCode[];
}
