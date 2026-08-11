from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditLogBase(BaseModel):
    user_id: Optional[int] = None
    action: str
    table_name: str
    record_id: Optional[int] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogInDB(AuditLogBase):
    id: int
    created_at: Optional[datetime] = None
    user: Optional[dict] = None

    class Config:
        from_attributes = True


class AuditLog(AuditLogInDB):
    pass
