# 📟 ai-receipt-generator

> Generator of realistic fake receipts (text + image) from structured data.
> Uses Faker for synthetic data, custom image prompts, and DALL·E 3 (GPT-Image) for visual generation.

![ChatGPT Image May 3, 2025, 11_31_53 PM (1)](https://github.com/user-attachments/assets/18705e51-c453-4263-b80b-7ab3df4e92bb)

---

## 📂 Project Overview

This project allows you to:

* Automatically generate a **structured fake receipt** in JSON format
* Transform it into a coherent image prompt (like a scanned receipt)
* Call **OpenAI GPT-Image (gpt-image-1)** to generate a **realistic receipt photo**
* Use it via **CLI** or **REST API (optional)**

---

## 🌐 Installation

### 1. Clone the repository

```bash
git clone https://github.com/WellApp-ai/Well.git
cd ai-receipt-generator
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
source venv/bin/activate      # Linux/macOS
venv\Scripts\activate         # Windows
```

### 3. Install dependencies

```bash
pip install -e .[dev]        # Windows
pip install -e .\[dev\]      # Linux/macOS
```

### 4.Create a .env file at the project root

> Inside the .env file, add your API keys (you can include one or both):

```text
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```
> These keys will be automatically loaded if you use the .env approach.

---

## 🔧 Usage

### CLI Usage

Generate a receipt image using a style:

```bash
python src/core/cli.py --style table_noire
```

Available options:

* `--input-path`: YAML or JSON file containing the data (merged into `receipt_input.yaml`)
* `--style`: visual style name from `prompts/styles/` (without `.json`)
* `--output-path`: path to export the generated prompt as `.txt`
* `--save-image`: whether to save the PNG image (default: yes)
* `--open-image`: whether to automatically open the PNG file

### REST API Usage

Start the API server:

```bash
# Using the provided script
python run_api.py

# Or directly with uvicorn
uvicorn src.core.api.app:app --reload --host 0.0.0.0 --port 8000
```

Access the API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Generate a receipt via API:

```bash
curl -X POST "http://localhost:8000/api/v1/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "input_fields": {"merchant_name": "My Store"},
    "style": "table_noire",
    "include_image": true
  }'
```

For comprehensive API documentation, see [API_README.md](API_README.md).

---

## 🔎 Quick Examples

### CLI Example

```bash
python src/core/cli.py --style table_noire
```

* Prompt exported to: `exports/prompt_for_chatgpt.txt`
* Image saved to: `exports/receipt_generated.png`

### API Example

```bash
# Generate receipt with image
curl -X POST "http://localhost:8000/api/v1/generate" \
  -H "Content-Type: application/json" \
  -d '{"style": "table_noire", "include_image": true}'

# Parse receipt text
curl -X POST "http://localhost:8000/api/v1/parse" \
  -H "Content-Type: application/json" \
  -d '{"receipt_text": "STORE\nItems:\n- Coffee $3.50\nTotal: $5.50"}'
```

---

## 📁 Project Structure

```txt
ai-receipt-generator/
├── src/ 
│    └── core/
│       ├── data_generator.py         # Generate JSON data (Faker)
│       ├── prompt_renderer.py        # Inject data into image prompt
│       ├── cli.py                    # Main CLI entry point (Typer)
│       ├── config_loader.py          # Load model.yaml
│       ├── services/
│       │   └── receipt_service.py    # Business logic layer
│       ├── api/
│       │   ├── app.py                # FastAPI application
│       │   ├── router.py             # API endpoints
│       │   └── models.py             # Pydantic models
│       ├── generators/
│       │   ├── base.py
│       │   ├── openai_generator.py
│       │   └── anthropic_generator.py
│       ├── prompts/
│       │   ├── styles/               # Visual style definitions
│       │   └── image_prompt_template.txt
│       └── config/
├── tests/
│   └── test_api.py                   # API test suite
├── config/
│   ├── receipt_input.yaml            # Default receipt settings
│   └── models.yaml                   # AI model configurations
├── run_api.py                        # API server runner
├── API_README.md                     # Comprehensive API documentation
└── README.md                         # This file
```
│       │   ├── image_prompt_template.txt
│       │   └── styles/
│       │       └── table_noire.json
│       ├── api/                      # (Optional)
│       │   ├── app.py                # FastAPI app
│       │   ├── router.py
│       │   ├── models.py
├── config/
│   └── receipt_input.yaml        # Editable fields (merchant, total, items, etc.)
├── exports/
│   ├── prompt_for_chatgpt.txt
│   └── receipt_generated.png
├── examples/
│   └── generated_receipt.json
├── tests/
│   └── test_core.py
├── requirements.txt
├── pyproject.toml
├── README.md
├── CONTRIBUTING.md
```

---

## ⚙️ Configuration Files

### `config/models.yaml`

Defines the models used:

```yaml
openai_image:
  model: gpt-image-1
  size: 1024x1024
  quality: high
```

> This file is loaded automatically. You can edit it to change the model, image size, or quality.

### `config/receipt_input.yaml`

You can pre-fill some fields here:

```yaml
merchant_name: Starbucks
transaction_date_time: 2025-05-21T15:00:00Z
ttc: 12.90
items:
  - description: Latte
    unit_price: 3.20
    quantity: 2
```

Unspecified fields are randomly generated using Faker.

---

## 🎯 REST API (optional)

You can expose the engine via FastAPI:

```bash
uvicorn core.api.app:app --reload
```
if error 

```bash
python -m uvicorn core.api.app:app --reload --app-dir=src --reload-dir=src
```

### Available endpoints:

| URL                 | Method | Description                                |
| ------------------- | ------ | ------------------------------------------ |
| `/current-config`   | GET    | Returns the current `receipt_input.yaml`   |
| `/update-input`     | POST   | Updates the `receipt_input.yaml` file      |
| `/styles`           | GET    | Lists available visual styles              |
| `/create-style`     | POST   | Adds a new style JSON file                 |
| `/generate-receipt` | POST   | Generates an image prompt and base64 image |

---

## 🔾 Server Launch Options

### ▶️ Option 1 — Using included `run.bat` (Windows)

```bash
./run.bat
```

This will:

* Activate the virtual environment
* Set `PYTHONPATH=src`
* Launch the FastAPI app with hot-reload

---

### ▶️ Option 2 — Using `run_api.sh` (macOS/Linux)

```bash
chmod +x run_api.sh
./run_api.sh
```

Same behavior as above: activates your venv, sets the path, and launches the API.

---

### ▶️ Option 3 — Manual launch

```bash
uvicorn core.api.app:app --reload --reload-dir=src --app-dir=src
```

Make sure you are in the project root and that the `venv` is activated.

---

### 🔐 Authentication

This project requires access to OpenAI API.

You can set your key either:

* In a `.env` file (recommended)

```env
OPENAI_API_KEY=sk-xxx
```

* Or directly inside `config/models.yaml` under `openai_image.api_key`

---

## 🧪 Testing

```bash
pytest
```

* Tests the JSON structure
* Verifies that the generated image prompt is not empty

---

## 💎 Extras

* You can create your own visual styles in `prompts/styles/*.json`
* You can infinitely customize the data fields
* The project is modular: everything is organized by role

---

## 📄 License

MIT

> Created by Pierre Ribeiro. Free to use and contribute.
