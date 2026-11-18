from datetime import datetime
from typing import Optional

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict


class RestaurantCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    cuisine_type: Optional[str] = None
    owner_id: Optional[PydanticObjectId] = None


class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    cuisine_type: Optional[str] = None
    owner_id: Optional[PydanticObjectId] = None
    is_active: Optional[bool] = None


class RestaurantRead(BaseModel):
    id: PydanticObjectId
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    cuisine_type: Optional[str] = None
    owner_id: Optional[PydanticObjectId] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
