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
    is_catalyst = bool(os.getenv("X_ZOHO_CATALYST_LISTEN_PORT"))
    port = int(os.getenv("X_ZOHO_CATALYST_LISTEN_PORT") or os.getenv("PORT") or str(settings.PORT))
    # Disable reloader on Catalyst AppSail container to run as production service
    default_reload = "false" if is_catalyst else "true"
    reload = os.getenv("RELOAD", default_reload).lower() in ("true", "1", "yes")

    print(f"================================================================")
    print(f" Starting {settings.TITLE} v{settings.VERSION}")
    print(f" Server URL:        http://localhost:{port}/")
    print(f" Swagger Docs:      http://localhost:{port}/docs")
    print(f" ReDoc:             http://localhost:{port}/redoc")
    print(f" Bible Reader App:  http://localhost:{port}/bible/")
    print(f" API Base:          http://localhost:{port}/api/bible/")
    print(f"================================================================")

    uvicorn.run("app.main:app", host=host, port=port, reload=reload)
