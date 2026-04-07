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
  | 'calendar';

export interface FeedAction {
  id: string;
  label: string;
  intent: string;
  variant?: 'default' | 'secondary' | 'destructive';
}

export interface FeedItem {
  id: string;
  kind: FeedItemType;
  domain: FeedDomain;
  title: string;
  summary: string;
  /** Priority score 0–100. Pre-computed by backend; do not re-score on the frontend. */
  priority: number;
  timestamp: string;
  actions: FeedAction[];
  allowedRoles: UserRole[];
  roleWeights?: Partial<Record<UserRole, number>>;
  financialImpact?: number;
  urgencyHours?: number;
  propertyId?: string;
  metadata?: Record<string, unknown>;
}

export interface FeedResponse {
  items: FeedItem[];
  role: UserRole;
  generatedAt: string;
}