from sqlalchemy import Column, Integer, String, DateTime, Integer, Text
from datetime import datetime
from app.core.database import Base


class BackupRecord(Base):
    __tablename__ = "backup_records"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer)
    backup_type = Column(String(50), default="manual")
    created_at = Column(DateTime, default=datetime.utcnow)
