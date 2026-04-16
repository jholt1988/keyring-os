import type { 
  UnderwritingRules, 
  PaymentPlanSettings, 
  DenialCompliance,
  PolicyBundle 
} from '@keyring/types';

// Backend API base URL - adjust as needed
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const headers = (): HeadersInit => ({
  'Content-Type': 'application/json',
  // Auth headers are typically added by Next.js middleware or session
});

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
  const res = await fetch(`${API_BASE}/policy/${propertyId}`, {
    method: 'GET',
    headers: headers(),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch policy: ${res.status}`);
  }
  
  return res.json();
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
  const res = await fetch(`${API_BASE}/policy/${propertyId}`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ section, data }),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to update policy: ${res.status}`);
  }
  
  return res.json();
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