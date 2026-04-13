'use client';

import { AlertTriangle, Calendar, Clock, DollarSign, Activity, Home, Users, Wrench } from 'lucide-react';
import type { ReactElement } from 'react';
import { useBriefing } from '@/app/hooks/useBriefing';
import { DecisionCard, SignalCard, SectionCard } from '@/components/copilot';

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const eventTypeIcon: Record<string, () => ReactElement> = {
  tour: () => <Users size={15} className="text-[#8B5CF6]" />,
  move_in: () => <Home size={15} className="text-[#22C55E]" />,
  move_out: () => <Home size={15} className="text-[#F97316]" />,
  inspection: () => <Activity size={15} className="text-[#38BDF8]" />,
  maintenance: () => <Wrench size={15} className="text-[#14B8A6]" />,
  lease_expiration: () => <Clock size={15} className="text-[#F59E0B]" />,
  signing: () => <DollarSign size={15} className="text-[#10B981]" />,
};

function DecisionContractGap() {
  return (
    <div className="rounded-[22px] border border-[#F59E0B]/20 bg-[#F59E0B]/6 p-4 text-sm text-[#F9D38B]">
      <div className="flex items-start gap-3">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#F59E0B]" />
        <div>
          <p className="font-medium text-[#F8E4B0]">Decision contract gap detected</p>
          <p className="mt-1 text-xs leading-relaxed text-[#D4B26A]">
            The current backend decision payload still exposes legacy fields like <code className="rounded bg-black/20 px-1 py-0.5">context</code> and <code className="rounded bg-black/20 px-1 py-0.5">urgency</code>. The directive target also needs <code className="rounded bg-black/20 px-1 py-0.5">type</code>, <code className="rounded bg-black/20 px-1 py-0.5">priority</code>, <code className="rounded bg-black/20 px-1 py-0.5">summary</code>, and <code className="rounded bg-black/20 px-1 py-0.5">reasoning[]</code> for first-class decision rendering.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DailyBrief() {
  const { data, isLoading, error, executeMutation, dismissDecision } = useBriefing();

  const topSignals = data?.signals.slice(0, 3) ?? [];
  const topDecisions = data?.decisions.slice(0, 3) ?? [];
  const topEvents = data?.events.slice(0, 3) ?? [];

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="h-[240px] rounded-[28px] bg-white/[0.04] animate-pulse" />
          <div className="h-[240px] rounded-[28px] bg-white/[0.04] animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="glass-panel rounded-[30px] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7FA7D9]">Briefing layer</p>
                <h2 className="mt-2 font-[family-name:var(--font-space)] text-3xl font-semibold tracking-tight text-[#F8FAFC]">
                  System awareness compressed into the next few moves.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8DA4C5]">
                  The interface stays minimal until a decision or action deserves focus.
                </p>
              </div>
              {data && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'At risk', value: `$${data.metrics.atRiskAmount.toLocaleString()}`, tone: 'text-[#F87171]' },
                    { label: 'Pending decisions', value: String(data.metrics.pendingDecisions), tone: 'text-[#FBBF24]' },
                    { label: 'Events today', value: String(data.metrics.todayEvents), tone: 'text-[#60A5FA]' },
                    { label: 'Overdue', value: String(data.metrics.overduePayments), tone: 'text-[#A78BFA]' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[20px] border border-white/8 bg-black/10 px-4 py-3">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-[#6E85A5]">{item.label}</div>
                      <div className={`mt-2 text-xl font-semibold ${item.tone}`}>{item.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DecisionContractGap />

          <div className="grid gap-6 lg:grid-cols-3">
            <SectionCard title="Critical Signals" subtitle="Top 3 risks worth attention now">
              <div className="space-y-3">
                {topSignals.length ? topSignals.map((signal) => <SignalCard key={signal.id} signal={signal} />) : (
                  <p className="text-sm text-[#94A3B8]">No critical signals right now.</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Needs Your Decision" subtitle="Judgment-first actions only">
              <div className="space-y-3">
                {topDecisions.length ? topDecisions.map((decision) => (
                  <DecisionCard
                    key={decision.id}
                    decision={decision}
                    onExecute={async (endpoint, method, body) => {
                      await executeMutation.mutateAsync({ endpoint, method, body });
                    }}
                    onDismiss={dismissDecision}
                  />
                )) : (
                  <p className="text-sm text-[#94A3B8]">No active decisions. System is clear.</p>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Scheduled Events" subtitle="Upcoming commitments with operational weight">
              <div className="space-y-3">
                {topEvents.length ? topEvents.map((event) => {
                  const Icon = eventTypeIcon[event.type] ?? (() => <Activity size={15} className="text-[#60A5FA]" />);
                  return (
                    <div key={event.id} className="rounded-[18px] border border-white/8 bg-white/[0.03] p-4 transition-all duration-[180ms] hover:border-white/12 hover:bg-white/[0.04]">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-[12px] border border-white/8 bg-black/10 p-2">
                          <Icon />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-[#F8FAFC]">{event.title}</div>
                          <div className="mt-1 text-xs text-[#8DA4C5]">
                            {event.propertyName}{event.unitName ? `, ${event.unitName}` : ''}
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full border border-white/8 bg-black/10 px-2.5 py-1 text-[11px] text-[#B8CAE2]">
                          <Calendar size={12} />
                          {formatTime(event.scheduledAt)}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-sm text-[#94A3B8]">No meaningful events scheduled.</p>
                )}
              </div>
            </SectionCard>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-[28px] p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7FA7D9]">Execution layer</p>
            <h3 className="mt-2 text-lg font-semibold text-[#F8FAFC]">Dynamic surfaces, not permanent pages.</h3>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-[#8DA4C5]">
              <p>Routes remain as deep-link anchors, but the interaction model is now command-first.</p>
              <p>The radial system drives domain selection, then routes collapse into the minimum surface needed to act.</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#7FA7D9]">Rendering rules</p>
            <div className="mt-4 space-y-3 text-sm text-[#C8D7EA]">
              <div className="rounded-[18px] border border-white/8 bg-black/10 p-4">Everything visible must either represent state, present a decision, or trigger an action.</div>
              <div className="rounded-[18px] border border-white/8 bg-black/10 p-4">Concurrency stays limited to the top few actions. The rest should reveal on demand.</div>
              <div className="rounded-[18px] border border-white/8 bg-black/10 p-4">The UI should know which domain is active before asking the user to navigate.</div>
            </div>
          </div>

          {error && (
            <div className="rounded-[22px] border border-[#F43F5E]/20 bg-[#F43F5E]/6 p-4 text-sm text-[#F8B4C2]">
              Briefing data failed to load. The decision surface cannot be trusted until server state returns.
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
