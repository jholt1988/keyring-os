import React, { useState, type FormEvent } from 'react';
import { useChatSocket } from '../hooks/useChatSocket';

export const ChatWindow = ({ user }: { user: string }) => {
  const { messages, sendMessage } = useChatSocket();
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ user, text: input.trim() });
    setInput('');
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
      <div>
        {messages.map((msg: any, idx: number) => (
          <div key={idx} style={{ marginBottom: '0.5rem' }}>
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ width: '80%' }}
        />
        <button type="submit" style={{ marginLeft: '0.5rem' }}>Send</button>
      </form>
    </div>
  );
};
