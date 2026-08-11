from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.backup import BackupRecordCreate, BackupRecord
from app.core.deps import get_current_active_superuser

router = APIRouter(tags=["Backups"])


@router.post("/", response_model=BackupRecord, status_code=status.HTTP_201_CREATED)
def create_backup(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    import os
    import subprocess
    from datetime import datetime
    from app.models.backup import BackupRecord as BackupRecordModel
    from app.core.config import settings

    backup_dir = "/backups"
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"backup_{timestamp}.sql"
    filepath = os.path.join(backup_dir, filename)

    env = os.environ.copy()
    env["PGPASSWORD"] = settings.POSTGRES_PASSWORD
    cmd = [
        "pg_dump",
        "-h", settings.POSTGRES_HOST,
        "-p", str(settings.POSTGRES_PORT),
        "-U", settings.POSTGRES_USER,
        "-d", settings.POSTGRES_DB,
        "-f", filepath,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, env=env)
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=f"Backup failed: {result.stderr}")

    file_size = os.path.getsize(filepath)
    record = BackupRecordModel(
        filename=filename,
        file_path=filepath,
        file_size=file_size,
        backup_type="manual",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/", response_model=List[BackupRecord])
def read_backups(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_superuser),
):
    from app.models.backup import BackupRecord as BackupRecordModel
    backups = db.query(BackupRecordModel).order_by(BackupRecordModel.created_at.desc()).offset(skip).limit(limit).all()
    return backups
