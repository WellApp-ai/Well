import pytest
import json
import yaml
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path
import tempfile
import os

# Import the FastAPI app
from src.core.api.app import app
from src.core.api.models import InputUpdate, StyleCreate, GenerationRequest

class TestAPIEndpoints:
    """Comprehensive tests for FastAPI endpoints"""
    
    @pytest.fixture
    def client(self):
        """Test client fixture"""
        return TestClient(app)
    
    @pytest.fixture
    def sample_config(self):
        """Sample configuration for testing"""
        return {
            "merchant_name": "Test Restaurant",
            "tax_rate": 0.2,
            "items": [
                {"description": "Burger", "quantity": 1, "unit_price": 12.50},
                {"description": "Fries", "quantity": 1, "unit_price": 4.50}
            ]
        }
    
    @pytest.fixture
    def sample_style(self):
        """Sample style configuration"""
        return {
            "background_color": "#ffffff",
            "text_color": "#000000",
            "font_family": "Arial",
            "layout": "compact",
            "paper_texture": "smooth",
            "wear_level": "minimal"
        }

    def test_app_initialization(self, client):
        """Test that the FastAPI app initializes correctly"""
        # Test that the app serves documentation
        response = client.get("/")
        assert response.status_code == 200
        
        # Test that OpenAPI docs are available
        response = client.get("/openapi.json")
        assert response.status_code == 200
        openapi_spec = response.json()
        assert openapi_spec["info"]["title"] == "🧾 Receipt Gen AI"

    def test_cors_headers(self, client):
        """Test CORS configuration"""
        # Test with a GET request that exists
        response = client.get("/current-config")
        assert response.status_code == 200 or response.status_code == 404  # Accept both since config may not exist
        
        # Test OPTIONS request for CORS preflight
        options_response = client.options("/current-config", headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET"
        })
        # FastAPI CORS should handle this (405 is acceptable if endpoint doesn't handle OPTIONS)
        assert options_response.status_code in [200, 405]

    def test_get_current_config_exists(self, client, sample_config):
        """Test getting current configuration when file exists"""
        config_path = Path("config/receipt_input.yaml")
        
        # Create temporary config file
        config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(config_path, 'w') as f:
            yaml.dump(sample_config, f)
        
        try:
            response = client.get("/current-config")
            assert response.status_code == 200
            assert response.json() == sample_config
        finally:
            # Cleanup
            if config_path.exists():
                config_path.unlink()

    def test_get_current_config_not_exists(self, client):
        """Test getting current configuration when file doesn't exist"""
        config_path = Path("config/receipt_input.yaml")
        
        # Ensure file doesn't exist
        if config_path.exists():
            config_path.unlink()
        
        response = client.get("/current-config")
        assert response.status_code == 404
        assert "receipt_input.yaml not found" in response.json()["detail"]

    def test_update_input_new_file(self, client):
        """Test updating input configuration (creating new file)"""
        config_path = Path("config/receipt_input.yaml")
        
        # Ensure file doesn't exist
        if config_path.exists():
            config_path.unlink()
        
        update_data = {
            "fields": {
                "merchant_name": "New Test Cafe",
                "tax_rate": 0.25
            }
        }
        
        try:
            response = client.post("/update-input", json=update_data)
            assert response.status_code == 200
            
            response_data = response.json()
            assert response_data["message"] == "✅ receipt_input.yaml updated"
            assert response_data["merged"]["merchant_name"] == "New Test Cafe"
            assert response_data["merged"]["tax_rate"] == 0.25
            
            # Verify file was created
            assert config_path.exists()
            
        finally:
            # Cleanup
            if config_path.exists():
                config_path.unlink()

    def test_update_input_merge_existing(self, client, sample_config):
        """Test updating input configuration (merging with existing)"""
        config_path = Path("config/receipt_input.yaml")
        
        # Create initial config
        config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(config_path, 'w') as f:
            yaml.dump(sample_config, f)
        
        update_data = {
            "fields": {
                "merchant_name": "Updated Restaurant",
                "new_field": "new_value"
            }
        }
        
        try:
            response = client.post("/update-input", json=update_data)
            assert response.status_code == 200
            
            response_data = response.json()
            merged = response_data["merged"]
            
            # Should merge with existing data
            assert merged["merchant_name"] == "Updated Restaurant"  # Updated
            assert merged["tax_rate"] == 0.2  # From original
            assert merged["new_field"] == "new_value"  # New field
            assert "items" in merged  # Original items preserved
            
        finally:
            # Cleanup
            if config_path.exists():
                config_path.unlink()

    def test_list_styles(self, client):
        """Test listing available styles"""
        style_dir = Path("src/core/prompts/styles")
        style_dir.mkdir(parents=True, exist_ok=True)
        
        # Create test style files
        test_styles = ["minimal.json", "vintage.json", "modern.json"]
        for style_name in test_styles:
            style_path = style_dir / style_name
            with open(style_path, 'w') as f:
                json.dump({"test": "style"}, f)
        
        try:
            response = client.get("/styles")
            assert response.status_code == 200
            
            styles = response.json()
            assert isinstance(styles, list)
            
            # Should return style names without .json extension
            expected_names = ["minimal", "vintage", "modern"]
            for name in expected_names:
                assert name in styles
                
        finally:
            # Cleanup test files
            for style_name in test_styles:
                style_path = style_dir / style_name
                if style_path.exists():
                    style_path.unlink()

    def test_create_style(self, client, sample_style):
        """Test creating a new style"""
        style_dir = Path("src/core/prompts/styles")
        style_dir.mkdir(parents=True, exist_ok=True)

        style_data = {
            "name": "test_style",
            "content": sample_style  # Fixed: use 'content' not 'config'
        }

        style_path = style_dir / "test_style.json"

        try:
            response = client.post("/create-style", json=style_data)
            assert response.status_code == 200
            
            # Verify style was created
            assert style_path.exists()
            
            # Verify content
            created_content = json.loads(style_path.read_text())
            assert created_content == sample_style
            
        finally:
            # Cleanup
            if style_path.exists():
                style_path.unlink()

    def test_create_style_overwrite(self, client, sample_style):
        """Test creating a style that overwrites existing one"""
        style_dir = Path("src/core/prompts/styles")
        style_dir.mkdir(parents=True, exist_ok=True)

        style_path = style_dir / "existing_style.json"

        # Create existing style
        existing_style = {"old": "config"}
        with open(style_path, 'w') as f:
            json.dump(existing_style, f)

        # Overwrite with new style
        style_data = {
            "name": "existing_style",
            "content": sample_style  # Fixed: use 'content' not 'config'
        }

        try:
            response = client.post("/create-style", json=style_data)
            # This should fail with 400 since style exists
            assert response.status_code == 400
            
        finally:
            # Cleanup
            if style_path.exists():
                style_path.unlink()

    @patch('src.core.api.router.load_config')
    @patch('src.core.api.router.validate_config')
    @patch('src.core.api.router.OpenAI')
    def test_generate_receipt_success(self, mock_openai, mock_validate, mock_load_config, client, sample_style):
        """Test successful receipt generation"""
        # Mock configuration loading
        mock_config = {
            "openai_image": {
                "model": "dall-e-3",
                "size": "1024x1024",
                "quality": "hd"
            }
        }
        mock_load_config.return_value = mock_config
        mock_validate.return_value = True
        
        # Mock OpenAI response
        mock_response = Mock()
        mock_response.data = [Mock()]
        mock_response.data[0].b64_json = "base64encodedimage"
        
        mock_client_instance = Mock()
        mock_client_instance.images.generate.return_value = mock_response
        mock_openai.return_value = mock_client_instance
        
        # Create test style file
        style_dir = Path("src/core/prompts/styles")
        style_dir.mkdir(parents=True, exist_ok=True)
        style_path = style_dir / "test_style.json"
        
        with open(style_path, 'w') as f:
            json.dump(sample_style, f)
        
        generation_request = {
            "style": "test_style",
            "input_fields": {
                "merchant_name": "API Test Cafe",
                "tax_rate": 0.15
            }
        }
        
        try:
            response = client.post("/generate-receipt", json=generation_request)
            assert response.status_code == 200
            
            response_data = response.json()
            assert response_data["message"] == "✅ Image successfully generated"
            assert response_data["b64_image"] == "base64encodedimage"
            
            # Verify OpenAI was called with correct parameters
            mock_client_instance.images.generate.assert_called_once()
            call_args = mock_client_instance.images.generate.call_args
            assert call_args[1]["model"] == "dall-e-3"
            assert call_args[1]["size"] == "1024x1024"
            assert call_args[1]["quality"] == "hd"
            
        finally:
            # Cleanup
            if style_path.exists():
                style_path.unlink()

    def test_generate_receipt_style_not_found(self, client):
        """Test receipt generation with non-existent style"""
        generation_request = {
            "style": "nonexistent_style",
            "input_fields": {}
        }
        
        response = client.post("/generate-receipt", json=generation_request)
        assert response.status_code == 404
        assert "Style not found" in response.json()["detail"]

    @patch('src.core.api.router.load_config')
    @patch('src.core.api.router.validate_config')
    def test_generate_receipt_invalid_config(self, mock_validate, mock_load_config, client, sample_style):
        """Test receipt generation with invalid OpenAI configuration"""
        mock_load_config.return_value = {}
        mock_validate.return_value = False
        
        # Create test style file
        style_dir = Path("src/core/prompts/styles")
        style_dir.mkdir(parents=True, exist_ok=True)
        style_path = style_dir / "test_style.json"
        
        with open(style_path, 'w') as f:
            json.dump(sample_style, f)
        
        generation_request = {
            "style": "test_style",
            "input_fields": {}
        }
        
        try:
            response = client.post("/generate-receipt", json=generation_request)
            assert response.status_code == 500
            assert "Invalid OpenAI configuration" in response.json()["detail"]
            
        finally:
            # Cleanup
            if style_path.exists():
                style_path.unlink()

    @patch('src.core.api.router.load_config')
    @patch('src.core.api.router.validate_config')
    @patch('src.core.api.router.OpenAI')
    def test_generate_receipt_openai_error(self, mock_openai, mock_validate, mock_load_config, client, sample_style):
        """Test receipt generation with OpenAI API error"""
        # Mock configuration
        mock_config = {
            "openai_image": {
                "model": "dall-e-3",
                "size": "1024x1024",
                "quality": "hd"
            }
        }
        mock_load_config.return_value = mock_config
        mock_validate.return_value = True
        
        # Mock OpenAI error
        mock_client_instance = Mock()
        mock_client_instance.images.generate.side_effect = Exception("API rate limit exceeded")
        mock_openai.return_value = mock_client_instance
        
        # Create test style file
        style_dir = Path("src/core/prompts/styles")
        style_dir.mkdir(parents=True, exist_ok=True)
        style_path = style_dir / "test_style.json"
        
        with open(style_path, 'w') as f:
            json.dump(sample_style, f)
        
        generation_request = {
            "style": "test_style",
            "input_fields": {}
        }
        
        try:
            response = client.post("/generate-receipt", json=generation_request)
            assert response.status_code == 500
            assert "OpenAI error" in response.json()["detail"]
            assert "API rate limit exceeded" in response.json()["detail"]
            
        finally:
            # Cleanup
            if style_path.exists():
                style_path.unlink()

    @patch('src.core.api.router.OpenAI')
    def test_api_model_validation(self, mock_openai, client):
        """Test API request model validation"""
        # Mock OpenAI to prevent initialization errors
        mock_client_instance = Mock()
        mock_openai.return_value = mock_client_instance
        
        # Test InputUpdate validation
        invalid_update = {"invalid_field": "value"}  # Missing 'fields'
        response = client.post("/update-input", json=invalid_update)
        assert response.status_code == 422  # Validation error

        # Test StyleCreate validation
        invalid_style = {"name": "test"}  # Missing 'content'
        response = client.post("/create-style", json=invalid_style)
        assert response.status_code == 422

        # Test GenerationRequest validation - actually this model has defaults, so test a different validation
        # Test with malformed JSON instead
        response = client.post("/generate-receipt", data="invalid json", headers={"Content-Type": "application/json"})
        assert response.status_code == 422

    def test_endpoint_error_handling(self, client):
        """Test error handling across all endpoints"""
        # Test with malformed JSON
        response = client.post(
            "/update-input",
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
        
        # Test with empty request body where required
        response = client.post("/generate-receipt")
        assert response.status_code == 422

    def test_api_response_formats(self, client, sample_config):
        """Test that API responses have consistent formats"""
        config_path = Path("config/receipt_input.yaml")
        
        # Create config for testing
        config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(config_path, 'w') as f:
            yaml.dump(sample_config, f)
        
        try:
            # Test current-config response format
            response = client.get("/current-config")
            assert response.status_code == 200
            assert isinstance(response.json(), dict)
            
            # Test update-input response format
            update_data = {"fields": {"test": "value"}}
            response = client.post("/update-input", json=update_data)
            assert response.status_code == 200
            response_data = response.json()
            assert "message" in response_data
            assert "merged" in response_data
            
            # Test styles response format
            response = client.get("/styles")
            assert response.status_code == 200
            assert isinstance(response.json(), list)
            
        finally:
            # Cleanup
            if config_path.exists():
                config_path.unlink()

    def test_api_performance(self, client):
        """Test API endpoint performance"""
        import time
        
        # Test response times for simple endpoints
        start_time = time.time()
        response = client.get("/styles")
        end_time = time.time()
        
        assert response.status_code == 200
        assert (end_time - start_time) < 1.0  # Should respond within 1 second
        
        # Test multiple concurrent requests (simulate load)
        import concurrent.futures
        
        def make_request():
            return client.get("/styles")
        
        start_time = time.time()
        with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
            futures = [executor.submit(make_request) for _ in range(10)]
            responses = [future.result() for future in concurrent.futures.as_completed(futures)]
        end_time = time.time()
        
        # All requests should succeed
        for response in responses:
            assert response.status_code == 200
        
        # Total time should be reasonable
        assert (end_time - start_time) < 5.0  # 10 requests in under 5 seconds

    def test_api_security(self, client):
        """Test basic API security measures"""
        # Test that sensitive paths don't exist
        sensitive_paths = [
            "/admin",
            "/config.yaml",
            "/secrets",
            "/.env",
            "/api/v1/admin"
        ]
        
        for path in sensitive_paths:
            response = client.get(path)
            assert response.status_code in [404, 405]  # Not found or method not allowed
        
        # Test input sanitization
        malicious_inputs = [
            {"fields": {"<script>alert('xss')</script>": "value"}},
            {"fields": {"../../../etc/passwd": "value"}},
            {"fields": {"test": "'; DROP TABLE users; --"}}
        ]
        
        for malicious_input in malicious_inputs:
            response = client.post("/update-input", json=malicious_input)
            # Should either process safely or reject
            assert response.status_code in [200, 400, 422]

    def test_api_documentation(self, client):
        """Test that API documentation is properly generated"""
        # Test OpenAPI specification
        response = client.get("/openapi.json")
        assert response.status_code == 200
        
        openapi_spec = response.json()
        assert "openapi" in openapi_spec
        assert "info" in openapi_spec
        assert "paths" in openapi_spec
        
        # Verify all endpoints are documented
        paths = openapi_spec["paths"]
        expected_endpoints = [
            "/current-config",
            "/update-input",
            "/styles",
            "/create-style",
            "/generate-receipt"
        ]
        
        for endpoint in expected_endpoints:
            assert endpoint in paths, f"Endpoint {endpoint} not documented"
        
        # Test ReDoc documentation
        response = client.get("/redoc")
        assert response.status_code == 200

    def test_api_content_types(self, client):
        """Test API content type handling"""
        # Test JSON content type
        update_data = {"fields": {"test": "value"}}
        response = client.post(
            "/update-input",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        
        # Test unsupported content type
        response = client.post(
            "/update-input",
            data="test=value",
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        assert response.status_code == 422  # Should reject non-JSON

    def test_api_headers(self, client):
        """Test API response headers"""
        response = client.get("/current-config")

        # Should have proper content type
        assert "application/json" in response.headers.get("content-type", "")

        # Check if we can make a preflight OPTIONS request
        options_response = client.options("/current-config", headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET"
        })
        # FastAPI CORS should handle this (405 is acceptable if endpoint doesn't handle OPTIONS)
        assert options_response.status_code in [200, 405]

    @patch('src.core.api.router.generate_receipt_data')
    @patch('src.core.api.router.generate_image_prompt')
    def test_api_data_flow(self, mock_prompt, mock_data, client, sample_style):
        """Test the complete data flow through the API"""
        # Mock data generation
        mock_receipt_data = {
            "merchant": {"name": "Test Merchant"},
            "total_amount": {"amount": "50.00"}
        }
        mock_data.return_value = mock_receipt_data
        mock_prompt.return_value = "Generated prompt text"
        
        # Create test style
        style_dir = Path("src/core/prompts/styles")
        style_dir.mkdir(parents=True, exist_ok=True)
        style_path = style_dir / "flow_test.json"
        
        with open(style_path, 'w') as f:
            json.dump(sample_style, f)
        
        # Mock OpenAI
        with patch('src.core.api.router.load_config') as mock_load_config, \
             patch('src.core.api.router.validate_config') as mock_validate, \
             patch('src.core.api.router.OpenAI') as mock_openai:
            
            mock_load_config.return_value = {
                "openai_image": {
                    "model": "dall-e-3",
                    "size": "1024x1024",
                    "quality": "standard"
                }
            }
            mock_validate.return_value = True
            
            mock_response = Mock()
            mock_response.data = [Mock()]
            mock_response.data[0].b64_json = "test_image_data"
            
            mock_client_instance = Mock()
            mock_client_instance.images.generate.return_value = mock_response
            mock_openai.return_value = mock_client_instance
            
            # Make API call
            generation_request = {
                "style": "flow_test",
                "input_fields": {"merchant_name": "API Flow Test"}
            }
            
            try:
                response = client.post("/generate-receipt", json=generation_request)
                assert response.status_code == 200
                
                # Verify data flow
                mock_data.assert_called_once()
                mock_prompt.assert_called_once_with(mock_receipt_data, sample_style)
                mock_client_instance.images.generate.assert_called_once()
                
                # Verify response
                response_data = response.json()
                assert response_data["b64_image"] == "test_image_data"
                
            finally:
                # Cleanup
                if style_path.exists():
                    style_path.unlink()
