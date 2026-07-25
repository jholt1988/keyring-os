import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { executeCommandCenterAction, loadReadOnlyOperatorData } from '@/lib/operator/read-only-data';
import type { BriefingData } from '@keyring/types';

export function useBriefing() {
  const queryClient = useQueryClient();

  const { data: raw, isLoading, error } = useQuery<BriefingData>({
    queryKey: ['briefing'],
    queryFn: async () => {
      const ro = await loadReadOnlyOperatorData({});
      return ro.briefing as unknown as BriefingData;
    },
    refetchInterval: 30_000,
  });

  const executeMutation = useMutation({
    mutationFn: ({ endpoint, method, body }: { endpoint: string; method: string; body?: Record<string, unknown> }) =>
      executeCommandCenterAction(endpoint, method, body ? JSON.stringify(body) : '', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['briefing'] }),
  });

  const dismissDecision = (id: string) => {
    queryClient.setQueryData<BriefingData>(['briefing'], (old) => {
      if (!old) return old;
      return { ...old, decisions: old.decisions.filter((d) => d.id !== id) };
    });
  };

  return { data: raw, isLoading, error, executeMutation, dismissDecision };
}
