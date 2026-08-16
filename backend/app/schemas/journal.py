from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


class JournalEntryLineBase(BaseModel):
    account_id: int
    fund_id: Optional[int] = None
    project_id: Optional[int] = None
    debit: Decimal = Decimal("0")
    credit: Decimal = Decimal("0")
    description: Optional[str] = None
    line_number: Optional[int] = 1


class JournalEntryLineCreate(JournalEntryLineBase):
    pass


class JournalEntryLineUpdate(BaseModel):
    id: Optional[int] = None
    account_id: Optional[int] = None
    fund_id: Optional[int] = None
    project_id: Optional[int] = None
    debit: Optional[Decimal] = None
    credit: Optional[Decimal] = None
    description: Optional[str] = None
    line_number: Optional[int] = None


class JournalEntryLineInDB(JournalEntryLineBase):
    id: int
    journal_entry_id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class JournalEntryLine(JournalEntryLineInDB):
    pass


class JournalEntryBase(BaseModel):
    entry_date: date
    description: Optional[str] = None
    reference: Optional[str] = None
    currency: str = "EGP"
    exchange_rate: Decimal = Decimal("1")
    fund_id: Optional[int] = None
    project_id: Optional[int] = None


class JournalEntryCreate(JournalEntryBase):
    lines: List[JournalEntryLineCreate]


class JournalEntryUpdate(BaseModel):
    id: Optional[int] = None
    entry_date: Optional[date] = None
    description: Optional[str] = None
    reference: Optional[str] = None
    currency: Optional[str] = None
    exchange_rate: Optional[Decimal] = None
    fund_id: Optional[int] = None
    project_id: Optional[int] = None
    lines: Optional[List[JournalEntryLineCreate]] = None


class JournalEntryInDB(JournalEntryBase):
    id: int
    entry_number: str
    status: str
    created_by: int
    posted_at: Optional[datetime] = None
    reversed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    lines: List[JournalEntryLine] = []

    model_config = ConfigDict(from_attributes=True)


class JournalEntry(JournalEntryInDB):
    pass
