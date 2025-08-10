"""Centralized error handling for receipt generator"""
from enum import Enum
from typing import Dict, Any, Optional, List
from datetime import datetime
from fastapi import HTTPException
import json

class ErrorCode(str, Enum):
    # Validation Errors
    INVALID_STYLE = "INVALID_STYLE"
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD"
    INVALID_CONFIGURATION = "INVALID_CONFIGURATION"
    
    # Resource Errors
    STYLE_NOT_FOUND = "STYLE_NOT_FOUND"
    
    # Processing Errors
    GENERATION_FAILED = "GENERATION_FAILED"
    PARSING_FAILED = "PARSING_FAILED"
    VALIDATION_FAILED = "VALIDATION_FAILED"
    
    # External Service Errors
    AI_SERVICE_ERROR = "AI_SERVICE_ERROR"
    
    # System Errors
    INTERNAL_ERROR = "INTERNAL_ERROR"

class RecoveryStrategy:
    def __init__(self, 
                 strategy_type: str,
                 description: str,
                 auto_retry: bool = False,
                 max_retries: int = 0,
                 fallback_action: Optional[str] = None):
        self.type = strategy_type
        self.description = description
        self.auto_retry = auto_retry
        self.max_retries = max_retries
        self.fallback_action = fallback_action

class ReceiptGeneratorError(Exception):
    def __init__(self,
                 code: ErrorCode,
                 message: str,
                 status_code: int,
                 operation: str,
                 recovery: RecoveryStrategy,
                 user_message: str,
                 technical_details: Optional[str] = None,
                 metadata: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.code = code
        self.status_code = status_code
        self.operation = operation
        self.recovery = recovery
        self.user_message = user_message
        self.technical_details = technical_details
        self.metadata = metadata or {}
        self.timestamp = datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "error": {
                "code": self.code.value,
                "message": self.user_message,
                "status_code": self.status_code,
                "timestamp": self.timestamp,
                "operation": self.operation,
                "recovery": {
                    "type": self.recovery.type,
                    "description": self.recovery.description,
                    "auto_retry": self.recovery.auto_retry,
                    "max_retries": self.recovery.max_retries,
                    "fallback_action": self.recovery.fallback_action
                },
                "technical_details": self.technical_details,
                "metadata": self.metadata
            }
        }
    
    def to_http_exception(self) -> HTTPException:
        return HTTPException(
            status_code=self.status_code,
            detail=self.to_dict()["error"]
        )

# Specific error classes
class StyleNotFoundError(ReceiptGeneratorError):
    def __init__(self, style_name: str, available_styles: List[str]):
        super().__init__(
            code=ErrorCode.STYLE_NOT_FOUND,
            message=f"Style '{style_name}' not found",
            status_code=404,
            operation="style_lookup",
            recovery=RecoveryStrategy(
                "manual",
                f"Use one of the available styles: {', '.join(available_styles)}"
            ),
            user_message=f"The requested style '{style_name}' is not available.",
            metadata={"requested_style": style_name, "available_styles": available_styles}
        )

class GenerationFailedError(ReceiptGeneratorError):
    def __init__(self, operation: str, original_error: str):
        super().__init__(
            code=ErrorCode.GENERATION_FAILED,
            message=f"Generation failed during {operation}",
            status_code=500,
            operation=operation,
            recovery=RecoveryStrategy(
                "retry",
                "Retry the generation or contact support if the issue persists",
                auto_retry=True,
                max_retries=2
            ),
            user_message=f"Failed to generate receipt. Please try again.",
            technical_details=original_error
        )