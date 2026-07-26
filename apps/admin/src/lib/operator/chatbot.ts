import { apiRequest } from './api/client';

export async function fetchChatSession(sessionId?: string) {
  return apiRequest<any>('get', `/api/chat/sessions/${sessionId ?? ''}` as any);
}

export async function sendChatMessage(message: string, sessionId?: string) {
  return apiRequest<any>('post', '/api/chat/messages' as any, { body: { message, sessionId } });
}
