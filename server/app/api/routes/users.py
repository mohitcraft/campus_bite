from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, status

from app.api.deps import require_admin
from app.models.user import User
from app.schemas.user import UserCreateByAdmin, UserRead, UserUpdate
from app.services.user_service import create_user_by_admin, list_users, update_user

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


@router.get("", response_model=list[UserRead])
async def get_users(_: User = Depends(require_admin)) -> list[UserRead]:
    return await list_users()


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreateByAdmin, _: User = Depends(require_admin)
) -> UserRead:
    return await create_user_by_admin(payload)


@router.patch("/{user_id}", response_model=UserRead)
async def patch_user(
    user_id: PydanticObjectId,
    payload: UserUpdate,
    _: User = Depends(require_admin),
) -> UserRead:
    return await update_user(user_id, payload)
