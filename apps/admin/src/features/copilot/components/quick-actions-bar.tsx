// Quick Actions Bar - P0 Design Item 7
// Floating action bar for common operations

'use client';

import { Plus, CreditCard, FileText, Wrench, Users, Home } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  { icon: Plus, label: 'New Lease', href: '/leases/new', color: 'bg-[#8B5CF6]' },
  { icon: CreditCard, label: 'Collect Rent', href: '/payments?action=collect', color: 'bg-[#10B981]' },
  { icon: Wrench, label: 'Create WO', href: '/maintenance/new', color: 'bg-[#14B8A6]' },
  { icon: Users, label: 'Add Tenant', href: '/tenants/new', color: 'bg-[#60A5FA]' },
  { icon: Home, label: 'Add Property', href: '/properties/new', color: 'bg-[#F59E0B]' },
  { icon: FileText, label: 'Send Statement', href: '/financials/statements/new', color: 'bg-[#22D3EE]' },
];

export function QuickActionsBar() {
  return (
    <div className="fixed bottom-6 left-24 right-6 z-30 mx-auto max-w-4xl">
      <div className="glass-panel rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
            Quick Actions
          </span>
          
          <div className="flex items-center gap-1">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-white transition-all duration-150 hover:bg-white/10 hover:scale-[0.98] active:scale-[0.96]"
                >
                  <div className={`rounded-lg p-1 ${action.color}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <span className="hidden sm:inline">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}