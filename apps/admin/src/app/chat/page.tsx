'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { WorkspaceShell } from '@/components/copilot/workspace-shell';
import { SectionCard } from '@/components/copilot/section-card';
import { ChatWindow, NotificationFeed } from '@keyring/shared-ui/components';

const AdminChatPage: React.FC = () => {
  const user = 'admin';

  return (
    <WorkspaceShell
      title="Admin Live Chat & Alerts"
      subtitle="Real-time messaging platform and live operator notifications"
      icon={MessageSquare}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Live Chat Window" subtitle="Real-time socket channel for operator communications">
            <ChatWindow user={user} />
          </SectionCard>
        </div>
        <div>
          <SectionCard title="Live Activity Feed" subtitle="Real-time system events and alerts">
            <NotificationFeed />
          </SectionCard>
        </div>
      </div>
    </WorkspaceShell>
  );
};

export default AdminChatPage;

