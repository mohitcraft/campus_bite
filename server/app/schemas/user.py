from datetime import datetime
from typing import Optional

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict

from app.models.user import Role


class UserCreate(BaseModel):
    """Schema for customer self-signup."""

    name: str
    email: str
    password: str


class UserCreateByAdmin(BaseModel):
    """Schema for admin creating users/owners or assigning restaurants."""

    name: str
    email: str
    password: str
    role: Role = Role.RESTAURANT_OWNER
    restaurant_id: Optional[PydanticObjectId] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[Role] = None
    restaurant_id: Optional[PydanticObjectId] = None
    is_active: Optional[bool] = None


class UserRead(BaseModel):
    id: PydanticObjectId
    name: str
    email: str
    role: Role
    restaurant_id: Optional[PydanticObjectId] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
