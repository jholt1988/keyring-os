'use client';

import { useEffect, useState } from 'react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { Settings, PlayCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchWorkflows, fetchWorkflowExecutions, triggerWorkflow } from '@/lib/copilot-api';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    Promise.all([fetchWorkflows(), fetchWorkflowExecutions()]).then(([wf, ex]) => {
      setWorkflows(wf as any[]);
      setExecutions(ex as any[]);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTrigger = async (id: string) => {
    await triggerWorkflow(id, { tenantId: 'sample', title: 'Test from UI' });
    loadData();
  };

  if (loading) {
    return (
      <WorkspaceShell title="AI Workflows" icon={Settings} subtitle="Automated Processes">
        <div className="flex justify-center p-12 text-[#94A3B8]">Loading workflows...</div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="AI Workflows" icon={Settings} subtitle="Command Center">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="border-b border-[#1E3350] pb-2 font-[family-name:var(--font-space)] text-lg font-semibold text-[#F8FAFC]">Available Workflows</h2>
          {workflows.map(wf => (
            <div key={wf.id} className="flex items-center justify-between rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.20)]">
              <div>
                <h3 className="text-sm font-medium text-[#F8FAFC]">{wf.name}</h3>
                <p className="mt-1 text-xs text-[#94A3B8]">{wf.description}</p>
                <div className="mt-2 flex gap-2">
                  {wf.steps?.slice(0, 3).map((step: any, i: number) => (
                    <span key={i} className="rounded-full bg-[#0F1B31] px-2 py-0.5 text-[10px] text-[#CBD5E1]">{step.type}</span>
                  ))}
                  {(wf.steps?.length || 0) > 3 && <span className="text-[10px] text-[#94A3B8]">+{wf.steps.length - 3} more</span>}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleTrigger(wf.id)}>
                <PlayCircle className="mr-2 h-4 w-4" /> Run
              </Button>
            </div>
          ))}
          {workflows.length === 0 && <div className="text-sm text-[#94A3B8]">No workflows registered.</div>}
        </div>
        
        <div className="space-y-4">
          <h2 className="border-b border-[#1E3350] pb-2 font-[family-name:var(--font-space)] text-lg font-semibold text-[#F8FAFC]">Recent Executions</h2>
          {executions.map(ex => (
            <div key={ex.id} className="rounded-[24px] border border-[#1E3350] bg-[#13233C] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.20)]">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs text-[#94A3B8]">{ex.id.split('-')[1] || ex.id}</span>
                  <h3 className="text-sm font-medium text-[#F8FAFC]">{ex.workflowId}</h3>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  ex.status === 'COMPLETED' ? 'bg-[#10B981]/10 text-[#10B981]' :
                  ex.status === 'FAILED' ? 'bg-[#F43F5E]/10 text-[#F43F5E]' :
                  'bg-[#38BDF8]/10 text-[#38BDF8]'
                }`}>
                  {ex.status}
                </span>
              </div>
              <div className="mt-2 flex items-center text-xs text-[#94A3B8]">
                <Clock className="mr-1 h-3 w-3" />
                {new Date(ex.startedAt).toLocaleString()}
                {ex.completedAt && ` \u2022 ${Math.round((new Date(ex.completedAt).getTime() - new Date(ex.startedAt).getTime()) / 1000)}s`}
              </div>
            </div>
          ))}
          {executions.length === 0 && <div className="text-sm text-[#94A3B8]">No recent executions.</div>}
        </div>
      </div>
    </WorkspaceShell>
  );
}
