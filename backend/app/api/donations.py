from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.donation import DonationCreate, DonationUpdate, Donation
from app.core.deps import get_current_user

router = APIRouter(tags=["Donations"])


@router.post("/", response_model=Donation, status_code=status.HTTP_201_CREATED)
def create_donation(
    donation_in: DonationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.donation import Donation as DonationModel
    from app.models.fund import Fund as FundModel
    fund = db.query(FundModel).filter(FundModel.id == donation_in.fund_id).first()
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")
    donation = DonationModel(**donation_in.model_dump(), created_by=current_user.id)
    db.add(donation)
    db.commit()
    db.refresh(donation)
    return donation


@router.get("/", response_model=List[Donation])
def read_donations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.donation import Donation as DonationModel
    donations = db.query(DonationModel).offset(skip).limit(limit).all()
    return donations


@router.get("/{donation_id}", response_model=Donation)
def read_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.donation import Donation as DonationModel
    donation = db.query(DonationModel).filter(DonationModel.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return donation


@router.put("/{donation_id}", response_model=Donation)
def update_donation(
    donation_id: int,
    donation_in: DonationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.donation import Donation as DonationModel
    donation = db.query(DonationModel).filter(DonationModel.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    update_data = donation_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(donation, field, value)
    db.commit()
    db.refresh(donation)
    return donation


@router.delete("/{donation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.donation import Donation as DonationModel
    donation = db.query(DonationModel).filter(DonationModel.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    db.delete(donation)
    db.commit()
    return None
