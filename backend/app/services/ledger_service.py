from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date
from typing import Optional
from app.models.account import Account as AccountModel
from app.models.journal import JournalEntry as JournalEntryModel, JournalEntryLine


class LedgerService:
    def __init__(self, db: Session):
        self.db = db

    def get_ledger(self, account_id: Optional[int] = None, start_date: Optional[date] = None, end_date: Optional[date] = None, fund_id: Optional[int] = None, project_id: Optional[int] = None):
        query = self.db.query(JournalEntryLine, JournalEntryModel, AccountModel)\
            .join(JournalEntryModel, JournalEntryLine.journal_entry_id == JournalEntryModel.id)\
            .join(AccountModel, JournalEntryLine.account_id == AccountModel.id)\
            .filter(JournalEntryModel.status == "posted")

        if account_id:
            query = query.filter(JournalEntryLine.account_id == account_id)
        if start_date:
            query = query.filter(JournalEntryModel.entry_date >= start_date)
        if end_date:
            query = query.filter(JournalEntryModel.entry_date <= end_date)
        if fund_id:
            query = query.filter(JournalEntryLine.fund_id == fund_id)
        if project_id:
            query = query.filter(JournalEntryLine.project_id == project_id)

        results = query.order_by(JournalEntryModel.entry_date, JournalEntryLine.line_number).all()
        running_balance = 0.0
        ledger = []
        for line, entry, account in results:
            running_balance += float(line.debit) - float(line.credit)
            ledger.append({
                "date": entry.entry_date,
                "entry_number": entry.entry_number,
                "account_code": account.code,
                "account_name": account.name,
                "debit": float(line.debit),
                "credit": float(line.credit),
                "balance": running_balance,
                "fund_id": line.fund_id,
                "project_id": line.project_id,
            })
        return ledger

    def get_trial_balance(self, start_date: Optional[date] = None, end_date: Optional[date] = None):
        query = self.db.query(
            AccountModel.code,
            AccountModel.name,
            func.coalesce(func.sum(JournalEntryLine.debit), 0).label("total_debit"),
            func.coalesce(func.sum(JournalEntryLine.credit), 0).label("total_credit"),
        ).join(JournalEntryLine, AccountModel.id == JournalEntryLine.account_id)\
        .join(JournalEntryModel, JournalEntryLine.journal_entry_id == JournalEntryModel.id)\
        .filter(JournalEntryModel.status == "posted")

        if start_date:
            query = query.filter(JournalEntryModel.entry_date >= start_date)
        if end_date:
            query = query.filter(JournalEntryModel.entry_date <= end_date)

        results = query.group_by(AccountModel.id, AccountModel.code, AccountModel.name).all()
        total_debit = sum(r.total_debit for r in results)
        total_credit = sum(r.total_credit for r in results)
        return {
            "accounts": [{"code": r.code, "name": r.name, "debit": float(r.total_debit), "credit": float(r.total_credit)} for r in results],
            "total_debit": float(total_debit),
            "total_credit": float(total_credit),
        }
