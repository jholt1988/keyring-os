// Minimal Sidebar - Operator-first navigation
// Two-tier structure: primary (operator domains) + secondary (admin utilities)

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Wrench,
  Home,
  Users,
  BarChart3,
  FolderOpen,
  MessageSquare,
  Settings,
  ChevronLeft,
  Menu,
  Zap,
  ShieldCheck,
  PenLine,
  Banknote,
  CalendarClock,
  Layers3,
  Search,
} from 'lucide-react';
import { useOperatorData } from '@/features/operator/context/operator-data-context';
import { LogoutButton } from '@/components/shell/logout-button';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

export function MinimalSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Pull live operator metrics for badge counts
  let pendingApprovals = 0;
  let openMaintenance = 0;
  let pendingApplications = 0;
  let activeWorkflows = 0;

  try {
    const { data } = useOperatorData();
    pendingApprovals = data.approvals?.length ?? 0;
    openMaintenance = data.metrics?.maintenance?.open ?? data.maintenanceDispatch?.metrics?.openRequests ?? 0;
    pendingApplications = data.applications?.metrics?.needsScreening ?? 0;
    activeWorkflows = data.workflows?.groups?.reduce((sum, g) => sum + g.items.length, 0) ?? 0;
  } catch {
    // Context not available yet — use static badges
  }

  // Primary: Operator domain views (the core of the app)
  const primaryNav: NavItem[] = [
    { icon: LayoutDashboard, label: 'Command Center', href: '/' },
    { icon: Layers3, label: 'Workflows', href: '/workflows', badge: activeWorkflows || undefined },
    { icon: ClipboardList, label: 'Applications', href: '/applications', badge: pendingApplications || undefined },
    { icon: PenLine, label: 'Lease Signing', href: '/leasing' },
    { icon: Wrench, label: 'Maintenance', href: '/maintenance', badge: openMaintenance || undefined },
    { icon: Search, label: 'Inspections', href: '/inspections' },
    { icon: CalendarClock, label: 'Renewals', href: '/renewals' },
    { icon: Banknote, label: 'Owner Statements', href: '/financials' },
    { icon: Home, label: 'Portfolio', href: '/portfolio' },
    { icon: ShieldCheck, label: 'Approvals', href: '/operator?view=approvals', badge: pendingApprovals || undefined },
  ];

  // Secondary: Admin utilities that don't overlap with Operator
  const secondaryNav: NavItem[] = [
    { icon: Users, label: 'Tenants', href: '/tenants' },
    { icon: MessageSquare, label: 'Messages', href: '/messages' },
    { icon: FolderOpen, label: 'Documents', href: '/documents' },
    { icon: BarChart3, label: 'Reports', href: '/reports' },
  ];

  const bottomNav: NavItem[] = [
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-20'
      }`}
    >
      <div className="flex h-full flex-col border-r border-[#1E3350] bg-[#0B1628]">
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-center border-b border-[#1E3350] px-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3B82F6]">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-[#1E3350] bg-[#0B1628] text-[#94A3B8] transition-colors hover:bg-[#17304E] hover:text-white"
        >
          {collapsed ? (
            <Menu className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>

        {/* Primary Navigation — Operator Domains */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto py-4" aria-label="Primary navigation">
          {primaryNav.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}

          {/* Divider between primary and secondary */}
          <div className="mx-3 my-3 border-t border-[#1E3350]" />

          {secondaryNav.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-[#1E3350] py-4">
          {bottomNav.map((item) => (
            <SidebarLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
          ))}
          <LogoutButton collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`group relative mx-2 flex items-center justify-center rounded-xl py-3 transition-all duration-150 hover:bg-[#17304E] ${
        isActive ? 'bg-[#17304E] text-white' : 'text-[#94A3B8]'
      }`}
      title={collapsed ? item.label : undefined}
    >
      <div className="relative">
        <Icon className="h-5 w-5" />
        {item.badge && item.badge > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#F43F5E] text-[10px] font-medium text-white">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {collapsed && (
        <span className="absolute left-full ml-2 hidden rounded-lg bg-[#13233C] px-3 py-2 text-sm text-white group-hover:block z-50">
          {item.label}
          {item.badge ? ` (${item.badge})` : ''}
        </span>
      )}
    </Link>
  );
}