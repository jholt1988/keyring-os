export interface MobileLease {
  unitNumber: string;
  status: string;
  rentAmount: number;
  deposit: number;
  startDate: string;
  endDate: string;
}

export type MobileMaintenanceStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | string;

export interface MobileMaintenanceItem {
  id: string;
  title: string;
  description: string;
  status: MobileMaintenanceStatus;
  priority: string;
  category: string;
  createdAt: string;
}

export interface MobileFeedCard {
  id: string;
  domain: 'lease' | 'maintenance' | 'payment' | 'notification';
  title: string;
  summary: string;
  priority: number;
}
