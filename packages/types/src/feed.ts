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

export type FeedActionVariant = 'default' |'primary'| 'secondary' | 'destructive';

interface BaseAction{
  id: string;
  label: string;
  variant:FeedActionVariant;
}

export interface MutationAction extends BaseAction{
  type: 'mutation';
  intent: string;
  requiresConfirm?: boolean;
}

export interface NavigationAction extends BaseAction{
  type: 'navigation';
  intent: string;
  href: string;
  openInNewTab?: boolean;
}

export type FeedAction = MutationAction | NavigationAction;



   


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

// Example of the refined metadata shape for Property Manager Notes
export interface PropertyManagerMetadata {
  pmNotes?: {
    narrative: string;      // The actual text/observation
    authorId: string;       // Linking back to the user/actor
    lastUpdated: string;    // For audit trailing
    adjustmentContext?: {   // Specific to your insurance adjusting background
      perilType?: string;
      depreciationApplied: boolean;
    };
  };
}