from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.account import AccountCreate, AccountUpdate, Account
from app.models.account import Account as AccountModel, AccountType
from app.core.deps import get_current_user
from app.services.account_service import AccountService

router = APIRouter(tags=["Accounts"])


@router.post("/", response_model=Account, status_code=status.HTTP_201_CREATED)
def create_account(
    account_in: AccountCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AccountService(db)
    return service.create(account_in)


@router.get("/", response_model=List[Account])
def read_accounts(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    account_type_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AccountService(db)
    return service.get_all(skip=skip, limit=limit, search=search, account_type_id=account_type_id, is_active=is_active)


@router.get("/tree", response_model=List[dict])
def read_accounts_tree(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AccountService(db)
    return service.get_tree()


@router.get("/{account_id}", response_model=Account)
def read_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AccountService(db)
    account = service.get_by_id(account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.put("/{account_id}", response_model=Account)
def update_account(
    account_id: int,
    account_in: AccountUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AccountService(db)
    account = service.update(account_id, account_in)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AccountService(db)
    if not service.delete(account_id):
        raise HTTPException(status_code=404, detail="Account not found")
    return None
