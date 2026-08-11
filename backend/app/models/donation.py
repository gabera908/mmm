from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Date, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donation_date = Column(Date, nullable=False)
    donor_id = Column(Integer, ForeignKey("donors.id"), nullable=False)
    fund_id = Column(Integer, ForeignKey("funds.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String(10), default="EGP")
    exchange_rate = Column(Numeric(18, 6), default=1)
    payment_method = Column(String(50))
    reference = Column(String(100))
    notes = Column(Text)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    donor = relationship("Donor", back_populates="donations")
    fund = relationship("Fund", back_populates="donations")
    project = relationship("Project", back_populates="donations")
