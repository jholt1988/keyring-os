/**
 * useFeatureFlag Hook
 * 
 * React hook for checking feature flag status from the frontend.
 * Uses React Query for caching and deduplication.
 * 
 * Usage:
 *   const { isEnabled, isLoading } = useFeatureFlag('dashboard_v2');
 *   if (isEnabled) { ... }
 */

import { useQuery } from '@tanstack/react-query';

export interface FeatureFlagContext {
  tenantId?: string;
  userId?: string;
  organizationId?: string;
  userRole?: 'admin' | 'manager' | 'tenant' | 'owner';
}

interface FeatureFlagResponse {
  enabled: boolean;
  key: string;
  rolloutPercentage: number;
  contextMatch: boolean;
}

async function fetchFeatureFlag(
  key: string,
  context?: FeatureFlagContext
): Promise<FeatureFlagResponse> {
  const params = new URLSearchParams({ key });
  if (context?.tenantId) params.append('tenantId', context.tenantId);
  if (context?.userId) params.append('userId', context.userId);
  if (context?.organizationId) params.append('organizationId', context.organizationId);
  if (context?.userRole) params.append('userRole', context.userRole);

  const response = await fetch(`/api/feature-flags/check?${params.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Feature flag check failed: ${response.status}`);
  }

  return response.json();
}

export function useFeatureFlag(flagKey: string, context?: FeatureFlagContext) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['featureFlag', flagKey, context],
    queryFn: () => fetchFeatureFlag(flagKey, context),
    staleTime: 60_000, // Cache for 1 minute
    retry: 1,
  });

  return {
    isEnabled: data?.enabled ?? false,
    isLoading,
    error,
    rolloutPercentage: data?.rolloutPercentage ?? 0,
    refetch,
  };
}

/**
 * Batch feature flag check hook
 * For checking multiple feature flags at once
 */
export function useFeatureFlags(flagKeys: string[], context?: FeatureFlagContext) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['featureFlags', flagKeys, context],
    queryFn: async (): Promise<Record<string, boolean>> => {
      if (flagKeys.length === 0) return {};

      const params = new URLSearchParams();
      flagKeys.forEach(key => params.append('keys', key));
      if (context?.tenantId) params.append('tenantId', context.tenantId);
      if (context?.userId) params.append('userId', context.userId);
      if (context?.organizationId) params.append('organizationId', context.organizationId);
      if (context?.userRole) params.append('userRole', context.userRole);

      const response = await fetch(`/api/feature-flags/check-batch?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Feature flag check failed: ${response.status}`);
      }

      return response.json();
    },
    staleTime: 60_000,
    retry: 1,
    enabled: flagKeys.length > 0,
  });

  return {
    flags: data ?? flagKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {}),
    isLoading,
    error,
    refetch,
  };
}
