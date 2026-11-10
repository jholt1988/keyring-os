import { useState, useEffect, useCallback } from 'react';

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
  const [workspace, setWorkspace] = useState(null as Workspace | null);

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

export function useTenantActivity(id: string) {
  const [data, setData] = useState(null as any);
  
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/tenants/${id}/activity`)
      .then((res) => res.json())
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data };
}

export function useTenantWorkspace(id: string) {
  const [data, setData] = useState(null as Workspace | null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    if (!id) return;
    setIsLoading(true);
    fetch(`/api/tenants/${id}/workspace`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((d) => {
        setData(d as Workspace);
        setIsLoading(false);
      })
      .catch(() => {
        setData(null);
        setIsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    if (!id) return;
    
    setIsLoading(true);
    fetch(`/api/tenants/${id}/workspace`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((d) => {
        if (!cancelled) {
          setData(d as Workspace);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setIsLoading(false);
        }
      });
      
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { data, isLoading, refetch };
}

export function useTenantsIndex(params: any = {}) {
  const [data, setData] = useState(null as any);
  const [isLoading, setIsLoading] = useState(true);

  // Stringify params for the dependency array so we don't infinitely re-fetch
  // if a new object reference is passed on every render.
  const paramsString = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    
    const parsedParams = JSON.parse(paramsString);
    const queryString = new URLSearchParams(parsedParams).toString();
    const url = `/api/tenants${queryString ? `?${queryString}` : ''}`;
    
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((d) => {
        if (!cancelled) {
          setData(d);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null);
          setIsLoading(false);
        }
      });
      
    return () => {
      cancelled = true;
    };
  }, [paramsString]);

  return { data, isLoading };
}
