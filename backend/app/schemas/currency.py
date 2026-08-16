from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime, date


class CurrencyBase(BaseModel):
    code: str
    name: str
    symbol: Optional[str] = None
    is_base: bool = False
    is_active: bool = True


class CurrencyCreate(CurrencyBase):
    exchange_rate: Optional[float] = 1.0


class CurrencyUpdate(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    name: Optional[str] = None
    symbol: Optional[str] = None
    is_base: Optional[bool] = None
    is_active: Optional[bool] = None
    exchange_rate: Optional[float] = None


class ExchangeRateBase(BaseModel):
    currency_id: int
    rate: float
    rate_date: date


class ExchangeRateCreate(ExchangeRateBase):
    pass


class ExchangeRateUpdate(BaseModel):
    id: Optional[int] = None
    currency_id: Optional[int] = None
    rate: Optional[float] = None
    rate_date: Optional[date] = None


class ExchangeRateInDB(ExchangeRateBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ExchangeRate(ExchangeRateInDB):
    pass


class CurrencyInDB(CurrencyBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    exchange_rates: List[ExchangeRate] = []

    model_config = ConfigDict(from_attributes=True)


class Currency(CurrencyInDB):
    pass
