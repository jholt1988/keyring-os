'use client';

import { useState } from 'react';
import { RequireRole } from '@/components/auth';
import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { fetchSecurityEvents } from '@/lib/copilot-api';

export default function SecuritySettingsPage() {
  const [filters, setFilters] = useState({ userId: '', type: '', from: '', to: '' });
  const { data } = useQuery({ queryKey: ['security-events', filters], queryFn: () => fetchSecurityEvents(filters) });
  const events = Array.isArray(data) ? data : [];
  return (
    <RequireRole requiredRoles="ADMIN">
      <WorkspaceShell title="Security Events" subtitle="Paginated security event log with filters" icon={Shield}>
      <SectionCard title="Filters" subtitle="User, type, and date range">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">{[['User ID', 'userId'], ['Type', 'type'], ['From', 'from'], ['To', 'to']].map(([label, key]) => <input key={key} value={(filters as any)[key]} onChange={(e) => setFilters((current) => ({ ...current, [key]: e.target.value }))} placeholder={label} className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />)}</div>
        <div className="space-y-3">{events.map((event: any, idx: number) => <div key={event.id ?? idx} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3"><p className="text-sm font-medium text-[#F8FAFC]">{event.type ?? 'Event'}</p><p className="text-xs text-[#94A3B8]">{event.userId ?? event.user ?? 'Unknown user'} · {event.ip ?? 'No IP'} · {event.timestamp ?? event.createdAt}</p></div>)}</div>
      </SectionCard>
    </WorkspaceShell>
    </RequireRole>
  );
}
