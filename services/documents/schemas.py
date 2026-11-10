from pydantic import BaseModel
from typing import Optional

class InitiateRequest(BaseModel):
    owner_id: str
    doc_type: str
    mime: str
    size: int
    filename: str
    tenant_id: str = "default"

class InitiateResponse(BaseModel):
    document_id: str
    upload_url: str
    storage_key: str

class CompleteResponse(BaseModel):
    document_id: str
    status: str

class DownloadResponse(BaseModel):
    document_id: str
    download_url: str
    status: str
