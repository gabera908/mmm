from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class AccountTypeBase(BaseModel):
    name: str
    code: str
    is_active: bool = True


class AccountTypeCreate(AccountTypeBase):
    pass


class AccountTypeUpdate(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    code: Optional[str] = None


class AccountTypeInDB(AccountTypeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AccountType(AccountTypeInDB):
    pass


class AccountBase(BaseModel):
    code: str
    name: str
    name_en: Optional[str] = None
    parent_id: Optional[int] = None
    account_type_id: int
    level: int = 1
    is_active: bool = True
    is_header: bool = False
    description: Optional[str] = None


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = None
    name_en: Optional[str] = None
    parent_id: Optional[int] = None
    account_type_id: Optional[int] = None
    level: Optional[int] = None
    is_active: Optional[bool] = None
    is_header: Optional[bool] = None
    description: Optional[str] = None


class AccountInDB(AccountBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    account_type: Optional[AccountType] = None

    model_config = ConfigDict(from_attributes=True)


class Account(AccountInDB):
    pass
