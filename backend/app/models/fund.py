from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Fund(Base):
    __tablename__ = "funds"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    fund_type = Column(String(50), default="unrestricted")
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    journal_lines = relationship("JournalEntryLine", back_populates="fund")
    projects = relationship("Project", back_populates="fund")
    donations = relationship("Donation", back_populates="fund")
    budgets = relationship("Budget", back_populates="fund")
