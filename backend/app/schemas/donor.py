from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class DonorBase(BaseModel):
    name: str
    donor_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True


class DonorCreate(DonorBase):
    pass


class DonorUpdate(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    donor_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class DonorInDB(DonorBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Donor(DonorInDB):
    pass
