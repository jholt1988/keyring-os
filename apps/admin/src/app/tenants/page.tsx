'use client';

import { useTenantsIndex } from '@/app/hooks/useWorkspace';
import { MetricCard,WorkspaceShell } from '@/components/copilot';
import { TenantCard,TenantHealthBadge } from '@/components/tenant';
import { Button } from '@/components/ui/button';
import {
AlertTriangle,
Calendar,
Clock,
FileText,
MessageSquare,
RefreshCw,
Search,
Send,
UserCheck,
Users,
XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useMemo,useState } from 'react';

const filterTabs = [
  { key: 'all', label: 'All Tenants', icon: Users },
  { key: 'attention', label: 'Needs Attention', icon: AlertTriangle },
  { key: 'movein', label: 'New Move-ins', icon: Calendar },
  { key: 'delinquent', label: 'Delinquent', icon: XCircle },
  { key: 'renewal', label: 'Renewal Candidates', icon: RefreshCw },
  { key: 'former', label: 'Former Tenants', icon: Clock },
];

export default function TenantsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (searchQuery) p.search = searchQuery;
    if (activeTab === 'delinquent') p.delinquent = 'true';
    if (activeTab === 'renewal') p.leaseEndingSoon = 'true';
    if (activeTab === 'attention') p.healthClass = 'AT_RISK';
    if (activeTab === 'former') p.former = 'true';
    if (activeTab === 'movein') p.status = 'ONBOARDING';
    return p;
  }, [activeTab, searchQuery]);

  const { data, isLoading } = useTenantsIndex(params);
  const tenants = (data as any)?.data ?? [];
  const total = (data as any)?.total ?? 0;

  const selectedTenant = tenants.find((t: any) => t.id === selectedTenantId);

  const atRiskCount = tenants.filter((t: any) => t.healthClass === 'AT_RISK' || t.healthClass === 'HIGH_TOUCH').length;
  const delinquentCount = tenants.filter((t: any) => t.status === 'DELINQUENT').length;
  const renewalCount = tenants.filter((t: any) => t.daysUntilLeaseEnd != null && t.daysUntilLeaseEnd <= 90 && t.daysUntilLeaseEnd > 0).length;

  return (
    <WorkspaceShell title="Tenants" subtitle="Resident Relationship Management" icon={UserCheck}>
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard value={total} label="Total Tenants" variant="info" />
        <MetricCard value={atRiskCount} label="At Risk" variant="danger" />
        <MetricCard value={delinquentCount} label="Delinquent" variant="warning" />
        <MetricCard value={renewalCount} label="Renewal Due" variant="success" />
      </div>

      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedTenantId(null); }}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-[180ms] ${
                activeTab === tab.key
                  ? 'border-[#3B82F6]/40 bg-[#17304E] text-[#F8FAFC]'
                  : 'border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] hover:border-[#2B4A73] hover:text-[#CBD5E1]'
              }`}
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Tenant List */}
        <div className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search tenants by name, email, unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-[14px] border border-[#1E3350] bg-[#0F1B31] py-2.5 pl-9 pr-4 text-sm text-[#F8FAFC] placeholder-[#64748B] transition-all duration-[180ms] focus:border-[#3B82F6]/40 focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/20"
            />
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-[14px] bg-[#0F1B31]" />
              ))}
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#1E3350] bg-[#0F1B31] py-16">
              <Users size={32} className="mb-3 text-[#64748B]" />
              <p className="text-sm font-medium text-[#94A3B8]">No tenants found</p>
              <p className="mt-1 text-xs text-[#64748B]">Try adjusting your filters or search</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tenants.map((tenant: any) => (
                <TenantCard
                  key={tenant.id}
                  tenant={tenant}
                  isSelected={selectedTenantId === tenant.id}
                  onClick={() => setSelectedTenantId(tenant.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Context Panel */}
        <div className="hidden lg:block">
          {selectedTenant ? (
            <div className="sticky top-8 rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5">
              <div className="mb-4">
                <h3 className="font-[family-name:var(--font-space)] text-base font-bold text-[#F8FAFC]">
                  {[selectedTenant.firstName, selectedTenant.lastName].filter(Boolean).join(' ')}
                </h3>
                <p className="mt-1 text-xs text-[#94A3B8]">
                  {selectedTenant.property} · {selectedTenant.unit}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <TenantHealthBadge classification={selectedTenant.healthClass} />
                  <span className="text-xs text-[#64748B]">{selectedTenant.status.replace(/_/g, ' ')}</span>
                </div>
              </div>

              <div className="mb-4 space-y-2 rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8]">Rent</span>
                  <span className="font-mono text-[#F8FAFC]">${selectedTenant.rentAmount?.toLocaleString() ?? '—'}/mo</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8]">Balance</span>
                  <span className={`font-mono ${(selectedTenant.currentBalance ?? 0) > 0 ? 'text-[#F43F5E]' : 'text-[#10B981]'}`}>
                    ${(selectedTenant.currentBalance ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8]">Lease ends</span>
                  <span className="font-mono text-[#F8FAFC]">
                    {selectedTenant.daysUntilLeaseEnd != null ? `${selectedTenant.daysUntilLeaseEnd}d` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#94A3B8]">Open issues</span>
                  <span className="font-mono text-[#F8FAFC]">{selectedTenant.openMaintenanceCount ?? 0}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link href={`/tenants/${selectedTenant.id}`}>
                  <Button size="sm" className="w-full">
                    <FileText size={12} /> Open Workspace
                  </Button>
                </Link>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare size={12} /> Message
                  </Button>
                  <Button size="sm" variant="outline">
                    <Send size={12} /> Notice
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-8 flex flex-col items-center justify-center rounded-[24px] border border-[#1E3350] bg-[#0F1B31] py-20">
              <UserCheck size={28} className="mb-3 text-[#64748B]" />
              <p className="text-sm text-[#94A3B8]">Select a tenant</p>
              <p className="mt-1 text-xs text-[#64748B]">Click any row to preview</p>
            </div>
          )}
        </div>
      </div>
    </WorkspaceShell>
  );
}
