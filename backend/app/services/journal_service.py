from sqlalchemy.orm import Session
from app.models.journal import JournalEntry as JournalEntryModel, JournalEntryLine
from app.schemas.journal import JournalEntryCreate, JournalEntryLineCreate
from datetime import datetime
from fastapi import HTTPException


class JournalService:
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id

    def create(self, journal_in: JournalEntryCreate):
        total_debit = sum(line.debit for line in journal_in.lines)
        total_credit = sum(line.credit for line in journal_in.lines)
        if total_debit != total_credit:
            raise HTTPException(status_code=400, detail="Debit and credit must be equal")

        entry_number = self._generate_entry_number()
        entry = JournalEntryModel(
            entry_number=entry_number,
            entry_date=journal_in.entry_date,
            description=journal_in.description,
            reference=journal_in.reference,
            currency=journal_in.currency,
            exchange_rate=journal_in.exchange_rate,
            fund_id=journal_in.fund_id,
            project_id=journal_in.project_id,
            created_by=self.user_id,
            status="draft",
        )
        self.db.add(entry)
        self.db.flush()

        for idx, line in enumerate(journal_in.lines, start=1):
            line_obj = JournalEntryLine(
                journal_entry_id=entry.id,
                account_id=line.account_id,
                fund_id=line.fund_id,
                project_id=line.project_id,
                debit=line.debit,
                credit=line.credit,
                description=line.description,
                line_number=idx,
            )
            self.db.add(line_obj)

        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_all(self, skip=0, limit=100, status=None, start_date=None, end_date=None):
        query = self.db.query(JournalEntryModel)
        if status:
            query = query.filter(JournalEntryModel.status == status)
        if start_date:
            query = query.filter(JournalEntryModel.entry_date >= start_date)
        if end_date:
            query = query.filter(JournalEntryModel.entry_date <= end_date)
        return query.order_by(JournalEntryModel.entry_date.desc()).offset(skip).limit(limit).all()

    def get_by_id(self, journal_id: int):
        return self.db.query(JournalEntryModel).filter(JournalEntryModel.id == journal_id).first()

    def post(self, journal_id: int):
        entry = self.get_by_id(journal_id)
        if not entry:
            return None
        if entry.status == "posted":
            raise HTTPException(status_code=400, detail="Entry already posted")
        if entry.status == "cancelled":
            raise HTTPException(status_code=400, detail="Cannot post cancelled entry")
        entry.status = "posted"
        entry.posted_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def reverse(self, journal_id: int):
        entry = self.get_by_id(journal_id)
        if not entry:
            return None
        if entry.status != "posted":
            raise HTTPException(status_code=400, detail="Can only reverse posted entries")
        reversal = JournalEntryModel(
            entry_number=self._generate_entry_number(),
            entry_date=datetime.utcnow().date(),
            description=f"Reversal of {entry.entry_number}",
            reference=entry.reference,
            currency=entry.currency,
            exchange_rate=entry.exchange_rate,
            fund_id=entry.fund_id,
            project_id=entry.project_id,
            created_by=self.user_id,
            status="posted",
        )
        self.db.add(reversal)
        self.db.flush()

        for line in entry.lines:
            rev_line = JournalEntryLine(
                journal_entry_id=reversal.id,
                account_id=line.account_id,
                fund_id=line.fund_id,
                project_id=line.project_id,
                debit=line.credit,
                credit=line.debit,
                description=line.description,
                line_number=line.line_number,
            )
            self.db.add(rev_line)

        entry.status = "reversed"
        entry.reversed_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(reversal)
        return reversal

    def delete(self, journal_id: int):
        entry = self.get_by_id(journal_id)
        if not entry:
            return False
        if entry.status == "posted":
            raise HTTPException(status_code=400, detail="Cannot delete posted entry")
        self.db.delete(entry)
        self.db.commit()
        return True

    def cancel(self, journal_id: int):
        entry = self.get_by_id(journal_id)
        if not entry:
            return None
        if entry.status != "draft":
            raise HTTPException(status_code=400, detail="Can only cancel draft entries")
        entry.status = "cancelled"
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def _generate_entry_number(self):
        last_entry = self.db.query(JournalEntryModel).order_by(JournalEntryModel.id.desc()).first()
        if last_entry:
            try:
                num = int(last_entry.entry_number.split("-")[-1]) + 1
            except (ValueError, IndexError):
                num = 1
        else:
            num = 1
        return f"JE-{num:06d}"
