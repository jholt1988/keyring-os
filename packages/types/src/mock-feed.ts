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
    allowedRoles: ['owner', 'property_manager', 'maintenance'],
    roleWeights: {
      maintenance: 25,
      property_manager: 15,
      owner: 5,
    },
    actions: [
      { id: 'a1', type: 'mutation', label: 'Schedule Repair', intent: 'schedule_repair' },
      { id: 'a2', type: 'navigation', label: 'Review', intent: 'review_repair_risk', variant: 'secondary' },
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
    allowedRoles: ['owner', 'property_manager'],
    roleWeights: {
      property_manager: 20,
      owner: 10,
    },
    actions: [
      { id: 'a3', type: 'mutation', label: 'Send Notice', intent: 'send_notice' },
      { id: 'a4', type: 'navigation', label: 'Message Tenant', intent: 'message_tenant', variant: 'secondary' },
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
    allowedRoles: ['property_manager', 'leasing'],
    roleWeights: {
      leasing: 20,
      property_manager: 10,
    },
    actions: [
      { id: 'a5', type: 'mutation', label: 'Approve w/ Conditions', intent: 'conditional_approve' },
      { id: 'a6', type: 'navigation', label: 'Deny', intent: 'deny', variant: 'destructive' },
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
    allowedRoles: ['owner', 'property_manager', 'leasing'],
    roleWeights: {
      leasing: 15,
      owner: 12,
      property_manager: 10,
    },
    actions: [
      { id: 'a7', type: 'mutation', label: 'Start Renewal', intent: 'start_renewal' },
      { id: 'a8', type: 'navigation', label: 'Prepare Listing', intent: 'prepare_listing', variant: 'secondary' },
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
    allowedRoles: ['property_manager', 'maintenance'],
    roleWeights: {
      maintenance: 15,
      property_manager: 10,
    },
    actions: [
      { id: 'a9', type: 'navigation', label: 'Open Details', intent: 'open_event' },
    ],
  },
];