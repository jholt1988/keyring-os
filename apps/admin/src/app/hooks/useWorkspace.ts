import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { fetchTenantActivity, fetchTenants, fetchTenantWorkspace } from '@/lib/operator/workspace';

type Workspace = {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  settings?: Record<string, unknown>;
};

export function useWorkspace(): Workspace | null {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/workspace')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setWorkspace(data as Workspace);
      })
      .catch(() => {
        if (!cancelled) setWorkspace(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return workspace;
}

export type TenantListItem = {
  id: string;
  firstName?: string;
  lastName?: string;
  property?: string;
  unit?: string;
  healthClass?: string;
  status?: string;
  rentAmountCents?: number | null;
  rentAmount?: number | null;
  currentBalanceCents?: number | null;
  currentBalance?: number | null;
  daysUntilLeaseEnd?: number | null;
  openMaintenanceCount?: number;
  leaseId?: string;
  userId?: string;
};

export type TenantListResponse = { data?: TenantListItem[]; total?: number };

export type HouseholdMember = {
  id?: string;
  name?: string;
  relationship?: string;
  isEmergency?: boolean;
  isOnLease?: boolean;
};

export type TenantProfile = {
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  email?: string;
  phone?: string;
  idVerified?: boolean;
  householdMembers?: HouseholdMember[];
  pets?: unknown;
  vehicles?: unknown;
};

export type TenantLease = {
  id?: string;
  propertyId?: string;
  unitId?: string;
  unit?: string;
  property?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  daysUntilEnd?: number | null;
  rentAmountCents?: number | null;
  rentAmount?: number | null;
  depositAmountCents?: number | null;
  depositAmount?: number | null;
  currentBalanceCents?: number | null;
  currentBalance?: number | null;
  autopayActive?: boolean;
  renewalStatus?: string;
};

export type TenantSummary = {
  status: string;
  leaseEndsIn?: string;
  paymentHealth?: string;
  openIssues?: number | string;
  lastContact?: string;
};

export type PaymentRow = { id?: string; amount?: number; date?: string; status?: string };

export type Payments = {
  onTimeRate?: number;
  latePayments?: number;
  currentBalance?: number;
  paymentPlanActive?: boolean;
  recentPayments?: PaymentRow[];
};

export type MaintenanceRow = {
  id?: string;
  status?: string;
  priority?: string;
  title?: string;
  unit?: { name?: string };
  createdAt?: string;
  completedAt?: string;
};

export type CommRow = {
  id?: string;
  createdAt?: string;
  channel?: string;
  direction?: string;
  subject?: string;
  message?: string;
};

export type DocumentRow = { id?: string; fileName?: string; category?: string; createdAt?: string };

export type ViolationRow = {
  id?: string;
  type?: string;
  severity?: string;
  description?: string;
  issuedAt?: string;
  createdAt?: string;
};

export type NoticeRow = { id?: string; type?: string; message?: string; sentAt?: string };

export type HealthDims = {
  paymentStability?: number;
  maintenanceFriction?: number;
  communicationResponsiveness?: number;
  renewalLikelihood?: number;
  complianceRisk?: number;
};

export type TenantHealth = {
  classification?: string;
  score?: number;
  dimensions?: HealthDims;
  signals?: string[];
  actions?: string[];
};

export type TenantWorkspace = {
  profile: TenantProfile;
  lease?: TenantLease;
  summary: TenantSummary;
  health: TenantHealth;
  payments?: Payments;
  maintenance?: MaintenanceRow[];
  communications?: CommRow[];
  documents?: DocumentRow[];
  violations?: ViolationRow[];
  notices?: NoticeRow[];
};

export type TimelineEvent = {
  id: string;
  date: string;
  type: string;
  title: string;
  details?: string;
};

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function num(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function bool(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function rows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const row = record(item);
    return row ? [row] : [];
  });
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function listItem(row: Record<string, unknown>, index: number): TenantListItem {
  return {
    id: text(row.id) ?? `tenant-${index}`,
    firstName: text(row.firstName),
    lastName: text(row.lastName),
    property: text(row.property),
    unit: text(row.unit),
    healthClass: text(row.healthClass),
    status: text(row.status),
    rentAmountCents: num(row.rentAmountCents) ?? null,
    rentAmount: num(row.rentAmount) ?? null,
    currentBalanceCents: num(row.currentBalanceCents) ?? null,
    currentBalance: num(row.currentBalance) ?? null,
    daysUntilLeaseEnd: num(row.daysUntilLeaseEnd) ?? null,
    openMaintenanceCount: num(row.openMaintenanceCount),
    leaseId: text(row.leaseId),
    userId: text(row.userId),
  };
}

function normalizeList(payload: unknown): TenantListResponse {
  const body = record(payload);
  const raw = body ? rows(body.data) : rows(payload);
  const total = body ? num(body.total) : undefined;
  return { data: raw.map(listItem), total: total ?? raw.length };
}

function leaseOf(value: unknown): TenantLease | undefined {
  const row = record(value);
  if (!row) return undefined;
  return {
    id: text(row.id),
    propertyId: text(row.propertyId),
    unitId: text(row.unitId),
    unit: text(row.unit),
    property: text(row.property),
    status: text(row.status),
    startDate: text(row.startDate),
    endDate: text(row.endDate),
    daysUntilEnd: num(row.daysUntilEnd) ?? null,
    rentAmountCents: num(row.rentAmountCents) ?? null,
    rentAmount: num(row.rentAmount) ?? null,
    depositAmountCents: num(row.depositAmountCents) ?? null,
    depositAmount: num(row.depositAmount) ?? null,
    currentBalanceCents: num(row.currentBalanceCents) ?? null,
    currentBalance: num(row.currentBalance) ?? null,
    autopayActive: bool(row.autopayActive),
    renewalStatus: text(row.renewalStatus),
  };
}

function normalizeWorkspace(payload: unknown): TenantWorkspace {
  const body = record(payload) ?? {};
  const profile = record(body.profile) ?? {};
  const summary = record(body.summary) ?? {};
  const health = record(body.health) ?? {};
  const dims = record(health.dimensions) ?? {};
  const payments = record(body.payments) ?? {};
  return {
    profile: {
      firstName: text(profile.firstName),
      lastName: text(profile.lastName),
      preferredName: text(profile.preferredName),
      email: text(profile.email),
      phone: text(profile.phone),
      idVerified: bool(profile.idVerified),
      householdMembers: rows(profile.householdMembers).map((member) => ({
        id: text(member.id),
        name: text(member.name),
        relationship: text(member.relationship),
        isEmergency: bool(member.isEmergency),
        isOnLease: bool(member.isOnLease),
      })),
      pets: profile.pets,
      vehicles: profile.vehicles,
    },
    lease: leaseOf(body.lease),
    summary: {
      status: text(summary.status) ?? 'UNKNOWN',
      leaseEndsIn: text(summary.leaseEndsIn),
      paymentHealth: text(summary.paymentHealth),
      openIssues: num(summary.openIssues) ?? text(summary.openIssues),
      lastContact: text(summary.lastContact),
    },
    health: {
      classification: text(health.classification),
      score: num(health.score),
      dimensions: {
        paymentStability: num(dims.paymentStability),
        maintenanceFriction: num(dims.maintenanceFriction),
        communicationResponsiveness: num(dims.communicationResponsiveness),
        renewalLikelihood: num(dims.renewalLikelihood),
        complianceRisk: num(dims.complianceRisk),
      },
      signals: strings(health.signals),
      actions: strings(health.actions),
    },
    payments: {
      onTimeRate: num(payments.onTimeRate),
      latePayments: num(payments.latePayments),
      currentBalance: num(payments.currentBalance),
      paymentPlanActive: bool(payments.paymentPlanActive),
      recentPayments: rows(payments.recentPayments).map((row) => ({
        id: text(row.id),
        amount: num(row.amount),
        date: text(row.date),
        status: text(row.status),
      })),
    },
    maintenance: rows(body.maintenance).map((row) => ({
      id: text(row.id),
      status: text(row.status),
      priority: text(row.priority),
      title: text(row.title),
      unit: record(row.unit) ? { name: text(record(row.unit)?.name) } : undefined,
      createdAt: text(row.createdAt),
      completedAt: text(row.completedAt),
    })),
    communications: rows(body.communications).map((row) => ({
      id: text(row.id),
      createdAt: text(row.createdAt),
      channel: text(row.channel),
      direction: text(row.direction),
      subject: text(row.subject),
      message: text(row.message),
    })),
    documents: rows(body.documents).map((row) => ({
      id: text(row.id),
      fileName: text(row.fileName),
      category: text(row.category),
      createdAt: text(row.createdAt),
    })),
    violations: rows(body.violations).map((row) => ({
      id: text(row.id),
      type: text(row.type),
      severity: text(row.severity),
      description: text(row.description),
      issuedAt: text(row.issuedAt),
      createdAt: text(row.createdAt),
    })),
    notices: rows(body.notices).map((row) => ({
      id: text(row.id),
      type: text(row.type),
      message: text(row.message),
      sentAt: text(row.sentAt),
    })),
  };
}

function normalizeActivity(payload: unknown): TimelineEvent[] {
  return rows(payload).map((row, index) => ({
    id: text(row.id) ?? `activity-${index}`,
    date: text(row.date) ?? text(row.createdAt) ?? '',
    type: text(row.type) ?? 'communication',
    title: text(row.title) ?? 'Activity',
    details: text(row.details) ?? text(row.message),
  }));
}

export function useTenantsIndex(params: Record<string, string>) {
  return useQuery({
    queryKey: ['tenants', params],
    queryFn: async () => normalizeList(await fetchTenants(params)),
  });
}

export function useTenantWorkspace(id: string | undefined) {
  return useQuery({
    queryKey: ['tenant', 'workspace', id],
    enabled: Boolean(id),
    queryFn: async () => normalizeWorkspace(await fetchTenantWorkspace(id as string)),
  });
}

export function useTenantActivity(id: string | undefined) {
  return useQuery({
    queryKey: ['tenant', 'activity', id],
    enabled: Boolean(id),
    queryFn: async () => normalizeActivity(await fetchTenantActivity(id as string)),
  });
}
