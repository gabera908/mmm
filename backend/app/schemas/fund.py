from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class FundBase(BaseModel):
    code: str
    name: str
    fund_type: str = "unrestricted"
    description: Optional[str] = None
    is_active: bool = True


class FundCreate(FundBase):
    pass


class FundUpdate(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = None
    fund_type: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class FundInDB(FundBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Fund(FundInDB):
    pass
