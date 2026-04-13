'use client';

import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface ApplicationShellProps {
  step: number;
  totalSteps: number;
  title: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
}

export function ApplicationShell({
  step,
  totalSteps,
  title,
  children,
  onNext,
  onBack,
}: ApplicationShellProps) {
  const progress = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <Card className="overflow-hidden border-[#1E3350] bg-[#13233C]/95 shadow-[0_18px_60px_rgba(2,8,23,0.28)]">
      <div className="h-1.5 w-full bg-[#0F1B31]">
        <div
          className="h-full rounded-r-full bg-gradient-to-r from-[#3B82F6] to-[#38BDF8] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <CardHeader className="gap-3 border-b border-[#1E3350] pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#38BDF8]">
              Rental Application
            </p>
            <CardTitle className="mt-2 text-2xl">{title}</CardTitle>
          </div>
          <div className="rounded-full border border-[#1E3350] bg-[#0F1B31] px-3 py-1 text-sm text-[#CBD5E1]">
            Step {step} of {totalSteps}
          </div>
        </div>
        <CardDescription>
          Complete the first sections to start your application. Your answers stay in local state for now.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-5 pt-5">
        {children}
        <div className="flex flex-col-reverse gap-3 border-t border-[#1E3350] pt-5 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={onBack} disabled={!onBack}>
            <ArrowLeft size={14} />
            Back
          </Button>
          <Button type="button" onClick={onNext} disabled={!onNext}>
            Next
            <ArrowRight size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
