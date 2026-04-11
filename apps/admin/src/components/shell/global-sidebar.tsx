'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Wallet,
  Users,
  UserCheck,
  Home,
  Wrench,
  RefreshCw,
  BookOpen,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const lanes = [
  { label: 'Briefing', icon: LayoutDashboard, href: '/' },
  { label: 'Portfolio', icon: Building2, href: '/portfolio' },
  { label: 'Tenants', icon: UserCheck, href: '/tenants' },
  { label: 'Payments', icon: Wallet, href: '/payments' },
  { label: 'Leasing', icon: Home, href: '/leasing' },
  { label: 'Screening', icon: Users, href: '/screening' },
  { label: 'Repairs', icon: Wrench, href: '/repairs' },
  { label: 'Renewals', icon: RefreshCw, href: '/renewals' },
  { label: 'Financials', icon: BookOpen, href: '/financials' },
  { label: 'Workflows', icon: Settings, href: '/workflows' },
];

export function GlobalSidebar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 z-40 flex h-screen w-[88px] flex-col items-center border-r border-[#1E3350] bg-[#0B1628] py-6">
      <Link href="/" className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6]">
        <span className="font-[var(--font-space)] text-sm font-bold text-white">K</span>
      </Link>

      <div className="flex flex-1 flex-col items-center gap-1">
        {lanes.map((lane) => {
          const isActive = lane.href === '/'
            ? pathname === '/'
            : pathname.startsWith(lane.href);
          const Icon = lane.icon;

          return (
            <Link
              key={lane.href}
              href={lane.href}
              className={cn(
                'group flex w-16 flex-col items-center gap-1 rounded-xl px-2 py-2.5 transition-all duration-[180ms]',
                isActive
                  ? 'bg-[#17304E] text-[#F8FAFC]'
                  : 'text-[#94A3B8] hover:bg-[#17304E]/50 hover:text-[#CBD5E1]',
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium leading-none">{lane.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
