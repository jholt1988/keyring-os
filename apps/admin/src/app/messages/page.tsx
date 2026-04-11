'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Plus, RefreshCw, ChevronRight } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { fetchConversations, createConversation } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function MessagesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [newOpen, setNewOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [participantId, setParticipantId] = useState('');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => fetchConversations(),
  });

  const createMutation = useMutation({
    mutationFn: () => createConversation({
      subject,
      content: firstMessage,
      participantIds: participantId ? [participantId] : undefined,
    }),
    onSuccess: () => {
      toast('Conversation created');
      setNewOpen(false);
      setSubject('');
      setFirstMessage('');
      setParticipantId('');
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: () => toast('Failed to create conversation', 'error'),
  });

  return (
    <>
      <WorkspaceShell title="Messages" subtitle="Tenant & Team Communications" icon={MessageSquare}
        actions={<Button size="sm" onClick={() => setNewOpen(true)}><Plus size={13} /> New Conversation</Button>}
      >
        <SectionCard title="Conversations">
          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-[#0F1B31]" />)}</div>
          ) : (conversations as any[]).length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare size={32} className="mx-auto mb-3 text-[#94A3B8]" />
              <p className="text-sm text-[#94A3B8]">No conversations yet.</p>
              <Button size="sm" className="mt-4" onClick={() => setNewOpen(true)}>
                <Plus size={13} /> Start a conversation
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {(conversations as any[]).map((conv: any) => {
                const lastMsg = conv.messages?.[conv.messages.length - 1];
                const unread = conv.messages?.filter((m: any) => !m.readAt && m.senderRole !== 'ADMIN').length ?? 0;
                return (
                  <Link key={conv.id} href={`/messages/${conv.id}`}
                    className="flex items-center justify-between gap-4 rounded-[14px] border border-[#1E3350] bg-[#0F1B31] px-4 py-3 transition-colors hover:border-[#2B4A73]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-[#F8FAFC]">{conv.subject ?? 'Conversation'}</p>
                        {unread > 0 && (
                          <span className="shrink-0 rounded-full bg-[#3B82F6] px-1.5 py-0.5 text-[10px] font-bold text-white">{unread}</span>
                        )}
                      </div>
                      {lastMsg && (
                        <p className="mt-0.5 truncate text-xs text-[#94A3B8]">{lastMsg.content}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {lastMsg && <span className="text-[10px] text-[#475569]">{new Date(lastMsg.createdAt).toLocaleDateString()}</span>}
                      <ChevronRight size={14} className="text-[#475569]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </SectionCard>
      </WorkspaceShell>

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="New Conversation"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => createMutation.mutate()} disabled={!subject || !firstMessage || createMutation.isPending}>
              {createMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />} Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Maintenance follow-up"
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">First Message</label>
            <textarea value={firstMessage} onChange={e => setFirstMessage(e.target.value)} rows={3}
              placeholder="Type your opening message…"
              className="w-full resize-none rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Participant ID <span className="text-[#475569]">(optional)</span></label>
            <input value={participantId} onChange={e => setParticipantId(e.target.value)} placeholder="UUID of tenant or user"
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
        </div>
      </Modal>
    </>
  );
}
