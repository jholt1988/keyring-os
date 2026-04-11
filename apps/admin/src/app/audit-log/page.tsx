'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { Button } from '@/components/ui/button';
import { fetchAuditLogs } from '@/lib/copilot-api';

const PAGE_SIZE = 25;

const MODULE_COLORS: Record<string, string> = {
  LEASE:        'text-[#3B82F6]',
  PAYMENT:      'text-[#10B981]',
  MAINTENANCE:  'text-[#F59E0B]',
  TENANT:       'text-[#8B5CF6]',
  PROPERTY:     'text-[#38BDF8]',
  APPLICATION:  'text-[#F43F5E]',
  INSPECTION:   'text-[#EC4899]',
  DOCUMENT:     'text-[#94A3B8]',
};

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Simple debounce via state
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(0);
    clearTimeout((window as any).__auditSearchTimer);
    (window as any).__auditSearchTimer = setTimeout(() => setDebouncedSearch(v), 400);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, debouncedSearch, moduleFilter],
    queryFn: () => fetchAuditLogs({
      skip: page * PAGE_SIZE,
      limit: PAGE_SIZE,
      module: moduleFilter || undefined,
      entityId: debouncedSearch || undefined,
    }),
  });

  const logs: any[] = data?.data ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const modules = Object.keys(MODULE_COLORS);

  return (
    <WorkspaceShell title="Audit Log" subtitle="System Activity & Change History" icon={ScrollText}>
      <SectionCard title="Activity Log">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Search by entity ID…"
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] py-2 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none focus:border-[#3B82F6]" />
          </div>
          <select value={moduleFilter} onChange={e => { setModuleFilter(e.target.value); setPage(0); }}
            className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
            <option value="">All Modules</option>
            {modules.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse rounded-lg bg-[#0F1B31]" />)}</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center">
            <ScrollText size={32} className="mx-auto mb-3 text-[#94A3B8]" />
            <p className="text-sm text-[#94A3B8]">No audit log entries found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[14px] border border-[#1E3350]">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1E3350] bg-[#07111F]">
                  {['Timestamp', 'Module', 'Action', 'Entity', 'Actor', 'Details'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left font-medium text-[#94A3B8]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b border-[#1E3350] last:border-0 hover:bg-[#0F1B31] transition-colors">
                    <td className="whitespace-nowrap px-3 py-2.5 text-[#475569]">
                      {new Date(log.createdAt ?? log.date).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`font-medium ${MODULE_COLORS[log.module?.toUpperCase()] ?? 'text-[#94A3B8]'}`}>
                        {log.module ?? '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[#CBD5E1]">{log.action ?? '—'}</td>
                    <td className="px-3 py-2.5 font-mono text-[#94A3B8]">
                      {log.entityId ? String(log.entityId).slice(0, 8) + '…' : '—'}
                    </td>
                    <td className="px-3 py-2.5 text-[#94A3B8]">
                      {log.actor?.name ?? log.actorId ?? '—'}
                    </td>
                    <td className="max-w-[200px] truncate px-3 py-2.5 text-[#475569]">
                      {log.details ? JSON.stringify(log.details).slice(0, 60) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-[#94A3B8]">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
                <ChevronLeft size={13} /> Prev
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}>
                Next <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </SectionCard>
    </WorkspaceShell>
  );
}
