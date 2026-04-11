'use client';

import { AlertTriangle, Clock, Calendar, DollarSign, Users, Home, Wrench, Activity } from 'lucide-react';
import { IntentBar, SignalCard, DecisionCard, SectionCard } from '@/components/copilot';
import { useBriefing } from '@/app/hooks/useBriefing';

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const eventTypeIcon: Record<string, React.ElementType> = {
  tour: Users,
  move_in: Home,
  move_out: Home,
  inspection: Activity,
  maintenance: Wrench,
  lease_expiration: Clock,
  signing: DollarSign,
};

export default function BriefingPage() {
  const { data, isLoading, error, executeMutation, dismissDecision } = useBriefing();

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1440px] px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded-[14px] bg-[#0F1B31]" />
          <div className="h-14 rounded-[18px] bg-[#0F1B31]" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-[24px] bg-[#0F1B31]" />)}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1440px] px-6 py-8">
      <div className="space-y-6">
        {/* Briefing Hero */}
        <div className="glass-panel rounded-[24px] p-6">
          <h1 className="font-[family-name:var(--font-space)] text-3xl font-bold text-[#F8FAFC]">
            {greeting}, <span className="text-[#3B82F6]">Operator</span>
          </h1>
          <p className="mt-1 font-mono text-sm text-[#94A3B8]">{dateStr}</p>

          {data && (
            <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-1">
              {data.metrics.atRiskAmount > 0 && (
                <div className="signal-pulse flex shrink-0 items-center gap-2 rounded-full border border-[#F43F5E]/20 bg-[#F43F5E]/5 px-3 py-1.5 font-mono text-xs text-[#F43F5E]">
                  <DollarSign size={12} />
                  ${data.metrics.atRiskAmount.toLocaleString()} at risk
                </div>
              )}
              {data.metrics.pendingDecisions > 0 && (
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-3 py-1.5 font-mono text-xs text-[#F59E0B]">
                  <AlertTriangle size={12} />
                  {data.metrics.pendingDecisions} decisions pending
                </div>
              )}
              {data.metrics.todayEvents > 0 && (
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/5 px-3 py-1.5 font-mono text-xs text-[#38BDF8]">
                  <Calendar size={12} />
                  {data.metrics.todayEvents} events today
                </div>
              )}
              {data.metrics.overduePayments > 0 && (
                <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#F43F5E]/20 bg-[#F43F5E]/5 px-3 py-1.5 font-mono text-xs text-[#F43F5E]">
                  <Clock size={12} />
                  {data.metrics.overduePayments} overdue
                </div>
              )}
            </div>
          )}
        </div>

        <IntentBar />

        {error && (
          <div className="rounded-[14px] border border-[#F43F5E]/20 bg-[#F43F5E]/5 p-3 text-sm text-[#F43F5E]">
            Failed to load briefing data.
          </div>
        )}

        {/* Three-Column Briefing Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SectionCard title="Critical Signals" subtitle="System-detected risks & anomalies">
            {!data?.signals.length ? (
              <p className="text-sm text-[#94A3B8]">No critical signals. Operations normal.</p>
            ) : (
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {data.signals.map((s) => <SignalCard key={s.id} signal={s} />)}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Needs Your Decision" subtitle="Actions requiring your judgment">
            {!data?.decisions.length ? (
              <p className="text-sm text-[#94A3B8]">No pending decisions. All clear.</p>
            ) : (
              <div className="max-h-[400px] space-y-3 overflow-y-auto">
                {data.decisions.map((d) => (
                  <DecisionCard
                    key={d.id}
                    decision={d}
                    onExecute={async (endpoint, method, body) => { await executeMutation.mutateAsync({ endpoint, method, body }); }}
                    onDismiss={dismissDecision}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Today&apos;s Schedule" subtitle="Inspections, tours, move-ins & more">
            {!data?.events.length ? (
              <p className="text-sm text-[#94A3B8]">No events scheduled for today.</p>
            ) : (
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {data.events.map((event) => {
                  const Icon = eventTypeIcon[event.type] ?? Activity;
                  return (
                    <div key={event.id} className="flex items-start gap-3 rounded-[14px] bg-[#0F1B31] p-3 transition-all duration-[180ms] hover:bg-[#17304E]">
                      <div className="rounded-[10px] bg-[#3B82F6]/10 p-1.5">
                        <Icon size={14} className="text-[#3B82F6]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-[#F8FAFC]">{event.title}</p>
                        <p className="text-xs text-[#94A3B8]">
                          {event.propertyName}{event.unitName ? ` - ${event.unitName}` : ''}
                        </p>
                      </div>
                      <span className="whitespace-nowrap font-mono text-xs text-[#94A3B8]">
                        {formatTime(event.scheduledAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
