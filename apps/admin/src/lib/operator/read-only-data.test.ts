import { describe, expect, it } from 'vitest';
import { unwrapEnvelope } from './read-only-data';

describe('unwrapEnvelope', () => {
  const payload = { metrics: { totalBalanceCents: 100 }, items: [1, 2] };

  it('unwraps the standard { data, meta, errors } envelope', () => {
    expect(unwrapEnvelope({ data: payload, meta: {}, errors: [] })).toEqual(payload);
  });

  it('unwraps the AI-gateway { result, confidence } envelope', () => {
    expect(unwrapEnvelope({ result: payload, confidence: 0.85, rationale: [] })).toEqual(payload);
  });

  it('peels BOTH nested envelopes { data: { result: ... } }', () => {
    // The real operator-payments / command-center shape that caused the
    // `metrics is undefined` crashes: doubly wrapped.
    const doubled = { data: { result: payload, confidence: 0.85 }, meta: {}, errors: [] };
    expect(unwrapEnvelope(doubled)).toEqual(payload);
    expect((unwrapEnvelope(doubled) as unknown as typeof payload).metrics.totalBalanceCents).toBe(100);
  });

  it('returns a bare payload unchanged', () => {
    expect(unwrapEnvelope(payload)).toEqual(payload);
    expect(unwrapEnvelope([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('handles null / primitive without throwing', () => {
    expect(unwrapEnvelope(null)).toBeNull();
    expect(unwrapEnvelope(42)).toBe(42);
  });
});
