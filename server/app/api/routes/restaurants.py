from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, status

from app.api.deps import require_admin
from app.models.user import User
from app.schemas.restaurant import RestaurantCreate, RestaurantRead, RestaurantUpdate
from app.services.restaurant_service import (
    create_restaurant,
    list_restaurants,
    update_restaurant,
)

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.get("", response_model=list[RestaurantRead])
async def get_restaurants(_: User = Depends(require_admin)) -> list[RestaurantRead]:
    return await list_restaurants()


@router.post("", response_model=RestaurantRead, status_code=status.HTTP_201_CREATED)
async def post_restaurant(
    payload: RestaurantCreate, _: User = Depends(require_admin)
) -> RestaurantRead:
    return await create_restaurant(payload)


@router.patch("/{restaurant_id}", response_model=RestaurantRead)
async def patch_restaurant(
    restaurant_id: PydanticObjectId,
    payload: RestaurantUpdate,
    _: User = Depends(require_admin),
) -> RestaurantRead:
    return await update_restaurant(restaurant_id, payload)
