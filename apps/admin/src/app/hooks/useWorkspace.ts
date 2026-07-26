import { useQuery } from '@tanstack/react-query';
import {
  loadOperatorPaymentsWorkspace,
  loadOperatorLeasingWorkspace,
  loadOperatorRepairsWorkspace,
  loadOperatorRenewalsWorkspace,
  loadOperatorScreeningWorkspace,
  loadOperatorFinancialsWorkspace,
  loadOperatorTenants,
  loadOperatorTenantWorkspace,
  loadOperatorTenantActivity,
} from '@/lib/operator/read-only-data';

export function usePaymentsWorkspace() {
  return useQuery({ queryKey: ['workspace', 'payments'], queryFn: () => loadOperatorPaymentsWorkspace({}) });
}

export function useLeasingWorkspace() {
  return useQuery({ queryKey: ['workspace', 'leasing'], queryFn: () => loadOperatorLeasingWorkspace({}) });
}

export function useRepairsWorkspace() {
  return useQuery({ queryKey: ['workspace', 'repairs'], queryFn: () => loadOperatorRepairsWorkspace({}) });
}

export function useRenewalsWorkspace() {
  return useQuery({ queryKey: ['workspace', 'renewals'], queryFn: () => loadOperatorRenewalsWorkspace({}) });
}

export function useScreeningWorkspace() {
  return useQuery({ queryKey: ['workspace', 'screening'], queryFn: () => loadOperatorScreeningWorkspace({}) });
}

export function useFinancialsWorkspace() {
  return useQuery({ queryKey: ['workspace', 'financials'], queryFn: () => loadOperatorFinancialsWorkspace({}) });
}

export function useTenantsIndex(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['tenants', 'index', params],
    queryFn: () => loadOperatorTenants(params, {}),
  });
}

export function useTenantWorkspace(id: string) {
  return useQuery({
    queryKey: ['tenants', 'workspace', id],
    queryFn: () => loadOperatorTenantWorkspace(id, {}),
    enabled: !!id,
  });
}

export function useTenantActivity(id: string) {
  return useQuery({
    queryKey: ['tenants', 'activity', id],
    queryFn: () => loadOperatorTenantActivity(id, {}),
    enabled: !!id,
  });
}
