from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.fund import FundCreate, FundUpdate, Fund
from app.core.deps import get_current_user

router = APIRouter(tags=["Funds"])


@router.post("/", response_model=Fund, status_code=status.HTTP_201_CREATED)
def create_fund(
    fund_in: FundCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.fund import Fund as FundModel
    db_fund = db.query(FundModel).filter(FundModel.code == fund_in.code).first()
    if db_fund:
        raise HTTPException(status_code=400, detail="Fund code already exists")
    fund = FundModel(**fund_in.model_dump())
    db.add(fund)
    db.commit()
    db.refresh(fund)
    return fund


@router.get("/", response_model=List[Fund])
def read_funds(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.fund import Fund as FundModel
    funds = db.query(FundModel).offset(skip).limit(limit).all()
    return funds


@router.get("/{fund_id}", response_model=Fund)
def read_fund(
    fund_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.fund import Fund as FundModel
    fund = db.query(FundModel).filter(FundModel.id == fund_id).first()
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")
    return fund


@router.put("/{fund_id}", response_model=Fund)
def update_fund(
    fund_id: int,
    fund_in: FundUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.fund import Fund as FundModel
    fund = db.query(FundModel).filter(FundModel.id == fund_id).first()
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")
    update_data = fund_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fund, field, value)
    db.commit()
    db.refresh(fund)
    return fund


@router.delete("/{fund_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fund(
    fund_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.fund import Fund as FundModel
    from app.models.journal import JournalEntryLine
    fund = db.query(FundModel).filter(FundModel.id == fund_id).first()
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")
    has_lines = db.query(JournalEntryLine).filter(JournalEntryLine.fund_id == fund_id).first()
    if has_lines:
        raise HTTPException(status_code=400, detail="Cannot delete fund with transactions")
    db.delete(fund)
    db.commit()
    return None
