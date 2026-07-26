'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Bot, Send, User, Loader2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { loadOperatorChatSession, sendOperatorChatMessage } from '@/lib/operator/read-only-data';
import { useToast } from '@/components/ui/toast';

export default function ChatbotPage() {
  const { toast } = useToast();
  const [sessionId, setSessionId] = useState('');
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  
  const { data, refetch, isLoading } = useQuery({ 
    queryKey: ['chatbot', sessionId], 
    queryFn: () => loadOperatorChatSession(sessionId, {}), 
    enabled: !!sessionId 
  });
  
  const thread = (data as any)?.messages ?? (data as any)?.thread ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread]);

  const mutation = useMutation({
    mutationFn: () => sendOperatorChatMessage(message, sessionId || undefined, {}),
    onSuccess: (result) => {
      setMessage('');
      if (!sessionId && (result as any)?.sessionId) {
        setSessionId((result as any).sessionId);
      } else {
        refetch();
      }
    },
    onError: () => toast('Failed to send message', 'error'),
  });

  return (
    <WorkspaceShell title="AI Assistant" subtitle="Chat session with context" icon={Bot}>
      <div className="flex h-[calc(100vh-140px)] flex-col rounded-[20px] border border-[#1E3350] bg-[#0B1628]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E3350] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6]/10">
              <Bot className="h-5 w-5 text-[#3B82F6]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#F8FAFC]">Copilot Assistant</h3>
              <p className="text-xs text-[#94A3B8]">Powered by AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              value={sessionId} 
              onChange={(e) => setSessionId(e.target.value)} 
              placeholder="Session ID (optional)" 
              className="w-48 rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-1.5 text-xs text-[#F8FAFC] placeholder:text-[#8A99AD] outline-none focus:border-[#3B82F6]" 
            />
            {sessionId && (
              <Button size="sm" variant="outline" onClick={() => { setSessionId(''); }}>
                New Chat
              </Button>
            )}
          </div>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {thread.length === 0 && !isLoading && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Bot className="mb-4 h-12 w-12 text-[#1E3350]" />
              <h4 className="text-lg font-medium text-[#F8FAFC]">How can I help you today?</h4>
              <p className="mt-2 text-sm text-[#94A3B8] max-w-md">
                I can assist with property summaries, tenant inquiries, maintenance analysis, and general system operations.
              </p>
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-[#94A3B8]">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {thread.map((msg: any, idx: number) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id ?? idx} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isUser ? 'bg-[#1E3350]' : 'bg-[#3B82F6]/20'}`}>
                  {isUser ? <User size={14} className="text-[#94A3B8]" /> : <Bot size={14} className="text-[#3B82F6]" />}
                </div>
                <div className={`max-w-[75%] rounded-[14px] p-3 text-sm ${isUser ? 'bg-[#3B82F6] text-white' : 'border border-[#1E3350] bg-[#0F1B31] text-[#F8FAFC]'}`}>
                  {msg.content ?? msg.message}
                </div>
              </div>
            );
          })}
          
          {mutation.isPending && (
             <div className="flex gap-3">
               <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#3B82F6]/20">
                 <Bot size={14} className="text-[#3B82F6]" />
               </div>
               <div className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3 text-sm text-[#F8FAFC]">
                 <Loader2 className="h-4 w-4 animate-spin text-[#94A3B8]" />
               </div>
             </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-[#1E3350] p-4 bg-[#07111F]/50 rounded-b-[20px]">
          <form 
            onSubmit={(e) => { e.preventDefault(); if(message.trim()) mutation.mutate(); }}
            className="flex items-end gap-2"
          >
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Message Copilot..." 
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[12px] border border-[#1E3350] bg-[#0F1B31] px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#8A99AD] outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if(message.trim()) mutation.mutate();
                }
              }}
            />
            <Button 
              type="submit" 
              className="h-[44px] shrink-0" 
              disabled={!message.trim() || mutation.isPending}
            >
              <Send size={16} />
            </Button>
          </form>
          <div className="mt-2 text-center text-[10px] text-[#8A99AD]">
            AI can make mistakes. Verify important information.
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
