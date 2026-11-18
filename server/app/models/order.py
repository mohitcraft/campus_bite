from datetime import datetime
from enum import Enum
from typing import Optional

from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderItem(BaseModel):
    menu_item_id: Optional[PydanticObjectId] = None
    name: str
    price: float
    quantity: int = 1


class Order(Document):
    customer_id: PydanticObjectId
    restaurant_id: PydanticObjectId
    items: list[OrderItem]
    total_amount: float
    status: OrderStatus = OrderStatus.PENDING
    delivery_address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "orders"
        indexes = [
            "restaurant_id",
            "customer_id",
            "status",
            "created_at",
        ]
