'use client';

import { Calendar } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot';
import { ToursSection } from '@/components/parity/shared';

export default function ToursPage() {
  return (
    <WorkspaceShell title="Tours" subtitle="Standalone tour scheduling and status management" icon={Calendar}>
      <ToursSection title="All Tours" subtitle="Calendar and list workflow for tours" />
    </WorkspaceShell>
  );
}
