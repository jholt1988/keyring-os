import React from 'react';
import { Drawer } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface FocusViewProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  entityType?: 'Unit' | 'Tenant' | 'Property' | 'Transaction' | 'Applicant';
  icon?: React.ElementType;
  children: React.ReactNode;
  actions?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
}

export function FocusView({
  open,
  onClose,
  title,
  subtitle,
  entityType,
  icon: Icon,
  children,
  actions,
  primaryAction,
}: FocusViewProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="xl"
      title={title}
      subtitle={subtitle}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled || primaryAction.loading}
            >
              {primaryAction.loading ? 'Working...' : primaryAction.label}
            </Button>
          )}
        </>
      }
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#1E3350] bg-[#13233C] text-[#3B82F6]">
              <Icon size={24} />
            </div>
          )}
          {entityType && (
            <div>
              <span className="rounded-full bg-[#3B82F6]/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3B82F6]">
                {entityType} Focus
              </span>
            </div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      <div className="space-y-6">
        {children}
      </div>
    </Drawer>
  );
}
