'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';


export default function PropertyPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [property, setProperty] = useState<any>(null);
  const [rollup, setRollup] = useState<any>(null);

  useEffect(() => {
    // Mock loading
    setTimeout(() => {
      setProperty({ name: 'Sample Property', address: '123 Main St', units: [] });
      setRollup({ totalUnits: 10, vacantCount: 2, expiringCount: 1, repairRiskCount: 0, signals: [] });
    }, 1000);
  }, [id]);

  if (!property || !rollup) return <div className="text-muted-foreground p-8">Loading Property...</div>;

  return (
    <WorkspaceShell
      title={property.name}
      subtitle={`${property.address} · ${rollup.totalUnits} Units · ${rollup.vacantCount} Vacant · ${rollup.expiringCount} Expiring · ${rollup.repairRiskCount} Risk`}
      icon={Building2}
    >
      <div className="flex gap-4 mb-8">
        <Button variant="outline">View Vacancy</Button>
        <Button variant="outline">Start Renewal</Button>
        <Button variant="outline">Open Maintenance</Button>
        <Button variant="outline">Review Financials</Button>
      </div>

      {rollup.signals && rollup.signals.length > 0 && (
        <div className="flex flex-col gap-2 mb-8 bg-destructive/10 p-4 rounded-xl border border-destructive/30">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active Signals</h4>
          {rollup.signals.map((sig: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {sig.type === 'CRITICAL' && <span className="text-destructive">⚠</span>}
              {sig.type === 'WARNING' && <span className="text-amber-500">📅</span>}
              {sig.message} — Unit {sig.unitName}
            </div>
          ))}
        </div>
      )}

      <h3 className="text-lg font-semibold mb-4">Unit Grid</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {property.units.length === 0 ? (
          <p className="text-muted-foreground">No units found.</p>
        ) : (
          property.units.map((unit: any) => (
            <div key={unit.id} className="rounded-xl border bg-card text-card-foreground shadow p-4 cursor-pointer hover:border-primary" onClick={() => router.push(`/properties/${id}/units/${unit.id}`)}>
              <h4 className="text-lg font-semibold mb-1">Unit {unit.name}</h4>
              <p className="text-sm text-primary mb-4 uppercase">{unit.status}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="default">Take Action</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </WorkspaceShell>
  );
}
