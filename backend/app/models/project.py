from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Date, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    fund_id = Column(Integer, ForeignKey("funds.id"))
    donor_id = Column(Integer, ForeignKey("donors.id"))
    budget = Column(Numeric(18, 2), default=0)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String(50), default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    fund = relationship("Fund", back_populates="projects")
    donor = relationship("Donor", back_populates="projects")
    journal_lines = relationship("JournalEntryLine", back_populates="project")
    donations = relationship("Donation", back_populates="project")
    budgets = relationship("Budget", back_populates="project")
