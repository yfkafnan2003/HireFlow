
from sqlalchemy import select

from app.models import User


def register_user(client, full_name, email):
    return client.post(
        "/auth/register",
        json={
            "full_name": full_name,
            "email": email,
            "password": "TestPassword123",
        },
    )


def login_user(client, email):
    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "TestPassword123",
        },
    )

    return response.json()["access_token"]


def promote_to_recruiter(db_session, email):
    recruiter = db_session.scalar(
        select(User).where(User.email == email)
    )

    recruiter.role = "recruiter"
    db_session.flush()


def create_job(client, recruiter_token):
    response = client.post(
        "/jobs",
        headers={
            "Authorization": f"Bearer {recruiter_token}"
        },
        json={
            "title": "Backend Internship",
            "description": "Work on backend development projects.",
            "location": "Dhaka",
        },
    )

    return response.json()["id"]


def test_candidate_can_apply_for_job(client, db_session):
    register_user(
        client,
        "Application Candidate",
        "application_candidate@example.com",
    )

    register_user(
        client,
        "Application Recruiter",
        "application_recruiter@example.com",
    )

    promote_to_recruiter(
        db_session,
        "application_recruiter@example.com",
    )

    candidate_token = login_user(
        client, "application_candidate@example.com"
    )
    recruiter_token = login_user(
        client, "application_recruiter@example.com"
    )

    job_id = create_job(client, recruiter_token)

    response = client.post(
        "/applications",
        headers={
            "Authorization": f"Bearer {candidate_token}"
        },
        json={"job_id": job_id},
    )

    assert response.status_code == 201
    assert response.json()["job_id"] == job_id
    assert response.json()["status"] == "submitted"


def test_candidate_cannot_apply_twice(client, db_session):
    register_user(
        client,
        "Duplicate Candidate",
        "duplicate_candidate@example.com",
    )
    register_user(
        client,
        "Duplicate Recruiter",
        "duplicate_recruiter@example.com",
    )

    promote_to_recruiter(
        db_session,
        "duplicate_recruiter@example.com",
    )

    candidate_token = login_user(
        client, "duplicate_candidate@example.com"
    )
    recruiter_token = login_user(
        client, "duplicate_recruiter@example.com"
    )

    job_id = create_job(client, recruiter_token)

    headers = {
        "Authorization": f"Bearer {candidate_token}"
    }

    first_response = client.post(
        "/applications",
        headers=headers,
        json={"job_id": job_id},
    )

    second_response = client.post(
        "/applications",
        headers=headers,
        json={"job_id": job_id},
    )

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_candidate_can_view_own_applications(client, db_session):
    register_user(
        client,
        "My Applications Candidate",
        "my_applications@example.com",
    )
    register_user(
        client,
        "My Applications Recruiter",
        "my_applications_recruiter@example.com",
    )

    promote_to_recruiter(
        db_session,
        "my_applications_recruiter@example.com",
    )

    candidate_token = login_user(
        client, "my_applications@example.com"
    )
    recruiter_token = login_user(
        client, "my_applications_recruiter@example.com"
    )

    job_id = create_job(client, recruiter_token)

    client.post(
        "/applications",
        headers={
            "Authorization": f"Bearer {candidate_token}"
        },
        json={"job_id": job_id},
    )

    response = client.get(
        "/applications/me",
        headers={
            "Authorization": f"Bearer {candidate_token}"
        },
    )

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_recruiter_can_update_application_status(client, db_session):
    register_user(
        client,
        "Status Candidate",
        "status_candidate@example.com",
    )
    register_user(
        client,
        "Status Recruiter",
        "status_recruiter@example.com",
    )

    promote_to_recruiter(
        db_session,
        "status_recruiter@example.com",
    )

    candidate_token = login_user(
        client, "status_candidate@example.com"
    )
    recruiter_token = login_user(
        client, "status_recruiter@example.com"
    )

    job_id = create_job(client, recruiter_token)

    application_response = client.post(
        "/applications",
        headers={
            "Authorization": f"Bearer {candidate_token}"
        },
        json={"job_id": job_id},
    )

    application_id = application_response.json()["id"]

    response = client.patch(
        f"/applications/{application_id}/status",
        headers={
            "Authorization": f"Bearer {recruiter_token}"
        },
        json={"status": "shortlisted"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "shortlisted"
