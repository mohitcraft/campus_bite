from datetime import datetime

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from app.models.restaurant import Restaurant
from app.models.user import Role, User
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate


async def list_restaurants() -> list[Restaurant]:
    return await Restaurant.find_all().sort(+Restaurant.created_at).to_list()


async def create_restaurant(payload: RestaurantCreate) -> Restaurant:
    owner_id = payload.owner_id
    if owner_id is not None:
        owner = await User.get(owner_id)
        if not owner:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Owner user not found"
            )

    restaurant = Restaurant(**payload.model_dump())
    await restaurant.insert()

    if owner_id is not None:
        owner = await User.get(owner_id)
        if owner:
            owner.role = Role.RESTAURANT_OWNER
            owner.restaurant_id = restaurant.id
            owner.updated_at = datetime.utcnow()
            await owner.save()

    return restaurant


async def update_restaurant(
    restaurant_id: PydanticObjectId, payload: RestaurantUpdate
) -> Restaurant:
    restaurant = await Restaurant.get(restaurant_id)
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found"
        )

    data = payload.model_dump(exclude_unset=True)

    if "owner_id" in data:
        new_owner_id = data["owner_id"]
        old_owner_id = restaurant.owner_id

        if new_owner_id is not None:
            new_owner = await User.get(new_owner_id)
            if not new_owner:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Owner user not found",
                )
            restaurant.owner_id = new_owner_id
            new_owner.role = Role.RESTAURANT_OWNER
            new_owner.restaurant_id = restaurant.id
            new_owner.updated_at = datetime.utcnow()
            await new_owner.save()
        else:
            restaurant.owner_id = None

        if old_owner_id and old_owner_id != new_owner_id:
            old_owner = await User.get(old_owner_id)
            if old_owner and old_owner.restaurant_id == restaurant.id:
                old_owner.restaurant_id = None
                if old_owner.role == Role.RESTAURANT_OWNER:
                    old_owner.role = Role.CUSTOMER
                old_owner.updated_at = datetime.utcnow()
                await old_owner.save()

        data.pop("owner_id", None)

    for field, value in data.items():
        setattr(restaurant, field, value)

    restaurant.updated_at = datetime.utcnow()
    await restaurant.save()
    return restaurant
