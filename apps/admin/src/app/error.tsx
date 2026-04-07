'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[feed] Unhandled render error:', error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-sm font-semibold text-destructive">
          Feed unavailable
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {error.message ?? 'An unexpected error occurred loading the feed.'}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={reset}
        >
          Try again
        </Button>
      </div>
    </main>
  );
}
