from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.company_settings import CompanySettingsUpdate
from app.core.deps import get_current_active_superuser

router = APIRouter(tags=["Settings"])


@router.get("/", response_model=dict)
def get_settings(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    from app.models.company_settings import CompanySettings as CompanySettingsModel
    settings = db.query(CompanySettingsModel).first()
    if not settings:
        return {}
    return {c.name: getattr(settings, c.name) for c in settings.__table__.columns}


@router.put("/", response_model=dict)
def update_settings(
    settings_in: CompanySettingsUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    from app.models.company_settings import CompanySettings as CompanySettingsModel
    settings = db.query(CompanySettingsModel).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return {c.name: getattr(settings, c.name) for c in settings.__table__.columns}
