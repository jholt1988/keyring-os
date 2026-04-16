'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, Save, X, Clock, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type MaintenanceCategoryPriority = 'emergency' | 'high' | 'medium' | 'low';
export type DispatchStrategy = 'ROUND_ROBIN' | 'PRIORITY_LIST';

export interface MaintenanceSubcategory {
  id: string;
  code: string;
  name: string;
}

export interface MaintenanceCategory {
  id: string;
  code: string;
  name: string;
  priority: MaintenanceCategoryPriority;
  slaHours: number;
  subcategories: MaintenanceSubcategory[];
}

export interface MaintenanceConfig {
  categories: MaintenanceCategory[];
  afterHoursDispatch: {
    enabled: boolean;
    emergencyOnly: boolean;
    strategy: DispatchStrategy;
  };
}

interface MaintenanceConfigCardProps {
  config: MaintenanceConfig;
  onConfigChange?: (config: MaintenanceConfig) => void;
}

const priorityOptions: { value: MaintenanceCategoryPriority; label: string }[] = [
  { value: 'emergency', label: 'Emergency' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const strategyOptions: { value: DispatchStrategy; label: string }[] = [
  { value: 'ROUND_ROBIN', label: 'Round Robin' },
  { value: 'PRIORITY_LIST', label: 'Priority List' },
];

const priorityColors: Record<MaintenanceCategoryPriority, string> = {
  emergency: 'text-[#F43F5E] bg-[#F43F5E]/10 border-[#F43F5E]/30',
  high: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
  medium: 'text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30',
  low: 'text-[#94A3B8] bg-white/5 border-white/10',
};

export function MaintenanceConfigCard({ config, onConfigChange }: MaintenanceConfigCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [categories, setCategories] = useState<MaintenanceCategory[]>(config.categories);
  const [afterHoursDispatch, setAfterHoursDispatch] = useState(config.afterHoursDispatch);
  
  // New category form state
  const [newCategory, setNewCategory] = useState({
    code: '',
    name: '',
    priority: 'medium' as MaintenanceCategoryPriority,
    slaHours: 24,
  });
  const [newSubcategory, setNewSubcategory] = useState({ code: '', name: '' });
  
  // Editing state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<MaintenanceCategory>>({});
  const [editingSubcategory, setEditingSubcategory] = useState<Partial<MaintenanceSubcategory>>({});

  const handleAddCategory = () => {
    if (!newCategory.code || !newCategory.name) return;
    
    const category: MaintenanceCategory = {
      id: crypto.randomUUID(),
      code: newCategory.code,
      name: newCategory.name,
      priority: newCategory.priority,
      slaHours: newCategory.slaHours,
      subcategories: [],
    };
    
    const updated = [...categories, category];
    setCategories(updated);
    setNewCategory({ code: '', name: '', priority: 'medium', slaHours: 24 });
    onConfigChange?.({ categories: updated, afterHoursDispatch });
  };

  const handleDeleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    onConfigChange?.({ categories: updated, afterHoursDispatch });
  };

  const handleStartEditCategory = (category: MaintenanceCategory) => {
    setEditingCategoryId(category.id);
    setEditingCategory({ ...category });
  };

  const handleSaveEditCategory = () => {
    if (!editingCategoryId || !editingCategory) return;
    
    const updated = categories.map(c => 
      c.id === editingCategoryId ? { ...c, ...editingCategory } : c
    );
    setCategories(updated);
    setEditingCategoryId(null);
    setEditingCategory({});
    onConfigChange?.({ categories: updated, afterHoursDispatch });
  };

  const handleAddSubcategory = (categoryId: string) => {
    if (!newSubcategory.code || !newSubcategory.name) return;
    
    const subcategory: MaintenanceSubcategory = {
      id: crypto.randomUUID(),
      code: newSubcategory.code,
      name: newSubcategory.name,
    };
    
    const updated = categories.map(c =>
      c.id === categoryId
        ? { ...c, subcategories: [...c.subcategories, subcategory] }
        : c
    );
    setCategories(updated);
    setNewSubcategory({ code: '', name: '' });
    onConfigChange?.({ categories: updated, afterHoursDispatch });
  };

  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    const updated = categories.map(c =>
      c.id === categoryId
        ? { ...c, subcategories: c.subcategories.filter(s => s.id !== subcategoryId) }
        : c
    );
    setCategories(updated);
    onConfigChange?.({ categories: updated, afterHoursDispatch });
  };

  const handleAfterHoursChange = (field: keyof typeof afterHoursDispatch, value: boolean | DispatchStrategy) => {
    const updated = { ...afterHoursDispatch, [field]: value };
    setAfterHoursDispatch(updated);
    onConfigChange?.({ categories, afterHoursDispatch: updated });
  };

  const categoryCount = categories.length;
  const subcategoryCount = categories.reduce((acc, c) => acc + c.subcategories.length, 0);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0F1B31] p-5">
      {/* Collapsed Summary */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#3B82F6]/10 p-2">
            <Clock className="h-5 w-5 text-[#3B82F6]" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#F8FAFC]">Maintenance Configuration</h3>
            <p className="mt-0.5 text-xs text-[#94A3B8]">
              {categoryCount} categories • {subcategoryCount} subcategories
              {afterHoursDispatch.enabled && (
                <span className="ml-2 flex items-center gap-1">
                  <AlertTriangle size={12} className="text-[#F59E0B]" />
                  After-hours active
                  {afterHoursDispatch.emergencyOnly && (
                    <span className="text-[#F59E0B]">(emergency only)</span>
                  )}
                </span>
              )}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-[#64748B]" />
        ) : (
          <ChevronRight className="h-5 w-5 text-[#64748B]" />
        )}
      </button>

      {/* Expanded Form */}
      {isExpanded && (
        <div className="mt-6 space-y-6 border-t border-white/10 pt-6">
          {/* Categories Management */}
          <div>
            <h4 className="text-sm font-medium text-[#F8FAFC]">Categories</h4>
            
            {/* Add Category Form */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-5">
              <Input
                placeholder="Code"
                value={newCategory.code}
                onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value })}
                className="sm:col-span-1"
              />
              <Input
                placeholder="Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="sm:col-span-2"
              />
              <select
                value={newCategory.priority}
                onChange={(e) => setNewCategory({ ...newCategory, priority: e.target.value as MaintenanceCategoryPriority })}
                className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
              >
                {priorityOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="SLA (hrs)"
                  value={newCategory.slaHours}
                  onChange={(e) => setNewCategory({ ...newCategory, slaHours: parseInt(e.target.value) || 0 })}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddCategory}>
                  <Plus size={14} />
                </Button>
              </div>
            </div>

            {/* Categories List */}
            <div className="mt-4 space-y-3">
              {categories.map(category => (
                <div
                  key={category.id}
                  className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
                >
                  {editingCategoryId === category.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                        <Input
                          value={editingCategory.code || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, code: e.target.value })}
                          placeholder="Code"
                          className="sm:col-span-1"
                        />
                        <Input
                          value={editingCategory.name || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          placeholder="Name"
                          className="sm:col-span-2"
                        />
                        <select
                          value={editingCategory.priority || 'medium'}
                          onChange={(e) => setEditingCategory({ ...editingCategory, priority: e.target.value as MaintenanceCategoryPriority })}
                          className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
                        >
                          {priorityOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <Input
                          type="number"
                          value={editingCategory.slaHours || 0}
                          onChange={(e) => setEditingCategory({ ...editingCategory, slaHours: parseInt(e.target.value) || 0 })}
                          placeholder="SLA (hrs)"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEditCategory}>
                          <Save size={14} />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingCategoryId(null)}>
                          <X size={14} />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${priorityColors[category.priority]}`}>
                            {category.priority}
                          </span>
                          <span className="text-sm font-medium text-[#F8FAFC]">
                            {category.code} - {category.name}
                          </span>
                          <span className="text-xs text-[#64748B]">
                            {category.slaHours}h SLA
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleStartEditCategory(category)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 size={14} className="text-[#F43F5E]" />
                          </Button>
                        </div>
                      </div>

                      {/* Subcategories */}
                      <div className="mt-3 ml-4 space-y-2 border-l border-white/10 pl-4">
                        {category.subcategories.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between">
                            <span className="text-xs text-[#94A3B8]">
                              {sub.code} - {sub.name}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSubcategory(category.id, sub.id)}
                            >
                              <Trash2 size={12} className="text-[#F43F5E]" />
                            </Button>
                          </div>
                        ))}
                        
                        {/* Add Subcategory */}
                        <div className="mt-2 flex gap-2">
                          <Input
                            placeholder="Code"
                            value={newSubcategory.code}
                            onChange={(e) => setNewSubcategory({ ...newSubcategory, code: e.target.value })}
                            className="h-8 text-xs"
                          />
                          <Input
                            placeholder="Name"
                            value={newSubcategory.name}
                            onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                            className="h-8 text-xs"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddSubcategory(category.id)}
                            className="h-8"
                          >
                            <Plus size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* After-Hours Dispatch Config */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-sm font-medium text-[#F8FAFC]">After-Hours Dispatch</h4>
            
            <div className="mt-3 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={afterHoursDispatch.enabled}
                  onChange={(e) => handleAfterHoursChange('enabled', e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
                />
                <span className="text-sm text-[#F8FAFC]">Enabled</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={afterHoursDispatch.emergencyOnly}
                  onChange={(e) => handleAfterHoursChange('emergencyOnly', e.target.checked)}
                  disabled={!afterHoursDispatch.enabled}
                  className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6] disabled:opacity-50"
                />
                <span className="text-sm text-[#F8FAFC]">Emergency Only</span>
              </label>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#F8FAFC]">Strategy:</span>
                <select
                  value={afterHoursDispatch.strategy}
                  onChange={(e) => handleAfterHoursChange('strategy', e.target.value as DispatchStrategy)}
                  disabled={!afterHoursDispatch.enabled}
                  className="flex h-10 rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] disabled:opacity-50"
                >
                  {strategyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}