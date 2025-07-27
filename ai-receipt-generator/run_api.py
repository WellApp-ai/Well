#!/usr/bin/env python3
"""
Simple script to run the Receipt Generator API server
"""
import os
import sys
import uvicorn
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def main():
    """Run the API server"""
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("ENVIRONMENT", "development") == "development"
    
    print(f"🚀 Starting Receipt Generator API...")
    print(f"📊 Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"🌐 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🔄 Auto-reload: {reload}")
    print(f"📚 Documentation: http://{host}:{port}/docs")
    print(f"🔍 Health check: http://{host}:{port}/ping")
    print()
    
    # Run the server
    uvicorn.run(
        "src.core.api.app:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )

if __name__ == "__main__":
    main() 