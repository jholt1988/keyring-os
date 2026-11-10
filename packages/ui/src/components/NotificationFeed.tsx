import React from 'react';
import { useNotificationSocket } from '../hooks/useNotificationSocket';

export const NotificationFeed = () => {
  const { notifications } = useNotificationSocket();
  return (
    <div style={{ border: '1px solid #ddd', padding: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
      <h4>Live Notifications</h4>
      {notifications.map((n: any, i: number) => (
        <div key={i} style={{ marginBottom: '0.4rem' }}>
          <strong>{n.title}</strong>: {n.body}
        </div>
      ))}
    </div>
  );
};
