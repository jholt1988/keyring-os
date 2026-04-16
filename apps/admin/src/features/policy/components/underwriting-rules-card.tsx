'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CreditCard, Calculator, Shield, CheckSquare, Square } from 'lucide-react';
import type { UnderwritingRules, CreditBand } from '@keyring/types';

export interface UnderwritingRulesCardProps {
  rules: UnderwritingRules;
  onChange?: (rules: UnderwritingRules) => void;
  editable?: boolean;
}

const CREDIT_BANDS: CreditBand[] = ['POOR', 'FAIR', 'GOOD', 'VERY_GOOD', 'EXCELLENT'];

const creditBandLabels: Record<CreditBand, string> = {
  POOR: 'Poor (< 600)',
  FAIR: 'Fair (600-650)',
  GOOD: 'Good (650-700)',
  VERY_GOOD: 'Very Good (700-750)',
  EXCELLENT: 'Excellent (750+)',
};

export function UnderwritingRulesCard({ rules, onChange, editable = false }: UnderwritingRulesCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (field: keyof UnderwritingRules, value: string | number | boolean) => {
    if (onChange) {
      onChange({ ...rules, [field]: value });
    }
  };

  const summaryItems = [
    { label: 'Credit Band', value: rules.creditBand },
    { label: 'Min ITR', value: `${(rules.minimumItr * 100).toFixed(0)}%` },
    { label: 'Max ITR', value: `${(rules.maximumItr * 100).toFixed(0)}%` },
    { label: 'Eviction', value: `${rules.evictionYears} yr${rules.evictionYears !== 1 ? 's' : ''}` },
  ];

  return (
    <div className="rounded-xl border border-white/10 bg-[#0F1B31] p-5 transition-all hover:border-white/12">
      {/* Header - Always Visible */}
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-[#38BDF8]/10 p-2">
            <Calculator className="h-4 w-4 text-[#38BDF8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[#94A3B8]">
                Underwriting Rules
              </span>
            </div>
            <h3 className="mt-1 text-sm font-medium text-[#F8FAFC]">Credit & ITR Thresholds</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-[#64748B]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#64748B]" />
          )}
        </div>
      </button>

      {/* Summary Row - Always Visible */}
      <div className="mt-4 flex flex-wrap gap-3">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
          >
            <div className="text-[10px] uppercase tracking-wider text-[#64748B]">{item.label}</div>
            <div className="mt-0.5 text-sm font-medium text-[#F8FAFC]">{item.value}</div>
          </div>
        ))}
      </div>

      {/* Expanded Form */}
      {isExpanded && (
        <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
          {/* Credit Band */}
          <div>
            <label className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <CreditCard size={14} />
              Minimum Credit Band
            </label>
            <select
              value={rules.creditBand}
              onChange={(e) => handleChange('creditBand', e.target.value as CreditBand)}
              disabled={!editable}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0F1729] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {CREDIT_BANDS.map((band) => (
                <option key={band} value={band}>
                  {creditBandLabels[band]}
                </option>
              ))}
            </select>
          </div>

          {/* ITR Thresholds */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Calculator size={14} />
                Minimum ITR
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={rules.minimumItr}
                onChange={(e) => handleChange('minimumItr', parseFloat(e.target.value) || 0)}
                disabled={!editable}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0F1729] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="mt-1 text-[10px] text-[#64748B]">Range: 0.00 - 1.00</div>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Calculator size={14} />
                Maximum ITR
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={rules.maximumItr}
                onChange={(e) => handleChange('maximumItr', parseFloat(e.target.value) || 0)}
                disabled={!editable}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0F1729] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="mt-1 text-[10px] text-[#64748B]">Range: 0.00 - 1.00</div>
            </div>
          </div>

          {/* Eviction Years */}
          <div>
            <label className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <Shield size={14} />
              Eviction History (Years)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              step="1"
              value={rules.evictionYears}
              onChange={(e) => handleChange('evictionYears', parseInt(e.target.value) || 0)}
              disabled={!editable}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0F1729] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="mt-1 text-[10px] text-[#64748B]">Maximum years of eviction history allowed</div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex cursor-pointer items-center gap-3">
              <button
                type="button"
                onClick={() => handleChange('allowThinCreditConditional', !rules.allowThinCreditConditional)}
                disabled={!editable}
                className="flex h-5 w-5 items-center justify-center rounded border border-white/20 bg-[#0F1729] transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {rules.allowThinCreditConditional && (
                  <CheckSquare className="h-3.5 w-3.5 text-[#38BDF8]" />
                )}
              </button>
              <span className="text-sm text-[#F8FAFC]">Allow thin credit file with conditions</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <button
                type="button"
                onClick={() => handleChange('requireSecondApprovalForDenyToApproveOverride', !rules.requireSecondApprovalForDenyToApproveOverride)}
                disabled={!editable}
                className="flex h-5 w-5 items-center justify-center rounded border border-white/20 bg-[#0F1729] transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {rules.requireSecondApprovalForDenyToApproveOverride && (
                  <CheckSquare className="h-3.5 w-3.5 text-[#38BDF8]" />
                )}
              </button>
              <span className="text-sm text-[#F8FAFC]">Require second approval for deny → approve override</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}