"""
FastAPI Application for Receipt Generator RESTful API
Provides comprehensive endpoints for receipt generation, parsing, validation, and management
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time
import os
from datetime import datetime

from .router import router

# ==============================
# Application Configuration
# ==============================

# Environment-based configuration
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = ENVIRONMENT == "development"
API_VERSION = "1.0.0"
API_TITLE = "🧾 Receipt Generator API"
API_DESCRIPTION = """
# Receipt Generator RESTful API

A comprehensive API for generating, parsing, and validating receipts with AI-powered image generation.

## Features

- **Receipt Generation**: Generate realistic receipt data and images
- **Receipt Parsing**: Extract structured data from receipt text
- **Receipt Validation**: Validate receipt data for consistency
- **Style Management**: Create and manage visual styles
- **Configuration**: Manage generation settings

## Quick Start

1. **Generate a receipt**:
   ```bash
   POST /generate
   {
     "input_fields": {"merchant_name": "My Store"},
     "style": "table_noire",
     "include_image": true
   }
   ```

2. **Parse receipt text**:
   ```bash
   POST /parse
   {
     "receipt_text": "STORE NAME\nItems:\n- Coffee $3.50\nTotal: $5.50"
   }
   ```

3. **Validate receipt data**:
   ```bash
   POST /validate
   {
     "receipt_data": {...},
     "strict_mode": false
   }
   ```

## Authentication

Currently, this API does not require authentication. In production, consider implementing API key authentication.

## Rate Limiting

- **Development**: No limits
- **Production**: 100 requests per minute per IP

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "error_code": "ERROR_CODE",
  "details": {...},
  "timestamp": "2024-01-15T14:30:00Z"
}
```
"""

# ==============================
# FastAPI Application
# ==============================

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None,
    openapi_url="/openapi.json" if DEBUG else None,
    contact={
        "name": "Well App AI Team",
        "email": "contact@wellapp.ai",
        "url": "https://wellapp.ai"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://api.wellapp.ai",
            "description": "Production server"
        }
    ]
)

# ==============================
# Middleware Configuration
# ==============================

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React dev server
        "http://localhost:8000",  # FastAPI dev server
        "https://wellapp.ai",     # Production frontend
        "https://*.wellapp.ai"    # Subdomains
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted host middleware (production only)
if ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "api.wellapp.ai",
            "*.wellapp.ai"
        ]
    )

# ==============================
# Request/Response Middleware
# ==============================

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

@app.middleware("http")
async def add_request_id_header(request: Request, call_next):
    """Add request ID header for tracking"""
    import uuid
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# ==============================
# Global Exception Handlers
# ==============================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "error_code": "INTERNAL_ERROR",
            "details": {
                "path": str(request.url),
                "method": request.method,
                "request_id": getattr(request.state, "request_id", "unknown")
            },
            "timestamp": datetime.now().isoformat()
        }
    )

# ==============================
# Health Check Endpoints
# ==============================

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Receipt Generator API",
        "version": API_VERSION,
        "environment": ENVIRONMENT,
        "docs_url": "/docs" if DEBUG else None,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/ping", tags=["Health"])
async def ping():
    """Simple ping endpoint for health checks"""
    return {"pong": datetime.now().isoformat()}

# ==============================
# Include Routers
# ==============================

# Include the main API router
app.include_router(
    router,
    prefix="/api/v1",
    tags=["Receipt Operations"]
)

# ==============================
# Startup/Shutdown Events
# ==============================

@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    print(f"🚀 Receipt Generator API starting up...")
    print(f"📊 Environment: {ENVIRONMENT}")
    print(f"🔧 Debug mode: {DEBUG}")
    print(f"📚 Documentation: {'/docs' if DEBUG else 'Disabled'}")
    print(f"⏰ Started at: {datetime.now().isoformat()}")

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    print(f"🛑 Receipt Generator API shutting down...")
    print(f"⏰ Shutdown at: {datetime.now().isoformat()}")

# ==============================
# Development Helpers
# ==============================

if DEBUG:
    @app.get("/debug/info", tags=["Debug"])
    async def debug_info():
        """Debug information endpoint (development only)"""
        import sys
        import platform
        
        return {
            "python_version": sys.version,
            "platform": platform.platform(),
            "environment": ENVIRONMENT,
            "debug": DEBUG,
            "timestamp": datetime.now().isoformat()
        }
