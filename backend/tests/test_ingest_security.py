from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.main import app
from app.routes import ingest


def test_ingest_endpoint_is_disabled_by_default():
    assert not any(
        getattr(route, "path", None) == "/api/knowledge/ingest"
        for route in app.routes
    )


def test_enabled_ingest_endpoint_rejects_missing_token(monkeypatch):
    monkeypatch.setattr(
        ingest,
        "get_settings",
        lambda: SimpleNamespace(ingest_admin_token="test-admin-token"),
    )
    test_app = FastAPI()
    test_app.include_router(ingest.router)
    client = TestClient(test_app)

    response = client.post(
        "/api/knowledge/ingest",
        json={
            "title": "Test document",
            "content": "Test content",
            "audience": "general",
        },
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized."}


def test_enabled_ingest_endpoint_rejects_wrong_token(monkeypatch):
    monkeypatch.setattr(
        ingest,
        "get_settings",
        lambda: SimpleNamespace(ingest_admin_token="test-admin-token"),
    )
    test_app = FastAPI()
    test_app.include_router(ingest.router)
    client = TestClient(test_app)

    response = client.post(
        "/api/knowledge/ingest",
        headers={"X-Admin-Token": "wrong-token"},
        json={
            "title": "Test document",
            "content": "Test content",
            "audience": "general",
        },
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Unauthorized."}
