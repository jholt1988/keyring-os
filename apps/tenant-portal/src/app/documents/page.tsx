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

function fileTypeIcon(fileType?: string) {
  // All documents use the same icon for now; extend with PDF/image icons as needed
  return <FileText size={18} className="text-[#3B82F6] shrink-0" />;
}

// ── Document Row ──────────────────────────────────────────────────────────────

function DocumentRow({ doc }: { doc: Document }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#1E3350] bg-[#0F1B31] px-4 py-3 transition-colors hover:border-[#2B4A73]">
      <div className="flex items-center gap-3 min-w-0">
        {fileTypeIcon(doc.fileType)}
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#F8FAFC] truncate">{doc.name}</p>
          <p className="text-xs text-[#94A3B8]">Added {formatDate(doc.createdAt)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {categoryBadge(doc.category)}
        <a
          href={getDocumentDownloadUrl(doc.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#1E3350] bg-[#07111F] text-[#94A3B8] transition-all hover:border-[#3B82F6] hover:text-[#3B82F6]"
          title="Download"
        >
          <Download size={13} />
        </a>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });

  // Derive unique categories
  const categories = Array.from(
    new Set(docs.map((d) => (d.category?.toUpperCase() ?? 'OTHER'))),
  ).sort();

  const filtered = docs.filter((d) => {
    const matchesSearch =
      !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !activeCategory ||
      (d.category?.toUpperCase() ?? 'OTHER') === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <WorkspaceShell title="Documents">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-[#94A3B8]" />
            <CardTitle>My Documents</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="relative mb-4">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents…"
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] py-2 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none transition-colors focus:border-[#3B82F6]"
            />
          </div>

          {/* Category filter chips */}
          {categories.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  !activeCategory
                    ? 'bg-[#3B82F6] text-white'
                    : 'border border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] hover:border-[#2B4A73] hover:text-[#F8FAFC]'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#3B82F6] text-white'
                      : 'border border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] hover:border-[#2B4A73] hover:text-[#F8FAFC]'
                  }`}
                >
                  {CATEGORY_LABELS[cat] ?? cat}
                </button>
              ))}
            </div>
          )}

          {/* Document list */}
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <FileText size={32} className="mx-auto mb-3 text-[#94A3B8]" />
              <p className="text-sm text-[#94A3B8]">
                {search || activeCategory ? 'No documents match your filter.' : 'No documents yet.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((doc) => (
                <DocumentRow key={doc.id} doc={doc} />
              ))}
            </div>
          )}

          {!isLoading && docs.length > 0 && (
            <p className="mt-3 text-xs text-[#94A3B8]">
              {filtered.length} of {docs.length} document{docs.length !== 1 ? 's' : ''}
            </p>
          )}
        </CardContent>
      </Card>
    </WorkspaceShell>
  );
}
