"""
Receipt Service Layer - Business Logic for Receipt Operations
"""
from typing import Dict, Any, Optional, List
from pathlib import Path
import json
import yaml
import base64
from datetime import datetime
from faker import Faker

from ..data_generator import generate_receipt_data
from ..prompt_renderer import generate_image_prompt
from ..config_loader import load_config, validate_config
from ..generators.base import BaseGenerator
from ..generators.openai_generator import OpenAIGenerator
from ..generators.anthropic_generator import AnthropicGenerator
from ..errors import StyleNotFoundError, GenerationFailedError, ErrorCode, RecoveryStrategy, ReceiptGeneratorError

faker = Faker("fr_FR")

class ReceiptService:
    """Service layer for receipt generation, parsing, and validation operations"""
    
    def __init__(self):
        self.config = load_config()
        self.style_dir = Path("src/core/prompts/styles")
        self.config_path = Path("config/receipt_input.yaml")
    
    def generate_receipt_data(self, overrides: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Generate receipt data with optional overrides
        
        Args:
            overrides: Optional dictionary of fields to override in generation
            
        Returns:
            Dictionary containing generated receipt data
        """
        return generate_receipt_data(overrides=overrides or {})
    
    def generate_receipt_image(
        self, 
        receipt_data: Dict[str, Any], 
        style: str = "table_noire",
        image_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate receipt image from data and style"""
        try:
            # Load style
            style_path = self.style_dir / f"{style}.json"
            if not style_path.exists():
                available_styles = self.get_available_styles()
                raise StyleNotFoundError(style, available_styles)
            
            style_data = json.loads(style_path.read_text(encoding="utf-8"))
            
            # Generate prompt
            prompt = generate_image_prompt(receipt_data, style_data)
            
            # Get image generator
            generator = self._get_image_generator(image_config)
            
            # Generate image
            image_data = generator.generate(prompt)
            return {
                "image_data": image_data,
                "prompt": prompt,
                "style": style,
                "metadata": {
                    "generated_at": datetime.now().isoformat(),
                    "style_used": style,
                    "data_hash": hash(str(receipt_data))
                }
            }
        except StyleNotFoundError:
            raise  # Re-raise our custom errors
        except Exception as e:
            raise GenerationFailedError("image_generation", str(e))
    
    def parse_receipt_data(self, receipt_text: str) -> Dict[str, Any]:
        """
        Parse receipt data from text input
        
        Args:
            receipt_text: Raw receipt text to parse
            
        Returns:
            Dictionary containing parsed receipt data
        """
        # This would integrate with the invoice extractor component
        # For now, return a basic structure
        return {
            "parsed_data": {
                "merchant": self._extract_merchant(receipt_text),
                "total": self._extract_total(receipt_text),
                "items": self._extract_items(receipt_text),
                "date": self._extract_date(receipt_text)
            },
            "confidence": 0.85,
            "raw_text": receipt_text
        }
    
    def validate_receipt(self, receipt_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate receipt data for consistency and completeness
        
        Args:
            receipt_data: Receipt data to validate
            
        Returns:
            Dictionary containing validation results
        """
        errors = []
        warnings = []
        
        # Check required fields
        required_fields = ["transaction_id", "transaction_amount", "items"]
        for field in required_fields:
            if field not in receipt_data:
                errors.append(f"Missing required field: {field}")
        
        # Validate amounts
        if "transaction_amount" in receipt_data:
            amount = receipt_data["transaction_amount"]
            if isinstance(amount, dict) and "amount" in amount:
                try:
                    float(amount["amount"])
                except (ValueError, TypeError):
                    errors.append("Invalid amount format")
        
        # Validate items
        if "items" in receipt_data and isinstance(receipt_data["items"], list):
            for i, item in enumerate(receipt_data["items"]):
                if not isinstance(item, dict):
                    errors.append(f"Invalid item format at index {i}")
                    continue
                
                if "description" not in item:
                    warnings.append(f"Item {i} missing description")
                if "unit_price" not in item:
                    errors.append(f"Item {i} missing unit price")
        
        # Calculate totals
        if "items" in receipt_data and isinstance(receipt_data["items"], list):
            calculated_total = sum(
                item.get("line_total", 0) for item in receipt_data["items"]
            )
            declared_total = receipt_data.get("transaction_amount", {}).get("amount", 0)
            
            try:
                if abs(float(calculated_total) - float(declared_total)) > 0.01:
                    warnings.append("Total amount doesn't match sum of items")
            except (ValueError, TypeError):
                errors.append("Invalid total amount format")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "confidence": max(0, 1 - len(errors) * 0.2)
        }
    
    def get_available_styles(self) -> List[str]:
        """Get list of available receipt styles"""
        return [f.stem for f in self.style_dir.glob("*.json")]
    
    def create_style(self, name: str, content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new receipt style
        
        Args:
            name: Style name
            content: Style configuration
            
        Returns:
            Dictionary with operation result
        """
        style_path = self.style_dir / f"{name}.json"
        if style_path.exists():
            raise ValueError(f"Style '{name}' already exists")
        
        style_path.write_text(
            json.dumps(content, indent=2, ensure_ascii=False), 
            encoding="utf-8"
        )
        
        return {"message": f"Style '{name}' created successfully", "path": str(style_path)}
    
    def update_config(self, fields: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update receipt generation configuration
        
        Args:
            fields: Fields to update in configuration
            
        Returns:
            Dictionary with operation result
        """
        old_config = {}
        if self.config_path.exists():
            old_config = yaml.safe_load(self.config_path.read_text(encoding="utf-8"))
        
        merged_config = {**old_config, **fields}
        self.config_path.write_text(
            yaml.dump(merged_config, allow_unicode=True), 
            encoding="utf-8"
        )
        
        return {
            "message": "Configuration updated successfully",
            "merged_config": merged_config
        }
    
    def get_config(self) -> Dict[str, Any]:
        """Get current receipt generation configuration"""
        if not self.config_path.exists():
            return {}
        return yaml.safe_load(self.config_path.read_text(encoding="utf-8"))
    
    def _get_image_generator(self, image_config: Optional[Dict[str, Any]] = None) -> BaseGenerator:
        """Get appropriate image generator based on configuration"""
        if not validate_config(self.config):
            raise RuntimeError("Invalid configuration")
        
        image_cfg = image_config or self.config.get("openai_image", {})
        api_key = image_cfg.get("api_key")
        
        if not api_key:
            raise RuntimeError("No API key configured for image generation")
        
        provider = image_cfg.get("provider", "openai")
        
        if provider == "openai":
            return OpenAIGenerator(
                api_key=api_key,
                model=image_cfg.get("model", "gpt-image-1")
            )
        elif provider == "anthropic":
            return AnthropicGenerator(
                api_key=api_key,
                model=image_cfg.get("model", "claude-3-sonnet-20240229")
            )
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    def _extract_merchant(self, text: str) -> str:
        """Extract merchant name from receipt text"""
        # Simple extraction - would be enhanced with NLP
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            if any(keyword in line.lower() for keyword in ['store', 'shop', 'market', 'restaurant']):
                return line.strip()
        return "Unknown Merchant"
    
    def _extract_total(self, text: str) -> float:
        """Extract total amount from receipt text"""
        import re
        # Look for currency patterns
        patterns = [
            r'total[\s:]*[\$€£]?\s*(\d+\.?\d*)',
            r'[\$€£]\s*(\d+\.?\d*)',
            r'amount[\s:]*(\d+\.?\d*)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    continue
        
        return 0.0
    
    def _extract_items(self, text: str) -> List[Dict[str, Any]]:
        """Extract items from receipt text"""
        # Simple extraction - would be enhanced with NLP
        items = []
        lines = text.split('\n')
        
        for line in lines:
            if any(keyword in line.lower() for keyword in ['item', 'product', 'service']):
                # Basic item parsing
                parts = line.split()
                if len(parts) >= 2:
                    items.append({
                        "description": " ".join(parts[:-1]),
                        "price": parts[-1]
                    })
        
        return items
    
    def _extract_date(self, text: str) -> str:
        """Extract date from receipt text"""
        import re
        # Look for date patterns
        date_patterns = [
            r'\d{1,2}/\d{1,2}/\d{4}',
            r'\d{1,2}-\d{1,2}-\d{4}',
            r'\d{4}-\d{2}-\d{2}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group()
        
        return datetime.now().strftime("%Y-%m-%d")