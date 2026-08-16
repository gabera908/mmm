from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class BudgetBase(BaseModel):
    fiscal_year: int
    account_id: int
    fund_id: Optional[int] = None
    project_id: Optional[int] = None
    budget_amount: float = 0
    actual_amount: float = 0
    notes: Optional[str] = None


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    id: Optional[int] = None
    fiscal_year: Optional[int] = None
    account_id: Optional[int] = None
    fund_id: Optional[int] = None
    project_id: Optional[int] = None
    budget_amount: Optional[float] = None
    actual_amount: Optional[float] = None
    notes: Optional[str] = None


class BudgetInDB(BudgetBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Budget(BudgetInDB):
    pass
