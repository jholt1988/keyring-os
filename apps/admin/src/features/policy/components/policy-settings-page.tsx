'use client';

import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Button } from '@/components/ui/button';
import type { DenialCompliance,PaymentPlanSettings,PolicyBundle,UnderwritingRules } from '@keyring/types';
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { AlertCircle,Shield } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect,useState } from 'react';
import {
DenialComplianceCard,
MaintenanceConfigCard,
PaymentPlanSettingsCard,
UnderwritingRulesCard,
} from './index';
import type { MaintenanceConfig } from './maintenance-config-card';

// Extended PolicyBundle type to include maintenance config
interface ExtendedPolicyBundle extends PolicyBundle {
  maintenanceConfig?: MaintenanceConfig;
}

// API fetch functions
async function fetchPolicyBundle(propertyId: string): Promise<ExtendedPolicyBundle> {
  const response = await fetch(`/api/policy/${propertyId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch policy bundle');
  }
  return response.json();
}

async function updateUnderwritingRules(propertyId: string, rules: UnderwritingRules): Promise<ExtendedPolicyBundle> {
  const response = await fetch(`/api/policy/${propertyId}/underwriting`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rules),
  });
  if (!response.ok) {
    throw new Error('Failed to update underwriting rules');
  }
  return response.json();
}

async function updatePaymentPlanSettings(propertyId: string, settings: PaymentPlanSettings): Promise<ExtendedPolicyBundle> {
  const response = await fetch(`/api/policy/${propertyId}/payment-plan`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error('Failed to update payment plan settings');
  }
  return response.json();
}

async function updateMaintenanceConfig(propertyId: string, config: MaintenanceConfig): Promise<ExtendedPolicyBundle> {
  const response = await fetch(`/api/policy/${propertyId}/maintenance`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    throw new Error('Failed to update maintenance config');
  }
  return response.json();
}

async function updateDenialCompliance(propertyId: string, compliance: DenialCompliance): Promise<ExtendedPolicyBundle> {
  const response = await fetch(`/api/policy/${propertyId}/denial-compliance`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(compliance),
  });
  if (!response.ok) {
    throw new Error('Failed to update denial compliance');
  }
  return response.json();
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B82F6] border-t-transparent" />
        <span className="text-sm text-[#94A3B8]">Loading policy settings...</span>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-[#F43F5E]/20 bg-[#F43F5E]/5 p-8">
      <AlertCircle className="mb-3 h-8 w-8 text-[#F43F5E]" />
      <p className="mb-4 text-center text-sm text-[#F8FAFC]">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}

export function PolicySettingsPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const queryClient = useQueryClient();

  const [localBundle, setLocalBundle] = useState<ExtendedPolicyBundle | null>(null);

  // Fetch policy bundle
  const { data: bundle, isLoading, isError, refetch } = useQuery({
    queryKey: ['policy-bundle', propertyId],
    queryFn: () => fetchPolicyBundle(propertyId),
    enabled: !!propertyId,
  });

  // Set local bundle when data is loaded
  useEffect(() => {
    if (bundle) {
      setLocalBundle(bundle);
    }
  }, [bundle]);

  // Update mutations
  const updateUnderwriting = useMutation({
    mutationFn: (rules: UnderwritingRules) => updateUnderwritingRules(propertyId, rules),
    onSuccess: (data) => {
      setLocalBundle(data);
      queryClient.invalidateQueries({ queryKey: ['policy-bundle', propertyId] });
    },
  });

  const updatePaymentPlan = useMutation({
    mutationFn: (settings: PaymentPlanSettings) => updatePaymentPlanSettings(propertyId, settings),
    onSuccess: (data) => {
      setLocalBundle(data);
      queryClient.invalidateQueries({ queryKey: ['policy-bundle', propertyId] });
    },
  });

  const updateMaintenance = useMutation({
    mutationFn: (config: MaintenanceConfig) => updateMaintenanceConfig(propertyId, config),
    onSuccess: (data) => {
      setLocalBundle(data);
      queryClient.invalidateQueries({ queryKey: ['policy-bundle', propertyId] });
    },
  });

  const updateDenialComplianceMutation = useMutation({
    mutationFn: (compliance: DenialCompliance) => updateDenialCompliance(propertyId, compliance),
    onSuccess: (data) => {
      setLocalBundle(data);
      queryClient.invalidateQueries({ queryKey: ['policy-bundle', propertyId] });
    },
  });

  if (isLoading) {
    return (
      <WorkspaceShell
        title="Policy Settings"
        subtitle="Configure underwriting, payment plans, and compliance"
        icon={Shield}
      >
        <LoadingState />
      </WorkspaceShell>
    );
  }

  if (isError) {
    return (
      <WorkspaceShell
        title="Policy Settings"
        subtitle="Configure underwriting, payment plans, and compliance"
        icon={Shield}
      >
        <ErrorState message="Failed to load policy settings" onRetry={() => refetch()} />
      </WorkspaceShell>
    );
  }

  if (!localBundle) {
    return (
      <WorkspaceShell
        title="Policy Settings"
        subtitle="Configure underwriting, payment plans, and compliance"
        icon={Shield}
      >
        <ErrorState message="No policy data available" />
      </WorkspaceShell>
    );
  }

  // Default maintenance config if not set
  const defaultMaintenanceConfig: MaintenanceConfig = {
    categories: [],
    afterHoursDispatch: {
      enabled: false,
      emergencyOnly: false,
      strategy: 'ROUND_ROBIN',
    },
  };

  const maintenanceConfig = localBundle.maintenanceConfig || defaultMaintenanceConfig;

  return (
    <WorkspaceShell
      title="Policy Settings"
      subtitle={`Configure policies for this property`}
      icon={Shield}
    >
      <div className="flex flex-col gap-6">
        {/* Underwriting Rules Card */}
        <UnderwritingRulesCard
          rules={localBundle.underwriting}
          editable
          onChange={(rules) =>
            setLocalBundle((prev) => (prev ? { ...prev, underwriting: rules } : null))
          }
          onSave={(rules) => updateUnderwriting.mutate(rules)}
        />

        {/* Payment Plan Settings Card */}
        <PaymentPlanSettingsCard
          propertyId={propertyId}
          initialSettings={localBundle.paymentPlan}
          onSave={(settings) => updatePaymentPlan.mutate(settings)}
        />

        {/* Maintenance Config Card */}
        <MaintenanceConfigCard
          config={maintenanceConfig}
          onConfigChange={(config) =>
            setLocalBundle((prev) => (prev ? { ...prev, maintenanceConfig: config } : null))
          }
          onSave={(config) => updateMaintenance.mutate(config)}
        />

        {/* Denial Compliance Card */}
        <DenialComplianceCard
          propertyId={propertyId}
          initialSettings={localBundle.denialCompliance}
          onSave={(compliance) => updateDenialComplianceMutation.mutate(compliance)}
        />
      </div>
    </WorkspaceShell>
  );
}

export default PolicySettingsPage;