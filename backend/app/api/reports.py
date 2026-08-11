from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
from app.core.database import get_db
from app.core.deps import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/trial-balance")
def get_trial_balance(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.report_service import ReportService
    service = ReportService(db)
    return service.get_trial_balance(start_date, end_date)


@router.get("/general-ledger")
def get_general_ledger(
    account_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.report_service import ReportService
    service = ReportService(db)
    return service.get_general_ledger(account_id, start_date, end_date)


@router.get("/income-statement")
def get_income_statement(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    fund_id: Optional[int] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.report_service import ReportService
    service = ReportService(db)
    return service.get_income_statement(start_date, end_date, fund_id, project_id)


@router.get("/balance-sheet")
def get_balance_sheet(
    end_date: Optional[date] = None,
    fund_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.report_service import ReportService
    service = ReportService(db)
    return service.get_balance_sheet(end_date, fund_id)


@router.get("/cash-flow")
def get_cash_flow(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.report_service import ReportService
    service = ReportService(db)
    return service.get_cash_flow(start_date, end_date)


@router.get("/budget-vs-actual")
def get_budget_vs_actual(
    fiscal_year: Optional[int] = None,
    fund_id: Optional[int] = None,
    project_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.report_service import ReportService
    service = ReportService(db)
    return service.get_budget_vs_actual(fiscal_year, fund_id, project_id)


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.services.report_service import ReportService
    service = ReportService(db)
    return service.get_dashboard()
