'use client';

/**
 * OperatorDataContext
 *
 * React context providing ReadOnlyOperatorData to all views in the app.
 * Wraps loadReadOnlyOperatorData with React Query for caching,
 * auto-refresh (30s), and error handling. All operator views consume
 * data from this context instead of managing their own fetch lifecycle.
 */

import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  loadReadOnlyOperatorData,
  emptyReadOnlyOperatorData,
  type ReadOnlyOperatorData,
} from '@/lib/operator/read-only-data';
import { countUnitsByStatus } from '@/features/operator/utils';

export interface OperatorTotals {
  properties: number;
  units: number;
  occupied: number;
  vacant: number;
  occupancy: number;
}

export interface OperatorDataContextValue {
  /** The full operator data snapshot */
  data: ReadOnlyOperatorData;
  /** Computed portfolio totals */
  totals: OperatorTotals;
  /** Whether data has loaded at least once */
  loaded: boolean;
  /** Whether a fetch is in progress */
  loading: boolean;
  /** The current auth token */
  token: string;
  /** Force a data refresh */
  refresh: () => Promise<void>;
  /** Set a new auth token and trigger refresh */
  setToken: (token: string) => void;
}

const OperatorDataContext = createContext<OperatorDataContextValue | null>(null);

function computeTotals(data: ReadOnlyOperatorData): OperatorTotals {
  const properties = data.portfolio.data;
  const unitCount = properties.reduce((sum, property) => sum + (property.units?.length ?? 0), 0);
  const vacantUnits = properties.reduce((sum, property) => sum + countUnitsByStatus(property, 'VACANT'), 0);

  return {
    properties: data.portfolio.meta?.totalItems ?? properties.length,
    units: data.metrics?.occupancy?.total ?? unitCount,
    occupied: data.metrics?.occupancy?.occupied ?? unitCount - vacantUnits,
    vacant: data.metrics?.occupancy?.vacant ?? vacantUnits,
    occupancy: data.metrics?.occupancy?.percentage ?? (unitCount > 0 ? Math.round(((unitCount - vacantUnits) / unitCount) * 100) : 0),
  };
}

export function OperatorDataProvider({
  children,
  initialToken = '',
}: {
  children: ReactNode;
  initialToken?: string;
}) {
  const queryClient = useQueryClient();

  // Persist token in localStorage
  const token = typeof window !== 'undefined'
    ? window.localStorage.getItem('operator_api_token') ?? initialToken
    : initialToken;

  const { data: rawData, isLoading, isFetched } = useQuery({
    queryKey: ['operator-data', token],
    queryFn: () => loadReadOnlyOperatorData({ token }),
    enabled: Boolean(token),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  const data = rawData ?? emptyReadOnlyOperatorData;
  const totals = useMemo(() => computeTotals(data), [data]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['operator-data'] });
  }, [queryClient]);

  const setToken = useCallback((nextToken: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('operator_api_token', nextToken);
    }
    // Invalidate stale data immediately, React Query will refetch with new token
    void queryClient.invalidateQueries({ queryKey: ['operator-data'] });
    // Force a page-level re-render by refetching
    void queryClient.refetchQueries({ queryKey: ['operator-data', nextToken] });
  }, [queryClient]);

  const value: OperatorDataContextValue = useMemo(() => ({
    data,
    totals,
    loaded: isFetched && Boolean(token),
    loading: isLoading,
    token,
    refresh,
    setToken,
  }), [data, totals, isFetched, token, isLoading, refresh, setToken]);

  return (
    <OperatorDataContext.Provider value={value}>
      {children}
    </OperatorDataContext.Provider>
  );
}

export function useOperatorData(): OperatorDataContextValue {
  const ctx = useContext(OperatorDataContext);
  if (!ctx) throw new Error('useOperatorData must be used inside <OperatorDataProvider>');
  return ctx;
}

/**
 * Convenience hook: returns the raw operator signals as ambient signals
 * for use in AmbientSignalCluster and BriefingContext.
 */
export function useOperatorSignals() {
  const { data } = useOperatorData();
  return useMemo(() => {
    const signals = data.briefing?.signals ?? [];
    return signals.slice(0, 6).map((signal) => ({
      id: signal.id,
      severity: signal.severity === 'critical' ? 'critical' as const
        : signal.severity === 'high' ? 'high' as const
        : signal.severity === 'medium' ? 'medium' as const
        : 'low' as const,
      label: signal.title,
      pulse: signal.severity === 'critical',
    }));
  }, [data.briefing?.signals]);
}
