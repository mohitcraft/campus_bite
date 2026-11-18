from fastapi import APIRouter, Depends, status

from app.api.deps import require_owner_or_admin
from app.models.user import User
from app.schemas.menu import MenuItemCreate, MenuItemRead
from app.services.menu_service import create_menu_item, list_menu_items

router = APIRouter(prefix="/menu", tags=["menu"])


@router.get("", response_model=list[MenuItemRead])
async def get_menu() -> list[MenuItemRead]:
    """Return available menu items for the main page."""
    return await list_menu_items()


@router.post("", response_model=MenuItemRead, status_code=status.HTTP_201_CREATED)
async def add_menu_item(
    payload: MenuItemCreate,
    current_user: User = Depends(require_owner_or_admin),
) -> MenuItemRead:
    """Add a menu item (restaurant owner/admin)."""
    return await create_menu_item(payload, current_user)

