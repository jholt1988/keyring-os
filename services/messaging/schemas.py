from pydantic import BaseModel
from typing import Optional, List

class CreateConversationRequest(BaseModel):
    tenant_id: str = "default"
    subject: Optional[str] = None
    member_ids: List[str]

class SendMessageRequest(BaseModel):
    sender_id: str
    body: str
    msg_type: str = "text"
    attachment_doc_id: Optional[str] = None

class MarkReadRequest(BaseModel):
    user_id: str
    last_read_message_id: str

class ConversationOut(BaseModel):
    id: str
    tenant_id: str
    subject: Optional[str] = None

class MessageOut(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    body: str
    msg_type: str
    attachment_doc_id: Optional[str] = None
    created_at: str
