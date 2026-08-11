from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BackupRecordBase(BaseModel):
    filename: str
    file_path: str
    file_size: Optional[int] = None
    backup_type: str = "manual"


class BackupRecordCreate(BackupRecordBase):
    pass


class BackupRecordInDB(BackupRecordBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BackupRecord(BackupRecordInDB):
    pass
