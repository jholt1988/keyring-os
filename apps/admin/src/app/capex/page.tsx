'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Landmark, Plus, RefreshCw } from 'lucide-react';
import { WorkspaceShell, MetricCard, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { approveCapexForecast, completeCapexForecast, createCapexForecast, fetchCapexForecasts, fetchCapexSummary, generateCapexForecast } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function CapexPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ propertyId: '', estimatedCost: '', description: '' });
  const { data: summary } = useQuery({ queryKey: ['capex-summary'], queryFn: fetchCapexSummary });
  const { data } = useQuery({ queryKey: ['capex-forecasts'], queryFn: fetchCapexForecasts });
  const forecasts = Array.isArray(data) ? data : [];
  const refresh = () => qc.invalidateQueries({ queryKey: ['capex-forecasts'] });
  const createM = useMutation({ mutationFn: () => createCapexForecast({ ...form, estimatedCost: Number(form.estimatedCost) || 0 }), onSuccess: () => { toast('Forecast created'); setOpen(false); refresh(); } });
  const approveM = useMutation({ mutationFn: (id: string) => approveCapexForecast(id), onSuccess: () => { toast('Forecast approved'); refresh(); } });
  const completeM = useMutation({ mutationFn: (id: string) => completeCapexForecast(id), onSuccess: () => { toast('Forecast completed'); refresh(); } });
  const generateM = useMutation({ mutationFn: (propertyId: string) => generateCapexForecast(propertyId), onSuccess: () => { toast('Forecast generated'); refresh(); } });

  return (
    <>
      <WorkspaceShell title="CapEx Forecasting" subtitle="Forecast pipeline and approvals" icon={Landmark} actions={<Button size="sm" onClick={() => setOpen(true)}><Plus size={12} /> New Forecast</Button>}>
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <MetricCard value={`$${summary?.totalForecastedSpend ?? 0}`} label="Forecasted Spend" variant="danger" />
          <MetricCard value={summary?.approvedCount ?? 0} label="Approved" variant="success" />
          <MetricCard value={summary?.pendingCount ?? 0} label="Pending" variant="warning" />
        </div>
        <SectionCard title="Forecasts" subtitle="Approve, complete, or generate property forecasts">
          <div className="space-y-3">
            {forecasts.map((forecast: any) => (
              <div key={forecast.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3">
                <p className="text-sm font-medium text-[#F8FAFC]">{forecast.propertyName ?? forecast.propertyId}</p>
                <p className="text-xs text-[#94A3B8]">${forecast.estimatedCost ?? 0} · {forecast.status ?? 'PENDING'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => approveM.mutate(forecast.id)}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => completeM.mutate(forecast.id)}>Complete</Button>
                  <Button size="sm" onClick={() => generateM.mutate(String(forecast.propertyId ?? ''))}>Generate</Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </WorkspaceShell>
      <Modal open={open} onClose={() => setOpen(false)} title="Create Forecast" footer={<><Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" onClick={() => createM.mutate()}>{createM.isPending ? <RefreshCw size={12} className="animate-spin" /> : <Plus size={12} />} Save</Button></>}>
        <div className="grid grid-cols-1 gap-3">{[['Property ID', 'propertyId'], ['Estimated Cost', 'estimatedCost'], ['Description', 'description']].map(([label, key]) => <label key={key} className="text-sm text-[#94A3B8]"><span className="mb-1 block">{label}</span><input value={(form as any)[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" /></label>)}</div>
      </Modal>
    </>
  );
}
