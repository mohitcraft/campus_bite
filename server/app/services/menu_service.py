from fastapi import HTTPException, status

from app.models.menu import MenuItem
from app.models.user import Role, User
from app.schemas.menu import MenuItemCreate


async def list_menu_items() -> list[dict]:
    pipeline = [
        {"$match": {"is_available": True}},
        {
            "$lookup": {
                "from": "restaurants",
                "localField": "restaurant_id",
                "foreignField": "_id",
                "as": "restaurant",
            }
        },
        {"$unwind": {"path": "$restaurant", "preserveNullAndEmptyArrays": True}},
        {
            "$addFields": {
                "id": "$_id",
                "restaurant_name": {"$ifNull": ["$restaurant.name", "Unknown Restaurant"]},
            }
        },
        {"$project": {"_id": 0, "restaurant": 0}},
        {"$sort": {"name": 1}},
    ]
    return await MenuItem.aggregate(pipeline).to_list()


async def create_menu_item(payload: MenuItemCreate, current_user: User) -> MenuItem:
    restaurant_id = payload.restaurant_id

    if current_user.role == Role.RESTAURANT_OWNER:
        if not current_user.restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Restaurant owner is not assigned to a restaurant",
            )
        restaurant_id = current_user.restaurant_id
    elif restaurant_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="restaurant_id is required",
        )

    item = MenuItem(
        restaurant_id=restaurant_id,
        name=payload.name,
        description=payload.description,
        price=payload.price,
        category=payload.category,
        image_url=payload.image_url,
        is_available=payload.is_available,
    )
    await item.insert()
    return item

