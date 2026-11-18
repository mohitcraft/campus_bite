from beanie import init_beanie
from pymongo import AsyncMongoClient

from app.core.config import settings
from app.models.menu import MenuItem
from app.models.order import Order
from app.models.restaurant import Restaurant
from app.models.user import User

client: AsyncMongoClient | None = None


async def init_db() -> None:
    global client
    client = AsyncMongoClient(settings.mongodb_url)
    await init_beanie(
        database=client[settings.database_name],
        document_models=[User, Restaurant, MenuItem, Order],
    )


async def close_db() -> None:
    global client
    if client is not None:
        await client.close()
        client = None
