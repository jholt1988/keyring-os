// Client helpers for the msgdoc Python services (messaging + documents).
// Configure via env: NEXT_PUBLIC_MESSAGING_URL, NEXT_PUBLIC_DOCUMENTS_URL

export const MESSAGING_URL = process.env.NEXT_PUBLIC_MESSAGING_URL || 'http://localhost:8002';
const AUTH_TOKEN = process.env.NEXT_PUBLIC_MSGDOC_TOKEN || '';

function authHeaders(): Record<string, string> {
  return AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {};
}

export async function fetchConversations(tenant_id = 'default'): Promise<any[]> {
  const res = await fetch(`${MESSAGING_URL}/conversations?tenant_id=${encodeURIComponent(tenant_id)}`, {
    headers: { ...authHeaders() },
  });
  if (!res.ok) throw new Error(`fetch convs failed: ${res.status}`);
  return res.json();
}
export const DOCUMENTS_URL = process.env.NEXT_PUBLIC_DOCUMENTS_URL || 'http://localhost:8001';

export async function initiateDocumentUpload(payload: {
  owner_id: string;
  doc_type: string;
  mime: string;
  size: number;
  filename: string;
  tenant_id?: string;
}) {
  const res = await fetch(`${DOCUMENTS_URL}/documents/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`initiate failed: ${res.status}`);
  return res.json() as Promise<{ document_id: string; upload_url: string; storage_key: string }>;
}

export async function completeDocumentUpload(document_id: string) {
  const res = await fetch(`${DOCUMENTS_URL}/documents/${document_id}/complete`, { method: 'POST' });
  if (!res.ok) throw new Error(`complete failed: ${res.status}`);
  return res.json();
}

export async function createConversation(member_ids: string[], tenant_id = 'default', subject?: string) {
  const res = await fetch(`${MESSAGING_URL}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ tenant_id, member_ids, subject }),
  });
  if (!res.ok) throw new Error(`create conv failed: ${res.status}`);
  return res.json() as Promise<{ id: string; tenant_id: string; subject?: string }>;
}

export async function sendMessage(conversation_id: string, sender_id: string, body: string) {
  const res = await fetch(`${MESSAGING_URL}/conversations/${conversation_id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ sender_id, body }),
  });
  if (!res.ok) throw new Error(`send failed: ${res.status}`);
  return res.json();
}

export function openConversationSocket(conversation_id: string, onMessage: (data: any) => void): WebSocket {
  const url = MESSAGING_URL.replace(/^http/, 'ws') + `/ws/conversations/${conversation_id}`;
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => {
    try { onMessage(JSON.parse(ev.data)); } catch { onMessage(ev.data); }
  };
  return ws;
}
