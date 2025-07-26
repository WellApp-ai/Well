#!/usr/bin/env python3
"""
Simple Test Runner for AI Receipt Generator

This script validates that our comprehensive test setup is working correctly.
"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_basic_functionality():
    """Test basic functionality without external dependencies"""
    print("🧪 Running basic functionality tests...")
    
    # Test 1: Basic data generation
    try:
        from core.data_generator import generate_receipt_data
        receipt_data = generate_receipt_data()
        assert isinstance(receipt_data, dict)
        assert "store_name" in receipt_data
        assert "total_amount" in receipt_data
        print("✅ Receipt data generation working")
    except Exception as e:
        print(f"❌ Receipt data generation failed: {e}")
        return False
    
    # Test 2: Basic receipt generator class
    try:
        from core.receipt_generator import ReceiptGenerator
        generator = ReceiptGenerator()
        assert generator is not None
        print("✅ Receipt generator class working")
    except Exception as e:
        print(f"❌ Receipt generator class failed: {e}")
        return False
    
    # Test 3: Configuration loading
    try:
        from config.settings import load_config
        config = load_config()
        assert isinstance(config, dict)
        print("✅ Configuration loading working")
    except Exception as e:
        print(f"❌ Configuration loading failed: {e}")
        return False
    
    return True

def test_api_setup():
    """Test FastAPI setup"""
    print("🌐 Testing API setup...")
    
    try:
        from api.main import app
        assert app is not None
        print("✅ FastAPI app setup working")
        return True
    except Exception as e:
        print(f"❌ FastAPI app setup failed: {e}")
        return False

def main():
    """Main test runner"""
    print("🚀 Starting AI Receipt Generator Test Suite")
    print("=" * 50)
    
    # Change to project directory
    project_dir = Path(__file__).parent
    os.chdir(project_dir)
    
    all_tests_passed = True
    
    # Run basic functionality tests
    if not test_basic_functionality():
        all_tests_passed = False
    
    print()
    
    # Run API setup tests
    if not test_api_setup():
        all_tests_passed = False
    
    print()
    print("=" * 50)
    
    if all_tests_passed:
        print("🎉 All basic tests passed! The test framework is ready.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
