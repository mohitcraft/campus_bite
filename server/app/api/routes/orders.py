from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, status

from app.api.deps import get_current_user, require_owner_or_admin
from app.models.user import User
from app.schemas.order import OrderCreate, OrderRead, OrderStatusUpdate
from app.services.order_service import create_order, list_orders_for_user, update_order_status

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[OrderRead])
async def get_orders(
    current_user: User = Depends(get_current_user),
) -> list[OrderRead]:
    """List orders for the current user (customer), or managed orders for owner/admin."""
    return await list_orders_for_user(current_user)


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
async def place_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user),
) -> OrderRead:
    """Place an order (authenticated users)."""
    return await create_order(payload, current_user)


@router.patch("/{order_id}/status", response_model=OrderRead)
async def change_order_status(
    order_id: PydanticObjectId,
    payload: OrderStatusUpdate,
    current_user: User = Depends(require_owner_or_admin),
) -> OrderRead:
    """Update order status (restaurant owner/admin)."""
    return await update_order_status(order_id, payload, current_user)
