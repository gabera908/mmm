from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class CompanySettingsBase(BaseModel):
    company_name: str
    logo_path: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    base_currency: str = "EGP"
    fiscal_year: Optional[int] = None
    date_format: str = "%Y-%m-%d"
    number_format: str = "###,##0.00"
    backup_schedule: str = "0 2 * * *"
    backup_retention_days: int = 30


class CompanySettingsCreate(CompanySettingsBase):
    pass


class CompanySettingsUpdate(BaseModel):
    id: Optional[int] = None
    company_name: Optional[str] = None
    logo_path: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    base_currency: Optional[str] = None
    fiscal_year: Optional[int] = None
    date_format: Optional[str] = None
    number_format: Optional[str] = None
    backup_schedule: Optional[str] = None
    backup_retention_days: Optional[int] = None


class CompanySettingsInDB(CompanySettingsBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CompanySettings(CompanySettingsInDB):
    pass
