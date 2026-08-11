from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user

router = APIRouter(prefix="/trial-balance", tags=["Trial Balance"])


@router.get("/")
def get_trial_balance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.ledger_service import LedgerService
    service = LedgerService(db)
    return service.get_trial_balance(start_date, end_date)
