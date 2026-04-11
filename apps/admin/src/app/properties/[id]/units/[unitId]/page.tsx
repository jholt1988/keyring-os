'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Home, XCircle, Clock } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';
import { fetchUnitWorkspace, transitionUnitState, fetchUnitLedger, fetchUnitRepairs, fetchAuditLogs } from '@/lib/copilot-api';
import { TimelineRail } from '@/components/copilot/timeline-rail';

export default function UnitPage() {
  const params = useParams();
  const id = params.id as string;
  const unitId = params.unitId as string;
  
  const [unit, setUnit] = useState<any>(null);
  const [rollup, setRollup] = useState<any>(null);
  const [ledger, setLedger] = useState<any>(null);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRepairsOverlay, setShowRepairsOverlay] = useState(false);

  const loadData = () => {
    if (id && unitId) {
      Promise.all([
        fetchUnitWorkspace(id, unitId),
        fetchUnitRepairs(unitId),
        fetchAuditLogs(unitId)
      ]).then(async ([res, reps, logs]) => {
        setUnit(res.unit);
        setRollup(res.rollup);
        setRepairs(reps);
        setAuditLogs(logs);
        if ((res.rollup as any)?.leaseId) {
          const ledgerData = await fetchUnitLedger((res.rollup as any).leaseId);
          setLedger(ledgerData);
        }
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    loadData();
  }, [id, unitId]);

  const handleAction = async (action: string) => {
    let newState = '';
    switch (action) {
      case 'Finish Turn': newState = 'VACANT'; break;
      case 'Publish Listing': newState = 'LISTED'; break;
    }
    if (newState) {
      try {
        await transitionUnitState(unitId, newState);
        loadData();
      } catch (e) {
        console.error('Failed to transition state', e);
      }
    }
  };

  if (loading || !unit || !rollup) return <div className="p-8 text-[#94A3B8]">Loading Unit...</div>;

  return (
    <WorkspaceShell
      title={`Unit ${unit.name}`}
      subtitle={`${unit.status.toUpperCase()} · Next: Action required`}
      icon={Home}
    >
      {/* Action Bar */}
      <div className="mb-8 flex gap-3 rounded-[18px] border border-[#1E3350] bg-[#0F1B31] p-4">
        {unit.status === 'TURNING' && <Button size="sm" variant="default" onClick={() => handleAction('Finish Turn')}>Finish Turn</Button>}
        {unit.status === 'VACANT' && <Button size="sm" variant="default" onClick={() => handleAction('Publish Listing')}>Publish Listing</Button>}
        <Button size="sm" variant="outline">Adjust Rent</Button>
        <Button size="sm" variant="outline">Schedule Showing</Button>
        <Button size="sm" variant="outline">Add Note</Button>
      </div>

      <div className="mb-8 grid gap-8 md:grid-cols-2">
        {/* Lifecycle Rail */}
        <div>
          <h4 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Lifecycle Rail</h4>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {['VACANT', 'TURNING', 'LISTED', 'APPLIED', 'APPROVED', 'LEASED', 'OCCUPIED', 'RENEWAL_DUE'].map(state => (
              <div key={state} className={`flex items-center gap-2 ${unit.status === state ? 'text-[#3B82F6]' : 'text-[#94A3B8]'}`}>
                <div className={`h-3 w-3 rounded-full ${unit.status === state ? 'bg-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-[#1E3350]'}`} />
                <span className={`text-xs tracking-wider ${unit.status === state ? 'font-bold' : ''}`}>{state}</span>
                {state !== 'RENEWAL_DUE' && <div className="mx-1 h-px w-8 bg-[#1E3350]" />}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Audit Timeline</h4>
          <TimelineRail events={auditLogs.map(log => ({
            id: log.id,
            label: log.action,
            date: new Date(log.date).toLocaleDateString(),
            status: 'completed'
          }))} />
        </div>
      </div>

      {/* Status / Financial / Maintenance panels */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.20)]">
          <h4 className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">STATUS PANEL</h4>
          <p className="text-sm text-[#CBD5E1]"><span className="text-[#94A3B8]">Occupancy:</span> {unit.status}</p>
          <p className="text-sm text-[#CBD5E1]"><span className="text-[#94A3B8]">Beds/Baths:</span> {unit.bedrooms || 0} / {unit.bathrooms || 0}</p>
        </div>

        <div className="rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.20)]">
          <h4 className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">FINANCIALS (YTD)</h4>
          <p className="text-sm text-[#CBD5E1]"><span className="text-[#94A3B8]">Revenue:</span> ${rollup.revenueYtd || 0}</p>
          <p className="text-sm text-[#CBD5E1]"><span className="text-[#94A3B8]">Expenses:</span> ${rollup.expenses || 0}</p>
          <div className="my-2 h-px w-full bg-[#1E3350]" />
          <p className="font-[family-name:var(--font-space)] text-sm font-bold text-[#3B82F6]">Net: ${rollup.net || 0}</p>
        </div>

        <div className="rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.20)]">
          <h4 className="mb-4 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">MAINTENANCE</h4>
          <p className="text-sm text-[#CBD5E1]"><span className="text-[#94A3B8]">Active Issues:</span> {repairs.length || rollup.activeIssues || 0}</p>
          <Button size="sm" variant="ghost" className="mt-2 text-xs text-[#F43F5E] hover:text-[#F43F5E]/80" onClick={() => setShowRepairsOverlay(true)}>View Open Work Orders</Button>
        </div>
      </div>

      {/* Tenant Ledger */}
      {ledger && (
        <div className="mb-8 rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.20)]">
          <h4 className="mb-4 font-mono text-[10px] uppercase tracking-wider font-semibold text-[#94A3B8]">Tenant Ledger</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E3350] text-left text-[#94A3B8]">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Charges</th>
                  <th className="pb-3 font-medium">Payments</th>
                  <th className="pb-3 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.entries && ledger.entries.length > 0 ? (
                  ledger.entries.map((entry: any, i: number) => {
                    const isCharge = entry.direction === 'DEBIT';
                    return (
                      <tr key={entry.id || i} className="border-b border-[#1E3350] last:border-0">
                        <td className="py-2.5 text-[#CBD5E1]">{new Date(entry.effectiveDate || entry.createdAt).toLocaleDateString()}</td>
                        <td className="py-2.5 text-[#CBD5E1]">{entry.entryType}</td>
                        <td className="py-2.5 text-[#CBD5E1]">{entry.description || '-'}</td>
                        <td className="py-2.5 font-mono text-[#F43F5E]">{isCharge ? `$${(entry.amountCents / 100).toFixed(2)}` : ''}</td>
                        <td className="py-2.5 font-mono text-[#10B981]">{!isCharge ? `$${(entry.amountCents / 100).toFixed(2)}` : ''}</td>
                        <td className="py-2.5 font-mono text-[#94A3B8]">-</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-[#94A3B8]">No ledger entries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Repairs Overlay */}
      {showRepairsOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07111F]/80 backdrop-blur-sm">
          <div className="relative max-h-[80vh] w-full max-w-2xl overflow-auto rounded-[24px] border border-[#1E3350] bg-[#13233C] p-6 shadow-[0_8px_30px_rgba(2,6,23,0.20)]">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 text-[#94A3B8] hover:text-[#F8FAFC]" onClick={() => setShowRepairsOverlay(false)}><XCircle /></Button>
            <h3 className="mb-4 font-[family-name:var(--font-space)] text-lg font-bold text-[#F8FAFC]">Repair Overlay: Unit {unit.name}</h3>
            {repairs.length === 0 ? (
              <p className="text-[#94A3B8]">No active or recent maintenance requests for this unit.</p>
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
