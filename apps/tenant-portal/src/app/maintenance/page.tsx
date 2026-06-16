'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Wrench, Plus, ArrowRight } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchMaintenanceRequests } from '@/lib/tenant-api';
import { formatDate } from '@/lib/utils';

function statusBadge(status: string) {
  switch (status.toUpperCase()) {
    case 'PENDING':     return <Badge variant="warning">Open</Badge>;
    case 'IN_PROGRESS': return <Badge variant="info">In Progress</Badge>;
    case 'COMPLETED':   return <Badge variant="success">Completed</Badge>;
    case 'CLOSED':      return <Badge variant="muted">Closed</Badge>;
    default:            return <Badge variant="muted">{status}</Badge>;
  }
}

function priorityBadge(priority: string) {
  switch (priority.toUpperCase()) {
    case 'EMERGENCY': return <Badge variant="destructive">Emergency</Badge>;
    case 'HIGH':      return <Badge variant="warning">High</Badge>;
    case 'MEDIUM':    return <Badge variant="muted">Medium</Badge>;
    case 'LOW':       return <Badge variant="muted">Low</Badge>;
    default:          return <Badge variant="muted">{priority}</Badge>;
  }
}
