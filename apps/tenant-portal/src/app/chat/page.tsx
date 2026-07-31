import React from 'react';
import { ChatWindow, NotificationFeed } from '../../../../../shared-ui/components';

const TenantChatPage: React.FC = () => {
  const user = 'tenant';
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Tenant Live Chat</h2>
      <>
        <ChatWindow user={user} />
        <NotificationFeed />
      </>
    </div>
  );
};

export default TenantChatPage;
