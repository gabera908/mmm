from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.fiscal_year import FiscalYearCreate, FiscalYearUpdate, FiscalYear, AccountingPeriodCreate
from app.core.deps import get_current_user

router = APIRouter(tags=["Fiscal Years"])


@router.post("", response_model=FiscalYear, status_code=status.HTTP_201_CREATED)
def create_fiscal_year(
    year_in: FiscalYearCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.fiscal_year import FiscalYear as FiscalYearModel
    db_year = db.query(FiscalYearModel).filter(FiscalYearModel.year == year_in.year).first()
    if db_year:
        raise HTTPException(status_code=400, detail="Fiscal year already exists")
    year = FiscalYearModel(**year_in.model_dump())
    db.add(year)
    db.commit()
    db.refresh(year)
    return year


@router.get("", response_model=List[FiscalYear])
def read_fiscal_years(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.fiscal_year import FiscalYear as FiscalYearModel
    years = db.query(FiscalYearModel).offset(skip).limit(limit).all()
    return years


@router.post("/{year_id}/periods", status_code=status.HTTP_201_CREATED)
def create_accounting_period(
    year_id: int,
    period_in: AccountingPeriodCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.fiscal_year import FiscalYear as FiscalYearModel, AccountingPeriod
    year = db.query(FiscalYearModel).filter(FiscalYearModel.id == year_id).first()
    if not year:
        raise HTTPException(status_code=404, detail="Fiscal year not found")
    if year.is_closed:
        raise HTTPException(status_code=400, detail="Cannot add periods to closed fiscal year")
    period = AccountingPeriod(**period_in.model_dump(), fiscal_year_id=year_id)
    db.add(period)
    db.commit()
    db.refresh(period)
    return period


@router.post("/{year_id}/close", response_model=FiscalYear)
def close_fiscal_year(
    year_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.fiscal_year import FiscalYear as FiscalYearModel
    from datetime import datetime
    year = db.query(FiscalYearModel).filter(FiscalYearModel.id == year_id).first()
    if not year:
        raise HTTPException(status_code=404, detail="Fiscal year not found")
    if year.is_closed:
        raise HTTPException(status_code=400, detail="Fiscal year already closed")
    year.is_closed = True
    year.closed_at = datetime.utcnow()
    db.commit()
    db.refresh(year)
    return year
