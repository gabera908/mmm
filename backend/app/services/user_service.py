from sqlalchemy.orm import Session
from app.models.user import User as UserModel
from app.schemas.user import UserCreate


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_in: UserCreate):
        from app.core.security import get_password_hash
        user = UserModel(
            username=user_in.username,
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=get_password_hash(user_in.password),
            role_id=user_in.role_id,
            is_active=user_in.is_active,
            is_superuser=user_in.is_superuser,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_all(self, skip: int = 0, limit: int = 100):
        return self.db.query(UserModel).offset(skip).limit(limit).all()

    def get_by_id(self, user_id: int):
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def update(self, user_id: int, user_in):
        user = self.get_by_id(user_id)
        if not user:
            return None
        update_data = user_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user_id: int):
        user = self.get_by_id(user_id)
        if not user:
            return False
        self.db.delete(user)
        self.db.commit()
        return True
