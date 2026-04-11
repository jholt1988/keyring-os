'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Wallet,
  Wrench,
  FolderOpen,
  MessageSquare,
  ClipboardCheck,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const lanes = [
  { label: 'Feed',        icon: LayoutDashboard, href: '/feed' },
  { label: 'My Lease',    icon: FileText,         href: '/lease' },
  { label: 'Payments',    icon: Wallet,           href: '/payments' },
  { label: 'Maintenance', icon: Wrench,           href: '/maintenance' },
  { label: 'Documents',   icon: FolderOpen,       href: '/documents' },
  { label: 'Messages',    icon: MessageSquare,    href: '/messages' },
  { label: 'Inspections', icon: ClipboardCheck,   href: '/inspections' },
  { label: 'Move Out',    icon: LogOut,           href: '/move-out' },
];

export function TenantSidebar() {
  const pathname = usePathname();

  return (
    <nav className="fixed left-0 top-0 z-40 flex h-screen w-[88px] flex-col items-center border-r border-[#1E3350] bg-[#0B1628] py-6">
      {/* Logo */}
      <Link
        href="/feed"
        className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B82F6]"
      >
        <span className="font-bold text-sm text-white">K</span>
      </Link>

      <div className="flex flex-1 flex-col items-center gap-1">
        {lanes.map((lane) => {
          const isActive = pathname === lane.href || pathname.startsWith(lane.href + '/');
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

      {/* Tenant badge */}
      <div className="mt-4 flex flex-col items-center gap-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#17304E] text-xs font-bold text-[#3B82F6]">
          T
        </div>
        <span className="text-[9px] text-[#94A3B8]">Tenant</span>
      </div>
    </nav>
  );
}
