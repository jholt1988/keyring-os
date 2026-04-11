'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, XCircle, Clock, Map, LayoutGrid } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';
import { fetchPortfolioWorkspace, fetchPortfolioRepairs, fetchPortfolioAuditLogs } from '@/lib/copilot-api';
import { TimelineRail } from '@/components/copilot/timeline-rail';

const PropertyMap = lazy(() =>
  import('@/components/copilot/property-map').then(m => ({ default: m.PropertyMap }))
);

export default function PortfolioPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [repairs, setRepairs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showRepairsOverlay, setShowRepairsOverlay] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  useEffect(() => {
    Promise.all([
      fetchPortfolioWorkspace(),
      fetchPortfolioRepairs(),
      fetchPortfolioAuditLogs()
    ]).then(([props, reps, logs]) => {
      setProperties(props);
      setRepairs(reps);
      setAuditLogs(logs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredProperties = properties.filter(p => {
    if (filter === 'Vacancies') return p.vacantCount > 0;
    if (filter === 'Risks') return (p.repairRiskCount > 0) || (p.overdueAmount > 0);
    return true;
  });

  return (
    <WorkspaceShell
      title="Portfolio Control Index"
      subtitle="Command index of all assets"
      icon={Building2}
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
  );
}
