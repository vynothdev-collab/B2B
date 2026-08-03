"""
Run once to create the first super_admin account.
  python create_admin.py --email admin@example.com --name "Admin" --password "yourpassword"
"""
import asyncio
import argparse
import uuid

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.admin_user import AdminUser
import app.models  # noqa: F401 — register all ORM models


async def create_admin(email: str, name: str, password: str, role: str = "super_admin") -> None:
    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(AdminUser).where(AdminUser.email == email))
        if existing.scalar_one_or_none():
            print(f"Admin with email '{email}' already exists.")
            return

        admin = AdminUser(
            id=str(uuid.uuid4()),
            email=email,
            name=name,
            hashed_password=hash_password(password),
            role=role,
        )
        db.add(admin)
        await db.commit()
        print(f"Created {role} '{name}' <{email}>")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create an admin user")
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--role", default="super_admin", choices=["admin", "super_admin"])
    args = parser.parse_args()

    asyncio.run(create_admin(args.email, args.name, args.password, args.role))
