'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  type Conversation,
  type Message,
} from '@/lib/tenant-api';
import { formatRelative } from '@/lib/utils';

const MOCK_USER_ID = process.env.NEXT_PUBLIC_MOCK_USER_ID ?? 'dev-tenant-uuid-001';

function MessageBubble({ msg }: { msg: Message }) {
  const isMine = msg.senderId === MOCK_USER_ID;
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isMine
            ? 'rounded-br-sm bg-[#3B82F6] text-white'
            : 'rounded-bl-sm border border-[#1E3350] bg-[#0F1B31] text-[#F8FAFC]'
        }`}
      >
        <p>{msg.content}</p>
        <p
          className={`mt-1 text-[10px] ${
            isMine ? 'text-blue-200' : 'text-[#475569]'
          }`}
        >
          {formatRelative(msg.createdAt)}
        </p>
      </div>
    </div>
  );
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const convId = Number(id);
  const qc = useQueryClient();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  });

  const conv: Conversation | undefined = conversations.find((c) => c.id === convId);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', convId],
    queryFn: () => fetchMessages(convId),
    refetchInterval: 15_000,
  });

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(convId, draft),
    onSuccess: () => {
      setDraft('');
      qc.invalidateQueries({ queryKey: ['messages', convId] });
      qc.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Scroll to bottom when messages load or new message arrives
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const title = conv?.subject ?? 'Conversation';

  return (
    <WorkspaceShell title={title} backHref="/messages" backLabel="Messages">
      {/* Message thread */}
      <Card className="flex flex-col" style={{ minHeight: '400px' }}>
        <CardContent className="flex flex-col gap-3 pt-5 pb-4 flex-1">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  className={`h-12 w-2/3 rounded-2xl ${i % 2 === 0 ? '' : 'self-end'}`}
                />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <p className="text-center text-sm text-[#94A3B8] py-8">
              No messages yet. Start the conversation below.
            </p>
          ) : (
            sorted.map((msg: Message) => <MessageBubble key={msg.id} msg={msg} />)
          )}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      {/* Compose */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3 items-end">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && draft.trim()) {
                  e.preventDefault();
                  sendMutation.mutate();
                }
              }}
              rows={2}
              placeholder="Type a message… (Enter to send)"
              className="flex-1 rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#3B82F6] resize-none"
            />
            <Button
              onClick={() => sendMutation.mutate()}
              disabled={!draft.trim() || sendMutation.isPending}
              className="shrink-0"
            >
              {sendMutation.isPending ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
            </Button>
          </div>
          {sendMutation.isError && (
            <p className="mt-2 text-xs text-[#F43F5E]">Failed to send. Please try again.</p>
          )}
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
