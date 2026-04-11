'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  CalendarDays,
  DollarSign,
  Home,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  PenLine,
} from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchMyLease,
  fetchRenewalOffers,
  fetchSigningEnvelopes,
  fetchRecipientViewUrl,
  respondToRenewalOffer,
  type RenewalOffer,
  type EsignEnvelope,
} from '@/lib/tenant-api';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

function leaseStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'ACTIVE':    return <Badge variant="success">Active</Badge>;
    case 'PENDING':   return <Badge variant="warning">Pending</Badge>;
    case 'EXPIRED':   return <Badge variant="muted">Expired</Badge>;
    case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
    default:          return <Badge variant="muted">{status}</Badge>;
  }
}

function envelopeStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'SENT':       return <Badge variant="warning">Awaiting Signature</Badge>;
    case 'DELIVERED':  return <Badge variant="info">Delivered</Badge>;
    case 'COMPLETED':  return <Badge variant="success">Signed</Badge>;
    case 'DECLINED':   return <Badge variant="destructive">Declined</Badge>;
    case 'VOIDED':     return <Badge variant="muted">Voided</Badge>;
    default:           return <Badge variant="muted">{status}</Badge>;
  }
}

function offerStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':   return <Badge variant="warning">Pending Response</Badge>;
    case 'ACCEPTED':  return <Badge variant="success">Accepted</Badge>;
    case 'DECLINED':  return <Badge variant="destructive">Declined</Badge>;
    case 'EXPIRED':   return <Badge variant="muted">Expired</Badge>;
    default:          return <Badge variant="muted">{status}</Badge>;
  }
}

// ── Signing Panel ─────────────────────────────────────────────────────────────

function SigningPanel({ leaseId }: { leaseId: string }) {
  const [signingId, setSigningId] = useState<number | null>(null);

  const { data: envelopes = [], isLoading } = useQuery({
    queryKey: ['esign-envelopes', leaseId],
    queryFn: () => fetchSigningEnvelopes(leaseId),
  });

  const signMutation = useMutation({
    mutationFn: (envelopeId: number) => fetchRecipientViewUrl(envelopeId),
    onSuccess: ({ url }) => {
      window.open(url, '_blank', 'noopener,noreferrer');
      setSigningId(null);
    },
  });

  const pending = envelopes.filter(
    (e) => !['COMPLETED', 'DECLINED', 'VOIDED'].includes(e.status.toUpperCase()),
  );

  if (isLoading) return <Skeleton className="h-24 w-full rounded-[14px]" />;
  if (envelopes.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PenLine size={16} className="text-[#94A3B8]" />
          <CardTitle>Documents to Sign</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {envelopes.map((env: EsignEnvelope) => {
            const needsSignature = !['COMPLETED', 'DECLINED', 'VOIDED'].includes(
              env.status.toUpperCase(),
            );
            return (
              <div
                key={env.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-[#1E3350] bg-[#0F1B31] px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={16} className="text-[#94A3B8] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#F8FAFC] truncate">
                      Lease Agreement
                    </p>
                    <p className="text-xs text-[#94A3B8]">Sent {formatDate(env.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {envelopeStatusBadge(env.status)}
                  {needsSignature && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSigningId(env.id);
                        signMutation.mutate(env.id);
                      }}
                      disabled={signMutation.isPending && signingId === env.id}
                    >
                      {signMutation.isPending && signingId === env.id ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <ExternalLink size={12} />
                      )}
                      Sign Now
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {pending.length > 0 && (
            <p className="text-xs text-[#F59E0B] flex items-center gap-1.5">
              <Clock size={12} />
              {pending.length} document{pending.length > 1 ? 's' : ''} awaiting your signature.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Renewal Panel ─────────────────────────────────────────────────────────────

function RenewalPanel({ leaseId, currentRent }: { leaseId: string; currentRent: number }) {
  const qc = useQueryClient();
  const [responded, setResponded] = useState<Record<number, 'ACCEPTED' | 'DECLINED'>>({});

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['renewal-offers', leaseId],
    queryFn: () => fetchRenewalOffers(leaseId),
  });

  const respondMutation = useMutation({
    mutationFn: ({
      offerId,
      decision,
    }: {
      offerId: number;
      decision: 'ACCEPTED' | 'DECLINED';
    }) => respondToRenewalOffer(leaseId, offerId, decision),
    onSuccess: (_, { offerId, decision }) => {
      setResponded((prev) => ({ ...prev, [offerId]: decision }));
      qc.invalidateQueries({ queryKey: ['renewal-offers', leaseId] });
    },
  });

  if (isLoading) return <Skeleton className="h-32 w-full rounded-[14px]" />;
  if (offers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[#94A3B8]" />
          <CardTitle>Renewal Offers</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {offers.map((offer: RenewalOffer) => {
            const localDecision = responded[offer.id];
            const finalStatus = localDecision ?? offer.status;
            const isPending =
              finalStatus.toUpperCase() === 'PENDING' ||
              finalStatus.toUpperCase() === 'OFFERED';
            const rentDiff = offer.proposedRent - currentRent;
            const rentDiffLabel =
              rentDiff === 0
                ? 'No change'
                : rentDiff > 0
                  ? `+${formatCurrency(rentDiff)}/mo`
                  : `${formatCurrency(rentDiff)}/mo`;

            return (
              <div
                key={offer.id}
                className="rounded-lg border border-[#1E3350] bg-[#0F1B31] p-4 flex flex-col gap-4"
              >
                {/* Offer header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#F8FAFC]">
                      {formatDate(offer.proposedStart)} – {formatDate(offer.proposedEnd)}
                    </p>
                    {offer.expiresAt && (
                      <p className="text-xs text-[#94A3B8] mt-0.5">
                        Offer expires {formatDate(offer.expiresAt)}
                        {daysUntil(offer.expiresAt) > 0 &&
                          ` (${daysUntil(offer.expiresAt)} days)`}
                      </p>
                    )}
                  </div>
                  {offerStatusBadge(finalStatus)}
                </div>

                {/* Rent comparison */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-[#94A3B8]">Current rent</p>
                    <p className="font-semibold text-[#F8FAFC]">{formatCurrency(currentRent)}</p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Proposed rent</p>
                    <p className="font-semibold text-[#F8FAFC]">
                      {formatCurrency(offer.proposedRent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#94A3B8]">Difference</p>
                    <p
                      className={`font-semibold ${
                        rentDiff > 0
                          ? 'text-[#F59E0B]'
                          : rentDiff < 0
                            ? 'text-[#10B981]'
                            : 'text-[#94A3B8]'
                      }`}
                    >
                      {rentDiffLabel}
                    </p>
                  </div>
                </div>

                {/* Message */}
                {offer.message && (
                  <p className="text-sm text-[#94A3B8] border-t border-[#1E3350] pt-3">
                    {offer.message}
                  </p>
                )}

                {/* Actions */}
                {isPending && (
                  <div className="flex gap-2 border-t border-[#1E3350] pt-3">
                    <Button
                      size="sm"
                      onClick={() =>
                        respondMutation.mutate({ offerId: offer.id, decision: 'ACCEPTED' })
                      }
                      disabled={respondMutation.isPending}
                      className="flex-1"
                    >
                      {respondMutation.isPending &&
                      respondMutation.variables?.offerId === offer.id &&
                      respondMutation.variables?.decision === 'ACCEPTED' ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        respondMutation.mutate({ offerId: offer.id, decision: 'DECLINED' })
                      }
                      disabled={respondMutation.isPending}
                      className="flex-1"
                    >
                      {respondMutation.isPending &&
                      respondMutation.variables?.offerId === offer.id &&
                      respondMutation.variables?.decision === 'DECLINED' ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <XCircle size={12} />
                      )}
                      Decline
                    </Button>
                  </div>
                )}

                {/* Post-response confirmation */}
                {!isPending && localDecision && (
                  <p
                    className={`text-xs flex items-center gap-1.5 ${
                      localDecision === 'ACCEPTED' ? 'text-[#10B981]' : 'text-[#94A3B8]'
                    }`}
                  >
                    {localDecision === 'ACCEPTED' ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <XCircle size={12} />
                    )}
                    {localDecision === 'ACCEPTED'
                      ? 'Offer accepted. Your property manager will follow up.'
                      : 'Offer declined.'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function LeasePage() {
  const { data: lease, isLoading } = useQuery({
    queryKey: ['my-lease'],
    queryFn: fetchMyLease,
  });

  if (isLoading) {
    return (
      <WorkspaceShell title="My Lease">
        <Skeleton className="h-48 w-full rounded-[14px]" />
        <Skeleton className="h-32 w-full rounded-[14px]" />
      </WorkspaceShell>
    );
  }

  if (!lease) {
    return (
      <WorkspaceShell title="My Lease">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Home size={32} className="mx-auto mb-3 text-[#94A3B8]" />
            <p className="text-sm text-[#94A3B8]">No active lease found.</p>
          </CardContent>
        </Card>
      </WorkspaceShell>
    );
  }

  const daysLeft = daysUntil(lease.endDate);
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 60;

  return (
    <WorkspaceShell title="My Lease">
      {/* Lease summary */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>
                {lease.unit?.property?.name ?? 'Property'} — Unit{' '}
                {lease.unit?.unitNumber ?? '—'}
              </CardTitle>
              {lease.unit?.property?.address && (
                <p className="text-sm text-[#94A3B8] mt-1">{lease.unit.property.address}</p>
              )}
            </div>
            {leaseStatusBadge(lease.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-[#94A3B8]">Lease start</p>
              <p className="font-semibold text-[#F8FAFC]">{formatDate(lease.startDate)}</p>
            </div>
            <div>
              <p className="text-[#94A3B8]">Lease end</p>
              <p className={`font-semibold ${isExpiringSoon ? 'text-[#F59E0B]' : 'text-[#F8FAFC]'}`}>
                {formatDate(lease.endDate)}
              </p>
            </div>
            <div>
              <p className="text-[#94A3B8]">Monthly rent</p>
              <p className="font-semibold text-[#F8FAFC]">{formatCurrency(lease.rentAmount)}</p>
            </div>
            <div>
              <p className="text-[#94A3B8]">Security deposit</p>
              <p className="font-semibold text-[#F8FAFC]">{formatCurrency(lease.depositAmount)}</p>
            </div>
          </div>

          {isExpiringSoon && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/5 px-4 py-3">
              <Clock size={16} className="text-[#F59E0B] shrink-0" />
              <p className="text-sm text-[#F59E0B]">
                Your lease expires in <strong>{daysLeft} days</strong>. Check renewal offers below.
              </p>
            </div>
          )}

          {lease.noticePeriodDays > 0 && (
            <p className="mt-3 text-xs text-[#94A3B8]">
              Notice period: {lease.noticePeriodDays} days required before move-out.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Signing panel */}
      <SigningPanel leaseId={lease.id} />

      {/* Renewal offers */}
      <RenewalPanel leaseId={lease.id} currentRent={lease.rentAmount} />

      {/* Lease details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-[#94A3B8]" />
            <CardTitle>Lease Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b border-[#1E3350] pb-2">
              <span className="text-[#94A3B8]">Status</span>
              <span className="font-medium text-[#F8FAFC]">{lease.status}</span>
            </div>
            <div className="flex justify-between border-b border-[#1E3350] pb-2">
              <span className="text-[#94A3B8]">Monthly rent</span>
              <span className="font-medium text-[#F8FAFC]">{formatCurrency(lease.rentAmount)}</span>
            </div>
            <div className="flex justify-between border-b border-[#1E3350] pb-2">
              <span className="text-[#94A3B8]">Security deposit</span>
              <span className="font-medium text-[#F8FAFC]">
                {formatCurrency(lease.depositAmount)}
              </span>
            </div>
            <div className="flex justify-between border-b border-[#1E3350] pb-2">
              <span className="text-[#94A3B8]">Notice period</span>
              <span className="font-medium text-[#F8FAFC]">{lease.noticePeriodDays} days</span>
            </div>
            {lease.moveOutAt && (
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Move-out date</span>
                <span className="font-medium text-[#F8FAFC]">{formatDate(lease.moveOutAt)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
