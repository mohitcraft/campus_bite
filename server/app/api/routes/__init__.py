from .auth import router as auth_router
from .menu import router as menu_router
from .orders import router as orders_router
from .restaurants import router as restaurants_router
from .users import router as users_router

__all__ = [
    "auth_router",
    "menu_router",
    "users_router",
    "restaurants_router",
    "orders_router",
]


