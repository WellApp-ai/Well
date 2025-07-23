import pytest
from core.data_generator import generate_receipt_data
from core.prompt_renderer import generate_image_prompt
from pathlib import Path
import json
import math

# +++ Fixtures +++

@pytest.fixture
def default_style() -> dict:
    """Loads the default style for tests."""
    style_path = Path("src/core/prompts/styles/table_noire.json")
    return json.loads(style_path.read_text(encoding="utf-8"))

# +++ Data Generator Tests +++

def test_generate_receipt_data_structure():
    """Ensures the generated data has the correct structure and keys."""
    data = generate_receipt_data()
    assert isinstance(data, dict)
    
    # Check top-level keys
    expected_keys = [
        "transaction_id", "merchant", "items", "transaction_amount",
        "terminal", "card", "barcode"
    ]
    for key in expected_keys:
        assert key in data, f"Missing top-level key: {key}"

    # Check nested structures
    assert "name" in data["merchant"]
    assert "address" in data["merchant"]
    assert "line1" in data["merchant"]["address"]
    assert isinstance(data["items"], list)
    assert len(data["items"]) > 0
    assert "description" in data["items"][0]
    assert "line_total" in data["items"][0]
    assert "amount" in data["transaction_amount"]
    assert "tax_amount" in data["transaction_amount"]

def test_generate_receipt_with_overrides():
    """Tests that overrides are correctly applied to the generated data."""
    overrides = {
        "merchant_name": "My Test Cafe",
        "tax_rate": 0.20
    }
    data = generate_receipt_data(overrides=overrides)
    
    assert data["merchant"]["name"] == "My Test Cafe"
    assert data["transaction_amount"]["tax_rate"] == "20%"

def test_item_totals_are_calculated_correctly():
    """Tests that totals are correctly calculated when specific items are provided."""
    overrides = {
        "items": [
            {"description": "Coffee", "quantity": 2, "unit_price": 3.50},
            {"description": "Cake", "quantity": 1, "unit_price": 5.00}
        ],
        "tax_rate": 0.1
    }
    data = generate_receipt_data(overrides=overrides)
    
    # Expected: (2 * 3.50) + (1 * 5.00) = 7.00 + 5.00 = 12.00
    expected_ht_total = 12.00
    expected_tax = 1.20
    expected_ttc = 13.20
    
    assert math.isclose(float(data["transaction_amount"]["amount"]), expected_ht_total)
    assert math.isclose(float(data["transaction_amount"]["tax_amount"]), expected_tax)
    assert math.isclose(float(data["transaction_amount"]["amount_tendered"]), expected_ttc)
    assert len(data["items"]) == 2
    assert data["items"][0]["line_total"] == 7.00

def test_total_override_generates_correct_sum():
    """Tests that generated items sum up to the forced total."""
    overrides = {
        "total_ttc": 100.00,
        "tax_rate": 0.25 # 1 + 0.25 = 1.25
    }
    # HT should be 100.00 / 1.25 = 80.00
    data = generate_receipt_data(overrides=overrides, num_items=5)
    
    items_total = sum(item["line_total"] for item in data["items"])
    
    assert math.isclose(items_total, 80.00)
    assert math.isclose(float(data["transaction_amount"]["amount_tendered"]), 100.00)

# +++ Prompt Renderer Tests +++

def test_image_prompt_generation(default_style):
    """Tests that a valid prompt string is generated."""
    data = generate_receipt_data()
    prompt = generate_image_prompt(data, default_style)
    
    assert isinstance(prompt, str)
    assert len(prompt.strip()) > 50
    assert "Generate a realistic photo" in prompt

def test_image_prompt_contains_data(default_style):
    """Ensures the generated prompt contains the JSON payload and style."""
    data = generate_receipt_data(overrides={"merchant_name": "Prompt Test Store"})
    prompt = generate_image_prompt(data, default_style)
    
    # Check that the data payload is embedded
    assert '"name": "Prompt Test Store"' in prompt
    
    # Check that the style payload is embedded
    style_json_string = json.dumps(default_style, indent=2)
    assert style_json_string in prompt