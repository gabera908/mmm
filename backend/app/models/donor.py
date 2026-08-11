from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric, Date, Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class Donor(Base):
    __tablename__ = "donors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    donor_type = Column(String(100))
    phone = Column(String(50))
    email = Column(String(200))
    address = Column(Text)
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects = relationship("Project", back_populates="donor")
    donations = relationship("Donation", back_populates="donor")
