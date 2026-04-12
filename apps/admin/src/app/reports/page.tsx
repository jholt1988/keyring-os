'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Home, AlertTriangle, Wrench, CreditCard, Zap } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import {
  fetchAccountingSyncStatus,
  fetchRentRoll,
  fetchProfitLoss,
  fetchVacancyRate,
  fetchDelinquencyAnalytics,
  fetchMaintenanceAnalytics,
  fetchManualChargesSummary,
  fetchManualPaymentsSummary,
  fetchOpexAnomalies,
  fetchPaymentHistory,
  fetchCapexAnalytics,
  fetchReportHeatmap,
} from '@/lib/copilot-api';

const TABS = [
  { id: 'rent-roll',    label: 'Rent Roll',     icon: Home },
  { id: 'pnl',         label: 'P&L',            icon: TrendingUp },
  { id: 'vacancy',     label: 'Vacancy',        icon: BarChart3 },
  { id: 'delinquency', label: 'Delinquency',    icon: AlertTriangle },
  { id: 'maintenance', label: 'Maintenance',    icon: Wrench },
  { id: 'payments',    label: 'Payments',       icon: CreditCard },
  { id: 'capex',       label: 'CapEx',          icon: Zap },
  { id: 'heatmap',     label: 'Heatmap',        icon: BarChart3 },
  { id: 'opex',        label: 'OpEx Anomalies', icon: AlertTriangle },
  { id: 'accounting',  label: 'Accounting Sync', icon: TrendingUp },
  { id: 'manual-pay',  label: 'Manual Payments', icon: CreditCard },
  { id: 'manual-charge', label: 'Manual Charges', icon: CreditCard },
] as const;

type TabId = typeof TABS[number]['id'];

function KVGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object');
  if (entries.length === 0) return <p className="text-sm text-[#94A3B8]">No summary data available.</p>;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {entries.map(([k, v]) => (
        <div key={k} className="rounded-[14px] border border-[#1E3350] bg-[#07111F] p-3">
          <p className="text-[10px] uppercase tracking-wide text-[#94A3B8]">{k.replace(/([A-Z])/g, ' $1').trim()}</p>
          <p className="mt-1 text-lg font-bold text-[#F8FAFC]">{String(v)}</p>
        </div>
      ))}
    </div>
  );
}

function TableSection({ rows, title }: { rows: any[]; title: string }) {
  if (!rows?.length) return null;
  const cols = Object.keys(rows[0]).filter(k => typeof rows[0][k] !== 'object');
  return (
    <div className="mt-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#94A3B8]">{title}</p>
      <div className="overflow-x-auto rounded-[14px] border border-[#1E3350]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[#1E3350] bg-[#07111F]">
              {cols.map(c => (
                <th key={c} className="px-3 py-2 text-left font-medium text-[#94A3B8]">
                  {c.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 50).map((row, i) => (
              <tr key={i} className="border-b border-[#1E3350] last:border-0 hover:bg-[#0F1B31]">
                {cols.map(c => (
                  <td key={c} className="px-3 py-2 text-[#CBD5E1]">{String(row[c] ?? '—')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportContent({ tab }: { tab: TabId }) {
  const queryMap: Record<TabId, () => Promise<any>> = {
    'rent-roll':    () => fetchRentRoll(),
    'pnl':          () => fetchProfitLoss(),
    'vacancy':      () => fetchVacancyRate(),
    'delinquency':  () => fetchDelinquencyAnalytics(),
    'maintenance':  () => fetchMaintenanceAnalytics(),
    'payments':     () => fetchPaymentHistory(),
    'capex':        () => fetchCapexAnalytics(),
    'heatmap':      () => fetchReportHeatmap(),
    'opex':         () => fetchOpexAnomalies(),
    'accounting':   () => fetchAccountingSyncStatus(),
    'manual-pay':   () => fetchManualPaymentsSummary(),
    'manual-charge': () => fetchManualChargesSummary(),
  };

  const { data, isLoading } = useQuery({
    queryKey: ['report', tab],
    queryFn: queryMap[tab],
  });

  if (isLoading) return (
    <div className="space-y-3 pt-2">
      {[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-[14px] bg-[#0F1B31]" />)}
    </div>
  );

  if (!data) return <p className="pt-4 text-sm text-[#94A3B8]">No data available for this report.</p>;

  // Normalise: data may be { summary, rows } or a flat object or an array
  const summary = data.summary ?? (Array.isArray(data) ? null : data);
  const rows: any[] = data.rows ?? data.items ?? data.data ?? (Array.isArray(data) ? data : null);

  return (
    <div className="pt-2">
      {summary && typeof summary === 'object' && !Array.isArray(summary) && (
        <KVGrid data={summary as Record<string, unknown>} />
      )}
      {Array.isArray(rows) && rows.length > 0 && (
        <TableSection rows={rows} title="Detail" />
      )}
      {!summary && (!rows || rows.length === 0) && (
        <p className="text-sm text-[#94A3B8]">No data returned.</p>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('rent-roll');
  const ActiveIcon = TABS.find(t => t.id === activeTab)?.icon ?? BarChart3;

  return (
    <WorkspaceShell title="Reports" subtitle="Portfolio Analytics & Financials" icon={BarChart3}>
      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-[18px] border border-[#1E3350] bg-[#0F1B31] p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 rounded-[14px] px-3 py-2 text-xs font-medium transition-all ${
              activeTab === id
                ? 'bg-[#3B82F6] text-white shadow'
                : 'text-[#94A3B8] hover:text-[#F8FAFC]'
            }`}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      <SectionCard title={TABS.find(t => t.id === activeTab)?.label ?? ''}>
        <ReportContent tab={activeTab} />
      </SectionCard>
    </WorkspaceShell>
  );
}
