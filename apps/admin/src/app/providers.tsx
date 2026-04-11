// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Initialize state using a callback to ensure it's only created once per user session
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Global defaults
        staleTime: 60 * 1000, // Data is fresh for 1 minute before refetching in background
        refetchOnWindowFocus: true, // Auto-update feed when user switches tabs back
        retry: 2, // Only retry failing requests twice
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}