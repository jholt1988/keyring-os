import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import QuickBooksSettingsView from './quickbooks-view';

import { useMutation, useQuery } from '@tanstack/react-query';
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
    <HydrationBoundary state={dehydrate(queryClient)}>
      <QuickBooksSettingsView />
    </HydrationBoundary>
  );
}
