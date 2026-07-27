'use client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import QuickBooksSettingsView from './quickbooks-view';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Landmark } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { disconnectOperatorQuickBooks, getOperatorQuickBooksAuthUrl, loadOperatorQuickBooksWorkbench, syncOperatorQuickBooks, testOperatorQuickBooksConnection } from '@/lib/operator/read-only-data';
import { useToast } from '@/components/ui/toast';

export default function QuickBooksSettingsPage() {
  const { toast } = useToast();
  const { data: status, refetch } = useQuery({ queryKey: ['quickbooks-status'], queryFn: () => loadOperatorQuickBooksWorkbench({}) });
  const { data: syncStatus } = useQuery({ queryKey: ['accounting-sync-status'], queryFn: () => loadOperatorQuickBooksWorkbench({}) });
  const connectM = useMutation({ mutationFn: () => getOperatorQuickBooksAuthUrl({}), onSuccess: (result) => { const link = result?.url ?? result?.authUrl; if (link) window.open(link, '_blank', 'noopener,noreferrer'); toast('QuickBooks auth launched'); } });
  const syncM = useMutation({ mutationFn: () => syncOperatorQuickBooks({}), onSuccess: () => { toast('Sync started'); refetch(); } });
  const disconnectM = useMutation({ mutationFn: () => disconnectOperatorQuickBooks({}), onSuccess: () => { toast('Disconnected'); refetch(); } });
  const testM = useMutation({ mutationFn: () => testOperatorQuickBooksConnection({}), onSuccess: () => toast('Connection test complete') });
  return (
    <WorkspaceShell title="QuickBooks" icon={Landmark}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Connection Status">
          <pre className="mb-4 overflow-x-auto text-xs text-[#CBD5E1]">{JSON.stringify(status ?? {}, null, 2)}</pre>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => connectM.mutate()}>Connect</Button>
            <Button size="sm" variant="outline" onClick={() => syncM.mutate()}>Sync Now</Button>
            <Button size="sm" variant="outline" onClick={() => testM.mutate()}>Test Connection</Button>
            <Button size="sm" variant="destructive" onClick={() => disconnectM.mutate()}>Disconnect</Button>
          </div>
        </SectionCard>
        <SectionCard title="Accounting Sync Status">
          <pre className="overflow-x-auto text-xs text-[#CBD5E1]">{JSON.stringify(syncStatus ?? {}, null, 2)}</pre>
        </SectionCard>
      </div>
    </WorkspaceShell>
  );
}
