from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog as AuditLogModel
from typing import Optional
from datetime import datetime


class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log(self, user_id: int, action: str, table_name: str, record_id: Optional[int] = None, old_value: Optional[str] = None, new_value: Optional[str] = None, ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        log = AuditLogModel(
            user_id=user_id,
            action=action,
            table_name=table_name,
            record_id=record_id,
            old_value=old_value,
            new_value=new_value,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_logs(self, skip=0, limit=100, user_id: Optional[int] = None, action: Optional[str] = None, table_name: Optional[str] = None):
        query = self.db.query(AuditLogModel)
        if user_id:
            query = query.filter(AuditLogModel.user_id == user_id)
        if action:
            query = query.filter(AuditLogModel.action == action)
        if table_name:
            query = query.filter(AuditLogModel.table_name == table_name)
        return query.order_by(AuditLogModel.created_at.desc()).offset(skip).limit(limit).all()
