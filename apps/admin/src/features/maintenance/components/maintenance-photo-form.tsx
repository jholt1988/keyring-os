'use client';

import { useState } from 'react';
import { Camera, X, Upload, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface MaintenancePhotoFormData {
  url?: string;
  caption?: string;
}

interface MaintenancePhotoFormProps {
  onSave: (data: MaintenancePhotoFormData) => void;
  onCancel: () => void;
}

export function MaintenancePhotoForm({ onSave, onCancel }: MaintenancePhotoFormProps) {
  const [form, setForm] = useState<MaintenancePhotoFormData>({
    url: '',
    caption: '',
  });

  const handleChange = (field: keyof MaintenancePhotoFormData, value: string | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Add Maintenance Photo</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>

      <div className="rounded-lg border border-dashed border-white/20 p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <Camera className="h-10 w-10 text-[#64748B]" />
          <div>
            <p className="text-sm text-[#F8FAFC]">Upload photo</p>
            <p className="text-xs text-[#64748B]">Drag and drop or click to select</p>
          </div>
          <Input
            type="file"
            accept="image/*"
            className="hidden"
            id="maintenance-photo-upload"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // In production, upload to storage and get URL
                const url = URL.createObjectURL(file);
                handleChange('url', url);
              }
            }}
          />
        </div>
      </div>

      {form.url && (
        <div className="rounded-lg border border-white/10 p-2">
          <div className="relative flex items-center justify-center">
            <ImageIcon className="h-32 w-full object-cover rounded" aria-hidden="true" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Image URL</label>
        <Input
          value={form.url || ''}
          onChange={(e) => handleChange('url', e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Caption</label>
        <Input
          value={form.caption || ''}
          onChange={(e) => handleChange('caption', e.target.value)}
          placeholder="Describe what's in the photo (optional)"
          maxLength={240}
        />
        <p className="text-xs text-[#64748B]">{form.caption?.length || 0}/240 characters</p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Upload size={14} />
          Add Photo
        </Button>
      </div>
    </form>
  );
}