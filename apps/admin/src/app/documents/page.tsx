'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FolderOpen, Upload, Download, Search, RefreshCw } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { fetchDocuments, uploadDocument, getDocumentDownloadUrl } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

const CATEGORY_LABELS: Record<string, string> = {
  LEASE: 'Lease', ADDENDUM: 'Addendum', NOTICE: 'Notice',
  INSPECTION: 'Inspection', FINANCIAL: 'Financial', OTHER: 'Other',
};

export default function DocumentsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('OTHER');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => fetchDocuments(),
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!uploadFile) throw new Error('No file selected');
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('category', uploadCategory);
      return uploadDocument(fd);
    },
    onSuccess: () => {
      toast('Document uploaded');
      setUploadOpen(false);
      setUploadFile(null);
      if (fileRef.current) fileRef.current.value = '';
      qc.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: () => toast('Upload failed', 'error'),
  });

  const categories = Array.from(new Set((docs as any[]).map((d: any) => d.category?.toUpperCase() ?? 'OTHER'))).sort();

  const filtered = (docs as any[]).filter((d: any) => {
    const matchSearch = !search || d.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || (d.category?.toUpperCase() ?? 'OTHER') === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <>
      <WorkspaceShell title="Documents" subtitle="Document Management" icon={FolderOpen}
        actions={<Button size="sm" onClick={() => setUploadOpen(true)}><Upload size={13} /> Upload</Button>}
      >
        <SectionCard title="Documents">
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] py-2 pl-9 pr-3 text-sm text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none focus:border-[#3B82F6]" />
          </div>

          {categories.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={() => setActiveCategory(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${!activeCategory ? 'bg-[#3B82F6] text-white' : 'border border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] hover:text-[#F8FAFC]'}`}>
                All
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeCategory === cat ? 'bg-[#3B82F6] text-white' : 'border border-[#1E3350] bg-[#0F1B31] text-[#94A3B8] hover:text-[#F8FAFC]'}`}>
                  {CATEGORY_LABELS[cat] ?? cat}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-14 animate-pulse rounded-lg bg-[#0F1B31]" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen size={32} className="mx-auto mb-3 text-[#94A3B8]" />
              <p className="text-sm text-[#94A3B8]">
                {search || activeCategory ? 'No documents match your filter.' : 'No documents yet.'}
              </p>
              {!search && !activeCategory && (
                <Button size="sm" className="mt-4" onClick={() => setUploadOpen(true)}>
                  <Upload size={13} /> Upload your first document
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between gap-4 rounded-lg border border-[#1E3350] bg-[#0F1B31] px-4 py-3 transition-colors hover:border-[#2B4A73]">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#F8FAFC]">{doc.name}</p>
                    <p className="text-xs text-[#94A3B8]">{new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="rounded-full border border-[#1E3350] bg-[#07111F] px-2 py-0.5 text-[10px] font-medium text-[#94A3B8]">
                      {CATEGORY_LABELS[doc.category?.toUpperCase()] ?? doc.category ?? 'Other'}
                    </span>
                    <a href={getDocumentDownloadUrl(doc.id)} target="_blank" rel="noopener noreferrer"
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-[#1E3350] bg-[#07111F] text-[#94A3B8] transition-all hover:border-[#3B82F6] hover:text-[#3B82F6]">
                      <Download size={13} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && (docs as any[]).length > 0 && (
            <p className="mt-3 text-xs text-[#94A3B8]">{filtered.length} of {(docs as any[]).length} documents</p>
          )}
        </SectionCard>
      </WorkspaceShell>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => uploadMutation.mutate()} disabled={!uploadFile || uploadMutation.isPending}>
              {uploadMutation.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} />} Upload
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">Category</label>
            <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}
              className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#3B82F6]">
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[#94A3B8]">File</label>
            <input ref={fileRef} type="file" onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-[#94A3B8] file:mr-3 file:rounded-lg file:border-0 file:bg-[#1E3350] file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#F8FAFC]" />
          </div>
        </div>
      </Modal>
    </>
  );
}
