'use client';

import { SectionCard, WorkspaceShell } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
  createOperatorMessageThread,
  loadOperatorAdminConversations,
  loadOperatorConversationMessages,
  loadOperatorMessageStats,
  loadOperatorMessagingTenants,
  replyToOperatorConversation,
} from '@/lib/operator/read-only-data';
import { useMutation, useQuery, useQueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import MessagesView from './messages-view';
import {
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Participant {
  id: string;
  userId: string;
  username?: string;
}

interface Conversation {
  id: number;
  subject?: string;
  updatedAt: string;
  participants?: Participant[];
  messages?: Array<{ content: string; createdAt: string }>;
  _count?: { messages: number };
}

interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender?: { id: string; username?: string };
}

interface Tenant {
  id: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function conversationPreview(conv: Conversation) {
  const lastMsg = conv.messages?.[0];
  return lastMsg?.content?.slice(0, 60) ?? 'No messages yet';
}

function participantName(conv: Conversation) {
  const others = conv.participants?.filter((p) => p.username) ?? [];
  return others[0]?.username ?? 'Unknown';
}

function timeAgo(dateStr: string) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  // Conversations list
  const { data: convsRaw, isLoading: convsLoading } = useQuery({
    queryKey: ['messaging', 'conversations'],
    queryFn: () => loadOperatorAdminConversations({}),
    refetchInterval: 30_000,
  });
  const conversations: Conversation[] = (convsRaw as any)?.data ?? convsRaw ?? [];

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['messaging', 'stats'],
    queryFn: () => loadOperatorMessageStats({}),
    staleTime: 60_000,
  });

  // Tenants (for compose)
  const { data: tenantsRaw } = useQuery({
    queryKey: ['messaging', 'tenants'],
    queryFn: () => loadOperatorMessagingTenants({}),
  });
  const tenants = (Array.isArray(tenantsRaw) ? tenantsRaw : []) as Tenant[];

  // Active thread
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const { data: threadMessages, isLoading: msgsLoading } = useQuery({
    queryKey: ['messaging', 'messages', activeConvId],
    queryFn: () => loadOperatorConversationMessages(activeConvId!, {}),
    enabled: activeConvId != null,
    refetchInterval: 10_000,
  });
  const messages = (Array.isArray(threadMessages) ? threadMessages : []) as Message[];

  // Reply
  const [replyBody, setReplyBody] = useState('');
  const replyMutation = useMutation({
    mutationFn: () => replyToOperatorConversation(activeConvId!, replyBody, {}),
    onSuccess: () => {
      setReplyBody('');
      qc.invalidateQueries({ queryKey: ['messaging', 'messages', activeConvId] });
      qc.invalidateQueries({ queryKey: ['messaging', 'conversations'] });
    },
    onError: () => toast('Failed to send reply', 'error'),
  });

  // Search
  const [search, setSearch] = useState('');
  const filteredConvs = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        participantName(c).toLowerCase().includes(q) ||
        (c.subject ?? '').toLowerCase().includes(q),
    );
  }, [conversations, search]);

  // Compose modal
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeTenantId, setComposeTenantId] = useState('');
  const [tenantSearch, setTenantSearch] = useState('');
  const threadMutation = useMutation({
    mutationFn: () => {
      const tenant = tenants.find((t) => t.id === composeTenantId);
      const participantId = tenant?.userId ?? tenant?.id ?? composeTenantId;
      return createOperatorMessageThread({
        subject: composeSubject || undefined,
        content: composeBody,
        participantIds: [participantId],
      }, {});
    },
    onSuccess: (thread: any) => {
      toast('Message sent');
      setComposeOpen(false);
      setComposeSubject('');
      setComposeBody('');
      setComposeTenantId('');
      setTenantSearch('');
      qc.invalidateQueries({ queryKey: ['messaging', 'conversations'] });
      setActiveConvId(thread?.id ?? null);
    },
    onError: () => toast('Failed to send message', 'error'),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConv = conversations.find((c) => c.id === activeConvId);

  const filteredTenants = useMemo(() => {
    if (!tenantSearch.trim()) return tenants.slice(0, 8);
    const q = tenantSearch.toLowerCase();
    return tenants
      .filter((t) =>
        [t.firstName, t.lastName, t.username].some((s) => s?.toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [tenants, tenantSearch]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <MessagesView />
    </HydrationBoundary>
  );
}
