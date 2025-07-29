"""
RESTful API Router for Receipt Generator
Provides endpoints for receipt generation, parsing, validation, and management
"""
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
import json
import yaml
from pathlib import Path
from datetime import datetime

from .models import (
    # Request models
    ReceiptGenerationRequest,
    ReceiptParsingRequest,
    ReceiptValidationRequest,
    StyleCreationRequest,
    ConfigUpdateRequest,
    # Response models
    GenerationResult,
    ParsingResult,
    ValidationResult,
    StyleInfo,
    ApiResponse,
    ErrorResponse,
    # Legacy models
    InputUpdate,
    StyleCreate,
    GenerationRequest
)
from ..services.receipt_service import ReceiptService
from ..errors import ReceiptGeneratorError, ErrorCode, RecoveryStrategy

router = APIRouter()

# Initialize service
receipt_service = ReceiptService()

# ==============================
# Health & Status Endpoints
# ==============================

@router.get("/health", response_model=ApiResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return ApiResponse(
        success=True,
        message="Receipt Generator API is healthy",
        data={
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0"
        }
    )

@router.get("/status", response_model=ApiResponse, tags=["Health"])
async def get_status():
    """Get API status and configuration"""
    try:
        config = receipt_service.get_config()
        styles = receipt_service.get_available_styles()
        
        return ApiResponse(
            success=True,
            message="API status retrieved successfully",
            data={
                "config_loaded": bool(config),
                "available_styles": styles,
                "config_fields": list(config.keys()) if config else []
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get status: {str(e)}"
        )

# ==============================
# Receipt Generation Endpoints
# ==============================

@router.exception_handler(ReceiptGeneratorError)
async def receipt_generator_exception_handler(request: Request, exc: ReceiptGeneratorError):
    """Handle custom receipt generator errors"""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )

# Remove lines 121-132 (duplicate exception handlers)
@router.post("/generate", response_model=GenerationResult, tags=["Generation"])
async def generate_receipt(request: ReceiptGenerationRequest):
    try:
        # Generate receipt data
        receipt_data = receipt_service.generate_receipt_data(
            overrides=request.input_fields
        )
        
        # Generate image if requested
        image_result = None
        if request.include_image:
            image_result = receipt_service.generate_receipt_image(
                receipt_data=receipt_data,
                style=request.style,
                image_config=request.image_config
            )
        
        return GenerationResult(
            receipt_data=receipt_data,
            image_data=image_result["image_data"] if image_result else None,
            prompt=image_result["prompt"] if image_result else None,
            style=request.style,
            metadata=image_result["metadata"] if image_result else {
                "generated_at": datetime.now().isoformat(),
                "style_used": request.style
            }
        )
    except ReceiptGeneratorError:
        raise  # Let the global exception handler deal with it
    except Exception as e:
        error = ReceiptGeneratorError(
            code=ErrorCode.INTERNAL_ERROR,
            message="Unexpected error during receipt generation",
            status_code=500,
            operation="generate_receipt",
            recovery=RecoveryStrategy("retry", "Please try again"),
            user_message="An unexpected error occurred. Please try again.",
            technical_details=str(e)
        )
        raise error.to_http_exception()
    # Remove the duplicate except blocks below
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request: {str(e)}"
        )
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error: {str(e)}"
        )

@router.post("/generate/data", response_model=ApiResponse, tags=["Generation"])
async def generate_receipt_data_only(request: ReceiptGenerationRequest):
    """
    Generate receipt data only (without image)
    
    Faster endpoint for when only data is needed
    """
    try:
        receipt_data = receipt_service.generate_receipt_data(
            overrides=request.input_fields
        )
        
        return ApiResponse(
            success=True,
            message="Receipt data generated successfully",
            data=receipt_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Data generation failed: {str(e)}"
        )

# ==============================
# Receipt Parsing Endpoints
# ==============================

@router.post("/parse", response_model=ParsingResult, tags=["Parsing"])
async def parse_receipt(request: ReceiptParsingRequest):
    """
    Parse receipt data from text input
    
    - **receipt_text**: Raw receipt text to parse
    - **language**: Language of receipt text (default: en)
    """
    try:
        result = receipt_service.parse_receipt_data(request.receipt_text)
        
        return ParsingResult(
            parsed_data=result["parsed_data"],
            confidence=result["confidence"],
            raw_text=result["raw_text"],
            extraction_metadata={
                "language": request.language,
                "text_length": len(request.receipt_text),
                "parsed_at": datetime.now().isoformat()
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Parsing failed: {str(e)}"
        )

# ==============================
# Receipt Validation Endpoints
# ==============================

@router.post("/validate", response_model=ValidationResult, tags=["Validation"])
async def validate_receipt(request: ReceiptValidationRequest):
    """
    Validate receipt data for consistency and completeness
    
    - **receipt_data**: Receipt data to validate
    - **strict_mode**: Enable strict validation mode
    """
    try:
        result = receipt_service.validate_receipt(request.receipt_data.dict())
        
        return ValidationResult(
            is_valid=result["is_valid"],
            confidence=result["confidence"],
            errors=result["errors"],
            warnings=result["warnings"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Validation failed: {str(e)}"
        )

@router.post("/validate/batch", response_model=ApiResponse, tags=["Validation"])
async def validate_receipts_batch(receipts: List[ReceiptValidationRequest]):
    """
    Validate multiple receipts in batch
    
    Returns validation results for all receipts
    """
    try:
        results = []
        for i, request in enumerate(receipts):
            try:
                result = receipt_service.validate_receipt(request.receipt_data.dict())
                results.append({
                    "index": i,
                    "valid": result["is_valid"],
                    "confidence": result["confidence"],
                    "errors": result["errors"],
                    "warnings": result["warnings"]
                })
            except Exception as e:
                results.append({
                    "index": i,
                    "valid": False,
                    "confidence": 0.0,
                    "errors": [f"Validation failed: {str(e)}"],
                    "warnings": []
                })
        
        return ApiResponse(
            success=True,
            message=f"Batch validation completed for {len(receipts)} receipts",
            data={
                "total_receipts": len(receipts),
                "valid_count": sum(1 for r in results if r["valid"]),
                "invalid_count": sum(1 for r in results if not r["valid"]),
                "results": results
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch validation failed: {str(e)}"
        )

# ==============================
# Style Management Endpoints
# ==============================

@router.get("/styles", response_model=List[str], tags=["Styles"])
async def list_styles():
    """Get list of available receipt styles"""
    try:
        return receipt_service.get_available_styles()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list styles: {str(e)}"
        )

@router.get("/styles/{style_name}", response_model=StyleInfo, tags=["Styles"])
async def get_style_info(style_name: str):
    """Get detailed information about a specific style"""
    try:
        styles = receipt_service.get_available_styles()
        if style_name not in styles:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Style '{style_name}' not found"
            )
        
        style_path = Path(f"src/core/prompts/styles/{style_name}.json")
        if style_path.exists():
            content = json.loads(style_path.read_text(encoding="utf-8"))
            stat = style_path.stat()
            
            return StyleInfo(
                name=style_name,
                description=content.get("description"),
                created_at=datetime.fromtimestamp(stat.st_ctime).isoformat(),
                file_size=stat.st_size
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Style file not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get style info: {str(e)}"
        )

@router.post("/styles", response_model=ApiResponse, tags=["Styles"])
async def create_style(request: StyleCreationRequest):
    """
    Create a new receipt style
    
    - **name**: Style name (without .json extension)
    - **content**: Style configuration JSON
    - **description**: Optional style description
    """
    try:
        result = receipt_service.create_style(request.name, request.content)
        
        return ApiResponse(
            success=True,
            message=result["message"],
            data={"path": result["path"]}
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create style: {str(e)}"
        )

@router.delete("/styles/{style_name}", response_model=ApiResponse, tags=["Styles"])
async def delete_style(style_name: str):
    """Delete a receipt style"""
    try:
        style_path = Path(f"src/core/prompts/styles/{style_name}.json")
        if not style_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Style '{style_name}' not found"
            )
        
        style_path.unlink()
        
        return ApiResponse(
            success=True,
            message=f"Style '{style_name}' deleted successfully"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete style: {str(e)}"
        )

# ==============================
# Configuration Endpoints
# ==============================

@router.get("/config", response_model=ApiResponse, tags=["Configuration"])
async def get_config():
    """Get current receipt generation configuration"""
    try:
        config = receipt_service.get_config()
        
        return ApiResponse(
            success=True,
            message="Configuration retrieved successfully",
            data=config
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get config: {str(e)}"
        )

@router.post("/config", response_model=ApiResponse, tags=["Configuration"])
async def update_config(request: ConfigUpdateRequest):
    """
    Update receipt generation configuration
    
    - **fields**: Configuration fields to update
    """
    try:
        result = receipt_service.update_config(request.fields)
        
        return ApiResponse(
            success=True,
            message=result["message"],
            data=result["merged_config"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update config: {str(e)}"
        )

# ==============================
# Legacy Endpoints (for backward compatibility)
# ==============================

@router.get("/current-config", tags=["Legacy"])
async def get_current_config():
    """Legacy endpoint for getting current configuration"""
    try:
        config = receipt_service.get_config()
        return config
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get config: {str(e)}"
        )

@router.post("/update-input", tags=["Legacy"])
async def update_input(data: InputUpdate):
    """Legacy endpoint for updating input configuration"""
    try:
        result = receipt_service.update_config(data.fields)
        return {
            "message": "✅ receipt_input.yaml updated",
            "merged": result["merged_config"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update input: {str(e)}"
        )

@router.post("/create-style", tags=["Legacy"])
async def create_style_legacy(style: StyleCreate):
    """Legacy endpoint for creating styles"""
    try:
        result = receipt_service.create_style(style.name, style.content)
        return {"message": f"✅ New style {style.name}.json created."}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create style: {str(e)}"
        )

@router.post("/generate-receipt", tags=["Legacy"])
async def generate_receipt_legacy(data: GenerationRequest):
    """Legacy endpoint for receipt generation"""
    try:
        # Generate receipt data
        receipt_data = receipt_service.generate_receipt_data(
            overrides=data.input_fields or {}
        )
        
        # Generate image
        image_result = receipt_service.generate_receipt_image(
            receipt_data=receipt_data,
            style=data.style
        )
        
        return {
            "message": "✅ Image successfully generated",
            "b64_image": image_result["image_data"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {str(e)}"
        )

# ==============================
# Error Handlers
# ==============================

# Note: Exception handlers are moved to the main app.py file
# as APIRouter doesn't support exception handlers directly
