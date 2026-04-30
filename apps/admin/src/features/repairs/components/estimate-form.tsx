'use client';

import { Button } from '@/components/ui/button';
import { Card,CardContent,CardHeader,CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DollarSign,Plus,Save,Trash2 } from 'lucide-react';
import { useState } from 'react';

interface LineItem {
  id: string;
  category: string;
  description: string;
  cost: number;
}

export interface EstimateFormData {
  propertyId: string;
  unitId: string;
  description: string;
  lineItems: LineItem[];
  notes?: string;
}

interface EstimateFormProps {
  onSave: (data: EstimateFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roofing',
  'Flooring',
  'Walls & Paint',
  'Appliances',
  'Windows & Doors',
  'Landscaping',
  'General',
  'Labor',
  'Materials',
];

export function EstimateForm({ onSave, onCancel, isSubmitting }: EstimateFormProps) {
  const [formData, setFormData] = useState<EstimateFormData>({
    propertyId: '',
    unitId: '',
    description: '',
    lineItems: [
      { id: crypto.randomUUID(), category: 'General', description: '', cost: 0 },
    ],
    notes: '',
  });

  const addLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        { id: crypto.randomUUID(), category: 'General', description: '', cost: 0 },
      ],
    });
  };

  const removeLineItem = (id: string) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((item) => item.id !== id),
    });
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const totalCost = formData.lineItems.reduce((sum, item) => sum + (item.cost || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-white/10 bg-[#0F1B31]">
        <CardHeader className="border-b border-white/10 pb-4">
          <CardTitle className="flex items-center gap-2 text-[#F8FAFC]">
            <DollarSign className="h-5 w-5 text-[#38BDF8]" />
            Create Repair Estimate
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Property & Unit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[#94A3B8]">Property</label>
              <Input
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                placeholder="Property ID"
                className="bg-[#13233C] border-white/10 text-[#F8FAFC]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#94A3B8]">Unit</label>
              <Input
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                placeholder="Unit ID (optional)"
                className="bg-[#13233C] border-white/10 text-[#F8FAFC]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm text-[#94A3B8]">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the repair work needed..."
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-[#13233C] px-3 py-2 text-[#F8FAFC]"
            />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-[#94A3B8]">Line Items</label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addLineItem}
                className="text-[#38BDF8]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {formData.lineItems.map((item) => (
              <div key={item.id} className="flex gap-2 items-start">
                <select
                  value={item.category}
                  onChange={(e) => updateLineItem(item.id, 'category', e.target.value)}
                  className="w-32 h-10 rounded-lg border border-white/10 bg-[#13233C] px-2 text-[#F8FAFC] text-sm"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Input
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  placeholder="Description"
                  className="flex-1 bg-[#13233C] border-white/10 text-[#F8FAFC]"
                />
                <Input
                  type="number"
                  value={item.cost}
                  onChange={(e) => updateLineItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                  placeholder="Cost"
                  min="0"
                  step="0.01"
                  className="w-28 bg-[#13233C] border-white/10 text-[#F8FAFC]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLineItem(item.id)}
                  disabled={formData.lineItems.length === 1}
                  className="text-[#F43F5E]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end border-t border-white/10 pt-4">
            <div className="text-right">
              <p className="text-sm text-[#94A3B8]">Total Estimate</p>
              <p className="text-2xl font-semibold text-[#38BDF8]">
                ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm text-[#94A3B8]">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
              className="w-full rounded-lg border border-white/10 bg-[#13233C] px-3 py-2 text-[#F8FAFC]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Create Estimate'}
        </Button>
      </div>
    </form>
  );
}
