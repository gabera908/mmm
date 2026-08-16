from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user

router = APIRouter(tags=["General Ledger"])


@router.get("/api/ledger")
def get_general_ledger(
    account_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    fund_id: Optional[int] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.ledger_service import LedgerService
    service = LedgerService(db)
    return service.get_ledger(account_id, start_date, end_date, fund_id, project_id)
