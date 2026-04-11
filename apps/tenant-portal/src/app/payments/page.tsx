'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchPayments,
  fetchInvoices,
  fetchAutopay,
  fetchMyLease,
  createStripeCheckoutSession,
  enableAutopay,
  disableAutopay,
} from '@/lib/tenant-api';
import { formatCurrency, formatDate } from '@/lib/utils';

function statusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'PAID':      return <Badge variant="success">Paid</Badge>;
    case 'OVERDUE':   return <Badge variant="destructive">Overdue</Badge>;
    case 'UNPAID':    return <Badge variant="warning">Due</Badge>;
    case 'PENDING':   return <Badge variant="info">Pending</Badge>;
    case 'FAILED':    return <Badge variant="destructive">Failed</Badge>;
    default:          return <Badge variant="muted">{status}</Badge>;
  }
}

export default function PaymentsPage() {
  const qc = useQueryClient();

  const { data: lease } = useQuery({ queryKey: ['my-lease'], queryFn: fetchMyLease });
  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  });
  const { data: payments = [], isLoading: loadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
  });
  const { data: autopay } = useQuery({
    queryKey: ['autopay'],
    queryFn: fetchAutopay,
    enabled: !!lease?.id,
  });

  const openInvoices = invoices.filter((i) =>
    ['UNPAID', 'OVERDUE'].includes(i.status.toUpperCase()),
  );
  const totalDue = openInvoices.reduce((s, i) => s + i.amount, 0);
  const nextDue = openInvoices.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  )[0];

  const checkoutMutation = useMutation({
    mutationFn: () =>
      createStripeCheckoutSession({
        leaseId: lease!.id,
        amount: totalDue,
        invoiceId: nextDue?.id,
      }),
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
  });

  const autopayMutation = useMutation({
    mutationFn: () =>
      autopay?.isActive
        ? disableAutopay(lease!.id)
        : enableAutopay(lease!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['autopay'] }),
  });

  return (
    <WorkspaceShell title="Payments" backHref="/feed" backLabel="Feed">
      {/* Balance due card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-[#10B981]" />
              <CardTitle>Balance Due</CardTitle>
            </div>
            {totalDue > 0 && <AlertTriangle size={16} className="text-[#F59E0B]" />}
          </div>
        </CardHeader>
        <CardContent>
          {loadingInvoices ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-3xl font-bold text-[#F8FAFC]">
                  {formatCurrency(totalDue)}
                </p>
                {nextDue && (
                  <p className="mt-1 text-sm text-[#94A3B8]">
                    Due {formatDate(nextDue.dueDate)}
                  </p>
                )}
                {totalDue === 0 && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[#10B981]">
                    <CheckCircle2 size={14} /> No outstanding balance
                  </p>
                )}
              </div>
              {totalDue > 0 && (
                <Button
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending || !lease}
                  className="gap-2"
                >
                  {checkoutMutation.isPending ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <ExternalLink size={14} />
                  )}
                  Pay Now
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Autopay toggle */}
      {lease && (
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[#F8FAFC]">Autopay</p>
                <p className="text-sm text-[#94A3B8]">
                  {autopay?.isActive
                    ? 'Autopay is enabled. Rent is charged automatically on the due date.'
                    : 'Enable autopay to never miss a payment.'}
                </p>
              </div>
              <Button
                variant={autopay?.isActive ? 'destructive' : 'default'}
                size="sm"
                onClick={() => autopayMutation.mutate()}
                disabled={autopayMutation.isPending}
              >
                {autopayMutation.isPending ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : autopay?.isActive ? (
                  'Disable'
                ) : (
                  'Enable'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Open invoices */}
      {openInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Open Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-[#1E3350]">
              {openInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">{inv.description}</p>
                    <p className="text-xs text-[#94A3B8]">Due {formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#F8FAFC]">
                      {formatCurrency(inv.amount)}
                    </span>
                    {statusBadge(inv.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            {lease && (
              <Link
                href="/payments/ledger"
                className="inline-flex items-center gap-1 text-xs text-[#3B82F6] hover:underline"
              >
                View full ledger <ArrowRight size={12} />
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loadingPayments ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : payments.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#94A3B8]">No payment history yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-[#1E3350]">
              {payments.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#94A3B8]" />
                    <div>
                      <p className="text-sm font-medium text-[#F8FAFC]">
                        {p.invoiceId ? `Invoice #${p.invoiceId}` : 'Payment'}
                      </p>
                      <p className="text-xs text-[#94A3B8]">{formatDate(p.paymentDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-[#F8FAFC]">
                      {formatCurrency(p.amount)}
                    </span>
                    {statusBadge(p.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
