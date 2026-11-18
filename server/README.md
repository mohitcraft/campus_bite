# Campus Bite API (Server)

FastAPI backend for Campus Bite with MongoDB (Beanie ODM).

## Setup

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Ensure MongoDB is running locally (default: `mongodb://localhost:27017`).
4. (Optional) Create a `.env` file based on `.env.example`.

## Run

```bash
uvicorn main:app --reload
```

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`

## Project structure

- `app/core/` — configuration and database connection (`config.py`, `database.py`)
- `app/models/` — Beanie document models / MongoDB collections (`User`, `Restaurant`, `MenuItem`)
- `app/schemas/` — Pydantic request/response schemas
- `main.py` — FastAPI app entrypoint and DB lifespan hooks

## Data model & role strategy

- **Users (`users`)** have roles: `customer`, `restaurant_owner`, `admin`.
  - Customers can self-sign up (default role: `customer`).
  - Admins can create restaurant owners/admin users.
  - A user can be assigned to a restaurant via `restaurant_id`; when assigned as an owner, their role should be set to `restaurant_owner` (enforced in service/route logic).
- **Restaurants (`restaurants`)** can be created by admins and linked to an owner via `owner_id`.
- **Menu items (`menu_items`)** belong to a restaurant (`restaurant_id`) and are managed by the restaurant owner for that restaurant (authorization enforced in service/route logic).

This structure supports a single portal with role-based access: customer-facing flows vs. owner/admin management flows.
