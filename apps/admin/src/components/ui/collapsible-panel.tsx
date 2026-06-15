'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState, ReactNode } from 'react';
import { Button } from './button';

interface CollapsiblePanelProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  icon?: ReactNode;
  badge?: string | number;
  variant?: 'default' | 'compact' | 'bordered';
  onToggle?: (expanded: boolean) => void;
  actions?: ReactNode;
}

export function CollapsiblePanel({
  title,
  children,
  defaultExpanded = false,
  className = '',
  icon,
  badge,
  variant = 'default',
  onToggle,
  actions
}: CollapsiblePanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (onToggle) onToggle(newExpanded);
  };

  const baseClasses = {
    default: 'rounded-lg border border-white/10 bg-[#0B1628]',
    compact: 'rounded-lg border border-white/10 bg-[#0B1628]',
    bordered: 'rounded-lg border border-white/10 bg-transparent'
  };

  const contentClasses = {
    default: 'p-4',
    compact: 'p-3',
    bordered: 'p-4'
  };

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      {/* Header */}
      <div 
        className={`flex cursor-pointer items-center justify-between ${variant === 'compact' ? 'p-3' : 'p-4'} ${expanded ? 'border-b border-white/10' : ''}`}
        onClick={handleToggle}
        role="button"
        aria-expanded={expanded}
        aria-controls={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            aria-label={expanded ? 'Collapse section' : 'Expand section'}
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          
          {icon && <span className="text-[#94A3B8]">{icon}</span>}
          
          <h3 className="text-sm font-semibold text-[#F8FAFC]">
            {title}
          </h3>
          
          {badge !== undefined && (
            <span className="rounded-full bg-[#3B82F6]/20 px-2 py-0.5 text-xs font-medium text-[#3B82F6]">
              {badge}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      </div>

      {/* Content */}
      <div
        id={`collapsible-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className={`${contentClasses[variant]} ${expanded ? 'block' : 'hidden'}`}
        aria-hidden={!expanded}
      >
        {children}
      </div>
    </div>
  );
}

// Example usage component for testing
export function ExampleCollapsibleDashboard() {
  return (
    <div className="space-y-4">
      <CollapsiblePanel
        title="Financial Overview"
        badge="3"
        defaultExpanded={true}
        actions={
          <Button size="sm" variant="outline">
            Refresh
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-[#0F1B31] p-3">
            <div className="text-xs uppercase tracking-wider text-[#94A3B8]">Revenue</div>
            <div className="mt-2 text-lg font-semibold text-[#F8FAFC]">$245,380</div>
            <div className="mt-1 text-xs text-[#10B981]">+12% from last month</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0F1B31] p-3">
            <div className="text-xs uppercase tracking-wider text-[#94A3B8]">Expenses</div>
            <div className="mt-2 text-lg font-semibold text-[#F8FAFC]">$98,450</div>
            <div className="mt-1 text-xs text-[#F43F5E]">+8% from last month</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-[#0F1B31] p-3">
            <div className="text-xs uppercase tracking-wider text-[#94A3B8]">Profit</div>
            <div className="mt-2 text-lg font-semibold text-[#F8FAFC]">$146,930</div>
            <div className="mt-1 text-xs text-[#10B981]">+15% from last month</div>
          </div>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel
        title="Recent Activity"
        variant="compact"
        badge="12"
      >
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
              <div className="text-sm text-[#F8FAFC]">User login from new device</div>
              <div className="text-xs text-[#94A3B8]">2 hours ago</div>
            </div>
          ))}
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel
        title="Alerts & Notifications"
        variant="bordered"
        badge="!"
      >
        <div className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 p-3">
          <div className="text-sm text-[#F8FAFC]">
            System maintenance scheduled for tomorrow at 2:00 AM UTC
          </div>
          <div className="mt-2 text-xs text-[#94A3B8]">
            Estimated downtime: 30 minutes. Please save your work.
          </div>
        </div>
      </CollapsiblePanel>
    </div>
  );
}