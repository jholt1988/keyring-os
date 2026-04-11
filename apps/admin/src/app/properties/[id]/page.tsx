'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2, XCircle, Clock } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';
import { fetchPropertyWorkspace, fetchPropertyRepairs, fetchAuditLogs } from '@/lib/copilot-api';
import { TimelineRail } from '@/components/copilot/timeline-rail';

export default function PropertyPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [property, setProperty] = useState<any>(null);
  const [rollup, setRollup] = useState<any>(null);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showRepairsOverlay, setShowRepairsOverlay] = useState(false);

  useEffect(() => {
    if (id) {
      Promise.all([
        fetchPropertyWorkspace(id),
        fetchPropertyRepairs(id),
        fetchAuditLogs({ entityId: id })
      ]).then(([res, reps, logs]) => {
        setProperty(res.property);
        setRollup(res.rollup);
        setRepairs(reps);
        setAuditLogs(Array.isArray(logs) ? logs : (logs as any).data ?? []);
      });
    }
  }, [id]);

  if (!property || !rollup) return <div className="p-8 text-[#94A3B8]">Loading Property...</div>;

  return (
    <WorkspaceShell
      title={property.name}
      subtitle={`${property.address} · ${rollup.totalUnits || 0} Units · ${rollup.vacantCount || 0} Vacant · ${rollup.expiringCount || 0} Expiring · ${rollup.repairRiskCount || 0} Risk`}
      icon={Building2}
    >
      {/* Action Shelf */}
      <div className="mb-8 flex gap-3 rounded-[18px] border border-[#1E3350] bg-[#0F1B31] p-4">
        <Button variant="outline" onClick={() => router.push(`/leasing?propertyId=${id}`)}>View Vacancy</Button>
        <Button variant="outline" onClick={() => router.push(`/renewals?propertyId=${id}`)}>Start Renewal</Button>
        <Button variant="outline" onClick={() => setShowRepairsOverlay(true)}>Open Maintenance</Button>
        <Button variant="outline" onClick={() => router.push(`/financials?propertyId=${id}`)}>Review Financials</Button>
      </div>

      <div className="mb-8">
        <h4 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Audit Timeline</h4>
        <TimelineRail events={auditLogs.map(log => ({
          id: log.id,
          label: log.action,
          date: new Date(log.date).toLocaleDateString(),
          status: 'completed'
        }))} />
      </div>

      {/* Signal Strip */}
      {rollup.signals && rollup.signals.length > 0 && (
        <div className="mb-8 flex flex-col gap-2 rounded-[18px] border border-[#F43F5E]/20 bg-[#F43F5E]/5 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-[#F43F5E]">Active Signals</h4>
          {rollup.signals.map((sig: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {sig.type === 'CRITICAL' && <span className="h-2 w-2 rounded-full bg-[#F43F5E]" />}
              {sig.type === 'WARNING' && <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />}
              <span className="text-[#CBD5E1]">{sig.message} &mdash; Unit {sig.unitName}</span>
            </div>
          ))}
        </div>
      )}

      {/* Unit Roster */}
      <h3 className="mb-4 font-[family-name:var(--font-space)] text-lg font-semibold text-[#F8FAFC]">Unit Roster</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
         {!property.units || property.units.length === 0 ? (
          <p className="text-[#94A3B8]">No units found.</p>
        ) : (
          property.units.map((unit: any) => (
            <div key={unit.id} className="cursor-pointer rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.20)] transition-all duration-[180ms] hover:border-[#3B82F6]/40" onClick={() => router.push(`/properties/${id}/units/${unit.id}`)}>
              <h4 className="mb-1 font-[family-name:var(--font-space)] text-lg font-semibold text-[#F8FAFC]">Unit {unit.name}</h4>
              <p className="mb-4 text-sm font-medium uppercase text-[#3B82F6]">{unit.status}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="default">Take Action</Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Repairs Overlay */}
      {showRepairsOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111F]/80 backdrop-blur-sm">
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-auto rounded-[24px] border border-[#1E3350] bg-[#13233C] p-6 shadow-[0_8px_30px_rgba(2,6,23,0.20)]">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#F8FAFC]" onClick={() => setShowRepairsOverlay(false)}><XCircle /></Button>
            <h3 className="mb-4 font-[family-name:var(--font-space)] text-lg font-bold text-[#F8FAFC]">Repair Overlay: {property.name}</h3>
            {repairs.length === 0 ? (
              <p className="text-[#94A3B8]">No active or recent maintenance requests for this property.</p>
            ) : (
              <div className="space-y-4">
                {repairs.map((rep: any) => (
                  <div key={rep.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h4 className="font-semibold text-[#F8FAFC]">{rep.title || 'Maintenance Request'} <span className="ml-2 rounded-[10px] bg-[#3B82F6]/10 p-1 text-xs text-[#3B82F6]">{rep.status}</span></h4>
                      <div className="flex items-center gap-1 text-xs text-[#94A3B8]"><Clock size={12} /> {new Date(rep.createdAt).toLocaleDateString()}</div>
                    </div>
                    <p className="text-sm text-[#CBD5E1]">{rep.description}</p>
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
