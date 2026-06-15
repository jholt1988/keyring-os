import type { PortfolioProperty, CommandCenterDecision, FeedItem } from '@/lib/operator/read-only-data';

export const formatCurrency = (value?: number | null) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
    : '$0';

export const formatNumber = (value?: number | null) => new Intl.NumberFormat('en-US').format(value ?? 0);

export function priorityLabel(item: FeedItem) {
  if (item.priority >= 90) return 'Critical';
  if (item.priority >= 70) return 'High';
  if (item.priority >= 40) return 'Medium';
  return 'Low';
}

export function decisionPriorityLabel(item: CommandCenterDecision) {
  return item.priority.charAt(0) + item.priority.slice(1).toLowerCase();
}

export function propertyAddress(property: PortfolioProperty) {
  return [property.address, property.city, property.state, property.zipCode].filter(Boolean).join(', ');
}

export function cents(value?: number | null) {
  return typeof value === 'number'
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value / 100)
    : null;
}

export function countUnitsByStatus(property: PortfolioProperty, status: string) {
  return property.units?.filter((unit) => unit.status === status).length ?? 0;
}
