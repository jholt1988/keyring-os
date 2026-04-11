import { useQuery } from '@tanstack/react-query';
import {
  fetchPaymentsWorkspace,
  fetchLeasingWorkspace,
  fetchRepairsWorkspace,
  fetchRenewalsWorkspace,
  fetchScreeningWorkspace,
  fetchFinancialsWorkspace,
  fetchTenants,
  fetchTenantWorkspace,
  fetchTenantActivity,
} from '@/lib/copilot-api';

export function usePaymentsWorkspace() {
  return useQuery({ queryKey: ['workspace', 'payments'], queryFn: fetchPaymentsWorkspace });
}

export function useLeasingWorkspace() {
  return useQuery({ queryKey: ['workspace', 'leasing'], queryFn: fetchLeasingWorkspace });
}

export function useRepairsWorkspace() {
  return useQuery({ queryKey: ['workspace', 'repairs'], queryFn: fetchRepairsWorkspace });
}

export function useRenewalsWorkspace() {
  return useQuery({ queryKey: ['workspace', 'renewals'], queryFn: fetchRenewalsWorkspace });
}

export function useScreeningWorkspace() {
  return useQuery({ queryKey: ['workspace', 'screening'], queryFn: fetchScreeningWorkspace });
}

export function useFinancialsWorkspace() {
  return useQuery({ queryKey: ['workspace', 'financials'], queryFn: fetchFinancialsWorkspace });
}

export function useTenantsIndex(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['tenants', 'index', params],
    queryFn: () => fetchTenants(params),
  });
}

export function useTenantWorkspace(id: string) {
  return useQuery({
    queryKey: ['tenants', 'workspace', id],
    queryFn: () => fetchTenantWorkspace(id),
    enabled: !!id,
  });
}

export function useTenantActivity(id: string) {
  return useQuery({
    queryKey: ['tenants', 'activity', id],
    queryFn: () => fetchTenantActivity(id),
    enabled: !!id,
  });
}
