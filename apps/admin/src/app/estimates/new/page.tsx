'use client';

import { ApprovalGate } from '@/features/operator';
import { WorkspaceShell } from '@/components/copilot';
import { useToast } from '@/components/ui/toast';
import { EstimateForm,type EstimateFormData } from '@/features/repairs/components/estimate-form';
import { createOperatorEstimate } from '@/lib/operator/read-only-data';
import { useMutation } from '@tanstack/react-query';
import { DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewEstimatePage() {
  const router = useRouter();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: EstimateFormData) => createOperatorEstimate(data as unknown as Record<string, unknown>, {}),
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
    <ApprovalGate requiredRoles={['ADMIN', 'PROPERTY_MANAGER']}>
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
    </ApprovalGate>
  );
}