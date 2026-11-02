
from sqlalchemy import select

from app.models import User


def create_recruiter(client, db_session, email):
    # Register a user
    client.post(
        "/auth/register",
        json={
            "full_name": "Test Recruiter",
            "email": email,
            "password": "TestPassword123",
        },
    )

    # Registration creates candidates, so promote this test user.
    recruiter = db_session.scalar(
        select(User).where(User.email == email)
    )
    recruiter.role = "recruiter"
    db_session.flush()

    # Log in after changing the role.
    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "TestPassword123",
        },
    )

    return response.json()["access_token"]


def test_recruiter_can_create_job(client, db_session):
    token = create_recruiter(
        client, db_session, "job_create@example.com"
    )

    response = client.post(
        "/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Python Backend Developer",
            "description": "Build backend services using Python.",
            "location": "Dhaka",
        },
    )

    assert response.status_code == 201
    assert response.json()["title"] == "Python Backend Developer"
    assert response.json()["status"] == "open"


def test_public_can_list_open_jobs(client, db_session):
    token = create_recruiter(
        client, db_session, "job_list@example.com"
    )

    client.post(
        "/jobs",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Backend Developer",
            "description": "Develop backend applications.",
            "location": "Dhaka",
        },
    )

    response = client.get("/jobs")

    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_job_search_and_location_filter(client, db_session):
    token = create_recruiter(
        client, db_session, "job_search@example.com"
    )
    headers = {"Authorization": f"Bearer {token}"}

    client.post(
        "/jobs",
        headers=headers,
        json={
            "title": "Python Backend Developer",
            "description": "Build backend services using Python.",
            "location": "Dhaka",
        },
    )

    client.post(
        "/jobs",
        headers=headers,
        json={
            "title": "Frontend Developer",
            "description": "Build user interfaces.",
            "location": "Chittagong",
        },
    )

    search_response = client.get("/jobs?search=Python")
    location_response = client.get("/jobs?location=Dhaka")

    assert search_response.status_code == 200
    assert all(
        "Python" in job["title"]
        for job in search_response.json()
    )

    assert location_response.status_code == 200
    assert all(
        job["location"] == "Dhaka"
        for job in location_response.json()
    )


def test_job_pagination(client, db_session):
    token = create_recruiter(
        client, db_session, "job_pagination@example.com"
    )
    headers = {"Authorization": f"Bearer {token}"}

    for number in range(3):
        client.post(
            "/jobs",
            headers=headers,
            json={
                "title": f"Pagination Job {number}",
                "description": "A job created for pagination testing.",
                "location": "Dhaka",
            },
        )

    response = client.get("/jobs?page=1&page_size=2")

    assert response.status_code == 200
    assert len(response.json()) == 2


def test_invalid_pagination(client):
    response = client.get("/jobs?page=0")

    assert response.status_code == 422
