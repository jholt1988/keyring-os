'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Home } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';
import { fetchUnitWorkspace, transitionUnitState, fetchUnitLedger } from '@/lib/copilot-api';

export default function UnitPage() {
  const params = useParams();
  const id = params.id as string;
  const unitId = params.unitId as string;
  
  const [unit, setUnit] = useState<any>(null);
  const [rollup, setRollup] = useState<any>(null);
  const [ledger, setLedger] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    if (id && unitId) {
      fetchUnitWorkspace(id, unitId).then(async (res) => {
        setUnit(res.unit);
        setRollup(res.rollup);
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
        loadData(); // Reload data to show updated state
      } catch (e) {
        console.error('Failed to transition state', e);
      }
    }
  };

  if (loading || !unit || !rollup) return <div className="text-muted-foreground p-8">Loading Unit...</div>;

  return (
    <WorkspaceShell
      title={`Unit ${unit.name}`}
      subtitle={`${unit.status.toUpperCase()} · Next: Action required`}
      icon={Home}
    >
      <div className="flex gap-4 mb-8 bg-muted/50 p-4 rounded-xl border border-border">
        {unit.status === 'TURNING' && <Button size="sm" variant="default" onClick={() => handleAction('Finish Turn')}>Finish Turn</Button>}
        {unit.status === 'VACANT' && <Button size="sm" variant="default" onClick={() => handleAction('Publish Listing')}>Publish Listing</Button>}
        <Button size="sm" variant="outline">Adjust Rent</Button>
        <Button size="sm" variant="outline">Schedule Showing</Button>
        <Button size="sm" variant="outline">Add Note</Button>
      </div>

      <div className="mb-8">
        <h4 className="text-xs uppercase font-mono tracking-widest text-muted-foreground mb-2">Lifecycle Rail</h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {['VACANT', 'TURNING', 'LISTED', 'APPLIED', 'APPROVED', 'LEASED', 'OCCUPIED', 'RENEWAL_DUE'].map(state => (
            <div key={state} className={`flex items-center gap-2 ${unit.status === state ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
              <div className={`w-3 h-3 rounded-full ${unit.status === state ? 'bg-primary' : 'bg-muted'}`} />
              <span className="text-xs tracking-wider">{state}</span>
              {state !== 'RENEWAL_DUE' && <div className="w-8 h-px bg-border mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <h4 className="text-sm text-muted-foreground mb-4">STATUS PANEL</h4>
          <p className="text-sm"><span className="text-muted-foreground">Occupancy:</span> {unit.status}</p>
          <p className="text-sm"><span className="text-muted-foreground">Beds/Baths:</span> {unit.bedrooms || 0} / {unit.bathrooms || 0}</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <h4 className="text-sm text-muted-foreground mb-4">FINANCIALS (YTD)</h4>
          <p className="text-sm"><span className="text-muted-foreground">Revenue:</span> ${rollup.revenueYtd || 0}</p>
          <p className="text-sm"><span className="text-muted-foreground">Expenses:</span> ${rollup.expenses || 0}</p>
          <div className="my-2 h-px bg-border w-full" />
          <p className="text-sm font-bold text-primary">Net: ${rollup.net || 0}</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <h4 className="text-sm text-muted-foreground mb-4">MAINTENANCE</h4>
          <p className="text-sm"><span className="text-muted-foreground">Active Issues:</span> {rollup.activeIssues || 0}</p>
          <Button size="sm" variant="ghost" className="mt-2 text-xs text-destructive">View Open Work Orders</Button>
        </div>
      </div>

      {ledger && (
        <div className="rounded-xl border bg-card text-card-foreground shadow p-4 mb-8">
          <h4 className="text-sm text-muted-foreground mb-4 uppercase tracking-wider font-semibold">Tenant Ledger</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium">Charges</th>
                  <th className="pb-2 font-medium">Payments</th>
                  <th className="pb-2 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {ledger.entries && ledger.entries.length > 0 ? (
                  ledger.entries.map((entry: any, i: number) => {
                    const isCharge = entry.direction === 'DEBIT'; // Typically in property management, DEBIT is a charge to tenant, CREDIT is a payment from tenant
                    return (
                      <tr key={entry.id || i} className="border-b last:border-0">
                        <td className="py-2">{new Date(entry.effectiveDate || entry.createdAt).toLocaleDateString()}</td>
                        <td className="py-2">{entry.entryType}</td>
                        <td className="py-2">{entry.description || '-'}</td>
                        <td className="py-2">{isCharge ? `$${(entry.amountCents / 100).toFixed(2)}` : ''}</td>
                        <td className="py-2 text-green-600 dark:text-green-400">{!isCharge ? `$${(entry.amountCents / 100).toFixed(2)}` : ''}</td>
                        <td className="py-2 font-mono text-muted-foreground">-</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-muted-foreground">No ledger entries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}
