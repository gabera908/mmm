from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Date, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    entry_number = Column(String(50), unique=True, nullable=False, index=True)
    entry_date = Column(Date, nullable=False)
    description = Column(Text)
    reference = Column(String(100))
    status = Column(String(20), default="draft")
    currency = Column(String(10), default="EGP")
    exchange_rate = Column(Numeric(18, 6), default=1)
    fund_id = Column(Integer, ForeignKey("funds.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    created_by = Column(Integer, ForeignKey("users.id"))
    posted_at = Column(DateTime)
    reversed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    lines = relationship("JournalEntryLine", back_populates="journal_entry", cascade="all, delete-orphan")


class JournalEntryLine(Base):
    __tablename__ = "journal_entry_lines"

    id = Column(Integer, primary_key=True, index=True)
    journal_entry_id = Column(Integer, ForeignKey("journal_entries.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    fund_id = Column(Integer, ForeignKey("funds.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    debit = Column(Numeric(18, 2), default=0)
    credit = Column(Numeric(18, 2), default=0)
    description = Column(Text)
    line_number = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    journal_entry = relationship("JournalEntry", back_populates="lines")
    account = relationship("Account", back_populates="journal_lines")
    fund = relationship("Fund", back_populates="journal_lines")
    project = relationship("Project", back_populates="journal_lines")
