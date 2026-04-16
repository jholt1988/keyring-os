'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wrench, Plus, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RequireRole } from '@/components/auth';
import { createMaintenanceRequest } from '@/lib/copilot-api';

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    propertyId: '',
    unitId: '',
    category: '',
  });

  // Fetch repairs workspace which includes maintenance requests
  const { data: workspace, isLoading } = useQuery({
    queryKey: ['repairs-workspace'],
    queryFn: () => import('@/lib/copilot-api').then(m => m.fetchRepairsWorkspace()),
  });

  const createMutation = useMutation({
    mutationFn: createMaintenanceRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repairs-workspace'] });
      setShowForm(false);
      setFormData({ title: '', description: '', priority: 'MEDIUM', propertyId: '', unitId: '', category: '' });
    },
  });

  const requests = (workspace?.requests as any[]) || [];
  const filteredRequests = requests.filter((r: any) =>
    r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-orange-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <RequireRole requiredRoles={['ADMIN', 'PROPERTY_MANAGER']}>
      <WorkspaceShell
        title="Maintenance Requests"
        subtitle="Create and manage maintenance requests"
        icon={Wrench}
      >
        <div className="space-y-4">
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </div>

          {/* Create Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-[#0F1B31] p-6 space-y-4">
              <h3 className="text-lg font-medium text-[#F8FAFC]">Create Maintenance Request</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-[#94A3B8]">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Brief description"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-[#94A3B8]">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full h-11 rounded-lg border border-white/10 bg-[#0F1B31] px-3 text-[#F8FAFC]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[#94A3B8]">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the issue..."
                  rows={3}
                  className="w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-[#F8FAFC]"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Request'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Requests List */}
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3B82F6] border-t-transparent" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#0F1B31] p-12 text-center">
              <Wrench className="mx-auto h-12 w-12 text-[#64748B]" />
              <p className="mt-4 text-[#94A3B8]">No maintenance requests found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredRequests.map((request: any) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-white/10 bg-[#0F1B31] p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {statusIcon(request.status)}
                        <h3 className="font-medium text-[#F8FAFC]">{request.title}</h3>
                        {request.priority && (
                          <span className={`rounded px-2 py-0.5 text-xs ${
                            request.priority === 'EMERGENCY' ? 'bg-red-500/20 text-red-400' :
                            request.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {request.priority}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#94A3B8]">{request.description}</p>
                      <div className="flex items-center gap-4 text-xs text-[#64748B]">
                        <span>{request.category || 'Uncategorized'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </WorkspaceShell>
    </RequireRole>
  );
}