from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Text, CheckConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class AccountType(Base):
    __tablename__ = "account_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(10), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    accounts = relationship("Account", back_populates="account_type")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    name_en = Column(String(255))
    parent_id = Column(Integer, ForeignKey("accounts.id"), nullable=True)
    account_type_id = Column(Integer, ForeignKey("account_types.id"), nullable=False)
    level = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    is_header = Column(Boolean, default=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account_type = relationship("AccountType", back_populates="accounts")
    parent = relationship("Account", remote_side=[id], backref="children")
    journal_lines = relationship("JournalEntryLine", back_populates="account")
    budget_lines = relationship("Budget", back_populates="account")

    __table_args__ = (
        CheckConstraint('level >= 1 AND level <= 5', name='check_level'),
    )
