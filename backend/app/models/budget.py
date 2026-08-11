from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    fiscal_year = Column(Integer, nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    fund_id = Column(Integer, ForeignKey("funds.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    budget_amount = Column(Numeric(18, 2), default=0)
    actual_amount = Column(Numeric(18, 2), default=0)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("Account", back_populates="budget_lines")
    fund = relationship("Fund", back_populates="budgets")
    project = relationship("Project", back_populates="budgets")
