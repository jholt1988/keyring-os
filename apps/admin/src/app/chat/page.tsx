import React from 'react';
import { ChatWindow, NotificationFeed } from '../../../../../shared-ui/components';

const AdminChatPage: React.FC = () => {
  const user = 'admin';
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Admin Live Chat</h2>
      <>
        <ChatWindow user={user} />
        <NotificationFeed />
      </>
    </div>
  );
};

export default AdminChatPage;
