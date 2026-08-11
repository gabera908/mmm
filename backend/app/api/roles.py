from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.user import RoleCreate, RoleUpdate, Role
from app.models.user import User as UserModel, Role as RoleModel
from app.core.deps import get_current_active_superuser

router = APIRouter(tags=["Roles"])


@router.post("/", response_model=Role, status_code=status.HTTP_201_CREATED)
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser),
):
    db_role = db.query(RoleModel).filter(RoleModel.name == role_in.name).first()
    if db_role:
        raise HTTPException(status_code=400, detail="Role already exists")
    role = RoleModel(**role_in.model_dump())
    db.add(role)
    db.commit()
    db.refresh(role)
    return role


@router.get("/", response_model=List[Role])
def read_roles(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser),
):
    roles = db.query(RoleModel).offset(skip).limit(limit).all()
    return roles


@router.get("/{role_id}", response_model=Role)
def read_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser),
):
    role = db.query(RoleModel).filter(RoleModel.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.put("/{role_id}", response_model=Role)
def update_role(
    role_id: int,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser),
):
    role = db.query(RoleModel).filter(RoleModel.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    update_data = role_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(role, field, value)
    db.commit()
    db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_active_superuser),
):
    role = db.query(RoleModel).filter(RoleModel.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()
    return None
