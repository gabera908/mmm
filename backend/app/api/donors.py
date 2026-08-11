from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.donor import DonorCreate, DonorUpdate, Donor
from app.core.deps import get_current_user

router = APIRouter(prefix="/donors", tags=["Donors"])


@router.post("/", response_model=Donor, status_code=status.HTTP_201_CREATED)
def create_donor(
    donor_in: DonorCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.donor import Donor as DonorModel
    donor = DonorModel(**donor_in.model_dump())
    db.add(donor)
    db.commit()
    db.refresh(donor)
    return donor


@router.get("/", response_model=List[Donor])
def read_donors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.donor import Donor as DonorModel
    donors = db.query(DonorModel).offset(skip).limit(limit).all()
    return donors


@router.get("/{donor_id}", response_model=Donor)
def read_donor(
    donor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.donor import Donor as DonorModel
    donor = db.query(DonorModel).filter(DonorModel.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    return donor


@router.put("/{donor_id}", response_model=Donor)
def update_donor(
    donor_id: int,
    donor_in: DonorUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.donor import Donor as DonorModel
    donor = db.query(DonorModel).filter(DonorModel.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    update_data = donor_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(donor, field, value)
    db.commit()
    db.refresh(donor)
    return donor


@router.delete("/{donor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_donor(
    donor_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.donor import Donor as DonorModel
    from app.models.journal import JournalEntryLine
    donor = db.query(DonorModel).filter(DonorModel.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    has_lines = db.query(JournalEntryLine).filter(JournalEntryLine.project_id.in_(
        db.query(DonorModel.projects).filter(DonorModel.id == donor_id)
    )).first()
    if has_lines:
        raise HTTPException(status_code=400, detail="Cannot delete donor with related transactions")
    db.delete(donor)
    db.commit()
    return None
