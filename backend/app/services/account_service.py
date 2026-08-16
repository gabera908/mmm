from sqlalchemy.orm import Session
from app.models.account import Account as AccountModel
from app.schemas.account import AccountCreate, AccountUpdate
from fastapi import HTTPException


class AccountService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, account_in: AccountCreate):
        db_account = self.db.query(AccountModel).filter(AccountModel.code == account_in.code).first()
        if db_account:
            raise HTTPException(status_code=400, detail="كود الحساب موجود بالفعل")

        from app.models.account import AccountType
        acc_type = self.db.query(AccountType).filter(AccountType.id == account_in.account_type_id).first()
        if not acc_type:
            first_type = self.db.query(AccountType).first()
            if first_type:
                account_in.account_type_id = first_type.id

        account = AccountModel(**account_in.model_dump())
        self.db.add(account)
        self.db.commit()
        self.db.refresh(account)
        return account

    def get_all(self, skip: int = 0, limit: int = 100, search: str = None, account_type_id: int = None, is_active: bool = None):
        query = self.db.query(AccountModel)
        if search:
            query = query.filter(AccountModel.name.contains(search) | AccountModel.code.contains(search))
        if account_type_id:
            query = query.filter(AccountModel.account_type_id == account_type_id)
        if is_active is not None:
            query = query.filter(AccountModel.is_active == is_active)
        return query.offset(skip).limit(limit).all()

    def get_tree(self):
        accounts = self.db.query(AccountModel).filter(AccountModel.parent_id == None).all()
        return [self._build_tree(acc) for acc in accounts]

    def _build_tree(self, account):
        children = self.db.query(AccountModel).filter(AccountModel.parent_id == account.id).all()
        return {
            "id": account.id,
            "code": account.code,
            "name": account.name,
            "level": account.level,
            "is_active": account.is_active,
            "children": [self._build_tree(child) for child in children],
        }

    def get_by_id(self, account_id: int):
        return self.db.query(AccountModel).filter(AccountModel.id == account_id).first()

    def update(self, account_id: int, account_in: AccountUpdate):
        account = self.get_by_id(account_id)
        if not account:
            return None
        update_data = account_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(account, field, value)
        self.db.commit()
        self.db.refresh(account)
        return account

    def delete(self, account_id: int):
        account = self.get_by_id(account_id)
        if not account:
            return False
        from app.models.journal import JournalEntryLine
        has_lines = self.db.query(JournalEntryLine).filter(JournalEntryLine.account_id == account_id).first()
        if has_lines:
            raise HTTPException(status_code=400, detail="Cannot delete account with transactions")
        self.db.delete(account)
        self.db.commit()
        return True
