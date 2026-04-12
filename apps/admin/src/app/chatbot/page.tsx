'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Bot, Send } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { fetchChatSession, sendChatMessage } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function ChatbotPage() {
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState('');
  const [message, setMessage] = useState('');
  const { data, refetch } = useQuery({ queryKey: ['chatbot', sessionId], queryFn: () => fetchChatSession(sessionId), enabled: !!sessionId });
  const thread = data?.messages ?? data?.thread ?? [];
  const mutation = useMutation({
    mutationFn: () => sendChatMessage(message, sessionId || undefined),
    onSuccess: (result) => {
      toast('Message sent');
      setMessage('');
      setSessionId(result?.sessionId ?? sessionId);
      refetch();
    },
  });
  return (
    <WorkspaceShell title="AI Assistant" subtitle="Chat session with persisted history" icon={Bot}>
      <SectionCard title="Session" subtitle="Resume an existing chat or start a new thread">
        <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="Session ID (optional)" className="mb-4 w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />
        <div className="mb-4 space-y-3">{thread.map((msg: any, idx: number) => <div key={msg.id ?? idx} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3"><p className="text-xs text-[#94A3B8]">{msg.role ?? 'assistant'}</p><p className="text-sm text-[#F8FAFC]">{msg.content ?? msg.message}</p></div>)}</div>
        <div className="flex gap-2"><input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask the assistant" className="flex-1 rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" /><Button size="sm" onClick={() => mutation.mutate()} disabled={!message}><Send size={12} /> Send</Button></div>
      </SectionCard>
    </WorkspaceShell>
  );
}
