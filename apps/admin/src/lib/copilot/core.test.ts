import { describe, expect, it, vi } from 'vitest';
import { api, buildQuery } from './core';

describe('copilot core', () => {
  it('buildQuery omits empty values', () => {
    expect(buildQuery({ a: 1, b: '', c: undefined, d: true })).toBe('?a=1&d=true');
  });

  it('api throws on non-ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(api('/x')).rejects.toThrow('API 500');
  });
});
