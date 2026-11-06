import { useState, useEffect } from 'react';

type Workspace = {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
  settings?: Record<string, unknown>;
};

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
