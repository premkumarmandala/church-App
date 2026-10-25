"""Convenience script to start the Grace Church FastAPI server."""
import os
import sys
from pathlib import Path
import uvicorn

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings

if __name__ == "__main__":
    host = os.getenv("HOST", settings.HOST)
    port = int(os.getenv("PORT", str(settings.PORT)))
    reload = os.getenv("RELOAD", "true").lower() in ("true", "1", "yes")

    print(f"================================================================")
    print(f" Starting {settings.TITLE} v{settings.VERSION}")
    print(f" Server URL:        http://localhost:{port}/")
    print(f" Swagger Docs:      http://localhost:{port}/docs")
    print(f" ReDoc:             http://localhost:{port}/redoc")
    print(f" Bible Reader App:  http://localhost:{port}/bible/")
    print(f" API Base:          http://localhost:{port}/api/bible/")
    print(f"================================================================")

    uvicorn.run("app.main:app", host=host, port=port, reload=reload)
