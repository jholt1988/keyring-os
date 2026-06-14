import { useCallback } from 'react';
import type { OperatorWorkflowItem, CommandCenterDecision } from '@/lib/operator/read-only-data';
import type { ActiveView } from '../types';
import { navItems } from '../types';

export function workflowItemMatchesDecision(item: OperatorWorkflowItem, decision: CommandCenterDecision) {
  return [
    item.entityId && decision.entity.id === item.entityId,
    item.propertyId && decision.propertyId === item.propertyId,
    item.unitId && decision.unitId === item.unitId,
    item.tenantId && decision.tenantId === item.tenantId,
  ].some(Boolean);
}

export function workflowTargetView(workflowId: string): ActiveView | null {
  if (workflowId.startsWith('WF-APP')) return 'applications';
  if (workflowId.startsWith('WF-LEASE')) return 'signing';
  if (workflowId.startsWith('WF-MNT')) return 'maintenance';
  if (workflowId.startsWith('WF-INSP')) return 'inspections';
  if (workflowId.startsWith('WF-RENEW')) return 'renewals';
  if (workflowId.startsWith('WF-OWNER')) return 'owners';
  if (workflowId.startsWith('WF-PAY')) return 'workflows';
  return null;
}

export function workflowTargetLabel(view: ActiveView | null) {
  return navItems.find((item) => item.id === view)?.label ?? 'Workspace';
}

export function WorkflowFocusBanner({ item, matched, onClear }: { item: OperatorWorkflowItem | null; matched?: boolean; onClear: () => void }) {
  if (!item) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">Opened from workflow</div>
        <div className="mt-1 font-medium">{item.title}</div>
        <div className="mt-1 text-sm text-[var(--muted)]">{item.workflowId} · {item.entityType} {item.entityId}</div>
        <div className="mt-2 text-sm text-[var(--muted)]">{item.nextAction}</div>
        <div className="mt-1 break-all text-xs text-[var(--muted)]">{item.canonicalRoute}</div>
        {matched === false ? <div className="mt-2 text-xs text-[var(--danger)]">The focused entity is not currently visible in this workspace queue.</div> : null}
      </div>
      <button onClick={onClear} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm font-medium">
        Clear focus
      </button>
    </div>
  );
}

export function workflowFocusMatchesEntity(item: OperatorWorkflowItem | null, entityType: string, entityId: string | number) {
  return Boolean(item && item.entityType === entityType && item.entityId === String(entityId));
}

export function useFocusedRowScroll(focused: boolean) {
  const ref = useCallback((node: HTMLElement | null) => {
    if (!node || !focused) return;
    window.setTimeout(() => {
      node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }, [focused]);

  return ref;
}
