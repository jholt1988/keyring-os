import type { Domain } from '@keyring/types';
import type { CommandDomain } from '../types/command';

export const commandDomains: CommandDomain[] = [
  {
    id: 'payments',
    label: 'Payments',
    shortLabel: 'Pay',
    description: 'Collections, delinquencies, and resident balances',
    route: '/payments',
    color: '#10B981',
    icon: 'wallet',
    actions: [
      { id: 'payments-review-risk', label: 'Review Risk', route: '/payments', hint: 'See overdue balances and execute collection actions' },
      { id: 'payments-open-ledger', label: 'Open Ledger', route: '/payments', hint: 'Jump to payment activity and ledger state' },
      { id: 'payments-alerts', label: 'Payment Alerts', route: '/notifications', hint: 'Review unread collection alerts' },
    ],
  },
  {
    id: 'leasing',
    label: 'Leasing',
    shortLabel: 'Lease',
    description: 'Vacancy fill, tours, and lease execution',
    route: '/leasing',
    color: '#8B5CF6',
    icon: 'home',
    actions: [
      { id: 'leasing-pipeline', label: 'Pipeline', route: '/leasing', hint: 'Review occupancy pipeline and offers' },
      { id: 'leasing-tours', label: 'Tours', route: '/tours', hint: 'Manage live tours and follow-up actions' },
      { id: 'leasing-new-lease', label: 'Create Lease', route: '/leases/new', hint: 'Start a new lease without browsing menus' },
    ],
  },
  {
    id: 'screening',
    label: 'Screening',
    shortLabel: 'Screen',
    description: 'Applicant policy decisions and overrides',
    route: '/screening',
    color: '#F59E0B',
    icon: 'users',
    actions: [
      { id: 'screening-review', label: 'Review Queue', route: '/screening', hint: 'Resolve applicants requiring judgment' },
      { id: 'screening-messages', label: 'Message Applicant', route: '/messages', hint: 'Respond with minimal context switching' },
    ],
  },
  {
    id: 'repairs',
    label: 'Repairs',
    shortLabel: 'Repair',
    description: 'Maintenance risk, SLA pressure, and dispatch actions',
    route: '/repairs',
    color: '#14B8A6',
    icon: 'wrench',
    actions: [
      { id: 'repairs-triage', label: 'Triage Queue', route: '/repairs', hint: 'Handle high-risk work orders first' },
      { id: 'repairs-inspections', label: 'Inspections', route: '/inspections', hint: 'Inspect damage and validate severity' },
      { id: 'repairs-vendors', label: 'Vendors', route: '/vendors', hint: 'Assign vendors without leaving context' },
    ],
  },
  {
    id: 'renewals',
    label: 'Renewals',
    shortLabel: 'Renew',
    description: 'Retention, expirations, and pricing decisions',
    route: '/renewals',
    color: '#60A5FA',
    icon: 'refresh',
    actions: [
      { id: 'renewals-queue', label: 'Review Queue', route: '/renewals', hint: 'Resolve expirations and renewal offers' },
      { id: 'renewals-rent', label: 'Rent Strategy', route: '/rent-optimization', hint: 'Use rent guidance in-line with renewals' },
    ],
  },
  {
    id: 'financials',
    label: 'Financials',
    shortLabel: 'Books',
    description: 'Reconciliation, statements, and month-end closure',
    route: '/financials',
    color: '#22C55E',
    icon: 'book',
    actions: [
      { id: 'financials-reconcile', label: 'Reconcile', route: '/financials', hint: 'Clear unmatched transactions and exceptions' },
      { id: 'financials-reports', label: 'Reports', route: '/reports', hint: 'Open financial reports and owner visibility' },
      { id: 'financials-owners', label: 'Owner Draws', route: '/owner-portal', hint: 'Execute owner distributions and approvals' },
    ],
  },
];

export function inferDomainFromPath(pathname: string): Domain | null {
  const matched = commandDomains.find((domain) => pathname === domain.route || pathname.startsWith(`${domain.route}/`));
  return matched?.id ?? null;
}

export function getOrderedCommandDomains(pathname: string) {
  const current = inferDomainFromPath(pathname);
  return [...commandDomains].sort((a, b) => {
    if (a.id === current) return -1;
    if (b.id === current) return 1;
    return 0;
  });
}
