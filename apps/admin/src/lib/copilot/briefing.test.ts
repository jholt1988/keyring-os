import { describe, expect, it, vi } from 'vitest';
import {
  computeSeverity,
  computeUrgency,
  executeDecisionAction,
  fetchBriefing,
  mapDelinquencyToSignals,
  mapFeedToDecisions,
  mapScheduleToEvents,
} from './briefing';

describe('briefing api', () => {
  it('returns primary briefing when API succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ signals: [], decisions: [], events: [], metrics: {} }) }));
    const result = await fetchBriefing();
    expect(result.signals).toEqual([]);
  });

  it('builds fallback briefing on API failure', async () => {
    const today = new Date().toISOString().slice(0, 10);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ buckets: [{ items: [{ leaseId: 'l1', tenantName: 'T', outstandingAmount: 100, daysOverdue: 10 }] }] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ id: 'f1', actions: [{ label: 'Go', endpoint: '/x' }], priorityScore: 90 }] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ events: [{ id: 'e1', date: `${today}T10:00:00Z`, type: 'MAINTENANCE' }] }) }),
    );
    const result = await fetchBriefing();
    expect(result.signals.length).toBe(1);
    expect(result.decisions.length).toBe(1);
    expect(result.events.length).toBe(1);
  });

  it('fallback handles empty/non-array payload branches', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ buckets: { not: 'array' } }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: [{ id: 'f2', priorityScore: 20 }] }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ events: [{ id: 'e2', scheduledAt: '2099-01-01T00:00:00Z', type: 'LEASE' }] }) }),
    );
    const result = await fetchBriefing();
    expect(result.signals).toEqual([]);
    expect(result.decisions).toEqual([]);
    expect(result.events).toEqual([]);
  });

  it('executes decision action', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }));
    const res = await executeDecisionAction('/decisions/x', 'POST', { approved: true });
    expect(res).toEqual({ ok: true });
  });

  it('covers severity and action mapping branches', async () => {
    const today = new Date().toISOString().slice(0, 10);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            buckets: [
              { items: [{ id: 'i1', tenantName: 'A', amount: 1, daysOverdue: 31 }] },
              { items: [{ id: 'i2', tenantName: 'B', outstandingAmount: 2, daysOverdue: 5 }] },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [
              {
                id: 'f3',
                type: 'work',
                actions: [{ type: 'navigation', endpoint: '/nav' }],
                priorityScore: 60,
              },
            ],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ events: [{ id: 'e3', date: `${today}T09:00:00Z`, type: 'LEASE', property: { name: 'P' }, unit: { name: 'U' } }] }),
        }),
    );

    const result = await fetchBriefing();
    expect(result.signals.map((s) => s.severity)).toEqual(['critical', 'medium']);
    expect(result.decisions[0].actions[0].method).toBe('GET');
    expect(result.decisions[0].urgency).toBe('today');
    expect(result.events[0].propertyName).toBe('P');
    expect(result.events[0].unitName).toBe('U');
  });

  it('handles rejected fallback sources and non-array feed/events', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ items: {} }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ events: {} }) }),
    );
    const result = await fetchBriefing();
    expect(result.signals).toEqual([]);
    expect(result.decisions).toEqual([]);
    expect(result.events).toEqual([]);
    expect(result.metrics.atRiskAmount).toBe(0);
  });

  it('covers low severity, default action method, and event title fallback', async () => {
    const today = new Date().toISOString().slice(0, 10);
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            buckets: [{ items: [{ id: 'i3', tenantName: 'C', amount: 3, daysOverdue: 0, noticeStatus: 'x' }] }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            items: [{ id: 'f4', actions: [{ endpoint: '/post-default' }], priorityScore: 10 }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ events: [{ id: 'e4', date: `${today}T08:00:00Z`, type: 'INSPECTION' }] }),
        }),
    );
    const result = await fetchBriefing();
    expect(result.signals[0].severity).toBe('medium');
    expect(result.decisions[0].actions[0].method).toBe('POST');
    expect(result.decisions[0].urgency).toBe('this_week');
    expect(result.events[0].title).toBe('INSPECTION');
  });

  it('covers helper functions directly', () => {
    expect(computeSeverity(31)).toBe('critical');
    expect(computeSeverity(8)).toBe('high');
    expect(computeSeverity(1)).toBe('medium');

    expect(computeUrgency(90)).toBe('immediate');
    expect(computeUrgency(70)).toBe('today');
    expect(computeUrgency(10)).toBe('this_week');

    const d = mapDelinquencyToSignals({ buckets: [{ items: [{ id: 'x', amount: 7, daysOverdue: 1 }] }] });
    expect(d.atRiskAmount).toBe(7);
    expect(d.signals.length).toBe(1);

    const f = mapFeedToDecisions({
      items: [{ id: 'a', actions: [{ endpoint: '/a' }], priorityScore: 0 }],
    });
    expect(f.length).toBe(1);

    const today = '2026-01-01';
    const s = mapScheduleToEvents([{ id: 'e', scheduledAt: `${today}T00:00:00Z`, type: 'X' }], today);
    expect(s.length).toBe(1);
  });
});
