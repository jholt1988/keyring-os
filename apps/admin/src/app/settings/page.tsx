'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Building2,
  CreditCard,
  Database,
  Globe,
  Key,
  Lock,
  Monitor,
  Settings,
  Shield,
  Smartphone,
  Users,
  Zap,
} from 'lucide-react';
import { ApprovalGate } from '@/features/operator';
import { WorkspaceShell } from '@/components/copilot';

interface SettingsSection {
  label: string;
  items: {
    href: string;
    icon: React.ElementType;
    title: string;
    description: string;
    badge?: string;
  }[];
}

const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    label: 'Security & Access',
    items: [
      {
        href: '/settings/security',
        icon: Shield,
        title: 'Security Events',
        description: 'Audit log of all authentication and authorization events across your organization.',
      },
      {
        href: '/settings/users',
        icon: Users,
        title: 'User Management',
        description: 'Invite team members, manage roles, and deactivate accounts.',
      },
      {
        href: '/settings/api-keys',
        icon: Key,
        title: 'API Keys',
        description: 'Generate and revoke programmatic access credentials.',
        badge: 'Soon',
      },
    ],
  },
  {
    label: 'Integrations',
    items: [
      {
        href: '/settings/quickbooks',
        icon: Database,
        title: 'QuickBooks',
        description: 'Sync your chart of accounts, transactions, and journal entries.',
      },
      {
        href: '/settings/smart-devices',
        icon: Smartphone,
        title: 'Smart Devices',
        description: 'Manage access-controlled smart lock and sensor integrations.',
      },
      {
        href: '/settings/billing',
        icon: CreditCard,
        title: 'Stripe Connect',
        description: 'Configure your connected Stripe account for tenant payment collection.',
      },
    ],
  },
  {
    label: 'Organization',
    items: [
      {
        href: '/settings/organization',
        icon: Building2,
        title: 'Organization Profile',
        description: 'Business name, address, timezone, and legal entity settings.',
        badge: 'Soon',
      },
      {
        href: '/settings/notifications',
        icon: Bell,
        title: 'Notification Rules',
        description: 'Configure when and how admins receive system alerts.',
        badge: 'Soon',
      },
      {
        href: '/settings/branding',
        icon: Globe,
        title: 'Tenant Portal Branding',
        description: 'Logo, color scheme, and domain for the tenant-facing portal.',
        badge: 'Soon',
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        href: '/settings/feature-flags',
        icon: Zap,
        title: 'Feature Flags',
        description: 'Toggle experimental features and beta capabilities per-org.',
      },
      {
        href: '/settings/display',
        icon: Monitor,
        title: 'Display Preferences',
        description: 'Date format, currency, and localization settings.',
        badge: 'Soon',
      },
    ],
  },
];

function SettingCard({
  href,
  icon: Icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link
      href={badge ? '#' : href}
      aria-disabled={!!badge}
      className={`group relative flex items-start gap-4 rounded-[20px] border p-5 transition-all duration-[180ms] ${
        isActive
          ? 'border-[#3B82F6]/40 bg-[#3B82F6]/8'
          : badge
          ? 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-60'
          : 'border-[#1E3350] bg-[#0F1B31] hover:border-[#2B4A73] hover:bg-[#0F1B31]/80'
      }`}
    >
      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border ${
          isActive ? 'border-[#3B82F6]/30 bg-[#3B82F6]/15 text-[#60A5FA]' : 'border-[#1E3350] bg-[#0C1625] text-[#7FA7D9]'
        }`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#F8FAFC]">{title}</p>
          {badge && (
            <span className="rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-[#F59E0B]">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#8DA4C5]">{description}</p>
      </div>
      {!badge && (
        <div className="mt-0.5 shrink-0 text-[#3B4C63] transition-colors group-hover:text-[#5A7A9E]">
          <Lock size={14} />
        </div>
      )}
    </Link>
  );
}

export default function SettingsPage() {
  return (
    <ApprovalGate requiredRoles="ADMIN">
      <WorkspaceShell title="Settings" subtitle="System Configuration" icon={Settings}>
        <div className="space-y-8">
          {/* Header summary */}
          <div className="glass-panel rounded-[30px] p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#7FA7D9]">Admin configuration</p>
                <h2 className="mt-2 font-[family-name:var(--font-space)] text-3xl font-semibold tracking-tight text-[#F8FAFC]">
                  System, integrations, and access control in one place.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#8DA4C5]">
                  Changes here affect the entire organization. Only admins can access this area.
                </p>
              </div>
            </div>
          </div>

          {/* Sections */}
          {SETTINGS_SECTIONS.map((section) => (
            <section key={section.label}>
              <h3 className="mb-3 text-[11px] uppercase tracking-[0.22em] text-[#6E85A5]">{section.label}</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {section.items.map((item) => (
                  <SettingCard key={item.href} {...item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </WorkspaceShell>
    </ApprovalGate>
  );
}
