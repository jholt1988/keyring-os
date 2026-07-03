import type { 
  UnderwritingRules, 
  PaymentPlanSettings, 
  DenialCompliance,
  PolicyBundle 
} from '@keyring/types';
import { apiClient } from '../../../lib/api-client';

// All calls route through the shared client (/api/v2 proxy), which forwards the
// httpOnly auth cookie as a Bearer token. Previously this called
// NEXT_PUBLIC_API_URL directly from the browser, bypassing auth entirely.

export type PolicySection = 
  | 'underwriting'
  | 'paymentPlan'
  | 'denialCompliance'
  | 'maintenanceTaxonomy'
  | 'afterHoursDispatch';

/**
 * Fetch the active policy bundle for a property
 */
export async function fetchPropertyPolicy(propertyId: string): Promise<PolicyBundle> {
  return apiClient.get<PolicyBundle>(`/policy/${propertyId}`);
}

/**
 * Update a specific section of the policy bundle
 * @param propertyId - The property ID
 * @param section - The section to update (underwriting, paymentPlan, etc.)
 * @param data - The partial data for that section
 * @returns The updated policy bundle
 */
export async function updatePropertyPolicySection(
  propertyId: string,
  section: PolicySection,
  data: unknown
): Promise<PolicyBundle> {
  return apiClient.patch<PolicyBundle>(`/policy/${propertyId}`, { section, data });
}

/**
 * Update underwriting rules specifically
 */
export async function updateUnderwritingRules(
  propertyId: string,
  rules: UnderwritingRules
): Promise<PolicyBundle> {
  return updatePropertyPolicySection(propertyId, 'underwriting', rules);
}

/**
 * Update payment plan settings specifically
 */
export async function updatePaymentPlanSettings(
  propertyId: string,
  settings: PaymentPlanSettings
): Promise<PolicyBundle> {
  return updatePropertyPolicySection(propertyId, 'paymentPlan', settings);
}

/**
 * Update denial compliance settings specifically
 */
export async function updateDenialCompliance(
  propertyId: string,
  settings: DenialCompliance
): Promise<PolicyBundle> {
  return updatePropertyPolicySection(propertyId, 'denialCompliance', settings);
}