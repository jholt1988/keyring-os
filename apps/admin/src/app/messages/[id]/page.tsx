'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';
import { fetchMessages, sendMessage } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => fetchMessages(Number(id)),
    refetchInterval: 10_000,
  });

  const sendMutation = useMutation({
    mutationFn: () => sendMessage(Number(id), content),
    onSuccess: () => {
      setContent('');
      qc.invalidateQueries({ queryKey: ['messages', id] });
    },
    onError: () => toast('Failed to send message', 'error'),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (content.trim()) sendMutation.mutate();
    }
  };

  return (
    <WorkspaceShell title="Conversation" subtitle={`Thread #${id}`} icon={MessageSquare}>
      <div className="flex h-[calc(100vh-220px)] flex-col rounded-[24px] border border-[#1E3350] bg-[#0F1B31]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-[#07111F]" />)}</div>
          ) : (messages as any[]).length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-[#94A3B8]">No messages yet. Start the conversation.</p>
            </div>
          ) : (
            (messages as any[]).map((msg: any) => {
              const isAdmin = msg.senderRole === 'ADMIN' || msg.sender?.role === 'ADMIN';
              return (
                <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-[14px] px-4 py-2.5 ${isAdmin ? 'bg-[#3B82F6] text-white' : 'border border-[#1E3350] bg-[#07111F] text-[#F8FAFC]'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <p className={`mt-1 text-[10px] ${isAdmin ? 'text-blue-200' : 'text-[#475569]'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[#1E3350] p-4">
          <div className="flex gap-2">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-[#1E3350] bg-[#07111F] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]"
            />
            <Button
              size="sm"
              onClick={() => sendMutation.mutate()}
              disabled={!content.trim() || sendMutation.isPending}
              className="self-end"
            >
              {sendMutation.isPending ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
            </Button>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
