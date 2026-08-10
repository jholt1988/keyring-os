import { useState, useEffect } from 'react';

type Workspace = {
  id: string;
  name: string;
  description?: string; // optional description
  ownerId?: string; // owner identifier
  createdAt?: string; // ISO timestamp
  updatedAt?: string; // ISO timestamp of last update
  settings?: Record<string, any>; // additional settings
};

/**
 * Simple hook to fetch the current workspace for the admin app.
 * It calls the `/api/workspace` endpoint which is already proxied in the admin backend.
 * Returns `null` while loading or if an error occurs.
 */
export function useWorkspace(): Workspace | null {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/workspace')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
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
