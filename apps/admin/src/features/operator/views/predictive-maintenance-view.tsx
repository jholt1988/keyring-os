'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { ReadOnlyOperatorData } from '@/lib/operator/read-only-data';

interface PredictiveAlertMetadata {
  assetId?: number;
  assetName?: string;
  category?: string;
  remainingLifeDays?: number;
  failureProbability?: number;
  recommendedAction?: string;
}

interface PredictiveAlert {
  id: string | number;
  metadata?: PredictiveAlertMetadata;
}

interface PredictiveAssets {
  alerts?: PredictiveAlert[];
}

export function PredictiveMaintenanceView({
  data: _data,
  token,
  onRefresh,
}: {
  data: ReadOnlyOperatorData;
  token: string;
  onRefresh: () => Promise<void>;
}) {
  const [predictiveAssets, setPredictiveAssets] = useState<PredictiveAssets | null>(null);
  const [loadingPredictive, setLoadingPredictive] = useState(false);
  const [triggeringAssetId, setTriggeringAssetId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadPredictive = useCallback(async () => {
    setLoadingPredictive(true);
    try {
      const res = await fetch('/api/maintenance/predictive/assets', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.ok) {
        const body = await res.json();
        setPredictiveAssets((body.data ?? body) as PredictiveAssets);
      }
    } catch {
      console.error('Failed to load predictive assets.');
    } finally {
      setLoadingPredictive(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      void loadPredictive();
    }
  }, [token, loadPredictive]);

  async function triggerPreventiveTicket(assetId: number) {
    setTriggeringAssetId(assetId);
    setMessage(null);
    try {
      const res = await fetch(`/api/maintenance/predictive/assets/${assetId}/trigger-preventive`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        setMessage('Preventative work order successfully generated.');
        await loadPredictive();
        await onRefresh();
      } else {
        setMessage('Failed to generate preventative work order.');
      }
    } catch {
      setMessage('Error triggering preventative ticket.');
    } finally {
      setTriggeringAssetId(null);
    }
  }

  return (
    <section aria-labelledby="predictive-maintenance-title">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="predictive-maintenance-title" className="text-lg font-semibold">Predictive Maintenance</h2>
          <p className="text-sm text-[var(--muted)]">Proactively generate work orders for high-risk appliances based on projected failure rates.</p>
        </div>
      </div>

      {message ? <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">{message}</div> : null}

      <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
        <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-600 animate-pulse" />
            High-Risk Appliances
          </h3>
          <button
            onClick={() => void loadPredictive()}
            disabled={loadingPredictive}
            className="text-xs text-[var(--accent)] font-medium hover:underline"
          >
            {loadingPredictive ? 'Scanning...' : 'Scan Assets'}
          </button>
        </div>

        {(predictiveAssets?.alerts?.length ?? 0) > 0 ? (
          <div className="space-y-3">
            {predictiveAssets?.alerts?.map((alert) => (
              <div key={alert.id} className="flex flex-col gap-3 rounded-md bg-[var(--panel-strong)] p-3 text-xs md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-[var(--foreground)]">{alert.metadata?.assetName} ({alert.metadata?.category})</div>
                  <div className="mt-1 text-[var(--muted)]">
                    Projected life remaining: <strong className="text-[var(--foreground)]">{alert.metadata?.remainingLifeDays} days</strong> · 
                    Failure Probability: <strong className="text-red-600 font-semibold">{Math.round((alert.metadata?.failureProbability ?? 0) * 100)}%</strong>
                  </div>
                  <div className="mt-1 font-medium text-yellow-700">{alert.metadata?.recommendedAction}</div>
                </div>
                <button
                  disabled={triggeringAssetId === alert.metadata?.assetId}
                  onClick={() => alert.metadata?.assetId != null && void triggerPreventiveTicket(alert.metadata.assetId)}
                  className="rounded bg-[var(--accent)] px-3 py-1.5 font-semibold text-white hover:opacity-90 disabled:opacity-50 min-w-[150px] text-center"
                >
                  {triggeringAssetId === alert.metadata?.assetId ? 'Generating...' : 'Approve Work Order'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-[var(--muted)]">No critical assets currently flagged for imminent failure.</div>
        )}
      </div>
    </section>
  );
}
