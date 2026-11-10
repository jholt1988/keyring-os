# msgdoc — In-App Messaging + Document Service

Self-hosted, E2EE, SOC 2-targeted. See plan: ../in-app-messaging-document-service-plan.md

## Stack
- Backend: Python 3.11 + FastAPI (both services)
- DB: PostgreSQL 16
- Cache/queue/realtime fan-out: Redis 7
- Object storage: MinIO (S3-compatible)
- Secret mgmt: HashiCorp Vault (dev mode for local)
- Python 3.11 or 3.12 recommended (3.14 wheels for asyncpg/pydantic-core are not available yet).

## Quick start
```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d
python -m venv .venv && source .venv/Scripts/activate
pip install -r requirements.txt
uvicorn services.documents.main:app --port 8001 --reload
uvicorn services.messaging.main:app --port 8002 --reload
```
