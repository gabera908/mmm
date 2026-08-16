from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.schemas.journal import JournalEntryCreate, JournalEntryUpdate, JournalEntry
from app.models.journal import JournalEntry as JournalEntryModel, JournalEntryLine
from app.core.deps import get_current_user
from app.services.journal_service import JournalService

router = APIRouter(tags=["Journal Entries"])


@router.post("", response_model=JournalEntry, status_code=status.HTTP_201_CREATED)
def create_journal(
    journal_in: JournalEntryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = JournalService(db, current_user.id)
    return service.create(journal_in)


@router.get("", response_model=List[JournalEntry])
def read_journals(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = JournalService(db, current_user.id)
    return service.get_all(skip=skip, limit=limit, status=status, start_date=start_date, end_date=end_date)


@router.get("/{journal_id}", response_model=JournalEntry)
def read_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = JournalService(db, current_user.id)
    journal = service.get_by_id(journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return journal


@router.post("/{journal_id}/post", response_model=JournalEntry)
def post_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = JournalService(db, current_user.id)
    journal = service.post(journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return journal


@router.post("/{journal_id}/reverse", response_model=JournalEntry)
def reverse_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = JournalService(db, current_user.id)
    journal = service.reverse(journal_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return journal


@router.post("/{journal_entry_id}/cancel", response_model=JournalEntry)
def cancel_journal(
    journal_entry_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = JournalService(db, current_user.id)
    journal = service.cancel(journal_entry_id)
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return journal


@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal(
    journal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = JournalService(db, current_user.id)
    if not service.delete(journal_id):
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return None
