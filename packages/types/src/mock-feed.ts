import type { FeedItem } from './feed';

const NOW = new Date().toISOString();

export const mockFeed: FeedItem[] = [
  {
    id: 'repair-1',
    kind: 'critical_signal',
    domain: 'maintenance',
    title: 'HVAC failure likely — Unit 101',
    summary: '85% failure probability in 5–7 days. Estimated exposure: $1,200.',
    priority: 95,
    timestamp: NOW,
    financialImpact: 1200,
    urgencyHours: 24,
    allowedRoles: ['OWNER', 'PROPERTY_MANAGER', 'ADMIN'],
    roleWeights: {
      PROPERTY_MANAGER: 25,
      ADMIN: 15,
      OWNER: 5,
    },
    actions: [
      { id: 'a1', type: 'navigation', label: 'Schedule Repair', intent: 'review_repair_risk', variant: 'default', href: '/repairs' },
      { id: 'a2', type: 'navigation', label: 'Review', intent: 'review_repair_risk', variant: 'secondary', href: '/repairs' },
    ],
  },
  {
    id: 'payment-1',
    kind: 'decision',
    domain: 'payments',
    title: 'Late notice ready — Unit 3C',
    summary: '$1,250 overdue. Grace period has ended.',
    priority: 92,
    timestamp: NOW,
    financialImpact: 1250,
    urgencyHours: 8,
    allowedRoles: ['OWNER', 'PROPERTY_MANAGER', 'ADMIN'],
    roleWeights: {
      PROPERTY_MANAGER: 20,
      ADMIN: 12,
      OWNER: 10,
    },
    actions: [
      { id: 'a3', type: 'mutation', label: 'Send Late Notice', intent: 'send_late_notice', variant: 'default' },
      { id: 'a4', type: 'navigation', label: 'Review Ledger', intent: 'message_tenant', variant: 'secondary', href: '/payments' },
    ],
  },
  {
    id: 'screening-1',
    kind: 'decision',
    domain: 'screening',
    title: 'Conditional applicant review — Sarah M.',
    summary: 'Income below 4x rent. Recommend co-signer or higher deposit.',
    priority: 88,
    timestamp: NOW,
    urgencyHours: 12,
    allowedRoles: ['PROPERTY_MANAGER', 'ADMIN', 'OWNER'],
    roleWeights: {
      PROPERTY_MANAGER: 20,
      ADMIN: 10,
      OWNER: 6,
    },
    actions: [
      { id: 'a5', type: 'navigation', label: 'Review Application', intent: 'conditional_approve', variant: 'default', href: '/leasing' },
      { id: 'a6', type: 'navigation', label: 'Open Queue', intent: 'deny', variant: 'destructive', href: '/leasing' },
    ],
  },
  {
    id: 'renewal-1',
    kind: 'critical_signal',
    domain: 'leasing',
    title: 'Lease expires soon — Unit 204',
    summary: 'Expires in 14 days. Vacancy risk: $1,250/month.',
    priority: 80,
    timestamp: NOW,
    financialImpact: 1250,
    urgencyHours: 72,
    allowedRoles: ['OWNER', 'PROPERTY_MANAGER', 'ADMIN'],
    roleWeights: {
      PROPERTY_MANAGER: 15,
      OWNER: 12,
      ADMIN: 10,
    },
    actions: [
      { id: 'a7', type: 'navigation', label: 'Start Renewal', intent: 'start_renewal', variant: 'default', href: '/leasing' },
      { id: 'a8', type: 'navigation', label: 'Prepare Listing', intent: 'prepare_listing', variant: 'secondary', href: '/leasing' },
    ],
  },
  {
    id: 'event-1',
    kind: 'scheduled_event',
    domain: 'calendar',
    title: 'Inspection — Oak St at 10:00 AM',
    summary: 'Move-in inspection scheduled for today.',
    priority: 70,
    timestamp: NOW,
    urgencyHours: 3,
    allowedRoles: ['PROPERTY_MANAGER', 'ADMIN'],
    roleWeights: {
      PROPERTY_MANAGER: 15,
      ADMIN: 10,
    },
    actions: [
      { id: 'a9', type: 'navigation', label: 'Open Details', intent: 'open_event', variant: 'default', href: '/repairs' },
    ],
  },
];
