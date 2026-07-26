import { apiClient } from './api-client';

/**
 * Client for the predictive-maintenance backend endpoints, via the `/api/v2`
 * proxy (cookie -> Bearer). Backend routes: `/maintenance/predictive/*`.
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskDriver {
  code: string;
  label: string;
  weight: number;
}

export interface RiskSummary {
  totalAssets: number;
  byLevel: Record<string, number>;
  highRiskCount: number;
  topCategories: Array<{ category: string; count: number; high: number }>;
  topDrivers: Array<{ code: string; count: number }>;
  averageConfidence: number | null;
  lowConfidenceCount: number;
  dataQualityFlagCounts: Record<string, number>;
  trend30d: { highRiskNow: number; highRisk30dAgo: number; delta: number };
  generatedAt: string;
}

export interface AssetRisk {
  id: string;
  assetId: number;
  organizationId: string;
  category: string;
  riskLevel: RiskLevel;
  failureProbability30d: number;
  remainingUsefulLifeDays: number | null;
  confidence: number | null;
  drivers: RiskDriver[] | null;
  dataQualityFlags: string[] | null;
  recommendedAction: string | null;
  scannedAt: string;
}

export interface PredictiveAlert {
  id: string | number;
  metadata?: Record<string, unknown>;
}

export interface PredictiveScanResult {
  scannedCount: number;
  snapshotsCreated?: number;
  alertsGeneratedCount: number;
  alerts: PredictiveAlert[];
}

/**
 * The backend SuccessEnvelopeInterceptor wraps some responses as
 * `{ data, meta, errors }` and returns others raw. Unwrap defensively so this
 * client works regardless of whether a given route is enveloped.
 */
function unwrap<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    'meta' in payload &&
    'errors' in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export const predictiveApi = {
  getRiskSummary: async (): Promise<RiskSummary> =>
    unwrap<RiskSummary>(await apiClient.get<unknown>('/maintenance/predictive/risk-summary')),

  getAssetRisk: async (assetId: number): Promise<AssetRisk> =>
    unwrap<AssetRisk>(
      await apiClient.get<unknown>(`/maintenance/predictive/assets/${assetId}/risk`),
    ),

  scanAssets: async (): Promise<PredictiveScanResult> =>
    unwrap<PredictiveScanResult>(await apiClient.get<unknown>('/maintenance/predictive/assets')),

  triggerPreventive: async (assetId: number): Promise<unknown> =>
    apiClient.post<unknown>(`/maintenance/predictive/assets/${assetId}/trigger-preventive`),
};
