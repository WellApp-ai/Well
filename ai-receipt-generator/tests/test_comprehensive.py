import pytest
import json
import yaml
from unittest.mock import Mock, patch, MagicMock
from pathlib import Path
import tempfile
import os
from decimal import Decimal
import datetime
from freezegun import freeze_time

# Test the core data generation module
from src.core.data_generator import generate_receipt_data, save_json

class TestDataGenerator:
    """Comprehensive tests for receipt data generation"""
    
    def test_basic_receipt_structure(self):
        """Test that generated receipt has all required fields"""
        receipt = generate_receipt_data()
        
        # Verify top-level structure
        required_fields = [
            'transaction_id', 'authorization_code', 'transaction_date_time',
            'status', 'transaction_amount', 'receipt_number', 'merchant',
            'terminal', 'card', 'items', 'barcode'
        ]
        
        for field in required_fields:
            assert field in receipt, f"Missing required field: {field}"
            assert field in receipt, f"Missing required field: {field}"
        
        # Verify nested structures
        assert 'name' in receipt['merchant']
        assert 'address' in receipt['merchant']
        assert 'amount' in receipt['transaction_amount']
        assert 'currency' in receipt['transaction_amount']
        assert isinstance(receipt['items'], list)
        assert len(receipt['items']) > 0
    
    def test_merchant_data_structure(self):
        """Test merchant information is properly structured"""
        receipt = generate_receipt_data()
        merchant = receipt['merchant']
        
        required_merchant_fields = [
            'name', 'merchant_id', 'vat_id', 'registration_id',
            'address', 'phone', 'website', 'logo_url'
        ]
        
        for field in required_merchant_fields:
            assert field in merchant, f"Missing merchant field: {field}"
        
        # Verify address structure
        address = merchant['address']
        address_fields = ['line1', 'city', 'state', 'postal_code', 'country']
        for field in address_fields:
            assert field in address, f"Missing address field: {field}"
        
        # Verify data types and formats
        assert merchant['merchant_id'].startswith('M')
        assert merchant['vat_id'].startswith('VAT FR')
        assert merchant['registration_id'].startswith('CRN ')
        assert address['country'] == 'FR'
    
    def test_transaction_amount_calculations(self):
        """Test that transaction amounts are calculated correctly"""
        receipt = generate_receipt_data(tax_rate=0.2, num_items=3)
        amount_info = receipt['transaction_amount']
        
        # Extract amounts
        ht_amount = float(amount_info['amount'])
        tax_amount = float(amount_info['tax_amount'])
        total_amount = float(amount_info['amount_tendered'])
        tax_rate = float(amount_info['tax_rate'].rstrip('%')) / 100
        
        # Verify calculations
        expected_total = ht_amount + tax_amount
        assert abs(total_amount - expected_total) < 0.01, "Total amount calculation error"
        
        expected_tax = ht_amount * tax_rate
        assert abs(tax_amount - expected_tax) < 0.01, "Tax calculation error"
        
        # Verify format
        assert amount_info['currency'] == 'EUR'
        assert amount_info['tax_rate'] == '20%'
    
    def test_items_generation(self):
        """Test that items are generated correctly"""
        num_items = 5
        receipt = generate_receipt_data(num_items=num_items)
        items = receipt['items']
        
        assert len(items) == num_items, f"Expected {num_items} items, got {len(items)}"
        
        for item in items:
            required_fields = ['description', 'quantity', 'unit_price', 'line_total', 'tax']
            for field in required_fields:
                assert field in item, f"Missing item field: {field}"
            
            # Verify calculations
            expected_total = item['quantity'] * item['unit_price']
            assert abs(item['line_total'] - expected_total) < 0.01, "Item line total error"
            
            # Verify data types
            assert isinstance(item['quantity'], int)
            assert isinstance(item['unit_price'], (int, float))
            assert isinstance(item['line_total'], (int, float))
            assert item['quantity'] > 0
            assert item['unit_price'] > 0
    
    def test_overrides_merchant_name(self):
        """Test that merchant name override works"""
        custom_name = "My Custom Business"
        receipt = generate_receipt_data(overrides={'merchant_name': custom_name})
        
        assert receipt['merchant']['name'] == custom_name
    
    def test_overrides_tax_rate(self):
        """Test that tax rate override works"""
        custom_tax_rate = 0.25
        receipt = generate_receipt_data(overrides={'tax_rate': custom_tax_rate})
        
        amount_info = receipt['transaction_amount']
        assert amount_info['tax_rate'] == '25%'
        
        # Verify tax calculation with custom rate
        ht_amount = float(amount_info['amount'])
        tax_amount = float(amount_info['tax_amount'])
        expected_tax = ht_amount * custom_tax_rate
        assert abs(tax_amount - expected_tax) < 0.01, "Custom tax rate calculation error"
    
    def test_overrides_specific_items(self):
        """Test that specific items override works"""
        custom_items = [
            {"description": "Coffee", "quantity": 2, "unit_price": 3.50},
            {"description": "Sandwich", "quantity": 1, "unit_price": 8.00}
        ]
        
        receipt = generate_receipt_data(overrides={'items': custom_items})
        items = receipt['items']
        
        assert len(items) == 2
        assert items[0]['description'] == "Coffee"
        assert items[0]['quantity'] == 2
        assert items[0]['unit_price'] == 3.50
        assert items[0]['line_total'] == 7.00
        
        assert items[1]['description'] == "Sandwich"
        assert items[1]['line_total'] == 8.00
    
    def test_overrides_total_amount(self):
        """Test that total amount override generates correct items"""
        target_total = 100.00
        tax_rate = 0.20
        
        receipt = generate_receipt_data(
            overrides={'total_ttc': target_total, 'tax_rate': tax_rate},
            num_items=4
        )
        
        # Calculate expected HT total
        expected_ht = target_total / (1 + tax_rate)
        
        # Verify items sum to expected total
        items_total = sum(item['line_total'] for item in receipt['items'])
        assert abs(items_total - expected_ht) < 0.01, "Items don't sum to expected HT total"
        
        # Verify final total
        final_total = float(receipt['transaction_amount']['amount_tendered'])
        assert abs(final_total - target_total) < 0.01, "Final total doesn't match override"
    
    @freeze_time("2024-01-15 14:30:00")
    def test_transaction_datetime(self):
        """Test that transaction datetime is properly set"""
        receipt = generate_receipt_data()
        
        # Check default datetime
        assert receipt['transaction_date_time'] == "2024-01-15T14:30:00+00:00"
        
        # Check custom datetime override
        custom_datetime = "2023-12-25T10:00:00"
        receipt_custom = generate_receipt_data(
            overrides={'transaction_date_time': custom_datetime}
        )
        assert receipt_custom['transaction_date_time'] == custom_datetime
    
    def test_card_and_terminal_data(self):
        """Test card and terminal information generation"""
        receipt = generate_receipt_data()
        
        # Verify card data
        card = receipt['card']
        required_card_fields = ['card_number_masked', 'cardholder_name', 'payment_network', 'card_type']
        for field in required_card_fields:
            assert field in card, f"Missing card field: {field}"
        
        assert card['card_number_masked'].startswith('************')
        assert len(card['card_number_masked']) == 16  # 12 asterisks + 4 digits
        assert card['payment_network'] in ['VISA', 'MASTERCARD', 'AMEX']
        assert card['card_type'] in ['DEBIT', 'CREDIT']
        
        # Verify terminal data
        terminal = receipt['terminal']
        assert 'terminal_id' in terminal
        assert 'entry_mode' in terminal
        assert terminal['terminal_id'].startswith('T')
        assert terminal['entry_mode'] in ['CHIP', 'SWIPE', 'CONTACTLESS']
    
    def test_barcode_generation(self):
        """Test barcode data generation"""
        receipt = generate_receipt_data()
        barcode = receipt['barcode']
        
        assert 'barcode_data' in barcode
        assert 'barcode_type' in barcode
        assert barcode['barcode_data'].startswith('TXN:')
        assert barcode['barcode_type'] in ['QR', 'CODE128', 'PDF417']
    
    def test_save_json_functionality(self):
        """Test JSON saving functionality"""
        receipt = generate_receipt_data()
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp_file:
            try:
                save_json(receipt, tmp_file.name)
                
                # Verify file was created and contains valid JSON
                assert os.path.exists(tmp_file.name)
                
                with open(tmp_file.name, 'r') as f:
                    loaded_data = json.load(f)
                
                # Check that all required fields are present (not exact match due to random data)
                assert 'transaction_id' in loaded_data
                assert 'merchant' in loaded_data
                assert 'items' in loaded_data
                assert loaded_data['merchant']['name'] == receipt['merchant']['name']
                assert len(loaded_data['items']) == len(receipt['items'])
                
            finally:
                os.unlink(tmp_file.name)
    
    def test_data_consistency(self):
        """Test that generated data is internally consistent"""
        receipt = generate_receipt_data()
        
        # Transaction ID should be consistent
        assert len(receipt['transaction_id']) == 12
        
        # Receipt number should follow format
        assert receipt['receipt_number'].startswith('RCPT-')
        
        # Authorization code should be 6 digits
        assert len(receipt['authorization_code']) == 6
        assert receipt['authorization_code'].isdigit()
        
        # Status should be approved
        assert receipt['status'] == 'APPROVED'
    
    def test_multiple_generation_uniqueness(self):
        """Test that multiple generations produce unique data"""
        receipts = [generate_receipt_data() for _ in range(5)]
        
        # Transaction IDs should be unique
        transaction_ids = [r['transaction_id'] for r in receipts]
        assert len(set(transaction_ids)) == 5, "Transaction IDs are not unique"
        
        # Receipt numbers should be unique
        receipt_numbers = [r['receipt_number'] for r in receipts]
        assert len(set(receipt_numbers)) == 5, "Receipt numbers are not unique"
        
        # Authorization codes should be unique
        auth_codes = [r['authorization_code'] for r in receipts]
        assert len(set(auth_codes)) == 5, "Authorization codes are not unique"
    
    def test_edge_cases(self):
        """Test edge cases and boundary conditions"""
        # Zero items should still generate at least one item
        receipt = generate_receipt_data(num_items=0)
        assert len(receipt['items']) >= 1, "Should generate at least one item"
        
        # Very large number of items
        receipt = generate_receipt_data(num_items=100)
        assert len(receipt['items']) == 100, "Should handle large number of items"
        
        # Zero tax rate
        receipt = generate_receipt_data(overrides={'tax_rate': 0.0})
        assert receipt['transaction_amount']['tax_rate'] == '0%'
        assert float(receipt['transaction_amount']['tax_amount']) == 0.0
        
        # Very high tax rate
        receipt = generate_receipt_data(overrides={'tax_rate': 0.5})
        assert receipt['transaction_amount']['tax_rate'] == '50%'
    
    def test_localization_support(self):
        """Test that data supports French localization"""
        receipt = generate_receipt_data()
        
        # Should use French locale for address
        address = receipt['merchant']['address']
        assert address['country'] == 'FR'
        
        # Currency should be EUR
        assert receipt['transaction_amount']['currency'] == 'EUR'
        
        # VAT ID should follow French format
        assert receipt['merchant']['vat_id'].startswith('VAT FR')


# Test the prompt rendering module
class TestPromptRenderer:
    """Tests for image prompt generation"""
    
    @pytest.fixture
    def sample_receipt_data(self):
        """Sample receipt data for testing"""
        return generate_receipt_data(overrides={
            'merchant_name': 'Test Cafe',
            'items': [
                {"description": "Espresso", "quantity": 2, "unit_price": 2.50},
                {"description": "Croissant", "quantity": 1, "unit_price": 3.00}
            ]
        })
    
    @pytest.fixture
    def sample_style(self):
        """Sample style configuration for testing"""
        return {
            "background_color": "#ffffff",
            "text_color": "#000000",
            "font_family": "Arial",
            "layout": "compact",
            "paper_texture": "smooth",
            "wear_level": "minimal"
        }
    
    def test_prompt_generation_basic(self, sample_receipt_data, sample_style):
        """Test basic prompt generation"""
        from src.core.prompt_renderer import generate_image_prompt
        
        prompt = generate_image_prompt(sample_receipt_data, sample_style)
        
        assert isinstance(prompt, str)
        assert len(prompt) > 100, "Prompt should be substantial"
        assert "Generate a realistic photo" in prompt
        assert "Test Cafe" in prompt, "Merchant name should be in prompt"
        assert "Espresso" in prompt, "Item descriptions should be in prompt"
        assert "Croissant" in prompt
    
    def test_prompt_contains_receipt_data(self, sample_receipt_data, sample_style):
        """Test that prompt contains the receipt data"""
        from src.core.prompt_renderer import generate_image_prompt
        
        prompt = generate_image_prompt(sample_receipt_data, sample_style)
        
        # Check that key receipt data is included
        receipt_json = json.dumps(sample_receipt_data, indent=2)
        assert receipt_json in prompt, "Receipt data should be embedded in prompt"
    
    def test_prompt_contains_style_data(self, sample_receipt_data, sample_style):
        """Test that prompt contains the style configuration"""
        from src.core.prompt_renderer import generate_image_prompt
        
        prompt = generate_image_prompt(sample_receipt_data, sample_style)
        
        # Check that style data is included
        style_json = json.dumps(sample_style, indent=2)
        assert style_json in prompt, "Style data should be embedded in prompt"
    
    def test_prompt_formatting(self, sample_receipt_data, sample_style):
        """Test that prompt is properly formatted"""
        from src.core.prompt_renderer import generate_image_prompt
        
        prompt = generate_image_prompt(sample_receipt_data, sample_style)
        
        # Should have clear sections
        assert "Generate a realistic photo" in prompt
        assert "transaction_id" in prompt
        
        # Should have instructions
        assert "realistic" in prompt.lower()
        assert "receipt" in prompt.lower()
    
    def test_different_styles(self, sample_receipt_data):
        """Test prompt generation with different styles"""
        from src.core.prompt_renderer import generate_image_prompt
        
        styles = [
            {"layout": "compact", "wear_level": "minimal"},
            {"layout": "spacious", "wear_level": "worn"},
            {"layout": "thermal", "paper_texture": "rough"}
        ]
        
        prompts = []
        for style in styles:
            prompt = generate_image_prompt(sample_receipt_data, style)
            prompts.append(prompt)
            assert isinstance(prompt, str)
            assert len(prompt) > 50
        
        # All prompts should be different
        assert len(set(prompts)) == len(prompts), "Different styles should generate different prompts"


# Test the configuration loader module
class TestConfigLoader:
    """Tests for configuration loading and validation"""
    
    def test_load_valid_config(self):
        """Test loading a valid configuration file"""
        from src.core.config_loader import load_config
        
        valid_config = {
            "openai_image": {
                "model": "dall-e-3",
                "size": "1024x1024",
                "quality": "hd",
                "api_key": "sk-test-key"
            },
            "anthropic": {
                "model": "claude-3-opus-20240229",
                "api_key": "sk-ant-test"
            }
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as tmp_file:
            try:
                yaml.dump(valid_config, tmp_file)
                tmp_file.flush()
                
                loaded_config = load_config(Path(tmp_file.name))
                assert loaded_config == valid_config
                
            finally:
                os.unlink(tmp_file.name)
    
    def test_load_missing_config(self):
        """Test loading a non-existent configuration file"""
        from src.core.config_loader import load_config
        
        result = load_config(Path("/non/existent/file.yaml"))
        assert result == {}
    
    def test_config_validation_success(self):
        """Test validation of a valid configuration"""
        from src.core.config_loader import validate_config
        
        valid_config = {
            "openai_image": {
                "model": "dall-e-3",
                "size": "1024x1024",
                "quality": "hd"
            }
        }
        
        assert validate_config(valid_config) is True
    
    def test_config_validation_failure(self, capsys):
        """Test validation of an invalid configuration"""
        from src.core.config_loader import validate_config
        
        invalid_config = {
            "openai_image": {
                "model": "dall-e-3"
                # Missing required fields: size, quality
            }
        }
        
        assert validate_config(invalid_config) is False
        
        captured = capsys.readouterr()
        assert "Missing fields in openai_image" in captured.out
        assert "size" in captured.out
        assert "quality" in captured.out
    
    def test_api_key_resolution_from_config(self):
        """Test API key resolution from configuration"""
        from src.core.config_loader import resolve_api_key
        
        config = {
            "openai_image": {
                "model": "dall-e-3",
                "api_key": "sk-from-config"
            }
        }
        
        key = resolve_api_key(config, "openai_image")
        assert key == "sk-from-config"
    
    @patch.dict(os.environ, {"OPENAI_API_KEY": "sk-from-env"})
    def test_api_key_resolution_from_env(self):
        """Test API key resolution from environment variable"""
        from src.core.config_loader import resolve_api_key
        
        config = {
            "openai_image": {
                "model": "dall-e-3"
                # No api_key in config
            }
        }
        
        key = resolve_api_key(config, "openai_image")
        assert key == "sk-from-env"
    
    @patch.dict(os.environ, {"OPENAI_API_KEY": "sk-from-env"})
    def test_api_key_precedence(self):
        """Test that config API key takes precedence over environment"""
        from src.core.config_loader import resolve_api_key
        
        config = {
            "openai_image": {
                "model": "dall-e-3",
                "api_key": "sk-from-config"
            }
        }
        
        key = resolve_api_key(config, "openai_image")
        assert key == "sk-from-config"  # Config should override env
    
    def test_api_key_not_found(self):
        """Test behavior when API key is not found"""
        from src.core.config_loader import resolve_api_key
        
        config = {
            "openai_image": {
                "model": "dall-e-3"
            }
        }
        
        key = resolve_api_key(config, "openai_image")
        assert key is None


# Test the generator classes
class TestGenerators:
    """Tests for AI generator implementations"""
    
    def test_openai_generator_initialization(self):
        """Test OpenAI generator initialization"""
        from src.core.generators.openai_generator import OpenAIGenerator
        
        generator = OpenAIGenerator(api_key="sk-test", model="dall-e-3")
        assert generator.api_key == "sk-test"
        assert generator.model == "dall-e-3"
    
    @patch('src.core.generators.openai_generator.OpenAI')
    def test_openai_image_generation(self, mock_openai_client):
        """Test OpenAI image generation"""
        from src.core.generators.openai_generator import OpenAIGenerator
        
        # Mock the OpenAI client response
        mock_response = Mock()
        mock_response.data = [Mock()]
        mock_response.data[0].b64_json = "base64encodedimage"
        
        mock_client_instance = Mock()
        mock_client_instance.images.generate.return_value = mock_response
        mock_openai_client.return_value = mock_client_instance
        
        generator = OpenAIGenerator(api_key="sk-test", model="dall-e-3")
        result = generator.generate("Test prompt")
        
        assert result == "base64encodedimage"
        mock_client_instance.images.generate.assert_called_once_with(
            model="dall-e-3",
            prompt="Test prompt",
            n=1,
            size="1024x1024",
            quality="high"
        )
    
    @patch('src.core.generators.openai_generator.OpenAI')
    def test_openai_text_generation(self, mock_openai_client):
        """Test OpenAI text generation"""
        from src.core.generators.openai_generator import OpenAIGenerator
        
        # Mock the OpenAI client response for text generation
        mock_response = Mock()
        mock_response.choices = [Mock()]
        mock_response.choices[0].message.content = "Generated text response"
        
        mock_client_instance = Mock()
        mock_client_instance.chat.completions.create.return_value = mock_response
        mock_openai_client.return_value = mock_client_instance
        
        generator = OpenAIGenerator(api_key="sk-test", model="gpt-4")
        result = generator.generate("Test prompt")
        
        assert result == "Generated text response"
        mock_client_instance.chat.completions.create.assert_called_once()
    
    @patch('src.core.generators.openai_generator.OpenAI')
    def test_openai_error_handling(self, mock_openai_client):
        """Test OpenAI error handling"""
        from src.core.generators.openai_generator import OpenAIGenerator
        
        # Mock an API error
        mock_client_instance = Mock()
        mock_client_instance.images.generate.side_effect = Exception("API Error")
        mock_openai_client.return_value = mock_client_instance
        
        generator = OpenAIGenerator(api_key="sk-test", model="dall-e-3")
        result = generator.generate("Test prompt")
        
        assert result == ""  # Should return empty string on error
    
    def test_anthropic_generator_initialization(self):
        """Test Anthropic generator initialization"""
        from src.core.generators.anthropic_generator import AnthropicGenerator
        
        generator = AnthropicGenerator(api_key="sk-ant-test", model="claude-3-opus")
        assert generator.api_key == "sk-ant-test"
        assert generator.model == "claude-3-opus"
    
    @patch('src.core.generators.anthropic_generator.Anthropic')
    def test_anthropic_generation(self, mock_anthropic_client):
        """Test Anthropic text generation"""
        from src.core.generators.anthropic_generator import AnthropicGenerator
        
        # Mock the Anthropic client response
        mock_response = Mock()
        mock_response.content = [Mock()]
        mock_response.content[0].text = "Generated response from Claude"
        
        mock_client_instance = Mock()
        mock_client_instance.messages.create.return_value = mock_response
        mock_anthropic_client.return_value = mock_client_instance
        
        generator = AnthropicGenerator(api_key="sk-ant-test", model="claude-3-opus")
        result = generator.generate("Test prompt")
        
        assert result == "Generated response from Claude"
        mock_client_instance.messages.create.assert_called_once()


# Test the CLI module
class TestCLI:
    """Tests for CLI functionality"""
    
    @patch('src.core.cli.get_generator')
    @patch('src.core.cli.generate_receipt_data')
    @patch('src.core.cli.generate_image_prompt')
    def test_cli_integration(self, mock_prompt, mock_data, mock_generator):
        """Test CLI integration with mocked dependencies"""
        from src.core.cli import get_generator
        
        # Mock the generator
        mock_gen_instance = Mock()
        mock_gen_instance.generate.return_value = "base64imagedata"
        mock_generator.return_value = mock_gen_instance
        
        # Mock data generation
        mock_data.return_value = {"test": "data"}
        mock_prompt.return_value = "Generated prompt"
        
        config = {
            "default_model": "openai_image",
            "openai_image": {
                "model": "dall-e-3",
                "api_key": "sk-test"
            }
        }
        
        generator = get_generator(config)
        assert generator is not None
    
    def test_get_generator_openai(self):
        """Test generator creation for OpenAI"""
        from src.core.cli import get_generator
        
        config = {
            "default_model": "openai_image",
            "openai_image": {
                "model": "dall-e-3",
                "api_key": "sk-test"
            }
        }
        
        with patch('src.core.cli.OpenAIGenerator') as mock_class:
            mock_instance = Mock()
            mock_class.return_value = mock_instance
            
            generator = get_generator(config)
            mock_class.assert_called_once_with(api_key="sk-test", model="dall-e-3")
    
    def test_get_generator_anthropic(self):
        """Test generator creation for Anthropic"""
        from src.core.cli import get_generator
        
        config = {
            "default_model": "anthropic",
            "anthropic": {
                "model": "claude-3-opus",
                "api_key": "sk-ant-test"
            }
        }
        
        with patch('src.core.cli.AnthropicGenerator') as mock_class:
            mock_instance = Mock()
            mock_class.return_value = mock_instance
            
            generator = get_generator(config)
            mock_class.assert_called_once_with(api_key="sk-ant-test", model="claude-3-opus")
    
    def test_get_generator_missing_api_key(self):
        """Test generator creation with missing API key"""
        from src.core.cli import get_generator
        
        config = {
            "default_model": "openai_image",
            "openai_image": {
                "model": "dall-e-3"
                # Missing api_key
            }
        }
        
        with pytest.raises(RuntimeError, match="No API key found"):
            get_generator(config)
    
    def test_get_generator_unsupported_provider(self):
        """Test generator creation with unsupported provider"""
        from src.core.cli import get_generator
        
        config = {
            "default_model": "unsupported_provider",
            "unsupported_provider": {
                "model": "some-model",
                "api_key": "test-key"
            }
        }
        
        with pytest.raises(ValueError, match="Unsupported model provider"):
            get_generator(config)


# Integration tests for the complete workflow
class TestIntegration:
    """Integration tests for the complete receipt generation workflow"""
    
    def test_complete_workflow(self):
        """Test the complete workflow from data generation to image prompt"""
        from src.core.data_generator import generate_receipt_data
        from src.core.prompt_renderer import generate_image_prompt
        
        # Generate receipt data
        receipt_data = generate_receipt_data(overrides={
            'merchant_name': 'Integration Test Cafe',
            'items': [
                {"description": "Coffee", "quantity": 1, "unit_price": 2.50},
                {"description": "Muffin", "quantity": 1, "unit_price": 3.00}
            ]
        })
        
        # Create style
        style = {
            "background_color": "#ffffff",
            "text_color": "#000000",
            "layout": "compact"
        }
        
        # Generate prompt
        prompt = generate_image_prompt(receipt_data, style)
        
        # Verify the complete workflow
        assert isinstance(receipt_data, dict)
        assert isinstance(prompt, str)
        assert "Integration Test Cafe" in prompt
        assert "Coffee" in prompt
        assert "Muffin" in prompt
        assert len(prompt) > 200
    
    @patch('src.core.generators.openai_generator.OpenAI')
    def test_end_to_end_generation(self, mock_openai_client):
        """Test end-to-end generation including AI call"""
        from src.core.data_generator import generate_receipt_data
        from src.core.prompt_renderer import generate_image_prompt
        from src.core.generators.openai_generator import OpenAIGenerator
        
        # Mock OpenAI response
        mock_response = Mock()
        mock_response.data = [Mock()]
        mock_response.data[0].b64_json = "mockbase64imagedata"
        
        mock_client_instance = Mock()
        mock_client_instance.images.generate.return_value = mock_response
        mock_openai_client.return_value = mock_client_instance
        
        # Complete workflow
        receipt_data = generate_receipt_data()
        style = {"layout": "compact"}
        prompt = generate_image_prompt(receipt_data, style)
        
        generator = OpenAIGenerator(api_key="sk-test", model="dall-e-3")
        image_data = generator.generate(prompt)
        
        assert image_data == "mockbase64imagedata"
        mock_client_instance.images.generate.assert_called_once()
    
    def test_configuration_integration(self):
        """Test configuration loading and validation integration"""
        from src.core.config_loader import load_config, validate_config, resolve_api_key
        
        config_data = {
            "openai_image": {
                "model": "dall-e-3",
                "size": "1024x1024",
                "quality": "hd",
                "api_key": "sk-integration-test"
            }
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as tmp_file:
            try:
                yaml.dump(config_data, tmp_file)
                tmp_file.flush()
                
                # Load and validate configuration
                loaded_config = load_config(Path(tmp_file.name))
                is_valid = validate_config(loaded_config)
                api_key = resolve_api_key(loaded_config, "openai_image")
                
                assert is_valid is True
                assert api_key == "sk-integration-test"
                
            finally:
                os.unlink(tmp_file.name)
    
    def test_error_handling_integration(self):
        """Test error handling across the complete workflow"""
        from src.core.data_generator import generate_receipt_data
        from src.core.prompt_renderer import generate_image_prompt
        
        # Test with invalid data
        try:
            receipt_data = generate_receipt_data(overrides={'tax_rate': -1.0})  # Invalid tax rate
            # Should still work but might have unusual values
            assert isinstance(receipt_data, dict)
        except Exception as e:
            pytest.fail(f"Should handle invalid tax rate gracefully: {e}")
        
        # Test with missing style data
        try:
            receipt_data = generate_receipt_data()
            prompt = generate_image_prompt(receipt_data, {})  # Empty style
            assert isinstance(prompt, str)
        except Exception as e:
            pytest.fail(f"Should handle empty style gracefully: {e}")
    
    def test_performance_requirements(self):
        """Test that generation meets performance requirements"""
        import time
        from src.core.data_generator import generate_receipt_data
        
        # Test data generation performance
        start_time = time.time()
        for _ in range(100):
            receipt_data = generate_receipt_data()
        end_time = time.time()
        
        avg_time_per_generation = (end_time - start_time) / 100
        assert avg_time_per_generation < 0.1, f"Data generation too slow: {avg_time_per_generation}s per receipt"
        
        # Test with large number of items
        start_time = time.time()
        receipt_data = generate_receipt_data(num_items=1000)
        end_time = time.time()
        
        large_generation_time = end_time - start_time
        assert large_generation_time < 1.0, f"Large receipt generation too slow: {large_generation_time}s"
        assert len(receipt_data['items']) == 1000
