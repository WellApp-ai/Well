# 🧾 Receipt Generator RESTful API

A comprehensive RESTful API for generating, parsing, and validating receipts with AI-powered image generation.

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install -e .[dev]

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Running the API

```bash
# Development server
uvicorn src.core.api.app:app --reload --host 0.0.0.0 --port 8000

# Production server
uvicorn src.core.api.app:app --host 0.0.0.0 --port 8000
```

### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 📚 API Endpoints

### Health & Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Root endpoint with API info |
| `GET` | `/ping` | Simple health check |
| `GET` | `/api/v1/health` | Detailed health check |
| `GET` | `/api/v1/status` | API status and configuration |

### Receipt Generation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/generate` | Generate complete receipt with image |
| `POST` | `/api/v1/generate/data` | Generate receipt data only |

### Receipt Parsing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/parse` | Parse receipt data from text |

### Receipt Validation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/validate` | Validate receipt data |
| `POST` | `/api/v1/validate/batch` | Validate multiple receipts |

### Style Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/styles` | List available styles |
| `GET` | `/api/v1/styles/{name}` | Get style information |
| `POST` | `/api/v1/styles` | Create new style |
| `DELETE` | `/api/v1/styles/{name}` | Delete style |

### Configuration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/config` | Get current configuration |
| `POST` | `/api/v1/config` | Update configuration |

## 🔧 Usage Examples

### Generate a Receipt

```bash
curl -X POST "http://localhost:8000/api/v1/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "input_fields": {
      "merchant_name": "My Store",
      "total_ttc": 50.00
    },
    "style": "table_noire",
    "include_image": true
  }'
```

**Response:**
```json
{
  "receipt_data": {
    "transaction_id": "TXN123456789",
    "authorization_code": "AUTH123456",
    "transaction_date_time": "2024-01-15T14:30:00Z",
    "status": "APPROVED",
    "transaction_amount": {
      "amount": "50.00",
      "currency": "EUR",
      "tax_rate": "10%",
      "tax_amount": "5.00"
    },
    "merchant_name": "My Store",
    "merchant_address": "123 Main St, City, Country",
    "items": [...]
  },
  "image_data": "base64_encoded_image_data",
  "prompt": "Generated image prompt",
  "style": "table_noire",
  "metadata": {
    "generated_at": "2024-01-15T14:30:00Z",
    "style_used": "table_noire"
  }
}
```

### Parse Receipt Text

```bash
curl -X POST "http://localhost:8000/api/v1/parse" \
  -H "Content-Type: application/json" \
  -d '{
    "receipt_text": "STORE NAME\nItems:\n- Coffee $3.50\nTotal: $5.50",
    "language": "en"
  }'
```

**Response:**
```json
{
  "parsed_data": {
    "merchant": "STORE NAME",
    "total": 5.50,
    "items": [
      {"description": "Coffee", "price": "3.50"}
    ],
    "date": "2024-01-15"
  },
  "confidence": 0.85,
  "raw_text": "STORE NAME\nItems:\n- Coffee $3.50\nTotal: $5.50",
  "extraction_metadata": {
    "language": "en",
    "text_length": 45,
    "parsed_at": "2024-01-15T14:30:00Z"
  }
}
```

### Validate Receipt Data

```bash
curl -X POST "http://localhost:8000/api/v1/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "receipt_data": {
      "transaction_id": "TXN123456789",
      "transaction_amount": {"amount": "25.50"},
      "items": [
        {"description": "Coffee", "unit_price": 3.50, "quantity": 2}
      ]
    },
    "strict_mode": false
  }'
```

**Response:**
```json
{
  "is_valid": true,
  "confidence": 0.95,
  "errors": [],
  "warnings": ["Total amount doesn't match sum of items"]
}
```

### Create a New Style

```bash
curl -X POST "http://localhost:8000/api/v1/styles" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "modern_style",
    "content": {
      "background": "white",
      "font": "Arial",
      "colors": {
        "primary": "#000000",
        "secondary": "#666666"
      }
    },
    "description": "Modern minimalist style"
  }'
```

## 🏗️ Architecture

### Service Layer

The API implements a clean separation of concerns with a service layer:

```
API Endpoints → Service Layer → Business Logic → External APIs
```

- **API Layer**: FastAPI endpoints with request/response models
- **Service Layer**: Business logic encapsulation (`ReceiptService`)
- **Business Logic**: Core functionality (data generation, image generation)
- **External APIs**: OpenAI, Anthropic, etc.

### Key Components

1. **Service Layer** (`src/core/services/receipt_service.py`)
   - Encapsulates all business logic
   - Provides clean interfaces for API endpoints
   - Handles error cases and validation

2. **API Models** (`src/core/api/models.py`)
   - Comprehensive Pydantic models
   - Request/response schemas
   - Validation and documentation

3. **Router** (`src/core/api/router.py`)
   - RESTful endpoint definitions
   - Error handling
   - Legacy endpoint support

4. **Application** (`src/core/api/app.py`)
   - FastAPI application configuration
   - Middleware setup
   - Global exception handlers

## 🔒 Error Handling

The API provides consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "error_code": "ERROR_CODE",
  "details": {
    "path": "/api/v1/generate",
    "method": "POST"
  },
  "timestamp": "2024-01-15T14:30:00Z"
}
```

### Common Error Codes

- `HTTP_400`: Bad Request (invalid input)
- `HTTP_404`: Not Found (resource not found)
- `HTTP_500`: Internal Server Error
- `INTERNAL_ERROR`: Unhandled exceptions

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pytest tests/test_api.py -v

# Run specific test category
pytest tests/test_api.py::test_generate_receipt_success -v

# Run with coverage
pytest tests/test_api.py --cov=src.core.api --cov-report=html
```

### Test Categories

- **Health & Status**: Basic API functionality
- **Generation**: Receipt generation endpoints
- **Parsing**: Text parsing functionality
- **Validation**: Data validation logic
- **Style Management**: Style CRUD operations
- **Configuration**: Config management
- **Legacy**: Backward compatibility
- **Error Handling**: Exception scenarios
- **Performance**: Response headers, CORS

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
ENVIRONMENT=development  # or production
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Server Configuration
HOST=0.0.0.0
PORT=8000
```

### Configuration Files

- `config/receipt_input.yaml`: Default receipt generation settings
- `config/models.yaml`: AI model configurations
- `src/core/prompts/styles/`: Visual style definitions

## 🚀 Deployment

### Development

```bash
# Install dependencies
pip install -e .[dev]

# Run with auto-reload
uvicorn src.core.api.app:app --reload --host 0.0.0.0 --port 8000
```

### Production

```bash
# Install production dependencies
pip install -e .

# Set environment
export ENVIRONMENT=production

# Run with gunicorn
gunicorn src.core.api.app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . .

RUN pip install -e .

EXPOSE 8000

CMD ["uvicorn", "src.core.api.app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📊 Monitoring

### Health Checks

```bash
# Basic health check
curl http://localhost:8000/ping

# Detailed health check
curl http://localhost:8000/api/v1/health

# API status
curl http://localhost:8000/api/v1/status
```

### Response Headers

All responses include:
- `X-Process-Time`: Request processing time
- `X-Request-ID`: Unique request identifier

### Logging

The API logs:
- Request/response details
- Error information
- Performance metrics
- Startup/shutdown events

## 🔄 Migration from Legacy

The API maintains backward compatibility with legacy endpoints:

| Legacy Endpoint | New Endpoint | Status |
|-----------------|--------------|--------|
| `/api/v1/current-config` | `/api/v1/config` | ✅ Compatible |
| `/api/v1/update-input` | `/api/v1/config` | ✅ Compatible |
| `/api/v1/create-style` | `/api/v1/styles` | ✅ Compatible |
| `/api/v1/generate-receipt` | `/api/v1/generate` | ✅ Compatible |

## 🤝 Contributing

### Adding New Endpoints

1. **Define Models** (`src/core/api/models.py`)
2. **Add Service Methods** (`src/core/services/receipt_service.py`)
3. **Create Endpoint** (`src/core/api/router.py`)
4. **Write Tests** (`tests/test_api.py`)
5. **Update Documentation**

### Code Style

- Follow PEP 8
- Use type hints
- Add docstrings
- Write comprehensive tests
- Update API documentation

## 📄 License

MIT License - see [LICENSE](../LICENSE) for details.

## 🆘 Support

- **Documentation**: `/docs` endpoint when running
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: contact@wellapp.ai 