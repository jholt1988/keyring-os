import React from 'react';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  label: string;
  date: string;
  status: 'completed' | 'active' | 'upcoming';
}

export function TimelineRail({ events }: { events: TimelineEvent[] }) {
  if (!events.length) return null;

  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-2">
      {events.map((event, i) => (
        <React.Fragment key={event.id}>
          <div className="flex min-w-[80px] flex-col items-center">
            <div className={cn(
              'h-2.5 w-2.5 rounded-full',
              event.status === 'completed' && 'bg-green-500',
              event.status === 'active' && 'animate-pulse bg-primary',
              event.status === 'upcoming' && 'bg-muted-foreground/30',
            )} />
            <p className="mt-1 text-center text-[10px] leading-tight text-muted-foreground">{event.label}</p>
            <p className="font-mono text-[9px] text-muted-foreground/60">{event.date}</p>
          </div>
          {i < events.length - 1 && (
            <div className={cn('h-px min-w-[20px] flex-1', event.status === 'completed' ? 'bg-green-500/50' : 'bg-border')} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
