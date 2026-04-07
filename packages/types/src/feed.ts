export type UserRole =
  | 'owner'
  | 'property_manager'
  | 'leasing'
  | 'maintenance';

export type FeedItemType =
  | 'critical_signal'
  | 'decision'
  | 'scheduled_event';

export type FeedDomain =
  | 'payments'
  | 'leasing'
  | 'screening'
  | 'maintenance'
  | 'renewals'
  | 'calendar';

export interface FeedAction {
  id: string;
  label: string;
  intent: string;
  variant?: 'default' | 'secondary' | 'destructive';
}

export interface FeedItem {
  id: string;
  kind: FeedItemKind;
  domain: FeedDomain;
  title: string;
  summary: string;
  priority: number; // raw system priority
  timestamp?: string;
  actions: FeedAction[];

  // visibility
  allowedRoles: UserRole[];

  // optional role boosts/penalties
  roleWeights?: Partial<Record<UserRole, number>>;

  // optional metadata for ranking
  financialImpact?: number;
  urgencyHours?: number;
  propertyId?: string;
}