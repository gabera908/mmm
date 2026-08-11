from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.currency import CurrencyCreate, CurrencyUpdate, Currency, ExchangeRateCreate
from app.core.deps import get_current_user

router = APIRouter(prefix="/currencies", tags=["Currencies"])


@router.post("/", response_model=Currency, status_code=status.HTTP_201_CREATED)
def create_currency(
    currency_in: CurrencyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.currency import Currency as CurrencyModel
    db_currency = db.query(CurrencyModel).filter(CurrencyModel.code == currency_in.code).first()
    if db_currency:
        raise HTTPException(status_code=400, detail="Currency code already exists")
    currency = CurrencyModel(**currency_in.model_dump())
    db.add(currency)
    db.commit()
    db.refresh(currency)
    return currency


@router.get("/", response_model=List[Currency])
def read_currencies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.currency import Currency as CurrencyModel
    currencies = db.query(CurrencyModel).offset(skip).limit(limit).all()
    return currencies


@router.put("/{currency_id}", response_model=Currency)
def update_currency(
    currency_id: int,
    currency_in: CurrencyUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.currency import Currency as CurrencyModel
    currency = db.query(CurrencyModel).filter(CurrencyModel.id == currency_id).first()
    if not currency:
        raise HTTPException(status_code=404, detail="Currency not found")
    update_data = currency_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(currency, field, value)
    db.commit()
    db.refresh(currency)
    return currency


@router.post("/{currency_id}/exchange-rates", status_code=status.HTTP_201_CREATED)
def create_exchange_rate(
    currency_id: int,
    rate_in: ExchangeRateCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.currency import Currency as CurrencyModel, ExchangeRate as ExchangeRateModel
    currency = db.query(CurrencyModel).filter(CurrencyModel.id == currency_id).first()
    if not currency:
        raise HTTPException(status_code=404, detail="Currency not found")
    rate = ExchangeRateModel(**rate_in.model_dump(), currency_id=currency_id)
    db.add(rate)
    db.commit()
    db.refresh(rate)
    return rate
