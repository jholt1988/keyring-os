'use client';

import type { ReactNode } from 'react';

interface FloatingOrbProps {
  severity: 'critical' | 'high' | 'medium' | 'low';
  label: string;
  pulse?: boolean;
  children?: ReactNode;
  className?: string;
}

function severityClasses(severity: FloatingOrbProps['severity']) {
  switch (severity) {
    case 'critical':
      return 'border-[#F43F5E]/40 shadow-[0_18px_50px_rgba(244,63,94,0.22)]';
    case 'high':
      return 'border-[#F59E0B]/40 shadow-[0_18px_50px_rgba(245,158,11,0.22)]';
    case 'medium':
      return 'border-[#60A5FA]/40 shadow-[0_18px_50px_rgba(96,165,250,0.22)]';
    case 'low':
    default:
      return 'border-[#10B981]/35 shadow-[0_18px_50px_rgba(16,185,129,0.18)]';
  }
}

export function FloatingOrb({ severity, label, pulse = false, children, className = '' }: FloatingOrbProps) {
  return (
    <div className={`relative inline-flex flex-col items-center gap-2 ${className}`.trim()}>
      <div
        className={`inline-flex items-center justify-center rounded-full border bg-[radial-gradient(circle_at_30%_30%,rgba(96,165,250,0.45),rgba(23,48,78,0.95))] text-white backdrop-blur-md transition-all duration-[180ms] ${severityClasses(severity)} ${pulse ? 'animate-pulse' : ''}`.trim()}
        aria-hidden="true"
      >
        {children}
      </div>
      <span className="max-w-28 text-center text-[11px] font-medium text-[#D9E8FF]">{label}</span>
    </div>
  );
}

export default FloatingOrb;
