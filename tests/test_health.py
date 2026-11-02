def test_home(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json()["status"] == "running"


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_database_health(client):
    response = client.get("/health/db")

    assert response.status_code == 200
    assert response.json()["database"] == "connected"