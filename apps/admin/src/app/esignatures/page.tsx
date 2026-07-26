'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileSignature, Download, RefreshCw, XCircle, Send } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { Button } from '@/components/ui/button';
import { loadOperatorEsignaturesWorkbench, voidOperatorEnvelope, resendOperatorEnvelope } from '@/lib/operator/read-only-data';
import { useToast } from '@/components/ui/toast';
import{ dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import ESignaturesView from './esignatures-view';

const STATUS_STYLES: Record<string, string> = {
  SENT:       'text-[#3B82F6] bg-[#3B82F6]/10',
  DELIVERED:  'text-[#8B5CF6] bg-[#8B5CF6]/10',
  COMPLETED:  'text-[#10B981] bg-[#10B981]/10',
  DECLINED:   'text-[#F43F5E] bg-[#F43F5E]/10',
  VOIDED:     'text-[#94A3B8] bg-[#94A3B8]/10',
  PENDING:    'text-[#F59E0B] bg-[#F59E0B]/10',
};

export default function ESignaturesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: envelopes = [], isLoading } = useQuery({
    queryKey: ['esign-envelopes'],
    queryFn: () => loadOperatorEsignaturesWorkbench({}),
  });

  const voidMutation = useMutation({
    mutationFn: (id: string) => voidOperatorEnvelope(Number(id), {}),
    onSuccess: () => { toast('Envelope voided'); qc.invalidateQueries({ queryKey: ['esign-envelopes'] }); },
    onError: () => toast('Failed to void envelope', 'error'),
  });

  const resendMutation = useMutation({
    mutationFn: (id: string) => resendOperatorEnvelope(Number(id), {}),
    onSuccess: () => toast('Envelope resent'),
    onError: () => toast('Failed to resend envelope', 'error'),
  });

  const active = (envelopes as any[]).filter(e => !['COMPLETED','VOIDED','DECLINED'].includes(e.status?.toUpperCase()));
  const archived = (envelopes as any[]).filter(e => ['COMPLETED','VOIDED','DECLINED'].includes(e.status?.toUpperCase()));

  const EnvelopeRow = ({ env }: { env: any }) => {
    const status = env.status?.toUpperCase() ?? 'PENDING';
    const isActive = !['COMPLETED','VOIDED','DECLINED'].includes(status);
    return (
      <div className="flex items-center justify-between gap-4 rounded-[14px] border border-[#1E3350] bg-[#0F1B31] px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#F8FAFC]">{env.subject ?? env.title ?? `Envelope #${env.id}`}</p>
          <p className="mt-0.5 text-xs text-[#94A3B8]">
            {env.signerEmail ?? env.recipientEmail ?? ''}
            {env.createdAt ? ` · ${new Date(env.createdAt).toLocaleDateString()}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status] ?? 'text-[#94A3B8] bg-[#94A3B8]/10'}`}>
            {env.status}
          </span>
          {status === 'COMPLETED' && (
            <a href={`/api/v2/operator-esignatures/envelopes/${env.id}/documents/signed`} target="_blank" rel="noopener noreferrer"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-[#1E3350] bg-[#07111F] text-[#94A3B8] transition-all hover:border-[#3B82F6] hover:text-[#3B82F6]"
              title="Download signed document">
              <Download size={12} />
            </a>
          )}
          {isActive && (
            <>
              <Button size="sm" variant="outline" onClick={() => resendMutation.mutate(env.id)}
                disabled={resendMutation.isPending && resendMutation.variables === env.id}>
                {resendMutation.isPending && resendMutation.variables === env.id
                  ? <RefreshCw size={11} className="animate-spin" />
                  : <Send size={11} />}
                Resend
              </Button>
              <Button size="sm" variant="outline"
                className="border-[#F43F5E]/30 text-[#F43F5E] hover:bg-[#F43F5E]/10"
                onClick={() => voidMutation.mutate(env.id)}
                disabled={voidMutation.isPending && voidMutation.variables === env.id}>
                {voidMutation.isPending && voidMutation.variables === env.id
                  ? <RefreshCw size={11} className="animate-spin" />
                  : <XCircle size={11} />}
                Void
              </Button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <HydrationBoundary state={dehydrate(useQueryClient())}>
      <ESignaturesView />
    </HydrationBoundary>
  );
}
