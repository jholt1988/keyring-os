'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft,Home,Search,User } from 'lucide-react';
import { useState } from 'react';

export interface Unit {
  id: string;
  unitNumber: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  rent: number;
  status: 'vacant' | 'occupied' | 'maintenance' | 'reserved';
  tenant?: {
    name: string;
    leaseEnd: string;
  };
}

interface UnitListProps {
  units: Unit[];
  propertyId?: string;
  propertyName?: string;
  onSelectUnit?: (id: string) => void;
  onBack?: () => void;
}

const statusConfig = {
  vacant: { label: 'Vacant', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/30' },
  occupied: { label: 'Occupied', color: 'text-[#38BDF8]', bg: 'bg-[#38BDF8]/10', border: 'border-[#38BDF8]/30' },
  maintenance: { label: 'Maintenance', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30' },
  reserved: { label: 'Reserved', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/30' },
};

export function UnitList({ units, propertyId, propertyName, onSelectUnit, onBack }: UnitListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUnits = units.filter((unit) => {
    const matchesSearch = !search || 
      unit.unitNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: units.length,
    vacant: units.filter((u) => u.status === 'vacant').length,
    occupied: units.filter((u) => u.status === 'occupied').length,
    maintenance: units.filter((u) => u.status === 'maintenance').length,
  };

  const totalRent = units.reduce((s, u) => s + u.rent, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      {(propertyName || propertyId) && (
        <div className="flex items-center gap-2">
          {onBack && (
            <Button size="sm" variant="ghost" onClick={onBack}>
              <ChevronLeft size={16} />
              Back
            </Button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-[#F8FAFC]">{propertyName || 'All Units'}</h2>
            {propertyId && <p className="text-xs text-[#64748B]">Property ID: {propertyId}</p>}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <div className="text-xs uppercase tracking-wider text-[#64748B]">Total Units</div>
          <div className="mt-1 text-2xl font-semibold text-[#F8FAFC]">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-[#10B981]/30 bg-[#10B981]/8 p-4">
          <div className="text-xs uppercase tracking-wider text-[#10B981]">Vacant</div>
          <div className="mt-1 text-2xl font-semibold text-[#10B981]">{stats.vacant}</div>
        </div>
        <div className="rounded-xl border border-[#38BDF8]/30 bg-[#38BDF8]/8 p-4">
          <div className="text-xs uppercase tracking-wider text-[#38BDF8]">Occupied</div>
          <div className="mt-1 text-2xl font-semibold text-[#38BDF8]">{stats.occupied}</div>
        </div>
        <div className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/8 p-4">
          <div className="text-xs uppercase tracking-wider text-[#F59E0B]">Maintenance</div>
          <div className="mt-1 text-2xl font-semibold text-[#F59E0B]">{stats.maintenance}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <div className="text-xs uppercase tracking-wider text-[#64748B]">Potential Rent</div>
          <div className="mt-1 text-xl font-semibold text-[#F8FAFC]">${totalRent.toLocaleString()}</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <Input
            placeholder="Search units..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'vacant', 'occupied', 'maintenance'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : statusConfig[status as keyof typeof statusConfig]?.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Unit Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filteredUnits.length === 0 ? (
          <div className="col-span-full rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <Home className="mx-auto h-8 w-8 text-[#64748B]" />
            <p className="mt-2 text-sm text-[#94A3B8]">No units found</p>
          </div>
        ) : (
          filteredUnits.map((unit) => {
            const status = statusConfig[unit.status];
            return (
              <div
                key={unit.id}
                onClick={() => onSelectUnit?.(unit.id)}
                className="cursor-pointer rounded-xl border border-white/8 bg-white/[0.02] p-4 transition-all hover:border-white/12 hover:bg-white/[0.04]"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-lg font-semibold text-[#F8FAFC]">Unit {unit.unitNumber}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${status.border} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                
                <div className="mb-3 flex gap-4 text-xs text-[#94A3B8]">
                  <span>{unit.bedrooms} bed</span>
                  <span>{unit.bathrooms} bath</span>
                  <span>{unit.sqft} sqft</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-[#10B981]">${unit.rent.toLocaleString()}</div>
                    <div className="text-xs text-[#64748B]">/month</div>
                  </div>
                  {unit.tenant && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-[#94A3B8]">
                        <User size={12} />
                        {unit.tenant.name}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        Lease ends {new Date(unit.tenant.leaseEnd).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function PropertyUnitsPage() {
  return (
    <div className="p-6 text-center text-[#94A3B8]">
      <p>Property units cannot be viewed without a selected property context.</p>
    </div>
  );
}