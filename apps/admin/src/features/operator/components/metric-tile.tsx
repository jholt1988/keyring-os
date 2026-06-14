import type { Building2 } from 'lucide-react';

export function MetricTile({ label, value, detail, icon: Icon }: { label: string; value: string; detail: string; icon: typeof Building2 }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-[var(--muted)]">{label}</div>
        <Icon size={18} className="text-[var(--accent-strong)]" aria-hidden="true" />
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-[var(--muted)]">{detail}</div>
    </div>
  );
}
