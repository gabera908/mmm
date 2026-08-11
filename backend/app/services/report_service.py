from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Numeric
from datetime import date
from typing import Optional
from app.models.account import Account as AccountModel, AccountType as AccountTypeModel
from app.models.journal import JournalEntry as JournalEntryModel, JournalEntryLine
from app.models.budget import Budget as BudgetModel


class ReportService:
    def __init__(self, db: Session):
        self.db = db

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

    def get_general_ledger(self, account_id: Optional[int] = None, start_date: Optional[date] = None, end_date: Optional[date] = None, fund_id: Optional[int] = None, project_id: Optional[int] = None):
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
            })
        return ledger

    def get_income_statement(self, start_date: Optional[date] = None, end_date: Optional[date] = None, fund_id: Optional[int] = None, project_id: Optional[int] = None):
        query = self.db.query(
            AccountModel.code,
            AccountModel.name,
            func.coalesce(func.sum(JournalEntryLine.debit), 0).label("total_debit"),
            func.coalesce(func.sum(JournalEntryLine.credit), 0).label("total_credit"),
        ).join(JournalEntryLine, AccountModel.id == JournalEntryLine.account_id)\
        .join(JournalEntryModel, JournalEntryLine.journal_entry_id == JournalEntryModel.id)\
        .join(AccountTypeModel, AccountModel.account_type_id == AccountTypeModel.id)\
        .filter(JournalEntryModel.status == "posted")\
        .filter(AccountTypeModel.code.in_(["REV", "EXP"]))

        if start_date:
            query = query.filter(JournalEntryModel.entry_date >= start_date)
        if end_date:
            query = query.filter(JournalEntryModel.entry_date <= end_date)
        if fund_id:
            query = query.filter(JournalEntryLine.fund_id == fund_id)
        if project_id:
            query = query.filter(JournalEntryLine.project_id == project_id)

        results = query.group_by(AccountModel.id, AccountModel.code, AccountModel.name).all()
        total_revenue = sum(r.total_credit for r in results if r.total_credit > 0)
        total_expense = sum(r.total_debit for r in results if r.total_debit > 0)
        net_income = total_revenue - total_expense
        return {
            "accounts": [{"code": r.code, "name": r.name, "amount": float(r.total_credit - r.total_debit)} for r in results],
            "total_revenue": float(total_revenue),
            "total_expense": float(total_expense),
            "net_income": float(net_income),
        }

    def get_balance_sheet(self, end_date: Optional[date] = None, fund_id: Optional[int] = None):
        query = self.db.query(
            AccountModel.code,
            AccountModel.name,
            AccountTypeModel.code.label("type_code"),
            func.coalesce(func.sum(JournalEntryLine.debit), 0).label("total_debit"),
            func.coalesce(func.sum(JournalEntryLine.credit), 0).label("total_credit"),
        ).join(JournalEntryLine, AccountModel.id == JournalEntryLine.account_id)\
        .join(JournalEntryModel, JournalEntryLine.journal_entry_id == JournalEntryModel.id)\
        .join(AccountTypeModel, AccountModel.account_type_id == AccountTypeModel.id)\
        .filter(JournalEntryModel.status == "posted")\
        .filter(AccountTypeModel.code.in_(["AST", "LIA", "NET"]))

        if end_date:
            query = query.filter(JournalEntryModel.entry_date <= end_date)
        if fund_id:
            query = query.filter(JournalEntryLine.fund_id == fund_id)

        results = query.group_by(AccountModel.id, AccountModel.code, AccountModel.name, AccountTypeModel.code).all()
        assets = sum(r.total_debit - r.total_credit for r in results if r.type_code == "AST")
        liabilities = sum(r.total_credit - r.total_debit for r in results if r.type_code == "LIA")
        net_assets = sum(r.total_credit - r.total_debit for r in results if r.type_code == "NET")
        return {
            "accounts": [{"code": r.code, "name": r.name, "type": r.type_code, "amount": float(r.total_debit - r.total_credit)} for r in results],
            "total_assets": float(assets),
            "total_liabilities": float(liabilities),
            "total_net_assets": float(net_assets),
        }

    def get_cash_flow(self, start_date: Optional[date] = None, end_date: Optional[date] = None):
        return {"message": "Cash flow statement implementation"}

    def get_budget_vs_actual(self, fiscal_year: Optional[int] = None, fund_id: Optional[int] = None, project_id: Optional[int] = None):
        query = self.db.query(BudgetModel)
        if fiscal_year:
            query = query.filter(BudgetModel.fiscal_year == fiscal_year)
        if fund_id:
            query = query.filter(BudgetModel.fund_id == fund_id)
        if project_id:
            query = query.filter(BudgetModel.project_id == project_id)
        results = query.all()
        return {
            "budgets": [
                {
                    "account_code": r.account.code,
                    "account_name": r.account.name,
                    "budget": float(r.budget_amount),
                    "actual": float(r.actual_amount),
                    "variance": float(r.budget_amount - r.actual_amount),
                    "execution": float((r.actual_amount / r.budget_amount * 100) if r.budget_amount else 0),
                }
                for r in results
            ]
        }

    def get_dashboard(self):
        total_assets = self.db.query(func.coalesce(func.sum(JournalEntryLine.debit), 0)).join(JournalEntryModel, JournalEntryLine.journal_entry_id == JournalEntryModel.id).filter(JournalEntryModel.status == "posted").scalar()
        total_revenue = self.db.query(func.coalesce(func.sum(JournalEntryLine.credit), 0)).join(JournalEntryModel, JournalEntryLine.journal_entry_id == JournalEntryModel.id).filter(JournalEntryModel.status == "posted").scalar()
        total_donations = self.db.query(func.coalesce(func.sum(JournalEntryLine.debit), 0)).join(JournalEntryModel, JournalEntryLine.journal_entry_id == JournalEntryModel.id).filter(JournalEntryModel.status == "posted").scalar()
        from app.models.project import Project as ProjectModel
        from app.models.donor import Donor as DonorModel
        projects_count = self.db.query(ProjectModel).count()
        donors_count = self.db.query(DonorModel).count()
        return {
            "total_assets": float(total_assets or 0),
            "total_liabilities": 0.0,
            "total_net_assets": float(total_assets or 0),
            "total_revenue": float(total_revenue or 0),
            "total_expenses": 0.0,
            "total_donations": float(total_donations or 0),
            "projects_count": projects_count,
            "donors_count": donors_count,
        }
