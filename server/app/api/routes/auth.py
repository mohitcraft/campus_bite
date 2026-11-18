from fastapi import APIRouter, status

from app.schemas.auth import LoginRequest, Token
from app.schemas.user import UserCreate, UserRead
from app.services.auth_service import login_user, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate) -> UserRead:
    """Open registration endpoint. New users are created with the customer role."""
    user = await register_user(payload)
    return user


@router.post("/login", response_model=Token)
async def login(payload: LoginRequest) -> Token:
    """Authenticate a user and return an access token."""
    return await login_user(payload)
