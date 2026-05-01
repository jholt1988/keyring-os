"use server";

import type { FeedItem, MutationAction } from '@keyring/types';

export interface FeedDomainActionResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

function requireBackendUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error('BACKEND_URL is not set.');
  return base;
}

function requirePaymentId(item: FeedItem): number {
  const raw = item.metadata?.paymentId;
  const paymentId = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(paymentId)) {
    throw new Error(`Feed item ${item.id} is missing a usable paymentId for direct payment mutation.`);
  }
  return paymentId;
}

async function callJson(url: string, init: RequestInit): Promise<FeedDomainActionResponse> {
  const res = await fetch(url, init);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `Request failed with status ${res.status}`,
    );
  }

  return {
    success: true,
    message: typeof data?.message === 'string' ? data.message : undefined,
    data,
  };
}

export async function executeFeedDomainAction(action: MutationAction, item: FeedItem): Promise<FeedDomainActionResponse> {
  const base = requireBackendUrl();
  const headers = {
    'Content-Type': 'application/json',
  };

  switch (action.intent) {
    case 'send_3_day_notice':
    case 'send_late_notice': {
      const paymentId = requirePaymentId(item);
      return callJson(`${base}/payments/delinquency/by-payment/${paymentId}/issue-notice`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ intent: action.intent }),
      });
    }
    case 'promise_to_pay': {
      const paymentId = requirePaymentId(item);
      return callJson(`${base}/payments/delinquency/by-payment/${paymentId}/promise-to-pay`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
    }
    case 'dismiss_manually': {
      return callJson(`${base}/feed/${item.id}/dismiss`, {
        method: 'PATCH',
        headers,
      });
    }
    default:
      throw new Error(`No direct domain mutation mapping exists for intent: ${action.intent}`);
  }
}
