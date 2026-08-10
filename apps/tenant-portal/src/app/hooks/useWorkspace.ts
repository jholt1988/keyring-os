import { useState, useEffect } from 'react';

type Workspace = {
  id: string;
  name: string;
  // add other fields as needed
};

/**
 * Hook for the tenant‑portal to fetch the current workspace.
 * It uses the same `/api/workspace` endpoint which the backend proxies for the tenant context.
 */
export function useWorkspace(): Workspace | null {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/workspace')
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setWorkspace(data as Workspace);
      })
      .catch(() => {
        if (!cancelled) setWorkspace(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return workspace;
}
