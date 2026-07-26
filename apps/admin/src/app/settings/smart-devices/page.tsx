import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createServerQueryClient, prefetchServerQuery, serverApiGet } from '@/lib/server-fetch';
import SmartDevicesView from './smart-devices-view';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Cpu, Plus } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { createOperatorAccessCode, loadOperatorAccessCodes, loadOperatorSmartDevicesWorkbench, registerOperatorSmartDevice } from '@/lib/operator/read-only-data';
import { useToast } from '@/components/ui/toast';

export default function SmartDevicesPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [deviceForm, setDeviceForm] = useState({ propertyId: '', unitId: '', name: '' });
  const [codeForm, setCodeForm] = useState({ code: '', label: '' });
  const { data } = useQuery({ queryKey: ['smart-devices'], queryFn: () => loadOperatorSmartDevicesWorkbench({}, {}) });
  const { data: codes } = useQuery({ queryKey: ['access-codes', selectedDevice], queryFn: () => loadOperatorAccessCodes(selectedDevice!, {}), enabled: !!selectedDevice });
  const devices = Array.isArray(data) ? data : [];
  const createDeviceM = useMutation({ mutationFn: () => registerOperatorSmartDevice(deviceForm, {}), onSuccess: () => { toast('Device registered'); setOpen(false); qc.invalidateQueries({ queryKey: ['smart-devices'] }); } });
  const createCodeM = useMutation({ mutationFn: () => createOperatorAccessCode(selectedDevice!, codeForm, {}), onSuccess: () => { toast('Access code created'); qc.invalidateQueries({ queryKey: ['access-codes', selectedDevice] }); } });
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SmartDevicesView />
    </HydrationBoundary>
  );
}
