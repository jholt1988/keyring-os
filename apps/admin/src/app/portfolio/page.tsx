'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';
import { fetchPortfolioWorkspace } from '@/lib/copilot-api';

export default function PortfolioPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchPortfolioWorkspace().then((data) => {
      setProperties(data);
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
      <div className="flex gap-4 mb-6">
        <Button variant={filter === 'All' ? 'default' : 'outline'} onClick={() => setFilter('All')}>All Properties</Button>
        <Button variant={filter === 'Vacancies' ? 'default' : 'outline'} onClick={() => setFilter('Vacancies')}>Vacancies</Button>
        <Button variant={filter === 'Risks' ? 'default' : 'outline'} onClick={() => setFilter('Risks')}>Units Needing Action</Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading portfolio...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(p => (
            <div key={p.id} className="rounded-xl border bg-card text-card-foreground shadow p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/properties/${p.id}`)}>
              <h3 className="text-xl font-bold mb-2">{p.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{p.totalUnits || 0} Units · {p.vacantCount || 0} Vacant · {p.expiringCount || 0} Expiring · {p.repairRiskCount || 0} Risk</p>
              
              <div className="space-y-2">
                {(p.signals || []).slice(0, 3).map((sig: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {sig.type === 'CRITICAL' && <span className="text-destructive">⚠</span>}
                    {sig.type === 'WARNING' && <span className="text-amber-500">📅</span>}
                    {sig.type === 'INFO' && <span className="text-blue-500">ℹ</span>}
                    <span className="text-muted-foreground">{sig.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}
