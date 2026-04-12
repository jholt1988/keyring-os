'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { Landmark } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { disconnectQuickBooks, fetchAccountingSyncStatus, fetchQuickBooksStatus, getQuickBooksAuthUrl, syncQuickBooks, testQuickBooksConnection } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function QuickBooksSettingsPage() {
  const { toast } = useToast();
  const { data: status, refetch } = useQuery({ queryKey: ['quickbooks-status'], queryFn: fetchQuickBooksStatus });
  const { data: syncStatus } = useQuery({ queryKey: ['accounting-sync-status'], queryFn: fetchAccountingSyncStatus });
  const connectM = useMutation({ mutationFn: () => getQuickBooksAuthUrl(), onSuccess: (result) => { const link = result?.url ?? result?.authUrl; if (link) window.open(link, '_blank', 'noopener,noreferrer'); toast('QuickBooks auth launched'); } });
  const syncM = useMutation({ mutationFn: () => syncQuickBooks(), onSuccess: () => { toast('Sync started'); refetch(); } });
  const disconnectM = useMutation({ mutationFn: () => disconnectQuickBooks(), onSuccess: () => { toast('Disconnected'); refetch(); } });
  const testM = useMutation({ mutationFn: () => testQuickBooksConnection(), onSuccess: () => toast('Connection test complete') });
  return (
    <WorkspaceShell title="QuickBooks" subtitle="Connection and accounting sync controls" icon={Landmark}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Connection Status" subtitle="Current QuickBooks integration state">
          <pre className="mb-4 overflow-x-auto text-xs text-[#CBD5E1]">{JSON.stringify(status ?? {}, null, 2)}</pre>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => connectM.mutate()}>Connect</Button>
            <Button size="sm" variant="outline" onClick={() => syncM.mutate()}>Sync Now</Button>
            <Button size="sm" variant="outline" onClick={() => testM.mutate()}>Test Connection</Button>
            <Button size="sm" variant="destructive" onClick={() => disconnectM.mutate()}>Disconnect</Button>
          </div>
        </SectionCard>
        <SectionCard title="Accounting Sync Status" subtitle="Backend reporting endpoint state">
          <pre className="overflow-x-auto text-xs text-[#CBD5E1]">{JSON.stringify(syncStatus ?? {}, null, 2)}</pre>
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
