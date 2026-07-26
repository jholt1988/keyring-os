import { apiRequest } from '@/lib/operator/api/client';

// Local runtime types aligned with consumers in the admin app
export interface Participant {
  id: string;
  userId: string;
  username?: string;
}

export interface Conversation {
  id: number;
  subject?: string;
  updatedAt: string;
  participants?: Participant[];
  messages?: Array<{ content: string; createdAt: string }>;
  _count?: { messages: number };
}

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender?: { id: string; username?: string };
}

export interface Tenant {
  id: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface MessageStats {
  totalConversations?: number;
  activeToday?: number;
  avgResponseTime?: number | string;
}

export async function fetchAdminConversations(): Promise<Conversation[] | any> {
  return apiRequest<Conversation[] | any>('get', '/api/messaging/admin/conversations');
}

export async function fetchConversationMessages(conversationId: number): Promise<Message[] | any> {
  return apiRequest<Message[] | any>('get', (`/api/messaging/conversations/${conversationId}/messages` as unknown) as any);
}

export async function createMessageThread(dto: {
  subject?: string;
  content: string;
  participantIds: string[];
}): Promise<{ id?: number } | any> {
  return apiRequest<{ id?: number } | any>('post', '/api/messaging/threads', {
    body: dto,
  });
}

export async function replyToConversation(conversationId: number, content: string): Promise<any> {
  return apiRequest<any>('post', (`/api/messaging/conversations/${conversationId}/messages` as unknown) as any, {
    body: { content },
  });
}

export async function fetchMessagingTenants(): Promise<Tenant[] | any> {
  return apiRequest<Tenant[] | any>('get', '/api/messaging/tenants');
}

export async function fetchMessageStats(): Promise<MessageStats | any> {
  return apiRequest<MessageStats | any>('get', '/api/messaging/stats');
}
