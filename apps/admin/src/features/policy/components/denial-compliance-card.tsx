'use client';

import { useState } from 'react';
import { FileWarning, ChevronDown, ChevronUp, Save, Mail, MessageSquare, AppWindow, Mailbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DenialCompliance, Channel } from '@keyring/types';

interface DenialComplianceCardProps {
  propertyId: string;
  initialSettings?: DenialCompliance;
  onSave: (settings: DenialCompliance) => void;
}

const CHANNEL_OPTIONS: { value: Channel; label: string; icon: React.ElementType }[] = [
  { value: 'EMAIL', label: 'Email', icon: Mail },
  { value: 'SMS', label: 'SMS', icon: MessageSquare },
  { value: 'IN_APP', label: 'In-App', icon: AppWindow },
  { value: 'PHYSICAL', label: 'Physical', icon: Mailbox },
];

const DEFAULT_SETTINGS: DenialCompliance = {
  requireAdverseActionNotice: true,
  autoSend: false,
  allowedChannels: ['EMAIL'],
  includeConsumerReportingAgencyBlock: true,
  includeDisputeRightsBlock: true,
  templateVersion: '1.0',
};

export function DenialComplianceCard({
  propertyId,
  initialSettings,
  onSave,
}: DenialComplianceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [settings, setSettings] = useState<DenialCompliance>(initialSettings || DEFAULT_SETTINGS);

  const handleToggle = (field: keyof DenialCompliance) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChannelToggle = (channel: Channel) => {
    setSettings((prev) => ({
      ...prev,
      allowedChannels: prev.allowedChannels.includes(channel)
        ? prev.allowedChannels.filter((c) => c !== channel)
        : [...prev.allowedChannels, channel],
    }));
  };

  const handleTextChange = (field: keyof DenialCompliance, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  const channelCount = settings.allowedChannels.length;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0F1B31] p-5 transition-all hover:border-white/12">
      <div
        className="flex cursor-pointer items-start justify-between gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-[#F59E0B]/10 p-2">
            <FileWarning className="h-4 w-4 text-[#F59E0B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#94A3B8]">
                Denial Compliance
              </span>
            </div>
            <h3 className="mt-1 text-sm font-medium text-[#F8FAFC]">Adverse Action Settings</h3>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#94A3B8]">
              <span className={`flex items-center gap-1 ${settings.autoSend ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                <span className={`h-2 w-2 rounded-full ${settings.autoSend ? 'bg-[#10B981]' : 'bg-[#F43F5E]'}`} />
                {settings.autoSend ? 'Auto-send enabled' : 'Auto-send disabled'}
              </span>
              <span className="flex items-center gap-1">
                {channelCount} channel{channelCount !== 1 ? 's' : ''} configured
              </span>
            </div>
          </div>
        </div>
        <button className="rounded-lg p-1 hover:bg-white/5">
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-[#64748B]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#64748B]" />
          )}
        </button>
      </div>

      {expanded && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requireAdverseActionNotice"
                checked={settings.requireAdverseActionNotice}
                onChange={() => handleToggle('requireAdverseActionNotice')}
                className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] accent-[#3B82F6]"
              />
              <label htmlFor="requireAdverseActionNotice" className="text-sm text-[#F8FAFC]">
                Require adverse action notice
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoSend"
                checked={settings.autoSend}
                onChange={() => handleToggle('autoSend')}
                className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] accent-[#3B82F6]"
              />
              <label htmlFor="autoSend" className="text-sm text-[#F8FAFC]">
                Automatically send denial notices
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider text-[#94A3B8]">
              Allowed Channels
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {CHANNEL_OPTIONS.map(({ value, label, icon: Icon }) => {
                const isSelected = settings.allowedChannels.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChannelToggle(value)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                      isSelected
                        ? 'border-[#3B82F6]/50 bg-[#3B82F6]/10 text-[#F8FAFC]'
                        : 'border-white/10 bg-white/[0.02] text-[#94A3B8] hover:border-white/20'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeConsumerReportingAgencyBlock"
                checked={settings.includeConsumerReportingAgencyBlock}
                onChange={() => handleToggle('includeConsumerReportingAgencyBlock')}
                className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] accent-[#3B82F6]"
              />
              <label htmlFor="includeConsumerReportingAgencyBlock" className="text-sm text-[#F8FAFC]">
                Include consumer reporting agency block
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeDisputeRightsBlock"
                checked={settings.includeDisputeRightsBlock}
                onChange={() => handleToggle('includeDisputeRightsBlock')}
                className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] accent-[#3B82F6]"
              />
              <label htmlFor="includeDisputeRightsBlock" className="text-sm text-[#F8FAFC]">
                Include dispute rights block
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[#94A3B8]">
              Template Version
            </label>
            <Input
              type="text"
              value={settings.templateVersion}
              onChange={(e) => handleTextChange('templateVersion', e.target.value)}
              placeholder="e.g., 1.0"
              className="max-w-[200px]"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit">
              <Save size={14} />
              Save Denial Settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}