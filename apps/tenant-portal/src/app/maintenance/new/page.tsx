'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FloatingValidation } from '@/components/forms/floating-validation';
import { createMaintenanceRequest } from '@/lib/tenant-api';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Structural', 'Pest Control', 'Other'];
const PRIORITIES = [
  { value: 'LOW',       label: 'Normal',    desc: 'Non-urgent, can be scheduled' },
  { value: 'HIGH',      label: 'Urgent',    desc: 'Needs attention within a few days' },
  { value: 'EMERGENCY', label: 'Emergency', desc: 'Immediate safety or habitability issue' },
];

export default function NewMaintenancePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () => createMaintenanceRequest({ title, category, description, priority }),
    onSuccess: (req) => router.push(`/maintenance/${req.id}`),
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!category) e.category = 'Category is required';
    if (!description.trim()) e.description = 'Description is required';
    if (description.length > 1000) e.description = 'Max 1000 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) mutation.mutate();
  }

  return (
    <WorkspaceShell title="New Maintenance Request" backHref="/maintenance" backLabel="Maintenance">
      <Card className="transition-all duration-300 hover:shadow-[0_18px_60px_rgba(2,8,23,0.28)]">
        <CardHeader>
          <CardTitle>Submit a Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kitchen faucet leaking"
                className={cn(
                  'rounded-lg border bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#3B82F6]',
                  errors.title ? 'border-[#F43F5E]' : 'border-[#1E3350]',
                )}
              />
              <FloatingValidation message={errors.title} />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={cn(
                  'rounded-lg border bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors focus:border-[#3B82F6]',
                  errors.category ? 'border-[#F43F5E]' : 'border-[#1E3350]',
                )}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <FloatingValidation message={errors.category} />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">
                Description * <span className="text-[#94A3B8]">({description.length}/1000)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the issue in detail…"
                className={cn(
                  'rounded-lg border bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#3B82F6] resize-none',
                  errors.description ? 'border-[#F43F5E]' : 'border-[#1E3350]',
                )}
              />
              <FloatingValidation message={errors.description} />
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#F8FAFC]">Priority</label>
              <div className="flex flex-col gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      'flex items-start gap-3 rounded-lg border p-3 text-left transition-all',
                      priority === p.value
                        ? 'border-[#3B82F6] bg-[#3B82F6]/10'
                        : 'border-[#1E3350] hover:border-[#2B4A73]',
                    )}
                  >
                    <div
                      className={cn(
                        'mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 transition-all',
                        priority === p.value
                          ? 'border-[#3B82F6] bg-[#3B82F6]'
                          : 'border-[#94A3B8]',
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-[#F8FAFC]">{p.label}</p>
                      <p className="text-xs text-[#94A3B8]">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {mutation.isError && (
              <p className="rounded-lg bg-[#F43F5E]/10 px-3 py-2 text-sm text-[#F43F5E]">
                Failed to submit request. Please try again.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <RefreshCw size={14} className="animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
