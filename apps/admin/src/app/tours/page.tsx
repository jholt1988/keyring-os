'use client';

import { Calendar } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot';
import { ToursSection } from '@/components/parity/shared';

export default function ToursPage() {
  return (
    <WorkspaceShell title="Tours" icon={Calendar}>
      <ToursSection title="All Tours" />
    </WorkspaceShell>
  );
}
