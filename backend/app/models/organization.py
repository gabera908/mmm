from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base


class Organization(Base):
    """Organization settings model"""
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    name_ar = Column(String(255), nullable=False)
    logo = Column(Text, nullable=True)  # Base64 encoded logo or path
    address = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    base_currency = Column(String(3), default="EGP")
    fiscal_year_start_month = Column(Integer, default=1)  # January
    fiscal_year_start_day = Column(Integer, default=1)
    date_format = Column(String(20), default="dd/mm/yyyy")
    number_format = Column(String(20), default="1,234.56")
    decimal_places = Column(Integer, default=2)
    tax_id = Column(String(50), nullable=True)
    registration_number = Column(String(50), nullable=True)
    # Report settings
    report_header = Column(Text, nullable=True)
    report_footer = Column(Text, nullable=True)
    report_show_logo = Column(Boolean, default=True)
    report_show_date = Column(Boolean, default=True)
    report_show_user = Column(Boolean, default=True)
    report_show_page_number = Column(Boolean, default=True)
    # Backup settings
    backup_enabled = Column(Boolean, default=True)
    backup_schedule = Column(String(100), default="0 2 * * *")  # Cron expression
    backup_retention_days = Column(Integer, default=30)
    backup_path = Column(String(255), default="/backups")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
