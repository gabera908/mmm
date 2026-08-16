from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime, date


class ProjectBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    fund_id: Optional[int] = None
    donor_id: Optional[int] = None
    budget: float = 0
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = "draft"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    fund_id: Optional[int] = None
    donor_id: Optional[int] = None
    budget: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None


class ProjectInDB(ProjectBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Project(ProjectInDB):
    pass
