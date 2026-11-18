from datetime import datetime

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from app.core.security import hash_password
from app.models.restaurant import Restaurant
from app.models.user import Role, User
from app.schemas.user import UserCreateByAdmin, UserUpdate


async def list_users() -> list[User]:
    return await User.find_all().sort(+User.created_at).to_list()


async def create_user_by_admin(payload: UserCreateByAdmin) -> User:
    existing = await User.find_one(User.email == payload.email.lower())
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    restaurant_id = payload.restaurant_id
    role = payload.role

    if restaurant_id is not None:
        restaurant = await Restaurant.get(restaurant_id)
        if not restaurant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Restaurant not found",
            )
        # Assigning a restaurant makes the user a restaurant owner
        role = Role.RESTAURANT_OWNER

    user = User(
        name=payload.name,
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        role=role,
        restaurant_id=restaurant_id,
    )
    await user.insert()

    if restaurant_id is not None:
        restaurant.owner_id = user.id
        restaurant.updated_at = datetime.utcnow()
        await restaurant.save()

    return user


async def update_user(user_id: PydanticObjectId, payload: UserUpdate) -> User:
    user = await User.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    data = payload.model_dump(exclude_unset=True)

    if "email" in data and data["email"]:
        data["email"] = data["email"].lower()
        existing = await User.find_one(User.email == data["email"])
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

    if "password" in data and data["password"]:
        user.password_hash = hash_password(data.pop("password"))
    else:
        data.pop("password", None)

    # Handle restaurant assignment and role changes
    if "restaurant_id" in data:
        new_restaurant_id = data["restaurant_id"]
        old_restaurant_id = user.restaurant_id

        if new_restaurant_id is not None:
            restaurant = await Restaurant.get(new_restaurant_id)
            if not restaurant:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Restaurant not found",
                )
            user.restaurant_id = new_restaurant_id
            user.role = Role.RESTAURANT_OWNER
            restaurant.owner_id = user.id
            restaurant.updated_at = datetime.utcnow()
            await restaurant.save()
        else:
            user.restaurant_id = None
            # If unassigned, keep role as provided or default back to customer if they were owner
            if "role" not in data and user.role == Role.RESTAURANT_OWNER:
                user.role = Role.CUSTOMER

        if old_restaurant_id and old_restaurant_id != new_restaurant_id:
            old_restaurant = await Restaurant.get(old_restaurant_id)
            if old_restaurant and old_restaurant.owner_id == user.id:
                old_restaurant.owner_id = None
                old_restaurant.updated_at = datetime.utcnow()
                await old_restaurant.save()

        data.pop("restaurant_id", None)

    if "role" in data and data["role"] is not None:
        user.role = data["role"]
        data.pop("role", None)

    for field, value in data.items():
        setattr(user, field, value)

    user.updated_at = datetime.utcnow()
    await user.save()
    return user
