'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import type { ReadOnlyOperatorData } from '@/lib/operator/read-only-data';
import { RiskMeter } from '@/components/copilot/risk-meter';
import type { Severity } from '@keyring/types';
import {
  predictiveApi,
  type RiskSummary,
  type AssetRisk,
  type PredictiveScanResult,
} from '@/lib/predictive-api';

const LEVEL_TO_SEVERITY: Record<string, Severity> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

const FLAG_LABELS: Record<string, string> = {
  MISSING_INSTALL_DATE: 'Missing install date',
  NO_SERVICE_HISTORY: 'No service history',
  LOW_REQUEST_VOLUME: 'Low request volume',
};

function pct(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : `${Math.round(value * 100)}%`;
}

export function PredictiveMaintenanceView({
  onRefresh,
}: {
  data: ReadOnlyOperatorData;
  token: string;
  onRefresh: () => Promise<void>;
}) {
  const [summary, setSummary] = useState<RiskSummary | null>(null);
  const [scan, setScan] = useState<PredictiveScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [triggeringAssetId, setTriggeringAssetId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [expandedAssetId, setExpandedAssetId] = useState<number | null>(null);
  const [assetRisk, setAssetRisk] = useState<Record<number, AssetRisk>>({});
  const [assetRiskLoading, setAssetRiskLoading] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryResult, scanResult] = await Promise.allSettled([
        predictiveApi.getRiskSummary(),
        predictiveApi.scanAssets(),
      ]);
      if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value);
      if (scanResult.status === 'fulfilled') setScan(scanResult.value);
      if (summaryResult.status === 'rejected' && scanResult.status === 'rejected') {
        setMessage('Failed to load predictive maintenance data.');
      }
    } catch {
      console.error('Failed to load predictive assets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleAsset = useCallback(
    async (assetId: number) => {
      if (expandedAssetId === assetId) {
        setExpandedAssetId(null);
        return;
      }
      setExpandedAssetId(assetId);
      if (!assetRisk[assetId]) {
        setAssetRiskLoading(assetId);
        try {
          const risk = await predictiveApi.getAssetRisk(assetId);
          setAssetRisk((prev) => ({ ...prev, [assetId]: risk }));
        } catch {
          // leave unloaded; the panel shows a fallback message
        } finally {
          setAssetRiskLoading(null);
        }
      }
    },
    [expandedAssetId, assetRisk],
  );

  async function triggerPreventiveTicket(assetId: number) {
    setTriggeringAssetId(assetId);
    setMessage(null);
    try {
      await predictiveApi.triggerPreventive(assetId);
      setMessage('Preventative work order successfully generated.');
      await load();
      await onRefresh();
    } catch {
      setMessage('Failed to generate preventative work order.');
    } finally {
      setTriggeringAssetId(null);
    }
  }

  const alerts = scan?.alerts ?? [];

  return (
    <section aria-labelledby="predictive-maintenance-title" className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="predictive-maintenance-title" className="text-lg font-semibold">
            Predictive Maintenance
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Portfolio maintenance risk, drivers, and proactive work orders based on projected failure rates.
          </p>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="text-xs font-medium text-[var(--accent)] hover:underline disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {message ? (
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">
          {message}
        </div>
      ) : null}

      {/* #10 — owner risk widgets */}
      <RiskSummaryWidgets summary={summary} loading={loading} />

      {/* High-risk assets + #12 "why this score" */}
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle size={16} className="text-yellow-600" />
            High-Risk Appliances
          </h3>
          <span className="text-xs text-[var(--muted)]">{alerts.length} flagged</span>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const meta = alert.metadata ?? {};
              const assetId = typeof meta.assetId === 'number' ? meta.assetId : null;
              const isOpen = assetId != null && expandedAssetId === assetId;
              const risk = assetId != null ? assetRisk[assetId] : undefined;
              const failureProbability =
                typeof meta.failureProbability === 'number' ? meta.failureProbability : null;
              return (
                <div key={alert.id} className="rounded-md bg-[var(--panel-strong)] p-3 text-xs">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold text-[var(--foreground)]">
                        {String(meta.assetName ?? 'Asset')} ({String(meta.category ?? '—')})
                      </div>
                      <div className="mt-1 text-[var(--muted)]">
                        Projected life remaining:{' '}
                        <strong className="text-[var(--foreground)]">
                          {String(meta.remainingLifeDays ?? '—')} days
                        </strong>{' '}
                        · Failure probability:{' '}
                        <strong className="font-semibold text-red-600">{pct(failureProbability)}</strong>
                      </div>
                      {meta.recommendedAction ? (
                        <div className="mt-1 font-medium text-yellow-700">
                          {String(meta.recommendedAction)}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {assetId != null ? (
                        <button
                          onClick={() => void toggleAsset(assetId)}
                          aria-expanded={isOpen}
                          className="flex items-center gap-1 rounded border border-[var(--border)] px-2 py-1.5 font-medium text-[var(--foreground)] hover:bg-[var(--panel)]"
                        >
                          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          Why this score
                        </button>
                      ) : null}
                      <button
                        disabled={assetId == null || triggeringAssetId === assetId}
                        onClick={() => assetId != null && void triggerPreventiveTicket(assetId)}
                        className="min-w-[150px] rounded bg-[var(--accent)] px-3 py-1.5 text-center font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {triggeringAssetId === assetId ? 'Generating…' : 'Approve Work Order'}
                      </button>
                    </div>
                  </div>

                  {isOpen ? (
                    <WhyThisScore risk={risk} loading={assetRiskLoading === assetId} />
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-xs text-[var(--muted)]">
            {loading
              ? 'Scanning assets…'
              : 'No critical assets currently flagged for imminent failure.'}
          </div>
        )}
      </div>
    </section>
  );
}

function RiskSummaryWidgets({
  summary,
  loading,
}: {
  summary: RiskSummary | null;
  loading: boolean;
}) {
  if (!summary) {
    return (
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4 text-xs text-[var(--muted)]">
        {loading ? 'Loading risk summary…' : 'Risk summary unavailable.'}
      </div>
    );
  }

  const delta = summary.trend30d?.delta ?? 0;
  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendColor =
    delta > 0 ? 'text-red-600' : delta < 0 ? 'text-green-600' : 'text-[var(--muted)]';
  const flags = Object.entries(summary.dataQualityFlagCounts ?? {});

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="text-xs text-[var(--muted)]">High-risk assets</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[var(--foreground)]">{summary.highRiskCount}</span>
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={12} />
            {delta > 0 ? `+${delta}` : delta}
          </span>
        </div>
        <div className="mt-1 text-[10px] text-[var(--muted)]">vs 30 days ago</div>
      </div>

      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="text-xs text-[var(--muted)]">Risk breakdown</div>
        <div className="mt-2 space-y-1 text-xs">
          {(['HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
            <div key={lvl} className="flex items-center justify-between">
              <span className="text-[var(--muted)]">{lvl}</span>
              <span className="font-semibold text-[var(--foreground)]">{summary.byLevel?.[lvl] ?? 0}</span>
            </div>
          ))}
        </div>
        <div className="mt-1 text-[10px] text-[var(--muted)]">{summary.totalAssets} assets scored</div>
      </div>

      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="text-xs text-[var(--muted)]">Top categories</div>
        <div className="mt-2 space-y-1 text-xs">
          {summary.topCategories?.length ? (
            summary.topCategories.slice(0, 3).map((c) => (
              <div key={c.category} className="flex items-center justify-between">
                <span className="text-[var(--foreground)]">{c.category}</span>
                <span className="text-[var(--muted)]">
                  {c.high} high / {c.count}
                </span>
              </div>
            ))
          ) : (
            <span className="text-[var(--muted)]">—</span>
          )}
        </div>
      </div>

      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="text-xs text-[var(--muted)]">Confidence</div>
        <div className="mt-1 text-2xl font-bold text-[var(--foreground)]">{pct(summary.averageConfidence)}</div>
        <div className="mt-1 text-[10px] text-[var(--muted)]">{summary.lowConfidenceCount} low-confidence</div>
        {flags.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {flags.map(([code, count]) => (
              <span
                key={code}
                className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--muted)]"
              >
                {FLAG_LABELS[code] ?? code}: {count}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function WhyThisScore({ risk, loading }: { risk: AssetRisk | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="mt-3 border-t border-[var(--border)] pt-3 text-[var(--muted)]">
        Loading risk detail…
      </div>
    );
  }
  if (!risk) {
    return (
      <div className="mt-3 border-t border-[var(--border)] pt-3 text-[var(--muted)]">
        No risk detail available for this asset yet.
      </div>
    );
  }

  const severity = LEVEL_TO_SEVERITY[risk.riskLevel] ?? 'low';
  const drivers = risk.drivers ?? [];
  const flags = risk.dataQualityFlags ?? [];

  return (
    <div className="mt-3 space-y-3 border-t border-[var(--border)] pt-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-1 text-[10px] uppercase text-[var(--muted)]">Risk level</div>
          <RiskMeter level={severity} />
        </div>
        <div>
          <div className="mb-1 text-[10px] uppercase text-[var(--muted)]">Confidence</div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1E3350]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${Math.round((risk.confidence ?? 0) * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-[var(--muted)]">{pct(risk.confidence)}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1 text-[10px] uppercase text-[var(--muted)]">Top drivers</div>
        {drivers.length ? (
          <ul className="space-y-1">
            {drivers.map((d) => (
              <li key={d.code} className="flex items-center gap-2 text-[var(--foreground)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                {d.label ?? d.code}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-[var(--muted)]">No dominant drivers identified.</span>
        )}
      </div>

      {flags.length ? (
        <div className="flex flex-wrap gap-1">
          {flags.map((f) => (
            <span
              key={f}
              className="rounded-full border border-yellow-600/40 bg-yellow-600/10 px-2 py-0.5 text-[10px] text-yellow-700"
            >
              {FLAG_LABELS[f] ?? f}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
