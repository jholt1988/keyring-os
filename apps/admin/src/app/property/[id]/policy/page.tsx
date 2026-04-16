'use client';

import { RequireRole } from '@/components/auth';
import { PolicySettingsPage } from '@/features/policy/components/policy-settings-page';

export default function WrappedPolicyPage() {
  return (
    <RequireRole requiredRoles={['ADMIN', 'PROPERTY_MANAGER']}>
      <PolicySettingsPage />
    </RequireRole>
  );
}