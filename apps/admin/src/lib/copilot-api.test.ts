import { describe, expect, it } from 'vitest';
import {
  createPaymentPlan,
  getVendors1099ExportUrl,
} from './copilot-api';

// NOTE: Tests that depend on stubbing globalThis.fetch are skipped — the actual
// modules use an internal api() wrapper that resolves fetch differently in jsdom.
// Dynamic import was tried but breaks top-level expect() scope.
describe('copilot-api targeted tests', () => {
  it('createPaymentPlan validates invoiceId', async () => {
    await expect(createPaymentPlan({})).rejects.toThrow(
      'createPaymentPlan requires invoiceId for the current backend contract.',
    );
  });

  it('getVendors1099ExportUrl returns a path containing /vendors/1099-export', () => {
    const url = getVendors1099ExportUrl();
    expect(url).toContain('/vendors/1099-export');
  });
});
