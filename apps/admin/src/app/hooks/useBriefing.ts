import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchBriefing, executeDecisionAction } from '@/lib/copilot-api';
import type { BriefingData } from '@keyring/types';

export function useBriefing() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<BriefingData>({
    queryKey: ['briefing'],
    queryFn: fetchBriefing,
    refetchInterval: 30_000,
  });

  const executeMutation = useMutation({
    mutationFn: ({ endpoint, method, body }: { endpoint: string; method: string; body?: Record<string, unknown> }) =>
      executeDecisionAction(endpoint, method, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['briefing'] }),
  });

  const dismissDecision = (id: string) => {
    queryClient.setQueryData<BriefingData>(['briefing'], (old) => {
      if (!old) return old;
      return { ...old, decisions: old.decisions.filter((d) => d.id !== id) };
    });
  };

  return { data, isLoading, error, executeMutation, dismissDecision };
}
