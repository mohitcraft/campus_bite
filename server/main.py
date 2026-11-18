from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    auth_router,
    menu_router,
    orders_router,
    restaurants_router,
    users_router,
)
from app.core.database import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(title="Campus Bite API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(menu_router)
app.include_router(users_router)
app.include_router(restaurants_router)
app.include_router(orders_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Campus Bite API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
