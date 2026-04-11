'use client';

import { Mail, MessageSquare, Phone, Bell, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const typeIcons: Record<string, React.ElementType> = {
  payment: FileText,
  maintenance: Bell,
  communication: MessageSquare,
  notice: Mail,
  lease: FileText,
};

const typeColors: Record<string, string> = {
  payment: 'text-[#10B981] bg-[#10B981]/10',
  maintenance: 'text-[#14B8A6] bg-[#14B8A6]/10',
  communication: 'text-[#3B82F6] bg-[#3B82F6]/10',
  notice: 'text-[#F59E0B] bg-[#F59E0B]/10',
  lease: 'text-[#8B5CF6] bg-[#8B5CF6]/10',
};

interface TimelineEvent {
  id: string;
  date: string;
  type: string;
  title: string;
  details?: string;
}

interface CommunicationTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function CommunicationTimeline({ events, className }: CommunicationTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[#64748B]">No activity recorded</p>
    );
  }

  return (
    <div className={cn('relative space-y-0', className)}>
      <div className="absolute left-[19px] top-2 bottom-2 w-px bg-[#1E3350]" />
      {events.map((event) => {
        const Icon = typeIcons[event.type] ?? FileText;
        const colorClass = typeColors[event.type] ?? 'text-[#94A3B8] bg-[#0F1B31]';
        const dateStr = new Date(event.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        const timeStr = new Date(event.date).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        });

        return (
          <div key={event.id} className="relative flex gap-3 py-2 pl-1">
            <div className={cn('z-10 flex size-[38px] shrink-0 items-center justify-center rounded-full', colorClass)}>
              <Icon size={16} />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm font-medium text-[#F8FAFC]">{event.title}</p>
              {event.details && (
                <p className="mt-0.5 truncate text-xs text-[#94A3B8]">{event.details}</p>
              )}
              <p className="mt-1 font-mono text-[10px] text-[#64748B]">
                {dateStr} · {timeStr}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
