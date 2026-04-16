export type CreditBand = 'POOR' | 'FAIR' | 'GOOD' | 'VERY_GOOD' | 'EXCELLENT';

export interface UnderwritingRules {
  creditBand: CreditBand;
  minimumItr: number;
  maximumItr: number;
  evictionYears: number;
  allowThinCreditConditional: boolean;
  requireSecondApprovalForDenyToApproveOverride: boolean;
}

export type Channel = 'EMAIL' | 'SMS' | 'IN_APP' | 'PHYSICAL';

export interface PaymentPlanSettings {
  enabled: boolean;
  maxPlanDurationDays: number;
  defaultInstallmentCountMin: number;
  defaultInstallmentCountMax: number;
  minimumInstallmentAmount: number;
  requireManagerApproval: boolean;
  continueCurrentRentDuringPlan: boolean;
  reportingEnabled: boolean;
}

export interface DenialCompliance {
  requireAdverseActionNotice: boolean;
  autoSend: boolean;
  allowedChannels: Channel[];
  includeConsumerReportingAgencyBlock: boolean;
  includeDisputeRightsBlock: boolean;
  templateVersion: string;
}

export interface PolicyBundle {
  id: string;
  name: string;
  underwriting: UnderwritingRules;
  paymentPlan: PaymentPlanSettings;
  denialCompliance?: DenialCompliance;
  createdAt: string;
  updatedAt: string;
}