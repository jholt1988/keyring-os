'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Building2, Wallet, Users, UserCheck, Home,
  Wrench, RefreshCw, BookOpen, Settings, ClipboardList, FolderOpen,
  Bell, MessageSquare, PenLine, BarChart2, ScrollText, Bot, Building, Zap, Shield, Cpu, BriefcaseBusiness, Calendar, TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchNotifications } from '@/lib/copilot-api';

const lanes = [
  { label: 'Briefing',    icon: LayoutDashboard, href: '/' },
  { label: 'Portfolio',   icon: Building2,        href: '/portfolio' },
  { label: 'Tenants',     icon: UserCheck,        href: '/tenants' },
  { label: 'Payments',    icon: Wallet,           href: '/payments' },
  { label: 'Leasing',     icon: Home,             href: '/leasing' },
  { label: 'Screening',   icon: Users,            href: '/screening' },
  { label: 'Repairs',     icon: Wrench,           href: '/repairs' },
  { label: 'Renewals',    icon: RefreshCw,        href: '/renewals' },
  { label: 'Financials',  icon: BookOpen,         href: '/financials' },
  { label: 'Inspections', icon: ClipboardList,    href: '/inspections' },
  { label: 'Documents',   icon: FolderOpen,       href: '/documents' },
  { label: 'Messages',    icon: MessageSquare,    href: '/messages' },
  { label: 'E-Sign',      icon: PenLine,          href: '/esignatures' },
  { label: 'Reports',     icon: BarChart2,        href: '/reports' },
  { label: 'Vendors',     icon: Building,         href: '/vendors' },
  { label: 'Tours',       icon: Calendar,         href: '/tours' },
  { label: 'Rent Opt',    icon: TrendingUp,        href: '/rent-optimization' },
  { label: 'CapEx',       icon: Zap,              href: '/capex' },
  { label: 'Billing',     icon: Wallet,           href: '/billing' },
  { label: 'Utilities',   icon: Cpu,              href: '/utility-billing' },
  { label: 'Insurance',   icon: Shield,           href: '/tenant-insurance' },
  { label: 'Moves',       icon: BriefcaseBusiness, href: '/move-orchestration' },
  { label: 'Owners',      icon: Building2,        href: '/owner-portal' },
  { label: 'AI Chat',     icon: Bot,              href: '/chatbot' },
  { label: 'Audit Log',   icon: ScrollText,       href: '/audit-log' },
  { label: 'QB',          icon: Settings,         href: '/settings/quickbooks' },
  { label: 'Devices',     icon: Cpu,              href: '/settings/smart-devices' },
  { label: 'Security',    icon: Shield,           href: '/settings/security' },
  { label: 'Workflows',   icon: Settings,         href: '/workflows' },
];

export function GlobalSidebar() {
  const pathname = usePathname();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => fetchNotifications({ unread: true }),
    refetchInterval: 60_000,
  });
  const unreadCount = (notifications as Array<{ isRead: boolean }>).filter((n) => !n.isRead).length;

  return (
    <nav className="fixed left-0 top-0 z-40 flex h-screen w-[88px] flex-col items-center border-r border-[#1E3350] bg-[#0B1628] py-6 overflow-y-auto">
      <Link href="/" className="mb-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3B82F6]">
        <span className="font-[var(--font-space)] text-sm font-bold text-white">K</span>
      </Link>

      <div className="flex flex-1 flex-col items-center gap-1">
        {lanes.map((lane) => {
          const isActive = lane.href === '/' ? pathname === '/' : pathname.startsWith(lane.href);
          const Icon = lane.icon;
          return (
            <Link
              key={lane.href}
              href={lane.href}
              className={cn(
                'group flex w-16 flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition-all duration-[180ms]',
                isActive ? 'bg-[#17304E] text-[#F8FAFC]' : 'text-[#94A3B8] hover:bg-[#17304E]/50 hover:text-[#CBD5E1]',
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium leading-none">{lane.label}</span>
            </Link>
          );
        })}

        {/* Notifications with unread badge */}
        <Link
          href="/notifications"
          className={cn(
            'group relative flex w-16 flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition-all duration-[180ms]',
            pathname.startsWith('/notifications') ? 'bg-[#17304E] text-[#F8FAFC]' : 'text-[#94A3B8] hover:bg-[#17304E]/50 hover:text-[#CBD5E1]',
          )}
        >
          <Bell size={20} strokeWidth={pathname.startsWith('/notifications') ? 2 : 1.5} />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F43F5E] px-0.5 text-[9px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="text-[10px] font-medium leading-none">Alerts</span>
        </Link>
      </div>
    </nav>
  );
}
