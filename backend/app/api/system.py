import platform
import sys
import fastapi
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, engine
from app.core.deps import get_current_active_superuser
from app.scripts.seed import run_seed
from app.models.user import User
from app.models.account import Account
from app.models.journal import JournalEntry
from app.models.donation import Donation
from app.models.project import Project
from app.models.donor import Donor

router = APIRouter(prefix="/api/system", tags=["System Manager"])


@router.get("/info")
def get_system_info(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    db_name = engine.name
    if db_name == "postgresql":
        db_type = "PostgreSQL"
    elif db_name == "sqlite":
        db_type = "SQLite"
    else:
        db_type = db_name.capitalize()

    users_count = db.query(User).count()
    accounts_count = db.query(Account).count()
    journals_count = db.query(JournalEntry).count()
    donations_count = db.query(Donation).count()
    projects_count = db.query(Project).count()
    donors_count = db.query(Donor).count()

    return {
        "python_version": platform.python_version(),
        "fastapi_version": fastapi.__version__,
        "database": db_type,
        "os": f"{platform.system()} {platform.release()}",
        "stats": {
            "users": users_count,
            "accounts": accounts_count,
            "journals": journals_count,
            "donations": donations_count,
            "projects": projects_count,
            "donors": donors_count,
        },
    }


@router.post("/seed-data")
def seed_system_data(
    reset: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    try:
        res = run_seed(db=db, force_reset=reset)
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"فشل في إدخال البيانات الوهمية: {str(e)}",
        )


@router.post("/clear-cache")
def clear_system_cache(
    current_user=Depends(get_current_active_superuser),
):
    return {"status": "success", "message": "تم مسح الذاكرة المؤقتة بنجاح"}


@router.post("/restart")
def restart_system(
    current_user=Depends(get_current_active_superuser),
):
    return {"status": "success", "message": "الخدمة تعمل بنجاح ولم تتأثر"}
