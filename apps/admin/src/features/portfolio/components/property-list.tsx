'use client';

import { useState } from 'react';
import { Search, Building, MapPin, Home, Users, DollarSign, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  type: 'single-family' | 'multi-family' | 'apartment' | 'condo' | 'townhouse';
  units: number;
  occupiedUnits: number;
  monthlyRevenue: number;
  occupancyRate: number;
  status: 'active' | 'inactive' | 'pending-onboarding';
}

interface PropertyListProps {
  properties: Property[];
  onSelectProperty?: (id: string) => void;
  onViewUnits?: (propertyId: string) => void;
}

const typeConfig = {
  'single-family': { label: 'Single Family', icon: Home },
  'multi-family': { label: 'Multi Family', icon: Building },
  'apartment': { label: 'Apartment', icon: Building },
  'condo': { label: 'Condo', icon: Building },
  'townhouse': { label: 'Townhouse', icon: Home },
};

const statusConfig = {
  active: { label: 'Active', color: 'text-[#10B981]' },
  inactive: { label: 'Inactive', color: 'text-[#64748B]' },
  'pending-onboarding': { label: 'Pending', color: 'text-[#F59E0B]' },
};

export function PropertyList({ properties, onSelectProperty, onViewUnits }: PropertyListProps) {
  const [search, setSearch] = useState('');

  const filteredProperties = properties.filter((property) => 
    !search || 
    property.name.toLowerCase().includes(search.toLowerCase()) ||
    property.address.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    totalProperties: properties.length,
    totalUnits: properties.reduce((s, p) => s + p.units, 0),
    occupiedUnits: properties.reduce((s, p) => s + p.occupiedUnits, 0),
    monthlyRevenue: properties.reduce((s, p) => s + p.monthlyRevenue, 0),
  };

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <div className="text-xs uppercase tracking-wider text-[#64748B]">Properties</div>
          <div className="mt-1 text-2xl font-semibold text-[#F8FAFC]">{stats.totalProperties}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <div className="text-xs uppercase tracking-wider text-[#64748B]">Total Units</div>
          <div className="mt-1 text-2xl font-semibold text-[#F8FAFC]">{stats.totalUnits}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <div className="text-xs uppercase tracking-wider text-[#64748B]">Occupied</div>
          <div className="mt-1 text-2xl font-semibold text-[#10B981]">{stats.occupiedUnits}</div>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
          <div className="text-xs uppercase tracking-wider text-[#64748B]">Monthly Revenue</div>
          <div className="mt-1 text-2xl font-semibold text-[#38BDF8]">${stats.monthlyRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <Input
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Property List */}
      <div className="space-y-2">
        {filteredProperties.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <Building className="mx-auto h-8 w-8 text-[#64748B]" />
            <p className="mt-2 text-sm text-[#94A3B8]">No properties found</p>
          </div>
        ) : (
          filteredProperties.map((property) => {
            const type = typeConfig[property.type];
            const TypeIcon = type.icon;
            return (
              <div
                key={property.id}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] p-4 transition-all hover:border-white/12 hover:bg-white/[0.04]"
              >
                <div 
                  className="flex items-center gap-4"
                  onClick={() => onSelectProperty?.(property.id)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#38BDF8]/10">
                    <TypeIcon className="h-5 w-5 text-[#38BDF8]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#F8FAFC]">{property.name}</span>
                      <span className={`text-xs ${statusConfig[property.status].color}`}>
                        {statusConfig[property.status].label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-[#94A3B8]">
                      <MapPin size={12} />
                      {property.address}, {property.city}, {property.state} {property.zipCode}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-sm font-medium text-[#F8FAFC]">
                      <Home size={14} />
                      {property.occupiedUnits}/{property.units}
                    </div>
                    <div className="text-xs text-[#64748B]">Units</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-[#10B981]">
                      {property.occupancyRate}%
                    </div>
                    <div className="text-xs text-[#64748B]">Occupied</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewUnits?.(property.id);
                    }}
                  >
                    View Units
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}