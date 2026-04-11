'use client';

import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchLedger, fetchMyLease } from '@/lib/tenant-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function LedgerPage() {
  const { data: lease } = useQuery({ queryKey: ['my-lease'], queryFn: fetchMyLease });
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['ledger', lease?.id],
    queryFn: () => fetchLedger(lease!.id),
    enabled: !!lease?.id,
  });

  return (
    <WorkspaceShell
      title="Full Ledger"
      backHref="/payments"
      backLabel="Payments"
      actions={
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer size={14} />
          Print
        </Button>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#94A3B8]">No ledger entries found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1E3350] text-left text-xs text-[#94A3B8]">
                    <th className="pb-3 pr-4 font-medium">Date</th>
                    <th className="pb-3 pr-4 font-medium">Description</th>
                    <th className="pb-3 pr-4 text-right font-medium">Charge</th>
                    <th className="pb-3 pr-4 text-right font-medium">Payment</th>
                    <th className="pb-3 text-right font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-[#1E3350]/50 transition-colors hover:bg-[#17304E]/30"
                    >
                      <td className="py-3 pr-4 text-[#94A3B8]">{formatDate(entry.date)}</td>
                      <td className="py-3 pr-4 text-[#F8FAFC]">{entry.description}</td>
                      <td className="py-3 pr-4 text-right font-mono text-[#F43F5E]">
                        {entry.charge != null ? formatCurrency(entry.charge) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-[#10B981]">
                        {entry.payment != null ? formatCurrency(entry.payment) : '—'}
                      </td>
                      <td
                        className={cn(
                          'py-3 text-right font-mono font-bold',
                          entry.balance > 0 ? 'text-[#F43F5E]' : 'text-[#10B981]',
                        )}
                      >
                        {formatCurrency(Math.abs(entry.balance))}
                        {entry.balance > 0 ? ' owed' : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
