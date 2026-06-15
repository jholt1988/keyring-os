'use client';

import { ApprovalGate } from '@/features/operator';
import { PolicySettingsPage } from '@/features/policy/components/policy-settings-page';

export default function WrappedPolicyPage() {
  return (
    <ApprovalGate requiredRoles={['ADMIN', 'PROPERTY_MANAGER']}>
      <PolicySettingsPage />
    </ApprovalGate>
  );
}