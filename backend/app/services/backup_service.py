import os
import subprocess
from datetime import datetime
from app.core.config import settings
from app.models.backup import BackupRecord as BackupRecordModel
from sqlalchemy.orm import Session


class BackupService:
    def __init__(self, db: Session):
        self.db = db

    def create_backup(self):
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
            raise Exception(f"Backup failed: {result.stderr}")

        file_size = os.path.getsize(filepath)
        record = BackupRecordModel(
            filename=filename,
            file_path=filepath,
            file_size=file_size,
            backup_type="manual",
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_backups(self, skip=0, limit=100):
        return self.db.query(BackupRecordModel).order_by(BackupRecordModel.created_at.desc()).offset(skip).limit(limit).all()
