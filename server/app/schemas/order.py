from datetime import datetime
from typing import Optional

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict

from app.models.order import OrderStatus


class OrderItemSchema(BaseModel):
    menu_item_id: Optional[PydanticObjectId] = None
    name: str
    price: float
    quantity: int = 1


class OrderCreate(BaseModel):
    restaurant_id: PydanticObjectId
    items: list[OrderItemSchema]
    delivery_address: Optional[str] = None
    notes: Optional[str] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderRead(BaseModel):
    id: PydanticObjectId
    customer_id: PydanticObjectId
    restaurant_id: PydanticObjectId
    restaurant_name: Optional[str] = None
    items: list[OrderItemSchema]
    total_amount: float
    status: OrderStatus
    delivery_address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
