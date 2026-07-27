'use client';

import { useQuery } from '@tanstack/react-query';
import { Zap, Loader2 } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';

interface FeatureFlag {
  key: string;
  name?: string;
  description?: string;
  enabled: boolean;
  category?: string;
}

const API_BASE = '/api/backend';

async function fetchFeatureFlags(): Promise<FeatureFlag[]> {
  const res = await fetch(`${API_BASE}/feature-flags`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load feature flags');
  const data = await res.json();
  if (Array.isArray(data)) return data;
  if (data?.flags) return data.flags;
  if (data?.data) return data.data;
  return [];
}

export default function FeatureFlagsSettingsPage() {
  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: fetchFeatureFlags,
  });

  const grouped = flags.reduce<Record<string, FeatureFlag[]>>((acc, flag) => {
    const cat = flag.category ?? 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(flag);
    return acc;
  }, {});

  return (
    <WorkspaceShell title="Feature Flags" icon={Zap}>
      <p className="mb-4 text-sm text-[#94A3B8]">
        View the status of feature flags for your organization. Flag evaluation is context-aware (user role, tenant, etc.).
      </p>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
        </div>
      ) : flags.length === 0 ? (
        <SectionCard title="No Flags">
          <p className="py-8 text-center text-sm text-[#94A3B8]">
            No feature flags returned by the backend.
          </p>
        </SectionCard>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categoryFlags]) => (
            <SectionCard key={category} title={category}>
              <div className="space-y-2">
                {categoryFlags.map((flag) => (
                  <div
                    key={flag.key}
                    className="flex items-center justify-between rounded-lg border border-[#1E3350] bg-[#0F1B31] px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#F8FAFC]">{flag.name ?? flag.key}</p>
                        <code className="rounded border border-[#1E3350] bg-[#0C1625] px-1.5 py-0.5 text-[10px] text-[#7FA7D9]">
                          {flag.key}
                        </code>
                      </div>
                      {flag.description && (
                        <p className="mt-1 text-xs leading-relaxed text-[#94A3B8]">{flag.description}</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide ${
                        flag.enabled
                          ? 'border-[#10B981]/20 bg-[#10B981]/10 text-[#6EE7B7]'
                          : 'border-[#475569]/20 bg-[#475569]/10 text-[#94A3B8]'
                      }`}
                    >
                      {flag.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </WorkspaceShell>
  );
}
