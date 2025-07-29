import pytest
import yaml
from pathlib import Path
from src.core.config_loader import load_config, validate_config, resolve_api_key

# --- Fixtures ---

@pytest.fixture
def valid_config_data():
    return {
        "openai_image": {
            "model": "gpt-image-1",
            "size": "1024x1024",
            "quality": "high",
            "api_key": "key_from_config"
        },
        "anthropic": {
            "model": "claude-3-opus-20240229"
        }
    }

@pytest.fixture
def invalid_config_data():
    return {
        "openai_image": {
            "model": "gpt-image-1"
            # Missing size and quality
        }
    }

# --- Tests ---

def test_load_config(tmp_path: Path, valid_config_data: dict):
    """Tests loading a valid YAML config file."""
    config_file = tmp_path / "models.yaml"
    config_file.write_text(yaml.dump(valid_config_data), encoding="utf-8")
    
    config = load_config(config_file)
    assert config == valid_config_data

def test_load_missing_config(tmp_path: Path):
    """Tests behavior when the config file is missing."""
    config = load_config(tmp_path / "non_existent.yaml")
    assert config == {}

def test_validate_config_success(valid_config_data: dict):
    """Tests that a valid config passes validation."""
    assert validate_config(valid_config_data) is True

def test_validate_config_failure(invalid_config_data: dict, capsys):
    """Tests that an invalid config fails validation and prints an error."""
    assert validate_config(invalid_config_data) is False
    captured = capsys.readouterr()
    assert "Missing fields in openai_image" in captured.out
    assert "size" in captured.out
    assert "quality" in captured.out

def test_resolve_api_key_from_config(valid_config_data: dict):
    """Tests resolving API key when it's present in the config."""
    key = resolve_api_key(valid_config_data, "openai_image")
    assert key == "key_from_config"

def test_resolve_api_key_from_env(monkeypatch, valid_config_data: dict):
    """Tests resolving API key from environment variable as a fallback."""
    # Remove key from config data for this test
    config_without_key = valid_config_data.copy()
    del config_without_key["openai_image"]["api_key"]
    
    monkeypatch.setenv("OPENAI_API_KEY", "key_from_env")
    
    key = resolve_api_key(config_without_key, "openai_image")
    assert key == "key_from_env"

def test_resolve_api_key_prefers_config_over_env(monkeypatch, valid_config_data: dict):
    """Tests that the config key is preferred over the environment variable."""
    monkeypatch.setenv("OPENAI_API_KEY", "key_from_env")
    key = resolve_api_key(valid_config_data, "openai_image")
    assert key == "key_from_config"

def test_resolve_api_key_not_found():
    """Tests that None is returned when no key is found."""
    config = {"openai_image": {"model": "test"}}
    key = resolve_api_key(config, "openai_image")
    assert key is None