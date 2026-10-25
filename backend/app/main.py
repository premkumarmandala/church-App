"""FastAPI application entry point for Grace Church and Bible API."""
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from app.api.routes import router as api_router
from app.config import settings
from app.services.bible_service import bible_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler to pre-load Scripture data on application startup."""
    bible_service.load_data()
    yield


app = FastAPI(
    title=settings.TITLE,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Enable CORS for multi-frontend and cross-origin compatibility
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

# Register API Router
app.include_router(api_router)


# Serve documentation file for licensing
@app.get("/BIBLE_SOURCES_AND_LICENSING.md", include_in_schema=False)
def get_licensing_doc() -> Response:
    """Serve licensing documentation file."""
    doc_path = settings.DOCS_DIR / "BIBLE_SOURCES_AND_LICENSING.md"
    if doc_path.exists():
        return FileResponse(doc_path, media_type="text/markdown; charset=utf-8")
    return Response(content="# Licensing Documentation\nPublic Domain / MIT License.", media_type="text/markdown")


# Mount /bible-data directory for offline caching and raw JSON access
if settings.DATA_DIR.exists():
    app.mount(
        "/bible-data",
        StaticFiles(directory=str(settings.DATA_DIR)),
        name="bible-data",
    )

# Mount frontend directory for web access if present
if settings.FRONTEND_DIR.exists():
    app.mount(
        "/",
        StaticFiles(directory=str(settings.FRONTEND_DIR), html=True),
        name="frontend",
    )
