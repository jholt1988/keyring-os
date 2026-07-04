'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import type { ReadOnlyOperatorData } from '@/lib/operator/read-only-data';
import { formatCurrency } from '../utils';

interface PricingOption {
  termMonths?: number;
  targetStartMonthLabel?: string;
  monthlyRent?: number;
  seasonalAdjustmentPercent?: number;
  reason?: string;
  recommended?: boolean;
}

interface PricingMatrix {
  unitName?: string;
  baseRent?: number;
  generatedAt?: string;
  options?: PricingOption[];
}

export function RentOptimizationView({
  data,
  token,
  initialUnitId,
}: {
  data: ReadOnlyOperatorData;
  token: string;
  initialUnitId?: string;
}) {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(initialUnitId || null);
  const [pricingMatrix, setPricingMatrix] = useState<PricingMatrix | null>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPricing = useCallback(async (unitId: string) => {
    setLoadingPricing(true);
    setPricingMatrix(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/rent-recommendations/seasonal-pricing/${unitId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.ok) {
        const body = await res.json();
        setPricingMatrix((body.data ?? body) as PricingMatrix);
      } else {
        setMessage('Failed to load seasonal pricing matrix.');
      }
    } catch (err) {
      setMessage('Error loading pricing matrix.');
    } finally {
      setLoadingPricing(false);
    }
  }, [token]);

  useEffect(() => {
    if (selectedUnitId) {
      void loadPricing(selectedUnitId);
    }
  }, [selectedUnitId, loadPricing]);

  const workbench = data.renewals;

  return (
    <section aria-labelledby="rent-optimization-title">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="rent-optimization-title" className="text-lg font-semibold">Rent Optimization</h2>
          <p className="text-sm text-[var(--muted)]">Review seasonal pricing matrices and apply dynamic rent optimizations.</p>
        </div>
      </div>

      {message ? <div className="mb-3 rounded-md border border-[var(--border)] bg-[var(--panel)] p-3 text-sm text-[var(--muted)]">{message}</div> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Unit Selector List */}
        <div className="rounded-md border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h3 className="font-semibold">Select a Unit</h3>
          </div>
          {!workbench || workbench.leases.length === 0 ? (
            <div className="px-4 py-4 text-sm text-[var(--muted)]">No expiring leases available.</div>
          ) : (
            <div className="divide-y divide-[var(--border)] max-h-[80vh] overflow-y-auto">
              {workbench.leases.map((item) => (
                <button
                  key={item.unitId}
                  onClick={() => setSelectedUnitId(item.unitId)}
                  className={`w-full text-left px-4 py-3 hover:bg-[var(--panel-strong)] transition-colors ${selectedUnitId === item.unitId ? 'bg-[var(--panel-strong)] border-l-2 border-l-[var(--accent)]' : 'border-l-2 border-l-transparent'}`}
                >
                  <div className="font-medium text-sm">{item.unitLabel || 'Unknown Unit'}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">{item.propertyName}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">Current Rent: {formatCurrency(item.currentRent)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Matrix Detail */}
        <div className="lg:col-span-2 rounded-md border border-[var(--border)] bg-[var(--panel)] p-6 min-h-[400px]">
          {!selectedUnitId ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              Select a unit from the list to view its pricing matrix.
            </div>
          ) : loadingPricing ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
            </div>
          ) : pricingMatrix ? (
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="text-xl font-bold">Seasonal Pricing Matrix & Dynamic Optimization</h3>
              </div>
              
              <div className="mb-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-md border border-[var(--border)] p-3">
                  <span className="text-xs text-[var(--muted)]">Unit</span>
                  <div className="text-sm font-semibold">{pricingMatrix.unitName}</div>
                </div>
                <div className="rounded-md border border-[var(--border)] p-3">
                  <span className="text-xs text-[var(--muted)]">Base Rent</span>
                  <div className="text-sm font-semibold">{formatCurrency(pricingMatrix.baseRent)}</div>
                </div>
                <div className="rounded-md border border-[var(--border)] p-3">
                  <span className="text-xs text-[var(--muted)]">Generated At</span>
                  <div className="text-sm font-semibold">{pricingMatrix.generatedAt ? new Date(pricingMatrix.generatedAt).toLocaleDateString() : '—'}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted)]">
                      <th className="py-2 px-3">Term (Months)</th>
                      <th className="py-2 px-3">Start Month</th>
                      <th className="py-2 px-3 text-right">Rent</th>
                      <th className="py-2 px-3 text-right">Adj %</th>
                      <th className="py-2 px-3">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {pricingMatrix.options?.map((option, idx) => {
                      const adj = option.seasonalAdjustmentPercent ?? 0;
                      return (
                      <tr key={idx} className={`hover:bg-[var(--panel-strong)] ${option.recommended ? 'bg-[var(--accent)]/5 font-medium' : ''}`}>
                        <td className="py-3 px-3">{option.termMonths}m</td>
                        <td className="py-3 px-3">{option.targetStartMonthLabel}</td>
                        <td className="py-3 px-3 text-right font-semibold">{formatCurrency(option.monthlyRent)}</td>
                        <td className="py-3 px-3 text-right text-xs">
                          <span className={adj > 0 ? 'text-green-600 font-medium' : adj < 0 ? 'text-red-600 font-medium' : ''}>
                            {adj > 0 ? '+' : ''}{adj}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-[var(--muted)] max-w-xs">{option.reason}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--muted)]">Failed to load data for this unit.</div>
          )}
        </div>
      </div>
    </section>
  );
}
