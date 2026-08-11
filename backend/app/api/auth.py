from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.schemas.user import UserCreate, UserUpdate, User, Token, ChangePassword
from app.models.user import User as UserModel
from app.core.deps import get_current_user
from app.services.user_service import UserService
from app.core.config import settings

router = APIRouter(tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(UserModel).filter(UserModel.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token = create_access_token(
        subject=user.username,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(subject=user.username)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
def refresh_token(token: str, db: Session = Depends(get_db)):
    payload = verify_password = None
    from app.core.security import decode_token
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    username = payload.get("sub")
    user = db.query(UserModel).filter(UserModel.username == username).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    access_token = create_access_token(
        subject=user.username,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    refresh_token = create_refresh_token(subject=user.username)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/change-password")
def change_password(
    password_in: ChangePassword,
    current_user: UserModel = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(password_in.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect old password")
    current_user.hashed_password = get_password_hash(password_in.new_password)
    current_user.must_change_password = False
    db.commit()
    return {"message": "Password changed successfully"}
