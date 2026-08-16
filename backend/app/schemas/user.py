from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Optional[str] = None
    is_active: bool = True


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[str] = None
    is_active: Optional[bool] = None


class RoleInDB(RoleBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Role(RoleInDB):
    pass


class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    role_id: Optional[int] = None
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    role_id: Optional[int] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None
    must_change_password: Optional[bool] = None


class UserInDB(UserBase):
    id: int
    hashed_password: str
    last_login: Optional[datetime] = None
    must_change_password: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    role: Optional[Role] = None

    model_config = ConfigDict(from_attributes=True)


class User(UserInDB):
    pass


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[str] = None


class ChangePassword(BaseModel):
    old_password: str
    new_password: str
