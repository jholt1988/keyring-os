import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "postgresql+asyncpg://msgdoc:msgdoc@localhost:5432/msgdoc")
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    minio_endpoint: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    minio_access_key: str = os.getenv("MINIO_ACCESS_KEY", "msgdoc")
    minio_secret_key: str = os.getenv("MINIO_SECRET_KEY", "msgdocsecret")
    minio_bucket: str = os.getenv("MINIO_BUCKET", "msgdoc")
    minio_secure: bool = os.getenv("MINIO_SECURE", "false").lower() == "true"
    vault_addr: str = os.getenv("VAULT_ADDR", "http://localhost:8200")
    vault_token: str = os.getenv("VAULT_TOKEN", "devroot")
    max_doc_bytes: int = int(os.getenv("MAX_DOC_BYTES", str(25 * 1024 * 1024)))

settings = Settings()
