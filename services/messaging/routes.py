from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .db import SessionLocal
from .models import Conversation, ConversationMember, Message, ReadReceipt
from .schemas import CreateConversationRequest, SendMessageRequest, MarkReadRequest, ConversationOut, MessageOut
from .ws import manager

router = APIRouter()

async def get_session():
    async with SessionLocal() as s:
        yield s

@router.post("/conversations", response_model=ConversationOut)
async def create_conv(req: CreateConversationRequest, session: AsyncSession = Depends(get_session)):
    conv = Conversation(tenant_id=req.tenant_id, subject=req.subject)
    session.add(conv)
    await session.flush()
    for uid in req.member_ids:
        session.add(ConversationMember(conversation_id=conv.id, user_id=uid))
    await session.commit()
    return ConversationOut(id=conv.id, tenant_id=conv.tenant_id, subject=conv.subject)

@router.get("/conversations/{conv_id}/messages", response_model=list[MessageOut])
async def list_messages(conv_id: str, session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(Message).where(Message.conversation_id == conv_id, Message.deleted_at.is_(None)).order_by(Message.created_at))
    return [MessageOut(id=m.id, conversation_id=m.conversation_id, sender_id=m.sender_id, body=m.body, msg_type=m.msg_type, attachment_doc_id=m.attachment_doc_id, created_at=m.created_at.isoformat()) for m in res.scalars().all()]

@router.post("/conversations/{conv_id}/messages", response_model=MessageOut)
async def send_message(conv_id: str, req: SendMessageRequest, session: AsyncSession = Depends(get_session)):
    msg = Message(conversation_id=conv_id, sender_id=req.sender_id, body=req.body, msg_type=req.msg_type, attachment_doc_id=req.attachment_doc_id)
    session.add(msg)
    await session.commit()
    await session.refresh(msg)
    out = MessageOut(id=msg.id, conversation_id=msg.conversation_id, sender_id=msg.sender_id, body=msg.body, msg_type=msg.msg_type, attachment_doc_id=msg.attachment_doc_id, created_at=msg.created_at.isoformat())
    await manager.broadcast(conv_id, {"type": "message", "message": out.model_dump()})
    return out

@router.post("/conversations/{conv_id}/read")
async def mark_read(conv_id: str, req: MarkReadRequest, session: AsyncSession = Depends(get_session)):
    rr = ReadReceipt(conversation_id=conv_id, user_id=req.user_id, last_read_message_id=req.last_read_message_id)
    session.add(rr)
    await session.commit()
    await manager.broadcast(conv_id, {"type": "read", "user_id": req.user_id, "last_read_message_id": req.last_read_message_id})
    return {"status": "ok"}

@router.websocket("/ws/conversations/{conv_id}")
async def ws_endpoint(websocket: WebSocket, conv_id: str):
    await manager.connect(conv_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(conv_id, {"type": "typing", "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(conv_id, websocket)
