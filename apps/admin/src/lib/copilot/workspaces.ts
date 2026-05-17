import {
  fetchPortfolioWorkspace,
  fetchPropertyWorkspace,
  fetchUnitWorkspace,
} from './legacy';
import { api } from './core';

export async function fetchPaymentsWorkspace() {
  const [delinquency, opsSummary, invoices, decisions] = await Promise.allSettled([
    api('/payments/delinquency/queue'),
    api('/payments/ops-summary'),
    api('/payments/invoices'),
    api('/payments/decisions'),
  ]);
  return {
    delinquency: delinquency.status === 'fulfilled' ? delinquency.value : null,
    opsSummary: opsSummary.status === 'fulfilled' ? opsSummary.value : null,
    invoices: invoices.status === 'fulfilled' ? invoices.value : null,
    decisions: decisions.status === 'fulfilled' ? decisions.value : null,
  };
}

export async function fetchLeasingWorkspace() {
  const [opsSummary, stats, leads] = await Promise.allSettled([
    api('/leasing/ops-summary'),
    api('/leasing/statistics'),
    api('/leasing/leads'),
  ]);
  return {
    opsSummary: opsSummary.status === 'fulfilled' ? opsSummary.value : null,
    stats: stats.status === 'fulfilled' ? stats.value : null,
    leads: leads.status === 'fulfilled' ? leads.value : null,
  };
}

export async function fetchRepairsWorkspace() {
  const [requests, estimates, aiMetrics] = await Promise.allSettled([
    api('/maintenance?sortBy=priority&sortOrder=asc'),
    api('/estimates'),
    api('/maintenance/ai-metrics'),
  ]);
  return {
    requests: requests.status === 'fulfilled' ? requests.value : null,
    estimates: estimates.status === 'fulfilled' ? estimates.value : null,
    aiMetrics: aiMetrics.status === 'fulfilled' ? aiMetrics.value : null,
  };
}

export async function fetchRenewalsWorkspace() {
  const [leases, recommendations] = await Promise.allSettled([
    api('/leases'),
    api('/rent-recommendations'),
  ]);
  return {
    leases: leases.status === 'fulfilled' ? leases.value : null,
    recommendations: recommendations.status === 'fulfilled' ? recommendations.value : null,
  };
}

export async function fetchScreeningWorkspace() {
  try {
    const apps = await api<any>('/rental-applications');
    return { applications: Array.isArray(apps) ? apps : apps?.data ?? apps?.applications ?? [] };
  } catch {
    return { applications: [] };
  }
}

export async function fetchFinancialsWorkspace() {
  const [workspace, reconciliation, chartOfAccounts] = await Promise.allSettled([
    api('/bookkeeping/workspace'),
    api('/bookkeeping/reconciliation'),
    api('/bookkeeping/chart-of-accounts'),
  ]);
  return {
    ...(workspace.status === 'fulfilled'
      ? (workspace.value as any)
      : {
          pendingTransactions: [],
          exceptions: [],
          reconciliation: { unmatchedCount: 0, matchedCount: 0, exceptionCount: 0, items: [] },
          monthlyClose: [],
          ownerStatements: [],
          metrics: {
            unreconciledAmount: 0,
            pendingCategorization: 0,
            exceptionsCount: 0,
            monthsOpen: 0,
            ownerDistributionsDue: 0,
          },
        }),
    reconciliationDetail: reconciliation.status === 'fulfilled' ? reconciliation.value : null,
    chartOfAccounts: chartOfAccounts.status === 'fulfilled' ? chartOfAccounts.value : [],
  };
}

export const workspaceApi = {
  fetchPaymentsWorkspace,
  fetchLeasingWorkspace,
  fetchRepairsWorkspace,
  fetchRenewalsWorkspace,
  fetchScreeningWorkspace,
  fetchFinancialsWorkspace,
  fetchPortfolioWorkspace,
  fetchPropertyWorkspace,
  fetchUnitWorkspace,
};
