import {
  Wallet,
  Wrench,
  FileText,
  ClipboardCheck,
  FolderOpen,
  MessageSquare,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import type { TenantFeedDomain } from '@keyring/types';

const DOMAIN_CONFIG: Record<
  TenantFeedDomain,
  { icon: React.ElementType; color: string; label: string }
> = {
  payments:    { icon: Wallet,        color: '#10B981', label: 'Payments' },
  maintenance: { icon: Wrench,        color: '#14B8A6', label: 'Maintenance' },
  lease:       { icon: FileText,      color: '#8B5CF6', label: 'Lease' },
  inspection:  { icon: ClipboardCheck,color: '#F59E0B', label: 'Inspection' },
  document:    { icon: FolderOpen,    color: '#60A5FA', label: 'Documents' },
  message:     { icon: MessageSquare, color: '#22D3EE', label: 'Messages' },
  renewal:     { icon: RefreshCw,     color: '#A78BFA', label: 'Renewal' },
  move_out:    { icon: LogOut,        color: '#F43F5E', label: 'Move Out' },
};

interface DomainIconProps {
  domain: TenantFeedDomain;
  size?: number;
}

export function DomainIcon({ domain, size = 16 }: DomainIconProps) {
  const config = DOMAIN_CONFIG[domain];
  const Icon = config.icon;
  return <Icon size={size} style={{ color: config.color }} strokeWidth={1.75} />;
}

export function getDomainConfig(domain: TenantFeedDomain) {
  return DOMAIN_CONFIG[domain];
}
