import uuid
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .db import SessionLocal
from .models import Document, DocumentAudit
from .schemas import InitiateRequest, InitiateResponse, CompleteResponse, DownloadResponse
from .storage import client
from shared.config import settings

router = APIRouter()

ALLOWED_MIME = {
    "insurance": {"application/pdf", "image/png", "image/jpeg"},
    "id": {"image/png", "image/jpeg"},
    "default": {"application/pdf", "image/png", "image/jpeg", "text/plain"},
}

async def get_session():
    async with SessionLocal() as s:
        yield s

@router.post("/documents/initiate", response_model=InitiateResponse)
async def initiate(req: InitiateRequest, session: AsyncSession = Depends(get_session)):
    allowed = ALLOWED_MIME.get(req.doc_type, ALLOWED_MIME["default"])
    if req.mime not in allowed:
        raise HTTPException(400, "mime not allowed for doc_type")
    if req.size > settings.max_doc_bytes:
        raise HTTPException(413, "file too large")
    doc_id = str(uuid.uuid4())
    storage_key = f"{req.tenant_id}/{req.owner_id}/{doc_id}"
    doc = Document(
        id=doc_id, owner_id=req.owner_id, tenant_id=req.tenant_id,
        doc_type=req.doc_type, mime=req.mime, size=req.size,
        storage_key=storage_key, status="pending",
        metadata_={"filename": req.filename},
    )
    session.add(doc)
    await session.commit()
    c = client()
    url = c.presigned_put_object(settings.minio_bucket, storage_key, expires=300)
    return InitiateResponse(document_id=doc_id, upload_url=url, storage_key=storage_key)

@router.post("/documents/{doc_id}/complete", response_model=CompleteResponse)
async def complete(doc_id: str, session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "not found")
    if doc.status != "pending":
        raise HTTPException(409, "invalid state")
    # AV scan placeholder: in v1 E2EE means no content scan; metadata-only validation.
    doc.status = "available"
    session.add(DocumentAudit(document_id=doc_id, actor_id=doc.owner_id, action="complete"))
    await session.commit()
    return CompleteResponse(document_id=doc_id, status=doc.status)

@router.get("/documents/{doc_id}", response_model=DownloadResponse)
async def get_doc(doc_id: str, actor_id: str, session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalar_one_or_none()
    if not doc or doc.deleted_at:
        raise HTTPException(404, "not found")
    if actor_id != doc.owner_id:
        raise HTTPException(403, "forbidden")
    if doc.status != "available":
        raise HTTPException(409, "not available")
    c = client()
    url = c.presigned_get_object(settings.minio_bucket, doc.storage_key, expires=300)
    session.add(DocumentAudit(document_id=doc_id, actor_id=actor_id, action="download"))
    await session.commit()
    return DownloadResponse(document_id=doc_id, download_url=url, status=doc.status)

@router.delete("/documents/{doc_id}")
async def delete(doc_id: str, actor_id: str, session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "not found")
    if actor_id != doc.owner_id:
        raise HTTPException(403, "forbidden")
    if doc.legal_hold:
        raise HTTPException(409, "legal hold")
    from datetime import datetime
    doc.deleted_at = datetime.utcnow()
    doc.status = "deleted"
    session.add(DocumentAudit(document_id=doc_id, actor_id=actor_id, action="delete"))
    await session.commit()
    return {"document_id": doc_id, "status": "deleted"}
