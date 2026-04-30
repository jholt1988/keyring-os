'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar,ChevronRight,Home,Search,User } from 'lucide-react';
import { useState } from 'react';

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  unitNumber: string;
  leaseStart: string;
  leaseEnd: string;
  monthlyRent: number;
  status: 'active' | 'pending' | 'past' | 'in-arrears';
}

interface TenantListProps {
  tenants: Tenant[];
  onSelectTenant?: (id: string) => void;
  onFilterChange?: (filter: string) => void;
}

const statusConfig = {
  active: { label: 'Active', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30' },
  pending: { label: 'Pending', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30' },
  past: { label: 'Past', color: 'text-[#64748B]', bg: 'bg-white/[0.02]', border: 'border-white/10' },
  'in-arrears': { label: 'In Arrears', color: 'text-[#F43F5E]', bg: 'bg-[#F43F5E]/10', border: 'border-[#F43F5E]/30' },
};

export function TenantList({ tenants, onSelectTenant, onFilterChange }: TenantListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = !search || 
      `${tenant.firstName} ${tenant.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      tenant.email.toLowerCase().includes(search.toLowerCase()) ||
      tenant.propertyAddress.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <Input
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'pending', 'in-arrears'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter(status);
                onFilterChange?.(status);
              }}
            >
              {status === 'all' ? 'All' : statusConfig[status as keyof typeof statusConfig]?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tenant List */}
      <div className="space-y-2">
        {filteredTenants.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <User className="mx-auto h-8 w-8 text-[#64748B]" />
            <p className="mt-2 text-sm text-[#94A3B8]">No tenants found</p>
          </div>
        ) : (
          filteredTenants.map((tenant) => {
            const status = statusConfig[tenant.status];
            return (
              <div
                key={tenant.id}
                onClick={() => onSelectTenant?.(tenant.id)}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] p-4 transition-all hover:border-white/12 hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#38BDF8]/10">
                    <User className="h-5 w-5 text-[#38BDF8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#F8FAFC]">
                        {tenant.firstName} {tenant.lastName}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${status.border} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Home size={12} />
                        {tenant.propertyAddress} {tenant.unitNumber && `Unit ${tenant.unitNumber}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(tenant.leaseStart).toLocaleDateString()} - {new Date(tenant.leaseEnd).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-[#F8FAFC]">
                      ${tenant.monthlyRent.toLocaleString()}/mo
                    </div>
                    <div className="text-xs text-[#64748B]">Monthly rent</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#64748B]" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}