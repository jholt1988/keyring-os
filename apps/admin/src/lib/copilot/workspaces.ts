import {
  fetchPortfolioWorkspace,
  fetchPropertyWorkspace,
  fetchUnitWorkspace,
} from './legacy-compat';
import { api } from './core';
import { loadReadOnlyOperatorData } from '../operator/read-only-data';

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
  const opData = await loadReadOnlyOperatorData({});
  const [aiMetrics] = await Promise.allSettled([
    api('/maintenance/ai-metrics'),
  ]);
  return {
    requests: opData.maintenanceDispatch?.requests?.map(r => ({ ...r, id: r.requestId })) ?? null,
    estimates: opData.inspectionEstimates?.estimates ?? null,
    aiMetrics: aiMetrics.status === 'fulfilled' ? aiMetrics.value : null,
  };
}

export async function fetchRenewalsWorkspace() {
  const opData = await loadReadOnlyOperatorData({});
  const [recommendations] = await Promise.allSettled([
    api('/rent-recommendations'),
  ]);
  return {
    leases: opData.renewals?.leases ?? null,
    recommendations: recommendations.status === 'fulfilled' ? recommendations.value : null,
  };
}

export async function fetchScreeningWorkspace() {
  try {
    const opData = await loadReadOnlyOperatorData({});
    return { applications: opData.applications?.applications ?? [] };
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
