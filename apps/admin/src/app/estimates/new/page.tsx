'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { DollarSign } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot';
import { RequireRole } from '@/components/auth';
import { EstimateForm, type EstimateFormData } from '@/features/repairs/components/estimate-form';
import { useToast } from '@/components/ui/toast';

// Stub API call - would need backend endpoint
async function createEstimate(data: EstimateFormData) {
  const response = await fetch('/api/estimates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create estimate');
  return response.json();
}

export default function NewEstimatePage() {
  const router = useRouter();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: createEstimate,
    onSuccess: () => {
      toast('Estimate created successfully');
      router.push('/repairs');
    },
    onError: () => {
      toast('Failed to create estimate', 'error');
    },
  });

  const handleSave = (data: EstimateFormData) => {
    mutation.mutate(data);
  };

  return (
    <RequireRole requiredRoles={['ADMIN', 'PROPERTY_MANAGER']}>
      <WorkspaceShell
        title="New Estimate"
        subtitle="Create a repair estimate"
        icon={DollarSign}
      >
        <div className="max-w-3xl mx-auto">
          <EstimateForm
            onSave={handleSave}
            onCancel={() => router.back()}
            isSubmitting={mutation.isPending}
          />
        </div>
      </WorkspaceShell>
    </RequireRole>
  );
}