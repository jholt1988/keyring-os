import pytest
from fastapi.testclient import TestClient

def test_documents_health():
    from services.documents.main import app
    c = TestClient(app)
    r = c.get("/health")
    assert r.status_code == 200
    assert r.json()["service"] == "documents"

def test_messaging_health():
    from services.messaging.main import app
    c = TestClient(app)
    r = c.get("/health")
    assert r.status_code == 200
    assert r.json()["service"] == "messaging"
