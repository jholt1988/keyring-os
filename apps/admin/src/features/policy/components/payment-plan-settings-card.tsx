'use client';

import { useState } from 'react';
import { CreditCard, ChevronDown, ChevronUp, Save, DollarSign, Calendar, Hash, FileCheck, UserCheck, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type PaymentPlanSettings } from '@keyring/types';
import { updatePaymentPlanSettings } from './policy-api';

interface PaymentPlanSettingsCardProps {
  propertyId: string;
  initialSettings?: PaymentPlanSettings;
  onSave?: (settings: PaymentPlanSettings) => void;
}

const defaultSettings: PaymentPlanSettings = {
  enabled: false,
  maxPlanDurationDays: 365,
  defaultInstallmentCountMin: 3,
  defaultInstallmentCountMax: 12,
  minimumInstallmentAmount: 100,
  requireManagerApproval: true,
  continueCurrentRentDuringPlan: false,
  reportingEnabled: false,
};

export function PaymentPlanSettingsCard({
  propertyId,
  initialSettings,
  onSave,
}: PaymentPlanSettingsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [settings, setSettings] = useState<PaymentPlanSettings>(
    initialSettings || defaultSettings
  );

  const handleChange = <K extends keyof PaymentPlanSettings>(
    key: K,
    value: PaymentPlanSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updatePaymentPlanSettings(propertyId, settings);
      onSave?.(settings);
    } catch (error) {
      console.error('Failed to save payment plan settings:', error);
      throw error;
    }
  };

  // Collapsed summary
  const summary = settings.enabled
    ? `Enabled • Max ${settings.maxPlanDurationDays} days • ${settings.defaultInstallmentCountMin}-${settings.defaultInstallmentCountMax} installments`
    : 'Disabled';

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0F1B31]">
      {/* Header - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#3B82F6]/10 p-2">
            <CreditCard className="h-4 w-4 text-[#38BDF8]" />
          </div>
          <div>
            <h3 className="font-medium text-[#F8FAFC]">Payment Plan Settings</h3>
            <p className="text-sm text-[#94A3B8]">{summary}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[#64748B]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[#64748B]" />
        )}
      </button>

      {/* Expanded form */}
      {expanded && (
        <div className="border-t border-white/10 px-5 py-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* Enabled toggle */}
            <div className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                id="enabled"
                checked={settings.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
              />
              <label htmlFor="enabled" className="text-sm text-[#F8FAFC]">
                Enable payment plans for this property
              </label>
            </div>

            {/* Max Plan Duration Days */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-xs uppercase tracking-wider text-[#94A3B8]">
                <Calendar className="h-3 w-3" />
                Max Plan Duration (Days)
              </label>
              <Input
                type="number"
                min={1}
                max={365}
                value={settings.maxPlanDurationDays}
                onChange={(e) => handleChange('maxPlanDurationDays', Number(e.target.value))}
                disabled={!settings.enabled}
              />
            </div>

            {/* Minimum Installment Amount */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-xs uppercase tracking-wider text-[#94A3B8]">
                <DollarSign className="h-3 w-3" />
                Min Installment Amount
              </label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={settings.minimumInstallmentAmount}
                onChange={(e) => handleChange('minimumInstallmentAmount', Number(e.target.value))}
                disabled={!settings.enabled}
              />
            </div>

            {/* Default Installment Count Min */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-xs uppercase tracking-wider text-[#94A3B8]">
                <Hash className="h-3 w-3" />
                Min Installments
              </label>
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.defaultInstallmentCountMin}
                onChange={(e) => handleChange('defaultInstallmentCountMin', Number(e.target.value))}
                disabled={!settings.enabled}
              />
            </div>

            {/* Default Installment Count Max */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-xs uppercase tracking-wider text-[#94A3B8]">
                <Hash className="h-3 w-3" />
                Max Installments
              </label>
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.defaultInstallmentCountMax}
                onChange={(e) => handleChange('defaultInstallmentCountMax', Number(e.target.value))}
                disabled={!settings.enabled}
              />
            </div>

            {/* Checkbox options */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="requireManagerApproval"
                  checked={settings.requireManagerApproval}
                  onChange={(e) => handleChange('requireManagerApproval', e.target.checked)}
                  disabled={!settings.enabled}
                  className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
                />
                <label htmlFor="requireManagerApproval" className="flex items-center gap-1 text-sm text-[#F8FAFC]">
                  <UserCheck className="h-3 w-3" />
                  Require manager approval for payment plans
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="continueCurrentRentDuringPlan"
                  checked={settings.continueCurrentRentDuringPlan}
                  onChange={(e) => handleChange('continueCurrentRentDuringPlan', e.target.checked)}
                  disabled={!settings.enabled}
                  className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
                />
                <label htmlFor="continueCurrentRentDuringPlan" className="flex items-center gap-1 text-sm text-[#F8FAFC]">
                  <PlayCircle className="h-3 w-3" />
                  Continue charging current rent during payment plan
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="reportingEnabled"
                  checked={settings.reportingEnabled}
                  onChange={(e) => handleChange('reportingEnabled', e.target.checked)}
                  disabled={!settings.enabled}
                  className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
                />
                <label htmlFor="reportingEnabled" className="flex items-center gap-1 text-sm text-[#F8FAFC]">
                  <FileCheck className="h-3 w-3" />
                  Enable payment plan reporting
                </label>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="mt-5 flex justify-end">
            <Button onClick={handleSave} disabled={!settings.enabled}>
              <Save size={14} />
              Save Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}