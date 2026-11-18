from datetime import datetime

from beanie import PydanticObjectId
from fastapi import HTTPException, status

from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import Role, User
from app.schemas.order import OrderCreate, OrderStatusUpdate


async def list_orders_for_user(current_user: User) -> list[dict]:
    if current_user.role == Role.ADMIN:
        match_stage: dict = {}
    elif current_user.role == Role.RESTAURANT_OWNER:
        if not current_user.restaurant_id:
            return []
        match_stage = {"restaurant_id": current_user.restaurant_id}
    else:
        match_stage = {"customer_id": current_user.id}

    pipeline = [
        {"$match": match_stage},
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
        {"$sort": {"created_at": -1}},
    ]
    return await Order.aggregate(pipeline).to_list()


async def update_order_status(
    order_id: PydanticObjectId, payload: OrderStatusUpdate, current_user: User
) -> Order:
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Order not found"
        )

    if current_user.role == Role.RESTAURANT_OWNER:
        if not current_user.restaurant_id or order.restaurant_id != current_user.restaurant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed to update this order",
            )
    elif current_user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to update this order",
        )

    order.status = payload.status
    order.updated_at = datetime.utcnow()
    await order.save()
    return order


async def create_order(payload: OrderCreate, current_user: User) -> Order:
    if not payload.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item",
        )

    items = [OrderItem(**item.model_dump()) for item in payload.items]
    total_amount = sum(item.price * item.quantity for item in items)

    order = Order(
        customer_id=current_user.id,
        restaurant_id=payload.restaurant_id,
        items=items,
        total_amount=round(total_amount, 2),
        status=OrderStatus.PENDING,
        delivery_address=payload.delivery_address,
        notes=payload.notes,
    )
    await order.insert()
    return order
