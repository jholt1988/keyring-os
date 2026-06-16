'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, Search, FolderOpen } from 'lucide-react';
import { WorkspaceShell } from '@/components/shell/workspace-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDocuments, getDocumentDownloadUrl, type Document } from '@/lib/tenant-api';
import { formatDate } from '@/lib/utils';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  LEASE: 'Lease',
  ADDENDUM: 'Addendum',
  NOTICE: 'Notice',
  INSPECTION: 'Inspection',
  FINANCIAL: 'Financial',
  OTHER: 'Other',
};

function categoryBadge(category?: string) {
  const label = category ? (CATEGORY_LABELS[category.toUpperCase()] ?? category) : 'Other';
  return <Badge variant="muted">{label}</Badge>;
}

function fileTypeIcon(_fileType?: string) {
  // All documents use the same icon for now; extend with PDF/image icons as needed
  return <FileText size={18} className="text-[#3B82F6] shrink-0" />;
}
