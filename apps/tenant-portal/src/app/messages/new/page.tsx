'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Send, RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createConversation, fetchPropertyManagers } from '@/lib/tenant-api';

export default function NewMessagePage() {
  const router = useRouter();
  const { data: propertyManagers = [], isLoading: loadingManagers } = useQuery({
    queryKey: ['property-managers'],
    queryFn: fetchPropertyManagers,
  });
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipientId, setRecipientId] = useState('');

  const mutation = useMutation({
    mutationFn: () => createConversation({ subject, content, recipientId }),
    onSuccess: (conv) => {
      router.push(`/messages/${conv.id}`);
    },
  });

  const canSubmit = recipientId.trim().length > 0 && content.trim().length > 0;

  return (
    <WorkspaceShell title="New Message" backHref="/messages" backLabel="Messages">
      <Card>
        <CardHeader>
          <CardTitle>New Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Recipient</label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                disabled={loadingManagers || mutation.isPending}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors focus:border-[#3B82F6]"
              >
                <option value="">
                  {loadingManagers ? 'Loading recipients…' : 'Select a property manager'}
                </option>
                {propertyManagers.map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.username?.trim() || manager.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question about my lease renewal"
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Write your message here…"
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#3B82F6] resize-none"
              />
            </div>
            {!loadingManagers && propertyManagers.length === 0 && (
              <p className="text-xs text-[#F43F5E]">
                No property managers are currently available to message.
              </p>
            )}
            {mutation.isError && (
              <p className="text-xs text-[#F43F5E]">Failed to send. Please try again.</p>
            )}
            <div className="flex justify-end">
              <Button
                onClick={() => mutation.mutate()}
                disabled={!canSubmit || mutation.isPending}
              >
                {mutation.isPending ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
