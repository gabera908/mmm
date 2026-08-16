from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class DonationBase(BaseModel):
    donation_date: date
    donor_id: int
    fund_id: int
    project_id: Optional[int] = None
    amount: Decimal
    currency: str = "EGP"
    exchange_rate: Decimal = Decimal("1")
    payment_method: Optional[str] = None
    reference: Optional[str] = None
    notes: Optional[str] = None


class DonationCreate(DonationBase):
    pass


class DonationUpdate(BaseModel):
    id: Optional[int] = None
    donation_date: Optional[date] = None
    donor_id: Optional[int] = None
    fund_id: Optional[int] = None
    project_id: Optional[int] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    exchange_rate: Optional[Decimal] = None
    payment_method: Optional[str] = None
    reference: Optional[str] = None
    notes: Optional[str] = None


class DonationInDB(DonationBase):
    id: int
    created_by: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Donation(DonationInDB):
    pass
