import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';

export interface Notification {
  title: string;
  body: string;
  timestamp: number;
}

export function useNotificationSocket() {
  const [notifications, setNotifications] = useState([] as Notification[]);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    const socket = io({ path: '/api/socket.io' });
    socketRef.current = socket;
    socket.on('notification', (note: Notification) => {
      setNotifications((prev: Notification[]) => [...prev, note]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendNotification = (note: Omit<Notification, 'timestamp'>) => {
    const full = { ...note, timestamp: Date.now() };
    socketRef.current?.emit('notification', full);
    setNotifications((prev: Notification[]) => [...prev, full]);
  };

  return { notifications, sendNotification };
}
