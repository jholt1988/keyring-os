'use client';

import { Info, Shield, Building2, UserCheck, Settings, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

export type UserRole = 'TENANT' | 'PROPERTY_MANAGER' | 'OWNER' | 'ADMIN';

interface RoleDescriptionProps {
  role: UserRole;
  className?: string;
}

const ROLE_DETAILS: Record<UserRole, {
  title: string;
  description: string;
  permissions: string[];
  icon: LucideIcon;
  color: string;
}> = {
  TENANT: {
    title: 'Tenant',
    description: 'Can view and manage their own account, payments, and lease information.',
    permissions: [
      'View own account details',
      'Make payments',
      'Submit maintenance requests',
      'View lease documents',
      'Update contact information'
    ],
    icon: UserCheck,
    color: '#60A5FA' // blue
  },
  PROPERTY_MANAGER: {
    title: 'Property Manager',
    description: 'Can manage properties, tenants, maintenance, and financial operations.',
    permissions: [
      'Manage tenant accounts',
      'Process payments',
      'Coordinate maintenance',
      'Generate reports',
      'Manage lease agreements'
    ],
    icon: Building2,
    color: '#8B5CF6' // violet
  },
  OWNER: {
    title: 'Owner',
    description: 'Can view portfolio performance, financial reports, and property analytics.',
    permissions: [
      'View portfolio performance',
      'Access financial reports',
      'Review property analytics',
      'View owner statements',
      'Monitor investment metrics'
    ],
    icon: Shield,
    color: '#10B981' // green
  },
  ADMIN: {
    title: 'Admin',
    description: 'Full system access including user management, security settings, and system configuration.',
    permissions: [
      'Manage all user accounts',
      'Configure system settings',
      'Access security logs',
      'Manage API integrations',
      'Override system permissions'
    ],
    icon: Settings,
    color: '#F59E0B' // amber
  }
};

export function RoleDescription({ role, className = '' }: RoleDescriptionProps) {
  const [showDetails, setShowDetails] = useState(false);
  const details = ROLE_DETAILS[role];
  const Icon = details.icon;

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-[#0F1B31] p-3 hover:bg-[#17304E]"
      >
        <div className="flex items-center gap-3">
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-md"
            style={{ backgroundColor: `${details.color}20` }}
          >
            <Icon className="h-4 w-4" style={{ color: details.color }} />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-[#F8FAFC]">{details.title}</div>
            <div className="text-xs text-[#94A3B8]">Click for details</div>
          </div>
        </div>
        <Info className="h-4 w-4 text-[#8A99AD]" />
      </button>

      {showDetails && (
        <div className="rounded-lg border border-white/10 bg-[#0B1628] p-4">
          <div className="mb-3">
            <p className="text-sm text-[#CBD5E1]">{details.description}</p>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
              Permissions
            </div>
            <ul className="space-y-1.5">
              {details.permissions.map((permission, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-current" style={{ color: details.color }} />
                  <span className="text-sm text-[#CBD5E1]">{permission}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="text-xs text-[#94A3B8]">
              <span className="font-medium">Security Note:</span> Role assignments affect system 
              access and data visibility. Assign carefully.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}