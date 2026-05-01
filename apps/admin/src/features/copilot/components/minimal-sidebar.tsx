// Minimal Sidebar - P0 Design Item 7
// Icon-only navigation to reduce clutter

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  FileText, 
  Wrench, 
  Home, 
  Users, 
  BarChart3,
  FolderOpen,
  Settings,
  ChevronLeft,
  Menu,
  Zap
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Briefing', href: '/' },
  { icon: CreditCard, label: 'Payments', href: '/payments', badge: 3 },
  { icon: FileText, label: 'Leases', href: '/leasing' },
  { icon: Wrench, label: 'Repairs', href: '/maintenance', badge: 5 },
  { icon: Home, label: 'Properties', href: '/portfolio' },
  { icon: Users, label: 'Tenants', href: '/tenants' },
  { icon: BarChart3, label: 'Financials', href: '/financials' },
  { icon: FolderOpen, label: 'Documents', href: '/documents' },
];

const bottomNav: NavItem[] = [
  { icon: Settings, label: 'Settings', href: '/settings/security' },
];

export function MinimalSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

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

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto py-4">
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
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
                      {item.badge}
                    </span>
                  )}
                </div>
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <span className="absolute left-full ml-2 hidden rounded-lg bg-[#13233C] px-3 py-2 text-sm text-white group-hover:block z-50">
                    {item.label}
                    {item.badge && ` (${item.badge})`}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-[#1E3350] py-4">
          {bottomNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative mx-2 flex items-center justify-center rounded-xl py-3 transition-all duration-150 hover:bg-[#17304E] ${
                  isActive ? 'bg-[#17304E] text-white' : 'text-[#94A3B8]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5" />
                
                {collapsed && (
                  <span className="absolute left-full ml-2 hidden rounded-lg bg-[#13233C] px-3 py-2 text-sm text-white group-hover:block z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}