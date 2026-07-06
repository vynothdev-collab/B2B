import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.list import List as ListModel, ListItem
from app.models.user import User
from app.schemas.list import AddToListRequest, AddToListResponse, ListCreate, ListItemOut, ListResponse, ListUpdate

router = APIRouter(prefix="/lists", tags=["lists"])


async def _ensure_defaults(user_id: str, db: AsyncSession) -> list[ListModel]:
    result = await db.execute(
        select(ListModel).where(
            ListModel.user_id == user_id,
            ListModel.is_default == True,
            ListModel.deleted_at == None,
        )
    )
    existing = result.scalars().all()
    existing_types = {d.list_type for d in existing}

    to_create = []
    if "people" not in existing_types:
        to_create.append(
            ListModel(
                id=str(uuid.uuid4()),
                name="All saved people",
                list_type="people",
                user_id=user_id,
                is_default=True,
            )
        )
    if "companies" not in existing_types:
        to_create.append(
            ListModel(
                id=str(uuid.uuid4()),
                name="All saved companies",
                list_type="companies",
                user_id=user_id,
                is_default=True,
            )
        )

    if to_create:
        db.add_all(to_create)
        await db.flush()

    return list(existing) + to_create


@router.get("", response_model=list[ListResponse])
async def get_lists(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_defaults(current_user.id, db)

    result = await db.execute(
        select(ListModel)
        .where(ListModel.user_id == current_user.id, ListModel.deleted_at == None)
        .order_by(ListModel.is_default.desc(), ListModel.created_at.asc())
    )
    lists = result.scalars().all()

    responses = []
    for lst in lists:
        count_result = await db.execute(
            select(func.count(ListItem.id)).where(ListItem.list_id == lst.id)
        )
        count = count_result.scalar() or 0
        responses.append(
            ListResponse(
                id=lst.id,
                name=lst.name,
                list_type=lst.list_type,
                is_default=lst.is_default,
                record_count=count,
                created_at=lst.created_at,
                updated_at=lst.updated_at,
            )
        )

    return responses


@router.post("", response_model=ListResponse)
async def create_list(
    data: ListCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_list = ListModel(
        id=str(uuid.uuid4()),
        name=data.name,
        list_type=data.list_type,
        user_id=current_user.id,
        is_default=False,
    )
    db.add(new_list)
    await db.flush()
    return ListResponse(
        id=new_list.id,
        name=new_list.name,
        list_type=new_list.list_type,
        is_default=new_list.is_default,
        record_count=0,
        created_at=new_list.created_at,
        updated_at=new_list.updated_at,
    )


@router.post("/add-items", response_model=AddToListResponse)
async def add_items_to_list(
    data: AddToListRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not data.items:
        raise HTTPException(status_code=400, detail="No items provided")

    item_type = data.items[0].item_type
    list_type = "people" if item_type == "person" else "companies"

    if data.list_id:
        result = await db.execute(
            select(ListModel).where(
                ListModel.id == data.list_id,
                ListModel.user_id == current_user.id,
                ListModel.deleted_at == None,
            )
        )
        target_list = result.scalar_one_or_none()
        if not target_list:
            raise HTTPException(status_code=404, detail="List not found")
    else:
        if not data.list_name:
            raise HTTPException(status_code=400, detail="list_name required when list_id is not provided")
        target_list = ListModel(
            id=str(uuid.uuid4()),
            name=data.list_name,
            list_type=list_type,
            user_id=current_user.id,
            is_default=False,
        )
        db.add(target_list)
        await db.flush()

    defaults = await _ensure_defaults(current_user.id, db)
    default_list = next((d for d in defaults if d.list_type == list_type), None)

    existing_in_target_result = await db.execute(
        select(ListItem.record_id).where(ListItem.list_id == target_list.id)
    )
    existing_in_target = {row[0] for row in existing_in_target_result.fetchall()}

    existing_in_default: set[str] = set()
    if default_list and default_list.id != target_list.id:
        existing_in_default_result = await db.execute(
            select(ListItem.record_id).where(ListItem.list_id == default_list.id)
        )
        existing_in_default = {row[0] for row in existing_in_default_result.fetchall()}

    added_count = 0
    for item in data.items:
        if item.record_id not in existing_in_target:
            db.add(
                ListItem(
                    id=str(uuid.uuid4()),
                    list_id=target_list.id,
                    record_id=item.record_id,
                    item_type=item.item_type,
                    data=item.data,
                )
            )
            added_count += 1

        if default_list and default_list.id != target_list.id and item.record_id not in existing_in_default:
            db.add(
                ListItem(
                    id=str(uuid.uuid4()),
                    list_id=default_list.id,
                    record_id=item.record_id,
                    item_type=item.item_type,
                    data=item.data,
                )
            )

    target_list.updated_at = datetime.now(timezone.utc)

    return AddToListResponse(
        added=added_count,
        list_id=target_list.id,
        list_name=target_list.name,
    )


@router.delete("/{list_id}")
async def delete_list(
    list_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ListModel).where(
            ListModel.id == list_id,
            ListModel.user_id == current_user.id,
            ListModel.deleted_at == None,
        )
    )
    lst = result.scalar_one_or_none()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    if lst.is_default:
        raise HTTPException(status_code=400, detail="Cannot delete default lists")

    lst.deleted_at = datetime.now(timezone.utc)
    return {"ok": True}


@router.patch("/{list_id}", response_model=ListResponse)
async def rename_list(
    list_id: str,
    data: ListUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ListModel).where(
            ListModel.id == list_id,
            ListModel.user_id == current_user.id,
            ListModel.deleted_at == None,
        )
    )
    lst = result.scalar_one_or_none()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")
    if lst.is_default:
        raise HTTPException(status_code=400, detail="Cannot rename default lists")

    lst.name = data.name.strip()
    lst.updated_at = datetime.now(timezone.utc)
    await db.flush()

    count_result = await db.execute(
        select(func.count(ListItem.id)).where(ListItem.list_id == lst.id)
    )
    return ListResponse(
        id=lst.id,
        name=lst.name,
        list_type=lst.list_type,
        is_default=lst.is_default,
        record_count=count_result.scalar() or 0,
        created_at=lst.created_at,
        updated_at=lst.updated_at,
    )


@router.delete("/{list_id}/items/{item_id}")
async def remove_list_item(
    list_id: str,
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ListModel).where(
            ListModel.id == list_id,
            ListModel.user_id == current_user.id,
            ListModel.deleted_at == None,
        )
    )
    lst = result.scalar_one_or_none()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    item_result = await db.execute(
        select(ListItem).where(ListItem.id == item_id, ListItem.list_id == list_id)
    )
    item = item_result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    await db.delete(item)
    lst.updated_at = datetime.now(timezone.utc)
    return {"ok": True}


@router.get("/{list_id}/items", response_model=list[ListItemOut])
async def get_list_items(
    list_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ListModel).where(
            ListModel.id == list_id,
            ListModel.user_id == current_user.id,
            ListModel.deleted_at == None,
        )
    )
    lst = result.scalar_one_or_none()
    if not lst:
        raise HTTPException(status_code=404, detail="List not found")

    items_result = await db.execute(
        select(ListItem).where(ListItem.list_id == list_id).order_by(ListItem.added_at.desc())
    )
    items = items_result.scalars().all()
    return [
        ListItemOut(
            id=i.id,
            record_id=i.record_id,
            item_type=i.item_type,
            data=i.data if isinstance(i.data, dict) else {},
            added_at=i.added_at,
        )
        for i in items
    ]
