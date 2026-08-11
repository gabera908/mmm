from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class FiscalYearBase(BaseModel):
    year: int
    start_date: date
    end_date: date
    is_closed: bool = False


class FiscalYearCreate(FiscalYearBase):
    pass


class FiscalYearUpdate(BaseModel):
    id: int
    year: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_closed: Optional[bool] = None


class AccountingPeriodBase(BaseModel):
    fiscal_year_id: int
    name: str
    start_date: date
    end_date: date
    is_closed: bool = False


class AccountingPeriodCreate(AccountingPeriodBase):
    pass


class AccountingPeriodUpdate(BaseModel):
    id: int
    fiscal_year_id: Optional[int] = None
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_closed: Optional[bool] = None


class AccountingPeriodInDB(AccountingPeriodBase):
    id: int
    closed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AccountingPeriod(AccountingPeriodInDB):
    pass


class FiscalYearInDB(FiscalYearBase):
    id: int
    closed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    periods: List[AccountingPeriod] = []

    class Config:
        from_attributes = True


class FiscalYear(FiscalYearInDB):
    pass
