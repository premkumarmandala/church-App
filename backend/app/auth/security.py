"""Security, JWT token issuance, and authentication dependencies."""
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from app.config import settings

# Optional bearer scheme to extract token from Authorization: Bearer <token>
bearer_scheme = HTTPBearer(auto_error=False)


def verify_admin_credentials(username: str, password: str) -> bool:
    """Verify administrator credentials against configuration settings."""
    if not username or not password:
        return False
    return (
        username.strip() == settings.ADMIN_USERNAME.strip()
        and password == settings.ADMIN_PASSWORD
    )


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ADMIN_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.ADMIN_JWT_SECRET,
        algorithm=settings.ADMIN_JWT_ALGORITHM,
    )
    return encoded_jwt


def get_current_admin(
    request: Request,
    auth_header: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    """FastAPI dependency: Authenticate pastoral administrator via JWT bearer token or header."""
    token: Optional[str] = None

    if auth_header and auth_header.credentials:
        token = auth_header.credentials
    else:
        # Check custom X-Admin-Token header or query parameter for attachment downloads
        token = request.headers.get("X-Admin-Token") or request.query_params.get("token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required: Please provide a valid pastoral admin token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token,
            settings.ADMIN_JWT_SECRET,
            algorithms=[settings.ADMIN_JWT_ALGORITHM],
        )
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: Subject missing.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"username": username, "role": payload.get("role", "admin")}
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired: Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: Authentication failed.",
            headers={"WWW-Authenticate": "Bearer"},
        )
