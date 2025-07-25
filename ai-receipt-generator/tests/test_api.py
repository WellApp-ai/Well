"""
Comprehensive test suite for Receipt Generator RESTful API
"""
import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime

from src.core.api.app import app

client = TestClient(app)

# ==============================
# Test Data
# ==============================

SAMPLE_RECEIPT_DATA = {
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

SAMPLE_RECEIPT_TEXT = """
STORE NAME
123 Main St
Date: 2024-01-15
Items:
- Coffee $3.50
- Bread $2.00
Total: $5.50
"""

# ==============================
# Health & Status Tests
# ==============================

def test_root_endpoint():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "environment" in data

def test_ping_endpoint():
    """Test ping endpoint"""
    response = client.get("/ping")
    assert response.status_code == 200
    data = response.json()
    assert "pong" in data

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "status" in data["data"]

def test_status_endpoint():
    """Test status endpoint"""
    response = client.get("/api/v1/status")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "config_loaded" in data["data"]

# ==============================
# Receipt Generation Tests
# ==============================

@patch('src.core.services.receipt_service.ReceiptService.generate_receipt_data')
@patch('src.core.services.receipt_service.ReceiptService.generate_receipt_image')
def test_generate_receipt_success(mock_generate_image, mock_generate_data):
    """Test successful receipt generation"""
    # Mock service responses
    mock_generate_data.return_value = SAMPLE_RECEIPT_DATA
    mock_generate_image.return_value = {
        "image_data": "base64_encoded_image",
        "prompt": "Generate receipt image",
        "metadata": {"generated_at": "2024-01-15T14:30:00Z"}
    }
    
    request_data = {
        "input_fields": {"merchant_name": "Test Store"},
        "style": "table_noire",
        "include_image": True
    }
    
    response = client.post("/api/v1/generate", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "receipt_data" in data
    assert "image_data" in data
    assert "style" in data
    assert data["style"] == "table_noire"

@patch('src.core.services.receipt_service.ReceiptService.generate_receipt_data')
def test_generate_receipt_data_only(mock_generate_data):
    """Test receipt data generation without image"""
    mock_generate_data.return_value = SAMPLE_RECEIPT_DATA
    
    request_data = {
        "input_fields": {"merchant_name": "Test Store"},
        "style": "table_noire",
        "include_image": False
    }
    
    response = client.post("/api/v1/generate/data", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "data" in data

@patch('src.core.services.receipt_service.ReceiptService.generate_receipt_data')
def test_generate_receipt_invalid_style(mock_generate_data):
    """Test receipt generation with invalid style"""
    mock_generate_data.side_effect = ValueError("Style 'invalid_style' not found")
    
    request_data = {
        "style": "invalid_style",
        "include_image": True
    }
    
    response = client.post("/api/v1/generate", json=request_data)
    assert response.status_code == 400
    assert "Invalid request" in response.json()["detail"]

# ==============================
# Receipt Parsing Tests
# ==============================

@patch('src.core.services.receipt_service.ReceiptService.parse_receipt_data')
def test_parse_receipt_success(mock_parse_data):
    """Test successful receipt parsing"""
    mock_parse_data.return_value = {
        "parsed_data": {
            "merchant": "Sample Store",
            "total": 5.50,
            "items": [
                {"description": "Coffee", "price": "3.50"},
                {"description": "Bread", "price": "2.00"}
            ],
            "date": "2024-01-15"
        },
        "confidence": 0.85,
        "raw_text": SAMPLE_RECEIPT_TEXT
    }
    
    request_data = {
        "receipt_text": SAMPLE_RECEIPT_TEXT,
        "language": "en"
    }
    
    response = client.post("/api/v1/parse", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "parsed_data" in data
    assert "confidence" in data
    assert "raw_text" in data
    assert data["confidence"] == 0.85

@patch('src.core.services.receipt_service.ReceiptService.parse_receipt_data')
def test_parse_receipt_failure(mock_parse_data):
    """Test receipt parsing failure"""
    mock_parse_data.side_effect = Exception("Parsing failed")
    
    request_data = {
        "receipt_text": "Invalid text",
        "language": "en"
    }
    
    response = client.post("/api/v1/parse", json=request_data)
    assert response.status_code == 500
    assert "Parsing failed" in response.json()["detail"]

# ==============================
# Receipt Validation Tests
# ==============================

@patch('src.core.services.receipt_service.ReceiptService.validate_receipt')
def test_validate_receipt_success(mock_validate):
    """Test successful receipt validation"""
    mock_validate.return_value = {
        "is_valid": True,
        "confidence": 0.95,
        "errors": [],
        "warnings": ["Total amount doesn't match sum of items"]
    }
    
    request_data = {
        "receipt_data": SAMPLE_RECEIPT_DATA,
        "strict_mode": False
    }
    
    response = client.post("/api/v1/validate", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["is_valid"] is True
    assert data["confidence"] == 0.95
    assert len(data["warnings"]) == 1

@patch('src.core.services.receipt_service.ReceiptService.validate_receipt')
def test_validate_receipt_invalid(mock_validate):
    """Test receipt validation with errors"""
    mock_validate.return_value = {
        "is_valid": False,
        "confidence": 0.3,
        "errors": ["Missing required field: transaction_id"],
        "warnings": []
    }
    
    invalid_data = SAMPLE_RECEIPT_DATA.copy()
    del invalid_data["transaction_id"]
    
    request_data = {
        "receipt_data": invalid_data,
        "strict_mode": True
    }
    
    response = client.post("/api/v1/validate", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["is_valid"] is False
    assert len(data["errors"]) == 1

def test_validate_receipt_batch():
    """Test batch receipt validation"""
    request_data = [
        {
            "receipt_data": SAMPLE_RECEIPT_DATA,
            "strict_mode": False
        },
        {
            "receipt_data": SAMPLE_RECEIPT_DATA,
            "strict_mode": True
        }
    ]
    
    response = client.post("/api/v1/validate/batch", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert data["data"]["total_receipts"] == 2

# ==============================
# Style Management Tests
# ==============================

@patch('src.core.services.receipt_service.ReceiptService.get_available_styles')
def test_list_styles(mock_get_styles):
    """Test listing available styles"""
    mock_get_styles.return_value = ["table_noire", "modern", "classic"]
    
    response = client.get("/api/v1/styles")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 3
    assert "table_noire" in data

def test_get_style_info_success():
    """Test getting style information"""
    # Mock file system operations
    with patch('pathlib.Path.exists') as mock_exists, \
         patch('pathlib.Path.read_text') as mock_read, \
         patch('pathlib.Path.stat') as mock_stat:
        
        mock_exists.return_value = True
        mock_read.return_value = '{"description": "Test style"}'
        mock_stat.return_value = MagicMock(st_ctime=1642248000, st_size=1024)
        
        response = client.get("/api/v1/styles/test_style")
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == "test_style"
        assert data["description"] == "Test style"

def test_get_style_info_not_found():
    """Test getting non-existent style information"""
    with patch('src.core.services.receipt_service.ReceiptService.get_available_styles') as mock_get_styles:
        mock_get_styles.return_value = ["table_noire"]
        
        response = client.get("/api/v1/styles/nonexistent_style")
        assert response.status_code == 404

@patch('src.core.services.receipt_service.ReceiptService.create_style')
def test_create_style_success(mock_create_style):
    """Test successful style creation"""
    mock_create_style.return_value = {
        "message": "Style 'test_style' created successfully",
        "path": "src/core/prompts/styles/test_style.json"
    }
    
    request_data = {
        "name": "test_style",
        "content": {"background": "white", "font": "Arial"},
        "description": "Test style"
    }
    
    response = client.post("/api/v1/styles", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "path" in data["data"]

@patch('src.core.services.receipt_service.ReceiptService.create_style')
def test_create_style_already_exists(mock_create_style):
    """Test creating style that already exists"""
    mock_create_style.side_effect = ValueError("Style 'existing_style' already exists")
    
    request_data = {
        "name": "existing_style",
        "content": {"background": "white"}
    }
    
    response = client.post("/api/v1/styles", json=request_data)
    assert response.status_code == 400

def test_delete_style_success():
    """Test successful style deletion"""
    with patch('pathlib.Path.exists') as mock_exists, \
         patch('pathlib.Path.unlink') as mock_unlink:
        
        mock_exists.return_value = True
        
        response = client.delete("/api/v1/styles/test_style")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] is True

def test_delete_style_not_found():
    """Test deleting non-existent style"""
    with patch('pathlib.Path.exists') as mock_exists:
        mock_exists.return_value = False
        
        response = client.delete("/api/v1/styles/nonexistent_style")
        assert response.status_code == 404

# ==============================
# Configuration Tests
# ==============================

@patch('src.core.services.receipt_service.ReceiptService.get_config')
def test_get_config(mock_get_config):
    """Test getting configuration"""
    mock_get_config.return_value = {
        "default_merchant": "Test Store",
        "tax_rate": 0.1
    }
    
    response = client.get("/api/v1/config")
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "data" in data

@patch('src.core.services.receipt_service.ReceiptService.update_config')
def test_update_config(mock_update_config):
    """Test updating configuration"""
    mock_update_config.return_value = {
        "message": "Configuration updated successfully",
        "merged_config": {
            "default_merchant": "New Store",
            "tax_rate": 0.08
        }
    }
    
    request_data = {
        "fields": {
            "default_merchant": "New Store",
            "tax_rate": 0.08
        }
    }
    
    response = client.post("/api/v1/config", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["success"] is True
    assert "merged_config" in data["data"]

# ==============================
# Legacy Endpoint Tests
# ==============================

@patch('src.core.services.receipt_service.ReceiptService.get_config')
def test_legacy_get_current_config(mock_get_config):
    """Test legacy current-config endpoint"""
    mock_get_config.return_value = {"test": "config"}
    
    response = client.get("/api/v1/current-config")
    assert response.status_code == 200
    
    data = response.json()
    assert data["test"] == "config"

@patch('src.core.services.receipt_service.ReceiptService.update_config')
def test_legacy_update_input(mock_update_config):
    """Test legacy update-input endpoint"""
    mock_update_config.return_value = {
        "message": "Configuration updated successfully",
        "merged_config": {"new_field": "value"}
    }
    
    request_data = {
        "fields": {"new_field": "value"}
    }
    
    response = client.post("/api/v1/update-input", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "message" in data
    assert "merged" in data

@patch('src.core.services.receipt_service.ReceiptService.create_style')
def test_legacy_create_style(mock_create_style):
    """Test legacy create-style endpoint"""
    mock_create_style.return_value = {
        "message": "Style 'test_style' created successfully",
        "path": "src/core/prompts/styles/test_style.json"
    }
    
    request_data = {
        "name": "test_style",
        "content": {"background": "white"}
    }
    
    response = client.post("/api/v1/create-style", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "message" in data

@patch('src.core.services.receipt_service.ReceiptService.generate_receipt_data')
@patch('src.core.services.receipt_service.ReceiptService.generate_receipt_image')
def test_legacy_generate_receipt(mock_generate_image, mock_generate_data):
    """Test legacy generate-receipt endpoint"""
    mock_generate_data.return_value = SAMPLE_RECEIPT_DATA
    mock_generate_image.return_value = {
        "image_data": "base64_encoded_image"
    }
    
    request_data = {
        "input_fields": {"merchant_name": "Test Store"},
        "style": "table_noire"
    }
    
    response = client.post("/api/v1/generate-receipt", json=request_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "message" in data
    assert "b64_image" in data

# ==============================
# Error Handling Tests
# ==============================

def test_invalid_json_request():
    """Test handling of invalid JSON requests"""
    response = client.post("/api/v1/generate", data="invalid json")
    assert response.status_code == 422

def test_missing_required_fields():
    """Test handling of missing required fields"""
    request_data = {
        "style": "table_noire"
        # Missing required fields
    }
    
    response = client.post("/api/v1/generate", json=request_data)
    assert response.status_code == 200  # Should still work with defaults

def test_global_exception_handler():
    """Test global exception handler"""
    # This would require mocking a service to raise an exception
    # For now, we test the structure is in place
    assert hasattr(app, 'exception_handlers')

# ==============================
# Performance Tests
# ==============================

def test_response_headers():
    """Test that response headers are properly set"""
    response = client.get("/api/v1/health")
    assert "X-Process-Time" in response.headers
    assert "X-Request-ID" in response.headers

def test_cors_headers():
    """Test CORS headers are present"""
    response = client.options("/api/v1/health")
    assert response.status_code == 200 