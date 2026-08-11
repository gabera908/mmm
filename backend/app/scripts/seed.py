import sys
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User, Role
from app.models.account import Account, AccountType
from app.models.fund import Fund
from app.models.donor import Donor
from app.models.project import Project
from app.models.journal import JournalEntry, JournalEntryLine
from app.models.budget import Budget
from app.models.donation import Donation
from app.models.currency import Currency
from app.models.fiscal_year import FiscalYear, AccountingPeriod
from app.models.audit_log import AuditLog
from app.models.backup import BackupRecord
from app.models.company_settings import CompanySettings
from app.core.config import settings
from datetime import date, timedelta


def seed_roles(db: Session):
    roles = [
        Role(name="Administrator", description="مدير النظام", permissions="*", is_active=True),
        Role(name="Accountant", description="محاسب", permissions="view_accounts,create_journals,view_reports", is_active=True),
        Role(name="Viewer", description="مشاهد", permissions="view_accounts,view_reports", is_active=True),
    ]
    db.add_all(roles)
    db.commit()


def seed_users(db: Session):
    admin_role = db.query(Role).filter(Role.name == "Administrator").first()
    user = User(
        username="admin",
        email="admin@example.com",
        full_name="مدير النظام",
        hashed_password=get_password_hash("admin123"),
        role_id=admin_role.id,
        is_active=True,
        is_superuser=True,
        must_change_password=True,
    )
    db.add(user)
    db.commit()


def seed_account_types(db: Session):
    types = [
        AccountType(name="الأصول", code="AST", is_active=True),
        AccountType(name="الخصوم", code="LIA", is_active=True),
        AccountType(name="صافي الأصول", code="NET", is_active=True),
        AccountType(name="الإيرادات", code="REV", is_active=True),
        AccountType(name="المصروفات", code="EXP", is_active=True),
    ]
    db.add_all(types)
    db.commit()


def seed_accounts(db: Session):
    asset_type = db.query(AccountType).filter(AccountType.code == "AST").first()
    liability_type = db.query(AccountType).filter(AccountType.code == "LIA").first()
    net_type = db.query(AccountType).filter(AccountType.code == "NET").first()
    rev_type = db.query(AccountType).filter(AccountType.code == "REV").first()
    exp_type = db.query(AccountType).filter(AccountType.code == "EXP").first()

    accounts = [
        Account(code="1000", name="الأصول", account_type_id=asset_type.id, level=1, is_header=True),
    ]
    db.add_all(accounts)
    db.commit()

    all_accounts = db.query(Account).all()
    account_map = {a.code: a.id for a in all_accounts}

    more_accounts = [
        Account(code="1100", name="الأصول المتداولة", account_type_id=asset_type.id, level=2, parent_id=account_map.get("1000"), is_header=True),
        Account(code="1110", name="النقدية", account_type_id=asset_type.id, level=3, parent_id=account_map.get("1100")),
        Account(code="1120", name="البنوك", account_type_id=asset_type.id, level=3, parent_id=account_map.get("1100")),
        Account(code="1200", name="الأصول الثابتة", account_type_id=asset_type.id, level=2, parent_id=account_map.get("1000"), is_header=True),
        Account(code="2000", name="الخصوم", account_type_id=liability_type.id, level=1, is_header=True),
        Account(code="2100", name="الخصوم المتداولة", account_type_id=liability_type.id, level=2, parent_id=account_map.get("2000"), is_header=True),
        Account(code="3000", name="صافي الأصول", account_type_id=net_type.id, level=1, is_header=True),
        Account(code="4000", name="الإيرادات", account_type_id=rev_type.id, level=1, is_header=True),
        Account(code="4100", name="التبرعات", account_type_id=rev_type.id, level=2, parent_id=account_map.get("4000")),
        Account(code="4200", name="الإيرادات الأخرى", account_type_id=rev_type.id, level=2, parent_id=account_map.get("4000")),
        Account(code="5000", name="المصروفات", account_type_id=exp_type.id, level=1, is_header=True),
        Account(code="5100", name="الرواتب", account_type_id=exp_type.id, level=2, parent_id=account_map.get("5000")),
        Account(code="5200", name="الإيجار", account_type_id=exp_type.id, level=2, parent_id=account_map.get("5000")),
        Account(code="5300", name="المصروفات الإدارية", account_type_id=exp_type.id, level=2, parent_id=account_map.get("5000")),
    ]
    db.add_all(more_accounts)
    db.commit()


def seed_funds(db: Session):
    funds = [
        Fund(code="GEN", name="الصندوق العام", fund_type="unrestricted", is_active=True),
        Fund(code="PRJ", name="صندوق المشاريع", fund_type="restricted", is_active=True),
        Fund(code="EMG", name="صندوق الطوارئ", fund_type="temporarily_restricted", is_active=True),
    ]
    db.add_all(funds)
    db.commit()


def seed_currencies(db: Session):
    currencies = [
        Currency(code="EGP", name="جنيه مصري", symbol="ج.م", is_base=True, is_active=True),
        Currency(code="USD", name="دولار أمريكي", symbol="$", is_base=False, is_active=True),
        Currency(code="EUR", name="يورو", symbol="€", is_base=False, is_active=True),
    ]
    db.add_all(currencies)
    db.commit()


def seed_fiscal_years(db: Session):
    today = date.today()
    start = date(today.year, 1, 1)
    end = date(today.year, 12, 31)
    year = FiscalYear(year=today.year, start_date=start, end_date=end, is_closed=False)
    db.add(year)
    db.commit()
    db.refresh(year)

    for i in range(1, 13):
        month_start = date(today.year, i, 1)
        if i == 12:
            month_end = date(today.year, 12, 31)
        else:
            month_end = date(today.year, i + 1, 1) - timedelta(days=1)
        period = AccountingPeriod(
            fiscal_year_id=year.id,
            name=f"فترة {i}",
            start_date=month_start,
            end_date=month_end,
            is_closed=False,
        )
        db.add(period)
    db.commit()


def seed_company_settings(db: Session):
    settings = CompanySettings(
        company_name="المؤسسة الخيرية",
        base_currency="EGP",
        fiscal_year=date.today().year,
        date_format="%Y-%m-%d",
        number_format="###,##0.00",
    )
    db.add(settings)
    db.commit()


def main():
    db = SessionLocal()
    try:
        print("Seeding database...")
        seed_roles(db)
        seed_users(db)
        seed_account_types(db)
        seed_accounts(db)
        seed_funds(db)
        seed_currencies(db)
        seed_fiscal_years(db)
        seed_company_settings(db)
        print("Database seeded successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
