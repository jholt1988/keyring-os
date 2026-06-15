'use client';

import { Loader2 } from 'lucide-react';
import { ReactNode } from 'react';

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
  height?: string;
}

export function LoadingSkeleton({ count = 1, className = '', height = 'h-4' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse rounded bg-[#1E3350] ${height} w-full`}
          aria-label="Loading..."
          role="status"
        />
      ))}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: ReactNode;
}

export function LoadingOverlay({ isLoading, message = 'Loading...', children }: LoadingOverlayProps) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div
        className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#0B1628]/80"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
          <span className="text-sm text-[#F8FAFC]">{message}</span>
        </div>
      </div>
    </div>
  );
}

interface ButtonLoadingProps {
  isLoading: boolean;
  loadingText?: string;
  children: ReactNode;
  className?: string;
}

export function ButtonLoading({ isLoading, loadingText = 'Processing...', children, className = '' }: ButtonLoadingProps) {
  return (
    <button
      className={`relative ${className}`}
      disabled={isLoading}
      aria-busy={isLoading}
      aria-label={isLoading ? loadingText : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      <span className={isLoading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
}

interface FormLoadingStateProps {
  isLoading: boolean;
  skeletonCount?: number;
  children: ReactNode;
}

export function FormLoadingState({ isLoading, skeletonCount = 3, children }: FormLoadingStateProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading form data...">
        <LoadingSkeleton count={skeletonCount} height="h-11" />
        <LoadingSkeleton count={2} height="h-4" />
      </div>
    );
  }

  return <>{children}</>;
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-[#0B1628] p-8 text-center">
      {icon && <div className="mb-4 text-[#94A3B8]">{icon}</div>}
      <h3 className="text-lg font-semibold text-[#F8FAFC]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[#94A3B8]">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div 
      className="rounded-lg border border-[#F43F5E]/20 bg-[#F43F5E]/10 p-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex flex-col gap-2">
        <div className="font-semibold text-[#F8FAFC]">{title}</div>
        <div className="text-sm text-[#CBD5E1]">{message}</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 self-start rounded-md bg-[#F43F5E] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#F43F5E]/80"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Accessibility helpers
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

export function AriaLiveRegion({ message, priority = 'polite' }: { message: string; priority?: 'polite' | 'assertive' }) {
  return (
    <div
      className="sr-only"
      aria-live={priority}
      aria-atomic="true"
    >
      {message}
    </div>
  );
}