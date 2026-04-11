'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';


// We'll mock the API call or use the existing copilot-api pattern
export default function PortfolioPage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    // Mocking fetch for now since apiFetch isn't directly compatible
    setTimeout(() => setLoading(false), 1000);
  }, []);

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
          <div className="text-muted-foreground">Portfolio data will be loaded here.</div>
        </div>
      )}
    </WorkspaceShell>
  );
}
