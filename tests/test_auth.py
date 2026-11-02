
def test_register_candidate(client):
    response = client.post(
        "/auth/register",
        json={
            "full_name": "Test Candidate",
            "email": "candidate_test@example.com",
            "password": "TestPassword123",
            "phone": "01700000000",
        },
    )

    assert response.status_code == 201
    assert response.json()["email"] == "candidate_test@example.com"
    assert response.json()["role"] == "candidate"


def test_register_duplicate_email(client):
    user_data = {
        "full_name": "Test Candidate",
        "email": "duplicate_test@example.com",
        "password": "TestPassword123",
    }

    first_response = client.post("/auth/register", json=user_data)
    second_response = client.post("/auth/register", json=user_data)

    assert first_response.status_code == 201
    assert second_response.status_code == 409


def test_login_success(client):
    client.post(
        "/auth/register",
        json={
            "full_name": "Login Candidate",
            "email": "login_test@example.com",
            "password": "TestPassword123",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "login_test@example.com",
            "password": "TestPassword123",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post(
        "/auth/register",
        json={
            "full_name": "Wrong Password User",
            "email": "wrong_password@example.com",
            "password": "CorrectPassword123",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "wrong_password@example.com",
            "password": "IncorrectPassword123",
        },
    )

    assert response.status_code == 401


def test_current_user_with_valid_token(client):
    client.post(
        "/auth/register",
        json={
            "full_name": "Authenticated User",
            "email": "authenticated@example.com",
            "password": "TestPassword123",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "authenticated@example.com",
            "password": "TestPassword123",
        },
    )

    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == "authenticated@example.com"


def test_current_user_without_token(client):
    response = client.get("/auth/me")

    assert response.status_code in (401, 403)


def test_candidate_cannot_access_recruiter_area(client):
    client.post(
        "/auth/register",
        json={
            "full_name": "Candidate User",
            "email": "candidate_rbac@example.com",
            "password": "TestPassword123",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "candidate_rbac@example.com",
            "password": "TestPassword123",
        },
    )

    token = login_response.json()["access_token"]

    response = client.get(
        "/auth/recruiter-area",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 403
