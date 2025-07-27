from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List, Union
from datetime import datetime
from enum import Enum

# ==============================
# Enums
# ==============================

class ReceiptStatus(str, Enum):
    """Receipt status enumeration"""
    APPROVED = "APPROVED"
    PENDING = "PENDING"
    DECLINED = "DECLINED"

class Currency(str, Enum):
    """Currency enumeration"""
    EUR = "EUR"
    USD = "USD"
    GBP = "GBP"
    CAD = "CAD"

class ImageQuality(str, Enum):
    """Image quality enumeration"""
    STANDARD = "standard"
    HD = "hd"

class ImageSize(str, Enum):
    """Image size enumeration"""
    SMALL = "256x256"
    MEDIUM = "512x512"
    LARGE = "1024x1024"

# ==============================
# Base Models
# ==============================

class ReceiptItem(BaseModel):
    """Individual receipt item model"""
    description: str = Field(..., description="Item description")
    quantity: int = Field(1, ge=1, description="Item quantity")
    unit_price: float = Field(..., ge=0, description="Unit price")
    line_total: Optional[float] = Field(None, ge=0, description="Line total")
    tax: Optional[float] = Field(None, ge=0, description="Tax amount")
    
    @validator('line_total', pre=True, always=True)
    def calculate_line_total(cls, v, values):
        if v is None and 'quantity' in values and 'unit_price' in values:
            return values['quantity'] * values['unit_price']
        return v

class TransactionAmount(BaseModel):
    """Transaction amount model"""
    amount: str = Field(..., description="Amount as string")
    currency: Currency = Field(Currency.EUR, description="Currency")
    tax_rate: str = Field("10%", description="Tax rate as percentage")
    tax_amount: str = Field(..., description="Tax amount as string")

class ReceiptData(BaseModel):
    """Complete receipt data model"""
    transaction_id: str = Field(..., description="Unique transaction ID")
    authorization_code: str = Field(..., description="Authorization code")
    transaction_date_time: str = Field(..., description="Transaction date/time")
    status: ReceiptStatus = Field(ReceiptStatus.APPROVED, description="Transaction status")
    transaction_amount: TransactionAmount = Field(..., description="Transaction amount details")
    merchant_name: str = Field(..., description="Merchant name")
    merchant_address: str = Field(..., description="Merchant address")
    items: List[ReceiptItem] = Field(..., description="List of receipt items")
    
    class Config:
        schema_extra = {
            "example": {
                "transaction_id": "TXN123456789",
                "authorization_code": "AUTH123456",
                "transaction_date_time": "2024-01-15T14:30:00Z",
                "status": "APPROVED",
                "transaction_amount": {
                    "amount": "25.50",
                    "currency": "EUR",
                    "tax_rate": "10%",
                    "tax_amount": "2.55"
                },
                "merchant_name": "Sample Store",
                "merchant_address": "123 Main St, City, Country",
                "items": [
                    {
                        "description": "Coffee",
                        "quantity": 2,
                        "unit_price": 3.50,
                        "line_total": 7.00,
                        "tax": 0.70
                    }
                ]
            }
        }

# ==============================
# Request Models
# ==============================

class ReceiptGenerationRequest(BaseModel):
    """Request model for receipt generation"""
    input_fields: Optional[Dict[str, Any]] = Field(None, description="Optional fields to override in generation")
    style: str = Field("table_noire", description="Visual style for receipt generation")
    include_image: bool = Field(True, description="Whether to generate image")
    image_config: Optional[Dict[str, Any]] = Field(None, description="Image generation configuration")
    
    class Config:
        schema_extra = {
            "example": {
                "input_fields": {
                    "merchant_name": "My Store",
                    "total_ttc": 50.00
                },
                "style": "table_noire",
                "include_image": True
            }
        }

class ReceiptParsingRequest(BaseModel):
    """Request model for receipt parsing"""
    receipt_text: str = Field(..., description="Raw receipt text to parse")
    language: Optional[str] = Field("en", description="Language of receipt text")
    
    class Config:
        schema_extra = {
            "example": {
                "receipt_text": "STORE NAME\n123 Main St\nDate: 2024-01-15\nItems:\n- Coffee $3.50\n- Bread $2.00\nTotal: $5.50",
                "language": "en"
            }
        }

class ReceiptValidationRequest(BaseModel):
    """Request model for receipt validation"""
    receipt_data: ReceiptData = Field(..., description="Receipt data to validate")
    strict_mode: bool = Field(False, description="Enable strict validation mode")
    
    class Config:
        schema_extra = {
            "example": {
                "receipt_data": {
                    "transaction_id": "TXN123456789",
                    "authorization_code": "AUTH123456",
                    "transaction_date_time": "2024-01-15T14:30:00Z",
                    "status": "APPROVED",
                    "transaction_amount": {
                        "amount": "25.50",
                        "currency": "EUR",
                        "tax_rate": "10%",
                        "tax_amount": "2.55"
                    },
                    "merchant_name": "Sample Store",
                    "merchant_address": "123 Main St, City, Country",
                    "items": [
                        {
                            "description": "Coffee",
                            "quantity": 2,
                            "unit_price": 3.50,
                            "line_total": 7.00,
                            "tax": 0.70
                        }
                    ]
                },
                "strict_mode": False
            }
        }

class StyleCreationRequest(BaseModel):
    """Request model for style creation"""
    name: str = Field(..., description="Style name (without .json extension)")
    content: Dict[str, Any] = Field(..., description="Style configuration JSON")
    description: Optional[str] = Field(None, description="Style description")
    
    class Config:
        schema_extra = {
            "example": {
                "name": "modern_style",
                "content": {
                    "background": "white",
                    "font": "Arial",
                    "colors": {"primary": "#000000", "secondary": "#666666"}
                },
                "description": "Modern minimalist style"
            }
        }

class ConfigUpdateRequest(BaseModel):
    """Request model for configuration updates"""
    fields: Dict[str, Any] = Field(..., description="Configuration fields to update")
    
    class Config:
        schema_extra = {
            "example": {
                "fields": {
                    "default_merchant": "New Store Name",
                    "default_currency": "USD",
                    "tax_rate": 0.08
                }
            }
        }

# ==============================
# Response Models
# ==============================

class ValidationResult(BaseModel):
    """Receipt validation result model"""
    is_valid: bool = Field(..., description="Whether receipt is valid")
    confidence: float = Field(..., ge=0, le=1, description="Validation confidence score")
    errors: List[str] = Field(default_factory=list, description="Validation errors")
    warnings: List[str] = Field(default_factory=list, description="Validation warnings")
    
    class Config:
        schema_extra = {
            "example": {
                "is_valid": True,
                "confidence": 0.95,
                "errors": [],
                "warnings": ["Total amount doesn't match sum of items"]
            }
        }

class ParsingResult(BaseModel):
    """Receipt parsing result model"""
    parsed_data: Dict[str, Any] = Field(..., description="Parsed receipt data")
    confidence: float = Field(..., ge=0, le=1, description="Parsing confidence score")
    raw_text: str = Field(..., description="Original receipt text")
    extraction_metadata: Optional[Dict[str, Any]] = Field(None, description="Extraction metadata")
    
    class Config:
        schema_extra = {
            "example": {
                "parsed_data": {
                    "merchant": "Sample Store",
                    "total": 25.50,
                    "items": [
                        {"description": "Coffee", "price": "3.50"},
                        {"description": "Bread", "price": "2.00"}
                    ],
                    "date": "2024-01-15"
                },
                "confidence": 0.85,
                "raw_text": "STORE NAME\n123 Main St\nDate: 2024-01-15\nItems:\n- Coffee $3.50\n- Bread $2.00\nTotal: $5.50"
            }
        }

class GenerationResult(BaseModel):
    """Receipt generation result model"""
    receipt_data: ReceiptData = Field(..., description="Generated receipt data")
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    prompt: Optional[str] = Field(None, description="Generated image prompt")
    style: str = Field(..., description="Style used for generation")
    metadata: Dict[str, Any] = Field(..., description="Generation metadata")
    
    class Config:
        schema_extra = {
            "example": {
                "receipt_data": {
                    "transaction_id": "TXN123456789",
                    "authorization_code": "AUTH123456",
                    "transaction_date_time": "2024-01-15T14:30:00Z",
                    "status": "APPROVED",
                    "transaction_amount": {
                        "amount": "25.50",
                        "currency": "EUR",
                        "tax_rate": "10%",
                        "tax_amount": "2.55"
                    },
                    "merchant_name": "Sample Store",
                    "merchant_address": "123 Main St, City, Country",
                    "items": [
                        {
                            "description": "Coffee",
                            "quantity": 2,
                            "unit_price": 3.50,
                            "line_total": 7.00,
                            "tax": 0.70
                        }
                    ]
                },
                "image_data": "base64_encoded_image_data",
                "prompt": "Generate a receipt image with...",
                "style": "table_noire",
                "metadata": {
                    "generated_at": "2024-01-15T14:30:00Z",
                    "style_used": "table_noire"
                }
            }
        }

class StyleInfo(BaseModel):
    """Style information model"""
    name: str = Field(..., description="Style name")
    description: Optional[str] = Field(None, description="Style description")
    created_at: Optional[str] = Field(None, description="Creation timestamp")
    file_size: Optional[int] = Field(None, description="Style file size in bytes")

class ApiResponse(BaseModel):
    """Generic API response model"""
    success: bool = Field(..., description="Operation success status")
    message: str = Field(..., description="Response message")
    data: Optional[Dict[str, Any]] = Field(None, description="Response data")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Response timestamp")

class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = Field(False, description="Operation success status")
    error: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    details: Optional[Dict[str, Any]] = Field(None, description="Error details")
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Error timestamp")

# ==============================
# Legacy Models (for backward compatibility)
# ==============================

class InputUpdate(BaseModel):
    """Legacy model for input updates"""
    fields: Dict[str, Any] = Field(..., description="Fields to merge into receipt_input.yaml")

class StyleCreate(BaseModel):
    """Legacy model for style creation"""
    name: str = Field(..., description="Name of the style (without .json)")
    content: Dict[str, Any] = Field(..., description="JSON content of the style")

class GenerationRequest(BaseModel):
    """Legacy model for generation requests"""
    input_fields: Optional[Dict[str, Any]] = None
    style: str = "table_noire"
