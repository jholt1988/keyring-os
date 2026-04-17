// Feature Flags Hook for Keyring OS
// Frontend integration for feature flag system

import { useState, useEffect, useCallback } from 'react';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
}

const FEATURE_FLAG_ENDPOINTS = {
  LIST: '/api/v2/feature-flags',
  GET: '/api/v2/feature-flags/:key',
  ENABLE: '/api/v2/feature-flags/:key/enable',
  DISABLE: '/api/v2/feature-flags/:key/disable',
};

// Default flags for frontend control
export const DEFAULT_FLAGS: Record<string, boolean> = {
  // Production flags
  dashboard_v2: true,
  ai_triage_routing: false,
  rent_optimization_ml: false,
  chatbot_beta: false,
  
  // New features from remediation
  lease_abstraction: true,
  ai_maintenance_triage: true,
  payment_reminders: true,
  screening_risk_detail: true,
  owner_statement_send: true,
  expense_anomaly_alerts: true,
  portfolio_risk_briefing: true,
};

export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, boolean>>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEnabled = useCallback((flagKey: string): boolean => {
    return flags[flagKey] ?? DEFAULT_FLAGS[flagKey] ?? false;
  }, [flags]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In production, would fetch from API
      // For now, use default flags
      setFlags({ ...DEFAULT_FLAGS });
    } catch (err) {
      setError('Failed to load feature flags');
      console.error('Feature flags error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    flags,
    loading,
    error,
    isEnabled,
    refresh,
  };
}

// HOC for features
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flagKey: string
): React.FC<P> {
  return (props: P) => {
    const { isEnabled } = useFeatureFlags();
    
    if (!isEnabled(flagKey)) {
      return null; // Or render a "feature coming soon" component
    }
    
    return <Component {...props} />;
  };
}

// Named exports for specific feature checks
export const useLeaseAbstraction = () => {
  const { isEnabled } = useFeatureFlags();
  return { enabled: isEnabled('lease_abstraction') };
};

export const useAIMaintenanceTriage = () => {
  const { isEnabled } = useFeatureFlags();
  return { enabled: isEnabled('ai_maintenance_triage') };
};

export const usePaymentReminders = () => {
  const { isEnabled } = useFeatureFlags();
  return { enabled: isEnabled('payment_reminders') };
};

export const useScreeningRiskDetail = () => {
  const { isEnabled } = useFeatureFlags();
  return { enabled: isEnabled('screening_risk_detail') };
};

export const useOwnerStatements = () => {
  const { isEnabled } = useFeatureFlags();
  return { enabled: isEnabled('owner_statement_send') };
};

export const useExpenseAnomalyAlerts = () => {
  const { isEnabled } = useFeatureFlags();
  return { enabled: isEnabled('expense_anomaly_alerts') };
};

export const usePortfolioRiskBriefing = () => {
  const { isEnabled } = useFeatureFlags();
  return { enabled: isEnabled('portfolio_risk_briefing') };
};