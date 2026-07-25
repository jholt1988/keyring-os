import { apiRequest, OperatorApiError, type ApiClientOptions } from './api/client';
import type { paths } from './api/generated/schema';

export type DashboardMetrics = {
  occupancy?: {
    total?: number;
    occupied?: number;
    vacant?: number;
    percentage?: number;
  };
  financials?: {
    monthlyRevenue?: number;
    collectedThisMonth?: number;
    outstanding?: number;
  };
  maintenance?: {
    open?: number;
    urgent?: number;
    total?: number;
  };
  applications?: {
    pending?: number;
    approved?: number;
    rejected?: number;
  };
  recentActivity?: Array<{
    id: string;
    type: string;
    title: string;
    date?: string;
    priority?: string;
  }>;
};

export type BriefingSignal = {
  id: string;
  severity?: string;
  domain?: string;
  title: string;
  summary?: string;
  monetaryImpact?: number;
  actionLabel?: string;
  createdAt?: string;
};

export type DailyBriefing = {
  signals: BriefingSignal[];
  decisions: BriefingSignal[];
  events: BriefingSignal[];
  metrics?: {
    atRiskAmount?: number;
    pendingDecisions?: number;
    todayEvents?: number;
    vacantUnits?: number;
    overduePayments?: number;
  };
};

export type FeedItem = {
  id: string;
  kind: string;
  domain: string;
  title: string;
  summary: string;
  priority: number;
  timestamp?: string;
  actions?: Array<{
    id: string;
    label: string;
    type: string;
    variant?: string;
    href?: string;
  }>;
  metadata?: {
    confidenceScore?: number;
    impact?: {
      financial?: number;
      timeline?: string;
      risk?: string;
    };
    reasoning?: string[];
    [key: string]: unknown;
  };
};

export type PropertyUnit = {
  id: string;
  name?: string | null;
  unitNumber?: string | null;
  status?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFeet?: number | null;
};

export type PortfolioProperty = {
  id: string;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  propertyType?: string | null;
  minRent?: number | null;
  maxRent?: number | null;
  units?: PropertyUnit[];
};

export type PortfolioResponse = {
  data: PortfolioProperty[];
  meta?: {
    page?: number;
    limit?: number;
    totalItems?: number;
    totalPages?: number;
  };
};

export type ApprovalTask = {
  id: string;
  status: string;
  title: string;
  summary?: string | null;
  propertyId?: string | null;
  tenantId?: string | null;
  leaseId?: string | null;
  workOrderId?: string | null;
  createdAt: string;
  actions?: unknown;
};

export type CommandCenterDecision = {
  id: string;
  type: string;
  domain: string;
  title: string;
  summary: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  entity: {
    type: string;
    id: string;
    label?: string | null;
  };
  propertyId?: string | null;
  unitId?: string | null;
  tenantId?: string | null;
  dueAt?: string | null;
  createdAt: string;
  recommendedAction: string;
  approvalTaskId?: string | null;
  evidence: Array<{
    label: string;
    value: string | number | boolean | null;
    source: string;
    entityType?: string;
    entityId?: string;
  }>;
  actions: Array<{
    id: string;
    label: string;
    mode: string;
    approvalTaskId?: string | null;
  }>;
  timeline?: Array<{
    id: string;
    title: string;
    status: string;
    occurredAt: string;
    domain: string;
  }>;
};

export type CommandCenterDecisionDetail = {
  decision: CommandCenterDecision;
  decisionRecords: unknown[];
  approvalTask?: ApprovalTask | null;
  auditTrail: Array<{
    id: string;
    title: string;
    status: string;
    occurredAt: string;
    domain: string;
  }>;
  sourceLinks: Array<{
    label: string;
    entityType: string;
    entityId: string;
    route: string;
  }>;
};

export type CommandCenterResponse = {
  metrics: {
    totalDecisions: number;
    criticalDecisions: number;
    pendingApprovals: number;
    generatedAt: string;
  };
  decisions: CommandCenterDecision[];
  approvals: ApprovalTask[];
  timeline: Array<{
    id: string;
    title: string;
    status: string;
    occurredAt: string;
    domain: string;
  }>;
  dailyBriefing?: DailyBriefing;
};

export type OperatorWorkflowItem = {
  id: string;
  workflowId: string;
  title: string;
  summary: string;
  status: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  entityType: string;
  entityId: string;
  propertyId?: string | null;
  unitId?: string | null;
  tenantId?: string | null;
  ownerId?: string | null;
  amountCents?: number | null;
  dueAt?: string | null;
  updatedAt: string;
  canonicalRoute: string;
  nextAction: string;
};

export type OperatorWorkflowGroup = {
  workflowId: string;
  label: string;
  count: number;
  items: OperatorWorkflowItem[];
};

export type OperatorWorkflowsResponse = {
  generatedAt: string;
  groups: OperatorWorkflowGroup[];
  totals: {
    workflows: number;
    items: number;
    highPriority: number;
    blocked: number;
  };
};

export type OperatorPaymentWorkbench = {
  generatedAt: string;
  metrics: {
    ledgerAccounts: number;
    totalBalanceCents: number;
    delinquentLeases: number;
    delinquentAmountCents: number;
    paymentExceptions: number;
    unreconciledItems: number;
    paymentExpansionBlocked: boolean;
  };
  ledgerAccounts: Array<{
    leaseId: string;
    tenantId: string;
    tenantName: string;
    propertyId: string | null;
    propertyName: string | null;
    unitId: string | null;
    unitName: string | null;
    currentBalanceCents: number;
    entryCount: number;
    lastActivityAt: string | null;
    canonicalRoute: string;
  }>;
  delinquency: unknown;
  exceptions: Array<{
    id: string;
    description: string;
    amountCents: number;
    status: string;
    reason: string | null;
    sourceType: string;
    sourceId: string | null;
    date: string;
    canonicalRoute: string;
  }>;
  reconciliation: unknown;
  paymentExpansionGates: unknown;
};

export type OperatorSetupSummary = {
  generatedAt: string;
  metrics: {
    properties: number;
    units: number;
    vacantUnits: number;
    listedUnits: number;
    unitsMissingDetails: number;
    propertiesMissingAddress: number;
  };
  properties: Array<{
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    unitCount: number;
    vacantUnits: number;
    listedUnits: number;
    setupWarnings: string[];
  }>;
};

export type OperatorApplicationItem = {
  id: number;
  applicantName: string;
  email: string;
  phoneNumber: string;
  status: string;
  propertyId: string;
  propertyName: string | null;
  unitId: string;
  unitLabel: string | null;
  income: number;
  creditScore: number | null;
  qualificationStatus: string | null;
  recommendation: string | null;
  screeningScore: number | null;
  screenedAt: string | null;
  decisionedAt: string | null;
  convertedLeaseId: string | null;
  submittedAt: string;
  updatedAt: string;
  nextAction: 'screen' | 'review' | 'resolve_conditions' | 'convert_to_lease' | 'complete' | 'none';
  canonicalRoute: string;
};

export type OperatorApplicationLeaseHandoff = {
  applicationId: number;
  applicantName: string;
  propertyName: string | null;
  unitLabel: string | null;
  recommendedRentAmount: number;
  recommendedDepositAmount: number;
  readinessWarnings: string[];
};

export type OperatorApplicationsWorkbench = {
  generatedAt: string;
  metrics: {
    totalApplications: number;
    pendingReview: number;
    needsScreening: number;
    approvedReadyForLease: number;
    conditionallyApproved: number;
    denied: number;
    convertedToLease: number;
  };
  applications: OperatorApplicationItem[];
  leaseHandoffs: OperatorApplicationLeaseHandoff[];
  reviewActions: string[];
  denialReasonCodes: string[];
  sourceLinks: Array<{ label: string; href: string; entityType: string }>;
};

export type OperatorLeaseSigningItem = {
  leaseId: string;
  leaseStatus: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string | null;
  propertyId: string | null;
  propertyName: string | null;
  unitId: string;
  unitLabel: string | null;
  startDate: string;
  endDate: string;
  rentAmount: number;
  rentAmountCents?: number | null;
  depositAmount: number;
  depositAmountCents?: number | null;
  documentCount: number;
  latestEnvelope: {
    id: number;
    providerEnvelopeId: string;
    status: string;
    providerStatus: string | null;
    createdAt: string;
    updatedAt: string;
    signedPdfDocumentId: number | null;
    auditTrailDocumentId: number | null;
    canonicalRoute: string;
    participants: Array<{
      id: number;
      name: string;
      email: string;
      role: string;
      status: string;
      userId: string | null;
    }>;
  } | null;
  nextAction: 'generate_packet' | 'send_for_signature' | 'monitor_signature' | 'complete' | 'blocked';
  blockers: string[];
  canonicalRoute: string;
};

export type OperatorLeaseSigningWorkbench = {
  generatedAt: string;
  metrics: {
    draftLeases: number;
    packetsReady: number;
    envelopesSent: number;
    signaturesCompleted: number;
    signingBlocked: number;
    riskItems: number;
  };
  items: OperatorLeaseSigningItem[];
  riskQueue: unknown;
  sourceLinks: Array<{ label: string; href: string; entityType: string }>;
};

export type OperatorMaintenanceDispatchItem = {
  requestId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  propertyId: string | null;
  propertyName: string | null;
  unitId: string | null;
  unitLabel: string | null;
  tenantId: string;
  tenantName: string;
  assigneeId: number | null;
  assigneeName: string | null;
  dueAt: string | null;
  responseDueAt: string | null;
  createdAt: string;
  updatedAt: string;
  notesCount: number;
  photosCount: number;
  bidsCount: number;
  latestBid: OperatorMaintenanceBidSummary | null;
  latestDispatch: OperatorMaintenanceBidSummary | null;
  dispatchHistory: OperatorMaintenanceBidSummary[];
  nextAction: 'triage' | 'assign_technician' | 'dispatch_vendor' | 'monitor_vendor' | 'complete' | 'blocked';
  blockers: string[];
  canonicalRoute: string;
};

export type OperatorMaintenanceBidSummary = {
    id: string;
    maintenanceRequestId?: string | null;
    propertyId?: string;
    vendorId?: string | null;
    vendorName: string | null;
    vendorEmail?: string | null;
    scope?: string;
    status: string;
    bidAmountCents: number | null;
    aiScore: number | null;
    dueDate: string | null;
    awardedAt?: string | null;
    responseNotes?: string | null;
    createdAt?: string;
};

export type OperatorMaintenanceDispatchWorkbench = {
  generatedAt: string;
  metrics: {
    openRequests: number;
    emergencyRequests: number;
    unassignedRequests: number;
    vendorReadyRequests: number;
    bidsOpen: number;
    dispatchedRequests: number;
    completedDispatches: number;
    dispatchBlocked: number;
  };
  requests: OperatorMaintenanceDispatchItem[];
  vendors: Array<{
    id: string;
    name: string;
    type: string;
    email: string | null;
    phone: string | null;
    complianceStatus: string;
    verifiedComplianceCount: number;
    expiredComplianceCount: number;
  }>;
  openBids: unknown[];
  sourceLinks: Array<{ label: string; href: string; entityType: string }>;
};

export type OperatorRepairEstimateSummary = {
  id: string;
  inspectionId: number | null;
  maintenanceRequestId: string | null;
  status: string;
  totalLaborCost: number;
  totalMaterialCost: number;
  totalProjectCost: number;
  itemsToRepair: number;
  itemsToReplace: number;
  totalLaborHours: number | null;
  generatedAt: string;
  approvedAt: string | null;
  lineItemCount: number;
  canonicalRoute: string;
};

export type OperatorInspectionEstimateItem = {
  inspectionId: number;
  type: string;
  status: string;
  propertyId: string;
  propertyName: string | null;
  unitId: string;
  unitLabel: string | null;
  scheduledDate: string;
  completedDate: string | null;
  findingsCount: number;
  photosCount: number;
  estimateCount: number;
  latestEstimate: OperatorRepairEstimateSummary | null;
  nextAction: 'complete_inspection' | 'generate_estimate' | 'review_estimate' | 'create_repair_request' | 'complete' | 'blocked';
  blockers: string[];
  canonicalRoute: string;
};

export type OperatorInspectionEstimatesWorkbench = {
  generatedAt: string;
  metrics: {
    completedInspections: number;
    inspectionsNeedingEstimate: number;
    draftEstimates: number;
    pendingReviewEstimates: number;
    approvedEstimates: number;
    repairReadyEstimates: number;
  };
  inspections: OperatorInspectionEstimateItem[];
  estimates: OperatorRepairEstimateSummary[];
  sourceLinks: Array<{ label: string; href: string; entityType: string }>;
};

export type OperatorRenewalItem = {
  leaseId: string;
  leaseStatus: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string | null;
  propertyId: string | null;
  propertyName: string | null;
  unitId: string;
  unitLabel: string | null;
  currentRent: number;
  currentRentCents?: number | null;
  endDate: string;
  renewalDueAt: string | null;
  moveOutAt: string | null;
  latestOffer: {
    id: number;
    proposedRent: number;
    proposedRentCents?: number | null;
    proposedStart: string;
    proposedEnd: string;
    status: string;
    expiresAt: string | null;
    respondedAt: string | null;
  } | null;
  latestEnvelope: {
    id: number;
    status: string;
    providerStatus: string | null;
    participants: Array<{ id: number; name: string; email: string; status: string }>;
  } | null;
  latestNotice: {
    id: number;
    type: string;
    sentAt: string;
    message: string | null;
  } | null;
  nextAction: 'create_offer' | 'await_response' | 'send_signature' | 'monitor_signature' | 'move_out' | 'complete' | 'blocked';
  blockers: string[];
  canonicalRoute: string;
};

export type OperatorRenewalsWorkbench = {
  generatedAt: string;
  metrics: {
    expiringLeases: number;
    needsOffer: number;
    offersPending: number;
    offersAccepted: number;
    signaturesPending: number;
    moveOutNotices: number;
  };
  leases: OperatorRenewalItem[];
  sourceLinks: Array<{ label: string; href: string; entityType: string }>;
};

export type OperatorOwnerStatementItem = {
  id: string;
  ownerId: string;
  ownerName: string;
  month: string;
  status: string;
  grossIncomeCents: number;
  totalExpensesCents: number;
  managementFeeCents: number;
  netDistributionCents: number;
  approvedAt: string | null;
  sentAt: string | null;
  createdAt: string;
  nextAction: 'generate' | 'review' | 'approve' | 'send' | 'complete' | 'blocked';
  blockers: string[];
  canonicalRoute: string;
};

export type OperatorOwnerStatementsWorkbench = {
  generatedAt: string;
  month: string;
  metrics: {
    statements: number;
    draftStatements: number;
    approvedStatements: number;
    sentStatements: number;
    netDistributionCents: number;
    closeLockedProperties: number;
    closeUnlockedProperties: number;
  };
  statements: OperatorOwnerStatementItem[];
  monthlyClose: unknown;
  paymentExpansionGates: unknown;
  sourceLinks: Array<{ label: string; href: string; entityType: string }>;
};

export type OperatorApplicationDetail = {
  generatedAt: string;
  application: OperatorApplicationItem & {
    decisionNotes: string | null;
    screeningDetails: string | null;
    screeningReasons: unknown;
    applicantId: string | null;
  };
  policyEvaluation: unknown;
  lifecycle: unknown;
  transitions: unknown;
  timeline: unknown[];
  leaseHandoff: OperatorApplicationLeaseHandoff | null;
  sourceLinks: Array<{ label: string; href: string; entityType: string; entityId: string }>;
};

export type AiGatewayCapability = {
  id: string;
  route: string;
  method: 'GET' | 'POST';
  task: string;
  workflowIds: string[];
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresApprovalForExternalAction: boolean;
  persistsDecisionRecord: boolean;
  blockedAutoActions: string[];
  primaryGuardrails: string[];
};

export type AiGatewayCapabilityManifest = {
  mode: 'mock' | 'openai';
  model: string;
  capabilities: AiGatewayCapability[];
};

export type ReadOnlyOperatorData = {
  commandCenter: CommandCenterResponse | null;
  aiCapabilities: AiGatewayCapabilityManifest | null;
  workflows: OperatorWorkflowsResponse | null;
  paymentWorkbench: OperatorPaymentWorkbench | null;
  setup: OperatorSetupSummary | null;
  applications: OperatorApplicationsWorkbench | null;
  leaseSigning: OperatorLeaseSigningWorkbench | null;
  maintenanceDispatch: OperatorMaintenanceDispatchWorkbench | null;
  inspectionEstimates: OperatorInspectionEstimatesWorkbench | null;
  renewals: OperatorRenewalsWorkbench | null;
  ownerStatements: OperatorOwnerStatementsWorkbench | null;
  metrics: DashboardMetrics | null;
  briefing: DailyBriefing | null;
  feed: FeedItem[];
  portfolio: PortfolioResponse;
  approvals: ApprovalTask[];
  errors: Array<{ area: string; message: string; status?: number }>;
};

export const emptyReadOnlyOperatorData: ReadOnlyOperatorData = {
  commandCenter: null,
  aiCapabilities: null,
  workflows: null,
  paymentWorkbench: null,
  setup: null,
  applications: null,
  leaseSigning: null,
  maintenanceDispatch: null,
  inspectionEstimates: null,
  renewals: null,
  ownerStatements: null,
  metrics: null,
  briefing: null,
  feed: [],
  portfolio: { data: [], meta: { page: 1, limit: 50, totalItems: 0, totalPages: 0 } },
  approvals: [],
  errors: [],
};

function captureError(area: string, error: unknown) {
  if (error instanceof OperatorApiError) {
    return { area, message: error.message, status: error.status };
  }

  return {
    area,
    message: error instanceof Error ? error.message : 'Unable to load data.',
  };
}

async function loadArea<T>(
  area: string,
  request: Promise<T>,
): Promise<{ data: T | null; error: ReturnType<typeof captureError> | null }> {
  try {
    return { data: unwrapEnvelope(await request), error: null };
  } catch (error) {
    return { data: null, error: captureError(area, error) };
  }
}

export function unwrapEnvelope<T>(payload: T): T {
  // Endpoints may be wrapped in one or BOTH envelopes — the standard API
  // envelope { data, meta, errors } and the AI-gateway envelope
  // { result, confidence, ... } — sometimes nested ({ data: { result: ... } }).
  // Peel every recognised layer so consumers get the bare payload.
  let current: unknown = payload;
  for (let i = 0; i < 5 && current && typeof current === 'object'; i++) {
    if ('data' in current && 'meta' in current && 'errors' in current) {
      current = (current as { data: unknown }).data;
      continue;
    }
    if ('result' in current && 'confidence' in current) {
      current = (current as { result: unknown }).result;
      continue;
    }
    break;
  }
  return current as T;
}



/**
 * Coerce the portfolio area into a stable { data: [], meta } shape regardless of
 * whether the upstream envelope was unwrapped to a bare array, arrived as a
 * PortfolioResponse, or is missing entirely. Prevents `.reduce` on undefined in
 * consumers that read portfolio.data.
 */
function normalizePortfolio(value: unknown): PortfolioResponse {
  // Unwrap an AI-gateway envelope ({ result: {...}, confidence, ... }) if present.
  const v0 = value && typeof value === 'object' && 'result' in value
    ? (value as { result: unknown }).result
    : value;
  if (Array.isArray(v0)) {
    return { data: v0 as PortfolioResponse['data'], meta: emptyReadOnlyOperatorData.portfolio.meta };
  }
  if (v0 && typeof v0 === 'object' && Array.isArray((v0 as PortfolioResponse).data)) {
    const v = v0 as PortfolioResponse;
    return { data: v.data, meta: v.meta ?? emptyReadOnlyOperatorData.portfolio.meta };
  }
  return emptyReadOnlyOperatorData.portfolio;
}

export async function decideApprovalTask(
  taskId: string,
  decision: 'APPROVE' | 'REJECT',
  reason: string,
  options: ApiClientOptions,
): Promise<ApprovalTask> {
  const path = `/api/policy/approval-tasks/${taskId}/decision` as keyof paths & string;
  return unwrapEnvelope(
    await apiRequest<ApprovalTask>('post', path, {
      ...options,
      body: {
        decision,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      },
    }),
  );
}

export async function loadCommandCenterDecisionDetail(
  decisionId: string,
  options: ApiClientOptions,
): Promise<CommandCenterDecisionDetail> {
  const path = `/api/command-center/decisions/${encodeURIComponent(decisionId)}` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<CommandCenterDecisionDetail>('get', path, options));
}

export async function executeCommandCenterAction(
  decisionId: string,
  actionId: string,
  note: string,
  options: ApiClientOptions,
): Promise<{ approvalTask: ApprovalTask; decision: CommandCenterDecision }> {
  const path = `/api/command-center/decisions/${encodeURIComponent(decisionId)}/actions/${encodeURIComponent(actionId)}` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<{ approvalTask: ApprovalTask; decision: CommandCenterDecision }>('post', path, {
    ...options,
    body: note.trim() ? { note: note.trim() } : {},
  }));
}

export async function deferCommandCenterDecision(
  decisionId: string,
  reason: string,
  options: ApiClientOptions,
): Promise<{ decision: CommandCenterDecision; decisionRecord: unknown }> {
  const path = `/api/command-center/decisions/${encodeURIComponent(decisionId)}/defer` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<{ decision: CommandCenterDecision; decisionRecord: unknown }>('post', path, {
    ...options,
    body: reason.trim() ? { reason: reason.trim() } : {},
  }));
}

export async function loadOperatorApplicationDetail(
  applicationId: number,
  options: ApiClientOptions,
): Promise<OperatorApplicationDetail> {
  const path = `/api/operator-applications/${applicationId}` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<OperatorApplicationDetail>('get', path, options));
}

export async function screenOperatorApplication(
  applicationId: number,
  options: ApiClientOptions,
): Promise<OperatorApplicationItem> {
  const path = `/api/operator-applications/${applicationId}/screen` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<OperatorApplicationItem>('post', path, options));
}

export async function performOperatorApplicationReviewAction(
  applicationId: number,
  input: {
    action: string;
    note?: string;
    reason?: string;
    reasonCode?: string;
    scheduledAt?: string;
    responseDeadline?: string;
    conditionalDeposit?: number;
    requiresCosigner?: boolean;
  },
  options: ApiClientOptions,
): Promise<OperatorApplicationItem> {
  const path = `/api/operator-applications/${applicationId}/review-action` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<OperatorApplicationItem>('post', path, {
    ...options,
    body: input,
  }));
}

export async function convertOperatorApplicationToLease(
  applicationId: number,
  input: {
    startDate: string;
    endDate: string;
    rentAmount?: number;
    rentAmountCents?: number;
    depositAmount?: number;
    depositAmountCents?: number;
    moveInAt?: string;
    noticePeriodDays?: number;
  },
  options: ApiClientOptions,
): Promise<{ id: string; status?: string }> {
  const path = `/api/operator-applications/${applicationId}/convert-to-lease` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<{ id: string; status?: string }>('post', path, {
    ...options,
    body: input,
  }));
}

export async function generateLeaseSigningPacket(
  leaseId: string,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-lease-signing/leases/${leaseId}/generate-packet` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, options));
}

export async function sendLeaseSigningEnvelope(
  leaseId: string,
  input: { templateId?: string; message?: string; signerEmail?: string; signerName?: string; provider?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-lease-signing/leases/${leaseId}/send-envelope` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: input,
  }));
}

export async function refreshLeaseSigningEnvelope(
  envelopeId: number,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-lease-signing/envelopes/${envelopeId}/refresh` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, options));
}

export async function resendLeaseSigningEnvelope(
  envelopeId: number,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-lease-signing/envelopes/${envelopeId}/resend` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, options));
}

export async function dispatchMaintenanceVendor(
  requestId: string,
  input: { vendorId: string; notes?: string; notifyTenant?: boolean; tenantMessage?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-maintenance-dispatch/requests/${requestId}/dispatch-vendor` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: input,
  }));
}

export async function requestMaintenanceVendorBid(
  requestId: string,
  input: { vendorId?: string; vendorName?: string; vendorEmail?: string; scope?: string; bidAmountCents?: number; dueDate?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-maintenance-dispatch/requests/${requestId}/bids` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: input,
  }));
}

export async function awardMaintenanceVendorBid(
  bidId: string,
  input: { note?: string; notifyTenant?: boolean; tenantMessage?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-maintenance-dispatch/bids/${bidId}/award` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, {
    ...options,
    body: input,
  }));
}

export async function completeMaintenanceVendorDispatch(
  bidId: string,
  input: { note?: string; completeRequest?: boolean },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-maintenance-dispatch/bids/${bidId}/complete` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, {
    ...options,
    body: input,
  }));
}

export async function rejectMaintenanceVendorBid(
  bidId: string,
  input: { reason?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-maintenance-dispatch/bids/${bidId}/reject` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, {
    ...options,
    body: input,
  }));
}

export async function generateInspectionRepairEstimate(
  inspectionId: number,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-inspection-estimates/inspections/${inspectionId}/generate-estimate` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, options));
}

export async function approveInspectionRepairEstimate(
  estimateId: string,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-inspection-estimates/estimates/${estimateId}/approve` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, options));
}

export async function rejectInspectionRepairEstimate(
  estimateId: string,
  reason: string,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-inspection-estimates/estimates/${estimateId}/reject` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, {
    ...options,
    body: reason.trim() ? { reason: reason.trim() } : {},
  }));
}

export async function createRepairRequestFromEstimate(
  estimateId: string,
  input: { title?: string; description?: string; priority?: string; dueDate?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-inspection-estimates/estimates/${estimateId}/create-repair-request` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: input,
  }));
}

export async function createOperatorRenewalOffer(
  leaseId: string,
  input: { proposedRent?: number; proposedRentCents?: number; proposedStart?: string; proposedEnd?: string; escalationPercent?: number; message?: string; expiresAt?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-renewals/leases/${leaseId}/offers` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, { ...options, body: input }));
}

export async function recordOperatorRenewalResponse(
  leaseId: string,
  offerId: number,
  input: { decision: 'ACCEPTED' | 'DECLINED'; message?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-renewals/leases/${leaseId}/offers/${offerId}/response` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, { ...options, body: input }));
}

export async function sendOperatorRenewalSignature(
  leaseId: string,
  input: { templateId?: string; message?: string; signerEmail?: string; signerName?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-renewals/leases/${leaseId}/signature` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, { ...options, body: input }));
}

export async function refreshOperatorRenewalEnvelope(
  envelopeId: number,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-renewals/envelopes/${envelopeId}/refresh` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, options));
}

export async function recordOperatorRenewalMoveOut(
  leaseId: string,
  input: { moveOutAt: string; message?: string; deliveryMethod?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-renewals/leases/${leaseId}/move-out` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, { ...options, body: input }));
}

export async function generateOperatorOwnerStatements(
  month: string,
  options: ApiClientOptions,
): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-owner-statements/generate', {
    ...options,
    body: { month },
  }));
}

export async function approveOperatorOwnerStatement(
  statementId: string,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-owner-statements/${statementId}/approve` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, options));
}

export async function sendOperatorOwnerStatement(
  statementId: string,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/operator-owner-statements/${statementId}/send` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, options));
}

export async function loadReadOnlyOperatorData(options: ApiClientOptions): Promise<ReadOnlyOperatorData> {
  const [commandCenter, aiCapabilities, workflows, paymentWorkbench, setup, applications, leaseSigning, maintenanceDispatch, inspectionEstimates, renewals, ownerStatements, metrics, briefing, feed, portfolio, approvals] = await Promise.all([
    loadArea('command center', apiRequest<CommandCenterResponse>('get', '/api/command-center', options)),
    loadArea('AI capabilities', apiRequest<AiGatewayCapabilityManifest>('get', '/api/ai-gateway/capabilities', options)),
    loadArea('operator workflows', apiRequest<OperatorWorkflowsResponse>('get', '/api/operator-workflows', options)),
    loadArea('payment workbench', apiRequest<OperatorPaymentWorkbench>('get', '/api/operator-payments', options)),
    loadArea('property setup', apiRequest<OperatorSetupSummary>('get', '/api/operator-setup', options)),
    loadArea('application workbench', apiRequest<OperatorApplicationsWorkbench>('get', '/api/operator-applications', options)),
    loadArea('lease signing', apiRequest<OperatorLeaseSigningWorkbench>('get', '/api/operator-lease-signing', options)),
    loadArea('maintenance dispatch', apiRequest<OperatorMaintenanceDispatchWorkbench>('get', '/api/operator-maintenance-dispatch', options)),
    loadArea('inspection estimates', apiRequest<OperatorInspectionEstimatesWorkbench>('get', '/api/operator-inspection-estimates', options)),
    loadArea('renewals', apiRequest<OperatorRenewalsWorkbench>('get', '/api/operator-renewals', options)),
    loadArea('owner statements', apiRequest<OperatorOwnerStatementsWorkbench>('get', '/api/operator-owner-statements', options)),
    loadArea('dashboard metrics', apiRequest<DashboardMetrics>('get', '/api/dashboard/metrics', options)),
    loadArea('daily briefing', apiRequest<DailyBriefing>('get', '/api/briefing/daily', options)),
    loadArea('decision feed', apiRequest<{ items?: FeedItem[] }>('get', '/api/feed', { ...options, query: { limit: 12 } })),
    loadArea('portfolio', apiRequest<PortfolioResponse>('get', '/api/properties', { ...options, query: { page: 1, limit: 50 } })),
    loadArea('approval tasks', apiRequest<ApprovalTask[] | { data?: ApprovalTask[] }>('get', '/api/policy/approval-tasks/pending', options)),
  ]);

  const approvalPayload = approvals.data;
  const approvalData = Array.isArray(approvalPayload) ? approvalPayload : approvalPayload?.data ?? [];

  return {
    commandCenter: commandCenter.data,
    aiCapabilities: aiCapabilities.data,
    workflows: workflows.data,
    paymentWorkbench: paymentWorkbench.data,
    setup: setup.data,
    applications: applications.data,
    leaseSigning: leaseSigning.data,
    maintenanceDispatch: maintenanceDispatch.data,
    inspectionEstimates: inspectionEstimates.data,
    renewals: renewals.data,
    ownerStatements: ownerStatements.data,
    metrics: metrics.data,
    briefing: commandCenter.data?.dailyBriefing ?? briefing.data,
    feed: feed.data?.items ?? [],
    portfolio: normalizePortfolio(portfolio.data),
    approvals: commandCenter.data?.approvals ?? approvalData,
    errors: [commandCenter.error, aiCapabilities.error, workflows.error, paymentWorkbench.error, setup.error, applications.error, leaseSigning.error, maintenanceDispatch.error, renewals.error, ownerStatements.error, metrics.error, briefing.error, feed.error, portfolio.error, approvals.error].filter((error) => error !== null),
  };
}

// ── Property & Unit detail workspace loaders ─────────────────────────────────

/**
 * Load property detail data: the property record plus its rollup summary.
 * Mirrors the legacy fetchPropertyWorkspace but via the operator API client.
 */
export async function loadPropertyWorkspace(
  propertyId: string,
  options: ApiClientOptions = {},
): Promise<{ property: PortfolioProperty | null; rollup: Record<string, unknown> | null }> {
  const propertyPath = `/api/properties/${propertyId}` as keyof paths & string;
  const rollupPath = `/api/properties/${propertyId}/rollup` as keyof paths & string;
  const [propertyRes, rollupRes] = await Promise.allSettled([
    apiRequest<PortfolioProperty>('get', propertyPath, options),
    apiRequest<Record<string, unknown>>('get', rollupPath, options),
  ]);

  return {
    property: propertyRes.status === 'fulfilled' ? unwrapEnvelope(propertyRes.value) : null,
    rollup: rollupRes.status === 'fulfilled' ? unwrapEnvelope(rollupRes.value) : null,
  };
}

/**
 * Load unit detail data: the unit record (from the parent property) plus its
 * rollup summary. Mirrors the legacy fetchUnitWorkspace.
 */
export async function loadUnitWorkspace(
  propertyId: string,
  unitId: string,
  options: ApiClientOptions = {},
): Promise<{ unit: PropertyUnit | null; rollup: Record<string, unknown> | null }> {
  const propertyPath = `/api/properties/${propertyId}` as keyof paths & string;
  const rollupPath = `/api/properties/units/${unitId}/rollup` as keyof paths & string;
  const [propertyRes, rollupRes] = await Promise.allSettled([
    apiRequest<PortfolioProperty>('get', propertyPath, options),
    apiRequest<Record<string, unknown>>('get', rollupPath, options),
  ]);
  let unit: PropertyUnit | null = null;
  if (propertyRes.status === 'fulfilled') {
    const prop = unwrapEnvelope(propertyRes.value);
    unit = (prop?.units ?? []).find((u) => u.id === unitId) ?? null;
  }

  return {
    unit,
    rollup: rollupRes.status === 'fulfilled' ? unwrapEnvelope(rollupRes.value) : null,
  };
}

/**
 * Transition a unit to a new lifecycle status.
 * Mirrors the legacy transitionUnitState.
 */
export async function transitionUnitStatus(
  unitId: string,
  status: string,
  options: ApiClientOptions = {},
): Promise<unknown> {
  const path = `/api/properties/units/${unitId}/transition` as keyof paths & string;
  return unwrapEnvelope(
    await apiRequest<unknown>('post', path, {
      ...options,
      body: { status },
    }),
  );
}

/**
 * Update a unit's fields (e.g. rent amount). Mirrors the legacy updateUnit.
 */
export async function updateUnit(
  propertyId: string,
  unitId: string,
  data: Record<string, unknown>,
  options: ApiClientOptions = {},
): Promise<PropertyUnit> {
  const path = `/api/properties/${propertyId}/units/${unitId}` as keyof paths & string;
  return unwrapEnvelope(
    await apiRequest<PropertyUnit>('patch', path, {
      ...options,
      body: data,
    }),
  );
}

/**
 * Load maintenance/repair requests for a specific unit.
 */
export async function loadUnitRepairs(
  unitId: string,
  options: ApiClientOptions = {},
): Promise<unknown[]> {
  try {
    const res = await apiRequest<unknown>('get', '/api/maintenance', {
      ...options,
      query: { unitId },
    });
    const unwrapped = unwrapEnvelope(res);
    return Array.isArray(unwrapped) ? unwrapped : ((unwrapped as { data?: unknown[] })?.data ?? []);
  } catch {
    return [];
  }
}

/**
 * Load maintenance/repair requests for a specific property.
 */
export async function loadPropertyRepairs(
  propertyId: string,
  options: ApiClientOptions = {},
): Promise<unknown[]> {
  try {
    const res = await apiRequest<unknown>('get', '/api/maintenance', {
      ...options,
      query: { propertyId },
    });
    const unwrapped = unwrapEnvelope(res);
    return Array.isArray(unwrapped) ? unwrapped : ((unwrapped as { data?: unknown[] })?.data ?? []);
  } catch {
    return [];
  }
}

/**
 * Load audit logs with optional filter params.
 * Mirrors the legacy fetchAuditLogs.
 */
export async function loadAuditLogs(
  params: {
    entityId?: string;
    module?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
  },
  options: ApiClientOptions = {},
): Promise<{ data: unknown[]; total?: number }> {
  try {
    const res = await apiRequest<{ data: unknown[]; total?: number }>('get', '/api/audit-log' as keyof paths & string, {
      ...options,
      query: params as Record<string, string | number | boolean | undefined>,
    });
    return unwrapEnvelope(res) ?? { data: [], total: 0 };
  } catch {
    return { data: [], total: 0 };
  }
}

/**
 * Create a new maintenance request.
 * Mirrors the legacy createMaintenanceRequest.
 */
export async function createMaintenanceFromPage(
  data: {
    title: string;
    category: string;
    priority: string;
    description: string;
    unitId?: string;
    propertyId?: string;
    tenantId?: string;
  },
  options: ApiClientOptions = {},
): Promise<unknown> {
  return unwrapEnvelope(
    await apiRequest<unknown>('post', '/api/maintenance', {
      ...options,
      body: data as unknown as Record<string, unknown>,
    }),
  );
}

/**
 * Load the tenant ledger for a specific lease.
 * Mirrors the legacy fetchUnitLedger.
 */
export async function loadUnitLedger(
  leaseId: string,
  options: ApiClientOptions = {},
): Promise<unknown | null> {
  try {
    const res = await apiRequest<unknown>('get', `/api/payments/ledger/accounts/${leaseId}` as keyof paths & string, options);
    return unwrapEnvelope(res);
  } catch {
    return null;
  }
}

export async function createSetupProperty(
  input: { name: string; address: string; city?: string; state?: string; zipCode?: string; propertyType?: string },
  options: ApiClientOptions,
): Promise<PortfolioProperty> {
  return unwrapEnvelope(await apiRequest<PortfolioProperty>('post', '/api/operator-setup/properties', {
    ...options,
    body: input,
  }));
}

export async function createSetupUnit(
  propertyId: string,
  input: { name: string; unitNumber?: string; bedrooms?: number; bathrooms?: number; squareFeet?: number; status?: string },
  options: ApiClientOptions,
): Promise<PropertyUnit> {
  const path = `/api/operator-setup/properties/${propertyId}/units` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<PropertyUnit>('post', path, {
    ...options,
    body: input,
  }));
}

// ── Inspection CRUD (operator API) ────────────────────────────────────────────

export async function loadOperatorInspectionDetail(
  inspectionId: number,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/inspections/${inspectionId}` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('get', path, options));
}

export async function startOperatorInspection(
  inspectionId: number,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = '/api/inspections/start' as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: { inspectionId },
  }));
}

export async function completeOperatorInspection(
  inspectionId: number,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = `/api/inspections/${inspectionId}/complete` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('put', path, options));
}

export async function createOperatorInspection(
  input: {
    type: string;
    propertyId?: string;
    unitId?: string;
    scheduledAt?: string;
    notes?: string;
  },
  options: ApiClientOptions,
): Promise<{ id: string | number; [key: string]: unknown }> {
  const path = '/api/inspections' as keyof paths & string;
  return unwrapEnvelope(await apiRequest<{ id: string | number; [key: string]: unknown }>('post', path, {
    ...options,
    body: input,
  }));
}

// ── Tenant operations (operator API) ─────────────────────────────────────────

export async function updateTenantProfile(
  tenantId: string,
  data: Record<string, unknown>,
  options: ApiClientOptions = {},
): Promise<unknown> {
  const path = `/api/tenants/${encodeURIComponent(tenantId)}/profile` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, {
    ...options,
    body: data,
  }));
}

export async function addHouseholdMember(
  tenantId: string,
  data: Record<string, unknown>,
  options: ApiClientOptions = {},
): Promise<unknown> {
  const path = `/api/tenants/${encodeURIComponent(tenantId)}/household` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: data,
  }));
}

export async function addViolation(
  tenantId: string,
  data: Record<string, unknown>,
  options: ApiClientOptions = {},
): Promise<unknown> {
  const path = `/api/tenants/${encodeURIComponent(tenantId)}/violations` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: data,
  }));
}

export async function recordTenantLeaseNotice(
  leaseId: string,
  data: { type: string; deliveryMethod: string; message?: string },
  options: ApiClientOptions = {},
): Promise<unknown> {
  const path = `/api/leases/${encodeURIComponent(leaseId)}/notices` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: data,
  }));
}

export async function createTenantMaintenanceRequest(
  data: {
    title: string;
    category: string;
    priority: string;
    description: string;
    unitId?: string;
    propertyId?: string;
    tenantId?: string;
  },
  options: ApiClientOptions = {},
): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/maintenance', { ...options, body: data }));
}

export async function logTenantManualPayment(
  data: {
    leaseId: string;
    propertyId: string;
    unitId?: string;
    tenantId: string;
    amountCents: number;
    method: string;
    referenceNumber?: string;
    receivedAt?: string;
    appliedTo?: string;
    memo?: string;
  },
  options: ApiClientOptions = {},
): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/payments/manual', { ...options, body: data }));
}

export async function startTenantConversation(
  dto: { subject?: string; content: string; participantIds?: string[] },
  options: ApiClientOptions = {},
): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/messaging/threads', { ...options, body: dto }));
}

// ── Lease creation (operator API) ─────────────────────────────────────────────

export async function createOperatorLease(
  input: {
    tenantId: string;
    unitId: string;
    startDate: string;
    endDate: string;
    rentAmount?: number;
    rentAmountCents?: number;
    depositAmount?: number;
    depositAmountCents?: number;
    noticePeriodDays?: number;
    moveInAt?: string;
    autoRenew?: boolean;
  },
  options: ApiClientOptions,
): Promise<{ id: string; [key: string]: unknown }> {
  const path = '/api/leases' as keyof paths & string;
  return unwrapEnvelope(await apiRequest<{ id: string; [key: string]: unknown }>('post', path, {
    ...options,
    body: input,
  }));
}

// ── Estimate creation (operator API) ──────────────────────────────────────────

export async function createOperatorEstimate(
  data: Record<string, unknown>,
  options: ApiClientOptions,
): Promise<unknown> {
  const path = '/api/estimates' as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: data,
  }));
}

// ── Move orchestration (operator API) ──────────────────────────────────────────

export async function startOperatorMoveIn(
  data: { leaseId: string; tenantId: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = '/api/move-orchestration/move-in' as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: data,
  }));
}

export async function startOperatorMoveOut(
  data: { leaseId: string; tenantId: string },
  options: ApiClientOptions,
): Promise<unknown> {
  const path = '/api/move-orchestration/move-out' as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, {
    ...options,
    body: data,
  }));
}

// ── Messaging (operator API) ───────────────────────────────────────────────────

export async function loadOperatorMessagingWorkbench(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-messaging' as keyof paths & string, options));
}

export async function loadOperatorConversations(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-messaging/conversations' as keyof paths & string, options));
}

export async function createOperatorConversation(
  dto: { subject?: string; content: string; participantIds?: string[] },
  options: ApiClientOptions,
): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-messaging/conversations' as keyof paths & string, {
    ...options,
    body: dto,
  }));
}

export async function loadOperatorMessages(conversationId: number, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-messaging/conversations/${conversationId}/messages` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('get', path, options));
}

export async function sendOperatorMessage(conversationId: number, content: string, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-messaging/conversations/${conversationId}/messages` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, { ...options, body: { content } }));
}

// ── Documents (operator API) ───────────────────────────────────────────────────

export async function loadOperatorDocumentsWorkbench(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-documents' as keyof paths & string, options));
}

export async function uploadOperatorDocument(formData: FormData, options: ApiClientOptions): Promise<unknown> {
  // FormData uploads don't use the standard JSON client — use fetch directly
  const token = options.token
    || (typeof window !== 'undefined' ? window.localStorage.getItem('operator_api_token') : null)
    || undefined;
  const res = await fetch('/api/v2/operator-documents/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function downloadOperatorDocument(docId: number, options: ApiClientOptions): Promise<string> {
  const path = `/api/operator-documents/${docId}/download` as keyof paths & string;
  const res = await apiRequest<Blob>('get', path, options);
  // Return a download URL
  return URL.createObjectURL(res as unknown as Blob);
}

export async function deleteOperatorDocument(docId: number, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-documents/${docId}` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('delete', path, options));
}

// ── E-Signatures (operator API) ───────────────────────────────────────────────

export async function loadOperatorEsignaturesWorkbench(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-esignatures' as keyof paths & string, options));
}

export async function voidOperatorEnvelope(envelopeId: number, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-esignatures/envelopes/${envelopeId}/void` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, options));
}

export async function resendOperatorEnvelope(envelopeId: number, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-esignatures/envelopes/${envelopeId}/resend` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, options));
}

export async function getOperatorSignedDocUrl(envelopeId: number, options: ApiClientOptions): Promise<string> {
  const path = `/api/operator-esignatures/envelopes/${envelopeId}/documents/signed` as keyof paths & string;
  const res = await apiRequest<{ url?: string; data?: { url?: string } }>('get', path, options);
  const unwrapped = unwrapEnvelope(res);
  return (unwrapped as { url?: string }).url ?? `/api/v2/operator-esignatures/envelopes/${envelopeId}/documents/signed`;
}

// ── CapEx (operator API) ───────────────────────────────────────────────────────

export async function loadOperatorCapexWorkbench(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-capex' as keyof paths & string, options));
}

export async function createOperatorCapexForecast(data: Record<string, unknown>, options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-capex/forecasts' as keyof paths & string, { ...options, body: data }));
}

export async function approveOperatorCapexForecast(id: string, approvedBudget: number, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-capex/forecasts/${id}/approve` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, { ...options, body: { approvedBudget } }));
}

export async function completeOperatorCapexForecast(id: string, actualCostCents: number, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-capex/forecasts/${id}/complete` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, { ...options, body: { actualCostCents } }));
}

export async function generateOperatorCapexForecast(propertyId: string, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-capex/properties/${propertyId}/generate` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, options));
}

// ── Vendors (operator API) ────────────────────────────────────────────────────

export async function loadOperatorVendorsWorkbench(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-vendors' as keyof paths & string, options));
}

export async function createOperatorVendor(data: Record<string, unknown>, options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-vendors' as keyof paths & string, { ...options, body: data }));
}

export function getOperatorVendors1099ExportUrl(): string {
  return '/api/v2/operator-vendors/1099-export';
}

// ── Security Events (operator API) ────────────────────────────────────────────

export async function loadOperatorSecurityWorkbench(
  params: { userId?: string; username?: string; type?: string; from?: string; to?: string; limit?: number; offset?: number },
  options: ApiClientOptions,
): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-security' as keyof paths & string, { ...options, query: params as Record<string, string | number | boolean | undefined> }));
}

// ── QuickBooks (operator API) ─────────────────────────────────────────────────

export async function loadOperatorQuickBooksWorkbench(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-quickbooks' as keyof paths & string, options));
}

export async function getOperatorQuickBooksAuthUrl(options: ApiClientOptions): Promise<{ authUrl?: string; url?: string }> {
  return unwrapEnvelope(await apiRequest<{ authUrl?: string; url?: string }>('get', '/api/operator-quickbooks/auth-url' as keyof paths & string, options));
}

export async function syncOperatorQuickBooks(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-quickbooks/sync' as keyof paths & string, options));
}

export async function disconnectOperatorQuickBooks(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-quickbooks/disconnect' as keyof paths & string, options));
}

export async function testOperatorQuickBooksConnection(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-quickbooks/test-connection' as keyof paths & string, options));
}

// ── Smart Devices (operator API) ──────────────────────────────────────────────

export async function loadOperatorSmartDevicesWorkbench(
  params: { propertyId?: string; unitId?: string },
  options: ApiClientOptions,
): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-smart-devices' as keyof paths & string, { ...options, query: params as Record<string, string | number | boolean | undefined> }));
}

export async function registerOperatorSmartDevice(data: Record<string, unknown>, options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-smart-devices' as keyof paths & string, { ...options, body: data }));
}

export async function createOperatorAccessCode(deviceId: string, data: Record<string, unknown>, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-smart-devices/${deviceId}/access-codes` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, { ...options, body: data }));
}

export async function loadOperatorAccessCodes(deviceId: string, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-smart-devices/${deviceId}/access-codes` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('get', path, options));
}

// ── Tenant Insurance (operator API) ───────────────────────────────────────────

export async function loadOperatorTenantInsuranceWorkbench(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-tenant-insurance' as keyof paths & string, options));
}

export async function recordOperatorTenantInsurance(leaseId: string, data: Record<string, unknown>, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-tenant-insurance/lease/${leaseId}` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, { ...options, body: data }));
}

export async function loadOperatorTenantInsurance(leaseId: string, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-tenant-insurance/lease/${leaseId}` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('get', path, options));
}

// ── Utility Billing (operator API) ────────────────────────────────────────────

export async function loadOperatorUtilityBillingWorkbench(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-utility-billing' as keyof paths & string, options));
}

export async function recordOperatorMasterBill(data: Record<string, unknown>, options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-utility-billing/master-bill' as keyof paths & string, { ...options, body: data }));
}

export async function allocateOperatorMasterBill(billId: string, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-utility-billing/master-bill/${billId}/allocate` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('post', path, options));
}

// ── Lease Abstraction (operator API) ─────────────────────────────────────────

export async function loadOperatorLeaseAbstractionWorkbench(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-lease-abstraction' as keyof paths & string, options));
}

export async function extractOperatorLease(data: Record<string, unknown>, options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-lease-abstraction/extract' as keyof paths & string, { ...options, body: data }));
}

export async function bulkExtractOperatorLeases(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-lease-abstraction/bulk-extract' as keyof paths & string, options));
}

export async function loadOperatorLeaseAbstractions(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-lease-abstraction/abstractions' as keyof paths & string, options));
}

export async function reviewOperatorLeaseAbstraction(id: string, data: Record<string, unknown>, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-lease-abstraction/abstractions/${id}/review` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('patch', path, { ...options, body: data }));
}

export async function loadOperatorLeaseAbstractionAnalytics(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-lease-abstraction/analytics' as keyof paths & string, options));
}

// ── Chatbot (operator API) ────────────────────────────────────────────────────

export async function loadOperatorChatbotWorkbench(options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-chatbot' as keyof paths & string, options));
}

export async function sendOperatorChatMessage(message: string, sessionId: string | undefined, options: ApiClientOptions): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('post', '/api/operator-chatbot/message' as keyof paths & string, { ...options, body: { message, sessionId } }));
}

export async function loadOperatorChatSession(sessionId: string, options: ApiClientOptions): Promise<unknown> {
  const path = `/api/operator-chatbot/session/${sessionId}` as keyof paths & string;
  return unwrapEnvelope(await apiRequest<unknown>('get', path, options));
}

// ── Audit Log (operator API) ──────────────────────────────────────────────────

export async function loadOperatorAuditLogWorkbench(
  params: { entityId?: string; module?: string; actorId?: string; startDate?: string; endDate?: string; limit?: number; skip?: number },
  options: ApiClientOptions,
): Promise<unknown> {
  return unwrapEnvelope(await apiRequest<unknown>('get', '/api/operator-audit-log' as keyof paths & string, { ...options, query: params as Record<string, string | number | boolean | undefined> }));
}
