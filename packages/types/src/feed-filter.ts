import type { FeedItem, UserRole } from './feed';

function urgencyBoost(hours?: number): number {
  if (hours == null) return 0;
  if (hours <= 6) return 20;
  if (hours <= 24) return 12;
  if (hours <= 72) return 6;
  return 0;
}

function financialBoost(amount?: number): number {
  if (!amount) return 0;
  if (amount >= 2000) return 15;
  if (amount >= 1000) return 8;
  if (amount >= 500) return 4;
  return 0;
}

export function scoreFeedItem(item: FeedItem, role: UserRole): number {
  const roleBoost = item.roleWeights?.[role] ?? 0;
  return (
    item.priority +
    roleBoost +
    urgencyBoost(item.urgencyHours) +
    financialBoost(item.financialImpact)
  );
}

export function getFeedForRole(items: FeedItem[], role: UserRole): FeedItem[] {
  return items
    .filter((item) => item.allowedRoles.includes(role))
    .sort((a, b) => scoreFeedItem(b, role) - scoreFeedItem(a, role));
}