'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Home } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';


export default function UnitPage() {
  const params = useParams();
  const { id, unitId } = params;
  
  const [unit, setUnit] = useState<any>(null);
  const [rollup, setRollup] = useState<any>(null);

  useEffect(() => {
    // Mock loading
    setTimeout(() => {
      setUnit({ name: '101', status: 'VACANT', bedrooms: 2, bathrooms: 1 });
      setRollup({ revenueYtd: 12000, expenses: 2000, net: 10000, activeIssues: 0 });
    }, 1000);
  }, [id, unitId]);

  if (!unit || !rollup) return <div className="text-muted-foreground p-8">Loading Unit...</div>;

  return (
    <WorkspaceShell
      title={`Unit ${unit.name}`}
      subtitle={`${unit.status.toUpperCase()} · Next: Action required`}
      icon={Home}
    >
      <div className="flex gap-4 mb-8 bg-muted/50 p-4 rounded-xl border border-border">
        <Button size="sm" variant="default">Finish Turn</Button>
        <Button size="sm" variant="outline">Adjust Rent</Button>
        <Button size="sm" variant="outline">Publish Listing</Button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <h4 className="text-sm text-muted-foreground mb-4">STATUS PANEL</h4>
          <p className="text-sm"><span className="text-muted-foreground">Occupancy:</span> {unit.status}</p>
          <p className="text-sm"><span className="text-muted-foreground">Beds/Baths:</span> {unit.bedrooms} / {unit.bathrooms}</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <h4 className="text-sm text-muted-foreground mb-4">FINANCIALS (YTD)</h4>
          <p className="text-sm"><span className="text-muted-foreground">Revenue:</span> ${rollup.revenueYtd}</p>
          <p className="text-sm"><span className="text-muted-foreground">Expenses:</span> ${rollup.expenses}</p>
          <div className="my-2 h-px bg-border w-full" />
          <p className="text-sm font-bold text-primary">Net: ${rollup.net}</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow p-4">
          <h4 className="text-sm text-muted-foreground mb-4">MAINTENANCE</h4>
          <p className="text-sm"><span className="text-muted-foreground">Active Issues:</span> {rollup.activeIssues}</p>
          <Button size="sm" variant="ghost" className="mt-2 text-xs text-destructive">View Open Work Orders</Button>
        </div>
      </div>
    </WorkspaceShell>
  );
}
