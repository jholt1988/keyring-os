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
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-12 rounded-xl bg-muted" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl bg-muted" />)}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-light">
            {greeting}, <span className="font-semibold">Operator</span>
          </h1>
          <p className="font-mono text-sm text-muted-foreground">{dateStr}</p>
        </div>

        <IntentBar />

        {/* Metrics Strip */}
        {data && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {data.metrics.atRiskAmount > 0 && (
              <div className="flex shrink-0 items-center gap-2 rounded-full border border-red-500/20 bg-red-500/5 px-3 py-1.5 font-mono text-xs text-red-500">
                <DollarSign size={12} />
                ${data.metrics.atRiskAmount.toLocaleString()} at risk
              </div>
            )}
            {data.metrics.pendingDecisions > 0 && (
              <div className="flex shrink-0 items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 font-mono text-xs text-amber-500">
                <AlertTriangle size={12} />
                {data.metrics.pendingDecisions} decisions pending
              </div>
            )}
            {data.metrics.todayEvents > 0 && (
              <div className="flex shrink-0 items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 font-mono text-xs text-blue-500">
                <Calendar size={12} />
                {data.metrics.todayEvents} events today
              </div>
            )}
            {data.metrics.overduePayments > 0 && (
              <div className="flex shrink-0 items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 font-mono text-xs text-rose-500">
                <Clock size={12} />
                {data.metrics.overduePayments} overdue
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            Failed to load briefing data.
          </div>
        )}

        {/* Three-Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SectionCard title="Critical Signals" subtitle="System-detected risks & anomalies">
            {!data?.signals.length ? (
              <p className="text-sm text-muted-foreground">No critical signals. Operations normal.</p>
            ) : (
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {data.signals.map((s) => <SignalCard key={s.id} signal={s} />)}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Needs Your Decision" subtitle="Actions requiring your judgment">
            {!data?.decisions.length ? (
              <p className="text-sm text-muted-foreground">No pending decisions. All clear.</p>
            ) : (
              <div className="max-h-[400px] space-y-3 overflow-y-auto">
                {data.decisions.map((d) => (
                  <DecisionCard
                    key={d.id}
                    decision={d}
                    onExecute={(endpoint, method, body) => executeMutation.mutateAsync({ endpoint, method, body })}
                    onDismiss={dismissDecision}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Today's Schedule" subtitle="Inspections, tours, move-ins & more">
            {!data?.events.length ? (
              <p className="text-sm text-muted-foreground">No events scheduled for today.</p>
            ) : (
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {data.events.map((event) => {
                  const Icon = eventTypeIcon[event.type] ?? Activity;
                  return (
                    <div key={event.id} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted">
                      <div className="rounded-lg bg-primary/10 p-1.5">
                        <Icon size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.propertyName}{event.unitName ? ` - ${event.unitName}` : ''}
                        </p>
                      </div>
                      <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
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
