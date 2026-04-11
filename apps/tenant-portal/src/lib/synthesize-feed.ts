/**
 * Client-side feed synthesis fallback.
 * Called when GET /tenant/feed fails or returns empty.
 * Builds TenantFeedItem[] from multiple existing endpoints.
 */
import type { TenantFeedItem } from '@keyring/types';
import type { TenantDashboard, Invoice, MaintenanceRequest, Lease, EsignEnvelope, RenewalOffer } from './tenant-api';

type Kind = TenantFeedItem['kind'];

const KIND_BASE: Record<Kind, number> = {
  critical_signal: 80,
  decision: 70,
  scheduled_event: 50,
  update: 30,
};

function score(kind: Kind, urgencyHours?: number, financialImpact?: number): number {
  let s = KIND_BASE[kind];
  if (urgencyHours != null) {
    if (urgencyHours <= 24) s += 20;
    else if (urgencyHours <= 72) s += 10;
    else if (urgencyHours <= 168) s += 5;
  }
  if (financialImpact != null) {
    if (financialImpact >= 1000) s += 10;
    else if (financialImpact >= 500) s += 5;
  }
  return Math.min(100, s);
}

export function synthesizeFeed(data: {
  dashboard?: TenantDashboard | null;
  invoices?: Invoice[];
  maintenance?: MaintenanceRequest[];
  lease?: Lease | null;
  envelopes?: EsignEnvelope[];
  renewalOffers?: RenewalOffer[];
}): TenantFeedItem[] {
  const items: TenantFeedItem[] = [];
  const now = Date.now();

  const { dashboard, invoices = [], maintenance = [], lease, envelopes = [], renewalOffers = [] } = data;

  // ── Lease expiry ────────────────────────────────────────────────────────
  const activeLease = lease ?? dashboard?.lease;
  if (activeLease?.endDate) {
    const daysToExpiry = Math.ceil(
      (new Date(activeLease.endDate).getTime() - now) / 86_400_000,
    );
    if (daysToExpiry > 0 && daysToExpiry <= 60) {
      const urgencyHours = daysToExpiry * 24;
      const kind: Kind = daysToExpiry <= 30 ? 'critical_signal' : 'decision';
      items.push({
        id: `lease-expiry-${activeLease.id}`,
        kind,
        domain: 'lease',
        title: `Lease expires in ${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'}`,
        summary:
          daysToExpiry <= 30
            ? 'Your lease is expiring soon. Contact your property manager or respond to a renewal offer.'
            : 'Your lease is coming up for renewal. Review your options.',
        priority: score(kind, urgencyHours),
        timestamp: new Date().toISOString(),
        navigateTo: '/lease',
        urgencyHours,
      });
    }
  }

  // ── Pending e-sign ───────────────────────────────────────────────────────
  const pendingEnvelope = envelopes.find((e) =>
    ['SENT', 'DELIVERED'].includes(e.status),
  );
  if (pendingEnvelope) {
    items.push({
      id: `esign-${pendingEnvelope.id}`,
      kind: 'decision',
      domain: 'lease',
      title: 'Lease ready to sign',
      summary: 'Your lease document is awaiting your electronic signature.',
      priority: score('decision', 48),
      timestamp: pendingEnvelope.createdAt,
      navigateTo: '/lease',
    });
  }

  // ── Renewal offer ────────────────────────────────────────────────────────
  const pendingOffer = renewalOffers.find((o) => o.status === 'OFFERED');
  if (pendingOffer) {
    items.push({
      id: `renewal-${pendingOffer.id}`,
      kind: 'decision',
      domain: 'renewal',
      title: 'Renewal offer received',
      summary: `New term offered at $${pendingOffer.proposedRent.toLocaleString()}/mo. Accept or decline.`,
      priority: score('decision', 72, pendingOffer.proposedRent),
      timestamp: new Date().toISOString(),
      navigateTo: '/lease',
      financialImpact: pendingOffer.proposedRent,
    });
  }

  // ── Invoices ─────────────────────────────────────────────────────────────
  for (const invoice of invoices) {
    const dueDate = new Date(invoice.dueDate);
    const hoursUntilDue = (dueDate.getTime() - now) / 3_600_000;
    const isOverdue = invoice.status === 'OVERDUE' || hoursUntilDue < 0;
    const kind: Kind = isOverdue ? 'critical_signal' : 'decision';
    const urgencyHours = isOverdue ? 0 : Math.max(0, hoursUntilDue);
    const daysLabel = Math.ceil(urgencyHours / 24);

    items.push({
      id: `invoice-${invoice.id}`,
      kind,
      domain: 'payments',
      title: isOverdue
        ? `Payment overdue — $${invoice.amount.toLocaleString()}`
        : `Rent due in ${daysLabel} day${daysLabel === 1 ? '' : 's'}`,
      summary: isOverdue
        ? `$${invoice.amount.toLocaleString()} was due on ${dueDate.toLocaleDateString()}. Pay now to avoid late fees.`
        : `$${invoice.amount.toLocaleString()} due on ${dueDate.toLocaleDateString()}.`,
      priority: score(kind, urgencyHours, invoice.amount),
      timestamp: invoice.issuedAt,
      navigateTo: '/payments',
      financialImpact: invoice.amount,
      urgencyHours: isOverdue ? 0 : urgencyHours,
    });
  }

  // ── Maintenance ──────────────────────────────────────────────────────────
  for (const req of maintenance) {
    if (req.priority === 'EMERGENCY' && req.status === 'PENDING') {
      items.push({
        id: `maint-emergency-${req.id}`,
        kind: 'critical_signal',
        domain: 'maintenance',
        title: `Emergency request open — ${req.title}`,
        summary: 'Your emergency maintenance request is being reviewed.',
        priority: score('critical_signal', 6),
        timestamp: req.createdAt,
        navigateTo: `/maintenance/${req.id}`,
        urgencyHours: 6,
      });
    } else if (req.status === 'COMPLETED') {
      items.push({
        id: `maint-complete-${req.id}`,
        kind: 'decision',
        domain: 'maintenance',
        title: `Repair completed — ${req.title}`,
        summary: 'Your maintenance request has been marked complete. Confirm to close it out.',
        priority: score('decision', 72),
        timestamp: req.updatedAt,
        navigateTo: `/maintenance/${req.id}`,
      });
    } else if (req.status === 'IN_PROGRESS') {
      items.push({
        id: `maint-inprogress-${req.id}`,
        kind: 'scheduled_event',
        domain: 'maintenance',
        title: `Repair in progress — ${req.title}`,
        summary: 'A technician is working on your request.',
        priority: score('scheduled_event', 48),
        timestamp: req.updatedAt,
        navigateTo: `/maintenance/${req.id}`,
      });
    }
  }

  return items.sort((a, b) => b.priority - a.priority).slice(0, 30);
}
