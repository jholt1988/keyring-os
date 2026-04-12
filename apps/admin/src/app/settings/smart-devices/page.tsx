'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Cpu, Plus } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { createAccessCode, fetchAccessCodes, fetchSmartDevices, registerSmartDevice } from '@/lib/copilot-api';
import { useToast } from '@/components/ui/toast';

export default function SmartDevicesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceForm, setDeviceForm] = useState({ propertyId: '', unitId: '', name: '' });
  const [codeForm, setCodeForm] = useState({ code: '', label: '' });
  const { data } = useQuery({ queryKey: ['smart-devices'], queryFn: () => fetchSmartDevices() });
  const { data: codes } = useQuery({ queryKey: ['access-codes', selectedDevice], queryFn: () => fetchAccessCodes(selectedDevice!), enabled: !!selectedDevice });
  const devices = Array.isArray(data) ? data : [];
  const createDeviceM = useMutation({ mutationFn: () => registerSmartDevice(deviceForm), onSuccess: () => { toast('Device registered'); setOpen(false); qc.invalidateQueries({ queryKey: ['smart-devices'] }); } });
  const createCodeM = useMutation({ mutationFn: () => createAccessCode(selectedDevice!, codeForm), onSuccess: () => { toast('Access code created'); qc.invalidateQueries({ queryKey: ['access-codes', selectedDevice] }); } });
  return (
    <>
      <WorkspaceShell title="Smart Devices" subtitle="Device registration and access code management" icon={Cpu} actions={<Button size="sm" onClick={() => setOpen(true)}><Plus size={12} /> Register Device</Button>}>
        <SectionCard title="Devices" subtitle="Property and unit device status">
          <div className="space-y-3">
            {devices.map((device: any) => <div key={device.id} className="rounded-[14px] border border-[#1E3350] bg-[#0F1B31] p-3"><p className="text-sm font-medium text-[#F8FAFC]">{device.name ?? device.id}</p><p className="text-xs text-[#94A3B8]">{device.propertyId} · {device.unitId} · {device.status ?? 'unknown'}</p><div className="mt-3"><Button size="sm" variant="outline" onClick={() => setSelectedDevice(device.id)}>Access Codes</Button></div></div>)}
          </div>
          {selectedDevice && <div className="mt-4 rounded-[14px] border border-[#1E3350] bg-[#07111F] p-3"><p className="mb-2 text-xs uppercase tracking-wide text-[#94A3B8]">Access Codes</p><div className="space-y-2">{(Array.isArray(codes) ? codes : []).map((code: any, idx: number) => <div key={code.id ?? idx} className="rounded-[10px] bg-[#0F1B31] p-2 text-xs text-[#CBD5E1]">{code.label ?? code.name} · {code.code ?? 'hidden'}</div>)}</div><div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">{[['Code', 'code'], ['Label', 'label']].map(([label, key]) => <input key={key} value={(codeForm as any)[key]} onChange={(e) => setCodeForm((current) => ({ ...current, [key]: e.target.value }))} placeholder={label} className="rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" />)}<Button size="sm" onClick={() => createCodeM.mutate()}>Generate</Button></div></div>}
        </SectionCard>
      </WorkspaceShell>
      <Modal open={open} onClose={() => setOpen(false)} title="Register Device" footer={<><Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" onClick={() => createDeviceM.mutate()}>Save</Button></>}>
        <div className="grid grid-cols-1 gap-3">{[['Property ID', 'propertyId'], ['Unit ID', 'unitId'], ['Device Name', 'name']].map(([label, key]) => <label key={key} className="text-sm text-[#94A3B8]"><span className="mb-1 block">{label}</span><input value={(deviceForm as any)[key]} onChange={(e) => setDeviceForm((current) => ({ ...current, [key]: e.target.value }))} className="w-full rounded-lg border border-[#1E3350] bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]" /></label>)}</div>
      </Modal>
    </>
  );
}
