'use client';

import { SectionCard, WorkspaceShell } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import {
  createMessageThread,
  fetchAdminConversations,
  fetchConversationMessages,
  fetchMessageStats,
  fetchMessagingTenants,
  replyToConversation,
} from '@/lib/copilot-api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
    queryFn: () => fetchAdminConversations(),
    refetchInterval: 30_000,
  });
  const conversations: Conversation[] = (convsRaw as any)?.data ?? convsRaw ?? [];

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['messaging', 'stats'],
    queryFn: () => fetchMessageStats(),
    staleTime: 60_000,
  });

  // Tenants (for compose)
  const { data: tenantsRaw } = useQuery({
    queryKey: ['messaging', 'tenants'],
    queryFn: () => fetchMessagingTenants(),
  });
  const tenants: Tenant[] = Array.isArray(tenantsRaw) ? tenantsRaw : [];

  // Active thread
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const { data: threadMessages, isLoading: msgsLoading } = useQuery({
    queryKey: ['messaging', 'messages', activeConvId],
    queryFn: () => fetchConversationMessages(activeConvId!),
    enabled: activeConvId != null,
    refetchInterval: 10_000,
  });
  const messages: Message[] = Array.isArray(threadMessages) ? threadMessages : [];

  // Reply
  const [replyBody, setReplyBody] = useState('');
  const replyMutation = useMutation({
    mutationFn: () => replyToConversation(activeConvId!, replyBody),
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
      return createMessageThread({
        subject: composeSubject || undefined,
        content: composeBody,
        participantIds: [participantId],
      });
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
    <WorkspaceShell title="Messages" subtitle="Tenant Communication Center" icon={MessageSquare}>
      {/* Stats row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Total Threads', value: (stats as any)?.totalConversations ?? conversations.length },
          { label: 'Active Today', value: (stats as any)?.activeToday ?? '—' },
          { label: 'Avg Response', value: (stats as any)?.avgResponseTime ?? '—' },
        ].map((s) => (
          <div key={s.label} className="rounded-[18px] border border-[#1E3350] bg-[#0F1B31] px-5 py-4">
            <p className="text-2xl font-bold text-[#F8FAFC]">{s.value}</p>
            <p className="mt-0.5 text-xs text-[#64748B]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* ── Left: Conversation List ── */}
        <div className="col-span-4">
          <SectionCard
            title="Conversations"
            actions={
              <Button size="sm" onClick={() => setComposeOpen(true)}>
                <MessageSquare size={12} /> Compose
              </Button>
            }
          >
            <div className="relative mb-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] py-2 pl-8 pr-3 text-xs text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
              />
            </div>

            {convsLoading ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw size={16} className="animate-spin text-[#64748B]" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#64748B]">No conversations yet</div>
            ) : (
              <div className="max-h-[520px] space-y-1.5 overflow-y-auto pr-1">
                {filteredConvs.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full rounded-[12px] border p-3 text-left transition-all duration-150 ${
                      activeConvId === conv.id
                        ? 'border-[#3B82F6]/40 bg-[#17304E]'
                        : 'border-[#1E3350] bg-[#0F1B31] hover:border-[#2B4A73] hover:bg-[#13233C]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#F8FAFC]">{participantName(conv)}</span>
                      <span className="text-[10px] text-[#64748B]">{timeAgo(conv.updatedAt)}</span>
                    </div>
                    {conv.subject && <p className="mt-0.5 text-[10px] font-medium text-[#94A3B8]">{conv.subject}</p>}
                    <p className="mt-1 truncate text-[10px] text-[#64748B]">{conversationPreview(conv)}</p>
                  </button>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Center: Thread Panel ── */}
        <div className="col-span-8">
          {activeConvId == null ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[24px] border border-[#1E3350] bg-[#0F1B31]">
              <MessageSquare size={32} className="mb-3 text-[#1E3350]" />
              <p className="text-sm text-[#64748B]">Select a conversation</p>
              <p className="mt-1 text-xs text-[#475569]">or compose a new message</p>
              <Button size="sm" className="mt-4" onClick={() => setComposeOpen(true)}>
                <MessageSquare size={13} /> New Message
              </Button>
            </div>
          ) : (
            <div
              className="flex flex-col rounded-[24px] border border-[#1E3350] bg-[#0F1B31]"
              style={{ minHeight: 520 }}
            >
              {/* Thread header */}
              <div className="flex items-center justify-between border-b border-[#1E3350] px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#F8FAFC]">
                    {activeConv ? participantName(activeConv) : '—'}
                  </p>
                  {activeConv?.subject && <p className="text-xs text-[#64748B]">{activeConv.subject}</p>}
                </div>
                <button onClick={() => setActiveConvId(null)} className="text-[#64748B] hover:text-[#F8FAFC]">
                  <X size={15} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {msgsLoading ? (
                  <div className="flex justify-center py-10">
                    <RefreshCw size={16} className="animate-spin text-[#64748B]" />
                  </div>
                ) : messages.length === 0 ? (
                  <p className="py-10 text-center text-xs text-[#64748B]">No messages in this thread</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#17304E] text-xs font-bold text-[#3B82F6]">
                        {(msg.sender?.username ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-medium text-[#94A3B8]">
                            {msg.sender?.username ?? 'Unknown'}
                          </span>
                          <span className="text-[10px] text-[#475569]">{timeAgo(msg.createdAt)}</span>
                        </div>
                        <p className="mt-1 rounded-[10px] border border-[#1E3350] bg-[#13233C] px-3 py-2 text-sm text-[#E2E8F0]">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply box */}
              <div className="border-t border-[#1E3350] p-4">
                <div className="flex gap-2">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && replyBody.trim()) {
                        replyMutation.mutate();
                      }
                    }}
                    rows={2}
                    placeholder="Type a reply… (Ctrl+Enter to send)"
                    className="flex-1 resize-none rounded-lg border border-[#1E3350] bg-[#13233C] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
                  />
                  <Button
                    size="sm"
                    className="self-end"
                    onClick={() => replyMutation.mutate()}
                    disabled={!replyBody.trim() || replyMutation.isPending}
                  >
                    {replyMutation.isPending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Compose Modal ── */}
      <Modal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        title="New Message"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => threadMutation.mutate()}
              disabled={!composeBody.trim() || !composeTenantId || threadMutation.isPending}
            >
              {threadMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />} Send
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Recipient */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">
              Recipient <span className="text-[#F43F5E]">*</span>
            </label>
            <div className="relative">
              <Users size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                value={tenantSearch}
                onChange={(e) => {
                  setTenantSearch(e.target.value);
                  setComposeTenantId('');
                }}
                placeholder="Search tenants..."
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] py-2 pl-8 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
              />
            </div>
            {tenantSearch && !composeTenantId && filteredTenants.length > 0 && (
              <div className="mt-1 max-h-36 overflow-y-auto rounded-lg border border-[#1E3350] bg-[#0F1B31]">
                {filteredTenants.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setComposeTenantId(t.id);
                      setTenantSearch(
                        [t.firstName, t.lastName].filter(Boolean).join(' ') || t.username || t.id,
                      );
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-[#F8FAFC] hover:bg-[#17304E]"
                  >
                    {[t.firstName, t.lastName].filter(Boolean).join(' ') || t.username || t.id}
                  </button>
                ))}
              </div>
            )}
            {composeTenantId && <p className="mt-1 text-xs text-[#10B981]">✓ Recipient selected</p>}
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">Subject (optional)</label>
            <input
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="Lease renewal, maintenance update..."
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* Message */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#94A3B8]">
              Message <span className="text-[#F43F5E]">*</span>
            </label>
            <textarea
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              rows={5}
              placeholder="Type your message..."
              className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
            />
          </div>
        </div>
      </Modal>
    </WorkspaceShell>
  );
}
