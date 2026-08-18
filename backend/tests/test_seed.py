from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base, get_db
from app.main import app
from app.scripts.seed import run_seed
from app.models.user import User
from app.models.account import Account
from app.models.journal import JournalEntry
from app.models.donation import Donation
from app.models.project import Project
from app.models.donor import Donor

SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def test_seed_database():
    db = TestingSessionLocal()
    result = run_seed(db=db, force_reset=True)
    assert result["status"] == "success"

    # Check users
    users_count = db.query(User).count()
    assert users_count >= 3

    # Check accounts
    accounts_count = db.query(Account).count()
    assert accounts_count >= 20

    # Check journal entries
    journals_count = db.query(JournalEntry).count()
    assert journals_count >= 8

    # Check donations
    donations_count = db.query(Donation).count()
    assert donations_count >= 5

    # Check projects
    projects_count = db.query(Project).count()
    assert projects_count >= 4

    # Check donors
    donors_count = db.query(Donor).count()
    assert donors_count >= 5

    db.close()
