from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.schemas.audit_log import AuditLogCreate, AuditLog
from app.core.deps import get_current_active_superuser

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])


@router.get("/", response_model=List[AuditLog])
def read_audit_logs(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[int] = None,
    action: Optional[str] = None,
    table_name: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    from app.models.audit_log import AuditLog as AuditLogModel
    query = db.query(AuditLogModel)
    if user_id:
        query = query.filter(AuditLogModel.user_id == user_id)
    if action:
        query = query.filter(AuditLogModel.action == action)
    if table_name:
        query = query.filter(AuditLogModel.table_name == table_name)
    if start_date:
        query = query.filter(AuditLogModel.created_at >= start_date)
    if end_date:
        query = query.filter(AuditLogModel.created_at <= end_date)
    logs = query.order_by(AuditLogModel.created_at.desc()).offset(skip).limit(limit).all()
    return logs
