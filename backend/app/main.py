from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, users, roles, accounts, funds, donors, projects, journals, budgets, donations, currencies, fiscal_years, audit_logs, settings, backups, reports, ledger, trial_balance, health
from app.core.database import engine, Base
from app.models import user, account, fund, donor, project, journal, budget, donation, currency, fiscal_year, audit_log, backup, company_settings

app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(roles.router, prefix="/api/roles", tags=["Roles"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Accounts"])
app.include_router(funds.router, prefix="/api/funds", tags=["Funds"])
app.include_router(donors.router, prefix="/api/donors", tags=["Donors"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(journals.router, prefix="/api/journals", tags=["Journal Entries"])
app.include_router(budgets.router, prefix="/api/budgets", tags=["Budgets"])
app.include_router(donations.router, prefix="/api/donations", tags=["Donations"])
app.include_router(currencies.router, prefix="/api/currencies", tags=["Currencies"])
app.include_router(fiscal_years.router, prefix="/api/fiscal-years", tags=["Fiscal Years"])
app.include_router(audit_logs.router, prefix="/api/audit-logs", tags=["Audit Logs"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])
app.include_router(backups.router, prefix="/api/backups", tags=["Backups"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(ledger.router, tags=["General Ledger"])
app.include_router(trial_balance.router, tags=["Trial Balance"])
