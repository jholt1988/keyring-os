'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';
import ConversationView from './conversation-view';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';
import { loadOperatorMessages, sendOperatorMessage } from '@/lib/operator/read-only-data';
import { useToast } from '@/components/ui/toast';

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => loadOperatorMessages(Number(id), {}),
    refetchInterval: 10_000,
  });

  const sendMutation = useMutation({
    mutationFn: () => sendOperatorMessage(Number(id), content, {}),
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
    <HydrationBoundary state={dehydrate(qc)}>
      <ConversationView />
    </HydrationBoundary>
  );
}
