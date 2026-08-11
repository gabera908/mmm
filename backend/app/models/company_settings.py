from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from datetime import datetime
from app.core.database import Base


class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    logo_path = Column(String(500))
    address = Column(Text)
    phone = Column(String(50))
    email = Column(String(200))
    base_currency = Column(String(10), default="EGP")
    fiscal_year = Column(Integer)
    date_format = Column(String(50), default="%Y-%m-%d")
    number_format = Column(String(50), default="###,##0.00")
    backup_schedule = Column(String(100), default="0 2 * * *")
    backup_retention_days = Column(Integer, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
