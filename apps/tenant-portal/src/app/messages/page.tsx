'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Plus, ChevronRight } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchConversations, type Conversation } from '@/lib/tenant-api';
import { formatRelative } from '@/lib/utils';

function participantNames(conv: Conversation): string {
  if (!conv.participants?.length) return 'Property Manager';
  return conv.participants
    .map((p) => {
      const u = p.user;
      if (u?.firstName || u?.lastName) {
        return [u.firstName, u.lastName].filter(Boolean).join(' ');
      }
      return 'Unknown';
    })
    .join(', ');
}

function lastMessage(conv: Conversation): string | null {
  if (!conv.messages?.length) return null;
  const sorted = [...conv.messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return sorted[0].content;
}

export default function MessagesPage() {
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  });

  return (
    <WorkspaceShell title="Messages">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#94A3B8]" />
              <CardTitle>Conversations</CardTitle>
            </div>
            <Link href="/messages/new">
              <Button size="sm">
                <Plus size={13} />
                New Message
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare size={32} className="mx-auto mb-3 text-[#94A3B8]" />
              <p className="text-sm text-[#94A3B8]">No conversations yet.</p>
              <Link href="/messages/new" className="mt-3 inline-block">
                <Button size="sm" variant="outline">
                  <Plus size={12} />
                  Start a conversation
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {conversations.map((conv: Conversation) => {
                const preview = lastMessage(conv);
                return (
                  <Link
                    key={conv.id}
                    href={`/messages/${conv.id}`}
                    className="flex items-center gap-4 rounded-lg border border-[#1E3350] bg-[#0F1B31] px-4 py-3 transition-colors hover:border-[#2B4A73] hover:bg-[#0F1B31]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E3350] text-[#94A3B8]">
                      <MessageSquare size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-[#F8FAFC] truncate">
                          {conv.subject ?? participantNames(conv)}
                        </p>
                        <p className="text-xs text-[#475569] shrink-0">
                          {formatRelative(conv.updatedAt)}
                        </p>
                      </div>
                      {preview && (
                        <p className="text-xs text-[#94A3B8] truncate mt-0.5">{preview}</p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-[#475569] shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
