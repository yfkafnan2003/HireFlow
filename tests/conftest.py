
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import the app and database dependencies
from app.main import app
from app.database import Base, get_db

# Import models so SQLAlchemy registers their tables
from app.models import (
    User,
    Job,
    Candidate,
    Application,
    Interview,
    AuditLog,
)


TEST_DATABASE_URL = os.getenv("HIREFLOW_TEST_DATABASE_URL")

if not TEST_DATABASE_URL:
    raise RuntimeError(
        "Set HIREFLOW_TEST_DATABASE_URL before running tests"
    )

if "hireflow_test" not in TEST_DATABASE_URL:
    raise RuntimeError(
        "Tests must use the dedicated hireflow_test database"
    )

test_engine = create_engine(
    TEST_DATABASE_URL,
    pool_pre_ping=True,
)

TestingSessionLocal = sessionmaker(
    bind=test_engine,
    autoflush=False,
    autocommit=False,
)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)
    test_engine.dispose()


@pytest.fixture()
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()

    session = TestingSessionLocal(bind=connection)

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
