import type { OperatorWorkflowItem } from '@/lib/operator/read-only-data';
import {
  Building2,
  CalendarClock,
  ClipboardList,
  Home,
  Banknote,
  Layers3,
  PenLine,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

export type ActiveView = 'command' | 'workflows' | 'applications' | 'signing' | 'maintenance' | 'inspections' | 'renewals' | 'owners' | 'portfolio' | 'approvals';

export type WorkflowFocus = {
  item: OperatorWorkflowItem;
  targetView: ActiveView;
};

export const navItems = [
  { id: 'command' as const, label: 'Command Center', icon: Home },
  { id: 'workflows' as const, label: 'Workflows', icon: Layers3 },
  { id: 'applications' as const, label: 'Applications', icon: ClipboardList },
  { id: 'signing' as const, label: 'Lease Signing', icon: PenLine },
  { id: 'maintenance' as const, label: 'Maintenance', icon: Wrench },
  { id: 'inspections' as const, label: 'Inspections', icon: ClipboardList },
  { id: 'renewals' as const, label: 'Renewals', icon: CalendarClock },
  { id: 'owners' as const, label: 'Owners', icon: Banknote },
  { id: 'portfolio' as const, label: 'Portfolio', icon: Building2 },
  { id: 'approvals' as const, label: 'Approvals', icon: ShieldCheck },
];

export const activeViewIds = new Set<ActiveView>(navItems.map((item) => item.id));

export function parseActiveView(value: string | null): ActiveView | null {
  return value && activeViewIds.has(value as ActiveView) ? (value as ActiveView) : null;
}

export function updateOperatorUrl(view: ActiveView, workflowItemId?: string | null) {
  const url = new URL(window.location.href);
  url.searchParams.set('view', view);
  if (workflowItemId) {
    url.searchParams.set('workflow', workflowItemId);
  } else {
    url.searchParams.delete('workflow');
  }
  window.history.replaceState(null, '', url);
}
