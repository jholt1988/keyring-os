'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, XCircle, Clock, Map, LayoutGrid, Plus, RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { fetchPortfolioWorkspace, fetchPortfolioRepairs, fetchPortfolioAuditLogs, createProperty, createUnit } from '@/lib/copilot-api';
import { TimelineRail } from '@/components/copilot/timeline-rail';
import { useToast } from '@/components/ui/toast';
import { useMutation } from '@tanstack/react-query';

const PropertyMap = lazy(() =>
  import('@/components/copilot/property-map').then(m => ({ default: m.PropertyMap }))
);

export default function PortfolioPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [repairs, setRepairs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showRepairsOverlay, setShowRepairsOverlay] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Create Property modal
  const [propOpen, setPropOpen] = useState(false);
  const [propForm, setPropForm] = useState({ name: '', address: '', city: '', state: '', zipCode: '', propertyType: 'RESIDENTIAL' });

  // Create Unit modal
  const [unitOpen, setUnitOpen] = useState(false);
  const [unitPropertyId, setUnitPropertyId] = useState('');
  const [unitForm, setUnitForm] = useState({ name: '', unitNumber: '', bedrooms: '', bathrooms: '', squareFeet: '' });

  const createPropertyMutation = useMutation({
    mutationFn: () => createProperty({
      name: propForm.name,
      address: propForm.address,
      city: propForm.city || undefined,
      state: propForm.state || undefined,
      zipCode: propForm.zipCode || undefined,
      propertyType: propForm.propertyType || undefined,
    }),
    onSuccess: (prop: any) => {
      toast('Property created');
      setPropOpen(false);
      setPropForm({ name: '', address: '', city: '', state: '', zipCode: '', propertyType: 'RESIDENTIAL' });
      router.push(`/properties/${prop.id}`);
    },
    onError: () => toast('Failed to create property', 'error'),
  });

  const createUnitMutation = useMutation({
    mutationFn: () => createUnit(unitPropertyId, {
      name: unitForm.name,
      unitNumber: unitForm.unitNumber || undefined,
      bedrooms: unitForm.bedrooms ? parseInt(unitForm.bedrooms) : undefined,
      bathrooms: unitForm.bathrooms ? parseFloat(unitForm.bathrooms) : undefined,
      squareFeet: unitForm.squareFeet ? parseInt(unitForm.squareFeet) : undefined,
    }),
    onSuccess: () => {
      toast('Unit created');
      setUnitOpen(false);
      setUnitForm({ name: '', unitNumber: '', bedrooms: '', bathrooms: '', squareFeet: '' });
      setUnitPropertyId('');
    },
    onError: () => toast('Failed to create unit', 'error'),
  });

  useEffect(() => {
    Promise.all([
      fetchPortfolioWorkspace(),
      fetchPortfolioRepairs(),
      fetchPortfolioAuditLogs()
    ]).then(([props, reps, logs]) => {
      setProperties(props);
      setRepairs(reps);
      setAuditLogs(Array.isArray(logs) ? logs : (logs as any).data ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredProperties = properties.filter(p => {
    if (filter === 'Vacancies') return p.vacantCount > 0;
    if (filter === 'Risks') return (p.repairRiskCount > 0) || (p.overdueAmount > 0);
    return true;
  });

  return (
    <>
    <WorkspaceShell
      title="Portfolio Control Index"
      subtitle="Command index of all assets"
      icon={Building2}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setUnitOpen(true)}><Plus size={13} /> Add Unit</Button>
          <Button size="sm" onClick={() => setPropOpen(true)}><Plus size={13} /> Add Property</Button>
        </div>
      }
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex gap-3">
          <Button variant={filter === 'All' ? 'default' : 'outline'} onClick={() => setFilter('All')}>All Properties</Button>
          <Button variant={filter === 'Vacancies' ? 'default' : 'outline'} onClick={() => setFilter('Vacancies')}>Vacancies</Button>
          <Button variant={filter === 'Risks' ? 'default' : 'outline'} onClick={() => setFilter('Risks')}>Units Needing Action</Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 rounded-[12px] px-3 py-1.5 text-xs font-medium transition-all duration-[180ms] ${viewMode === 'grid' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`inline-flex items-center gap-1.5 rounded-[12px] px-3 py-1.5 text-xs font-medium transition-all duration-[180ms] ${viewMode === 'map' ? 'bg-[#3B82F6] text-white' : 'text-[#94A3B8] hover:text-[#F8FAFC]'}`}
            >
              <Map size={14} /> Map
            </button>
          </div>
          <Button variant="outline" className="border-[#F43F5E]/30 text-[#F43F5E] hover:bg-[#F43F5E]/10" onClick={() => setShowRepairsOverlay(true)}>
            Global Maintenance Queue
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Global Audit Timeline</h4>
        <TimelineRail events={auditLogs.map(log => ({
          id: log.id,
          label: log.action,
          date: new Date(log.date).toLocaleDateString(),
          status: 'completed'
        }))} />
      </div>

      {loading ? (
        <div className="text-[#94A3B8]">Loading portfolio...</div>
      ) : viewMode === 'map' ? (
        <Suspense fallback={<div className="flex h-[500px] items-center justify-center rounded-[24px] border border-[#1E3350] bg-[#13233C]"><p className="text-sm text-[#94A3B8]">Loading map...</p></div>}>
          <PropertyMap properties={filteredProperties} />
        </Suspense>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map(p => (
            <div key={p.id} className="cursor-pointer rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.20)] transition-all duration-[180ms] hover:border-[#3B82F6]/40" onClick={() => router.push(`/properties/${p.id}`)}>
              <h3 className="mb-2 font-[family-name:var(--font-space)] text-xl font-bold text-[#F8FAFC]">{p.name}</h3>
              <p className="mb-4 text-sm text-[#94A3B8]">{p.totalUnits || 0} Units &bull; {p.vacantCount || 0} Vacant &bull; {p.expiringCount || 0} Expiring &bull; {p.repairRiskCount || 0} Risk</p>
              
              <div className="space-y-2">
                {(p.signals || []).slice(0, 3).map((sig: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {sig.type === 'CRITICAL' && <span className="h-2 w-2 rounded-full bg-[#F43F5E]" />}
                    {sig.type === 'WARNING' && <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />}
                    {sig.type === 'INFO' && <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />}
                    <span className="text-[#CBD5E1]">{sig.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showRepairsOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111F]/80 backdrop-blur-sm">
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-auto rounded-[24px] border border-[#1E3350] bg-[#13233C] p-6 shadow-[0_8px_30px_rgba(2,6,23,0.20)]">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#F8FAFC]" onClick={() => setShowRepairsOverlay(false)}><XCircle /></Button>
            <h3 className="mb-4 font-[family-name:var(--font-space)] text-lg font-bold text-[#F8FAFC]">Global Repair Queue</h3>
            {repairs.length === 0 ? (
              <p className="text-[#94A3B8]">No active or recent maintenance requests across your portfolio.</p>
            ) : (
              <div className="space-y-4">
                {repairs.slice(0, 20).map((rep: any) => (
                  <div key={rep.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-semibold text-[#F8FAFC]">{rep.title || 'Maintenance Request'} <span className="ml-2 rounded-[10px] bg-[#3B82F6]/10 p-1 text-xs text-[#3B82F6]">{rep.status}</span></h4>
                      <div className="flex items-center gap-1 text-xs text-[#94A3B8]"><Clock size={12} /> {new Date(rep.createdAt).toLocaleDateString()}</div>
                    </div>
                    <p className="mb-1 text-sm text-[#CBD5E1]">{rep.description}</p>
                    <div className="mt-2 text-xs text-[#94A3B8]">
                      <strong>Priority:</strong> {rep.priority} &bull; <strong>Category:</strong> {rep.category}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </WorkspaceShell>

    {/* Create Property Modal */}
    <Modal open={propOpen} onClose={() => setPropOpen(false)} title="Add Property"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setPropOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={() => createPropertyMutation.mutate()} disabled={!propForm.name || !propForm.address || createPropertyMutation.isPending}>
            {createPropertyMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />} Create Property
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {[
          { key: 'name', label: 'Property Name', placeholder: 'e.g. Sunset Apartments' },
          { key: 'address', label: 'Street Address', placeholder: '123 Main St' },
          { key: 'city', label: 'City', placeholder: 'Austin' },
          { key: 'state', label: 'State', placeholder: 'TX' },
          { key: 'zipCode', label: 'ZIP Code', placeholder: '78701' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">{label}</label>
            <input value={(propForm as any)[key]} onChange={e => setPropForm(p => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
        ))}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Property Type</label>
          <select value={propForm.propertyType} onChange={e => setPropForm(p => ({ ...p, propertyType: e.target.value }))}
            className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
            {['RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'INDUSTRIAL'].map(t => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>

    {/* Create Unit Modal */}
    <Modal open={unitOpen} onClose={() => setUnitOpen(false)} title="Add Unit"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={() => setUnitOpen(false)}>Cancel</Button>
          <Button size="sm" onClick={() => createUnitMutation.mutate()} disabled={!unitPropertyId || !unitForm.name || createUnitMutation.isPending}>
            {createUnitMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />} Create Unit
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Property ID</label>
          <input value={unitPropertyId} onChange={e => setUnitPropertyId(e.target.value)} placeholder="UUID of the property"
            className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
        </div>
        {[
          { key: 'name', label: 'Unit Name', placeholder: 'e.g. Unit 2B' },
          { key: 'unitNumber', label: 'Unit Number', placeholder: '2B' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">{label}</label>
            <input value={(unitForm as any)[key]} onChange={e => setUnitForm(p => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
          </div>
        ))}
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'bedrooms', label: 'Beds', placeholder: '2' },
            { key: 'bathrooms', label: 'Baths', placeholder: '1' },
            { key: 'squareFeet', label: 'Sq Ft', placeholder: '850' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">{label}</label>
              <input type="number" min="0" value={(unitForm as any)[key]} onChange={e => setUnitForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#3B82F6]" />
            </div>
          ))}
        </div>
      </div>
    </Modal>
    </>
  );
}
