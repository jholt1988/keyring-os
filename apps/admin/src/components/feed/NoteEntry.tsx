// components/feed/NoteEntry.tsx
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Save, Loader2 } from 'lucide-react';

interface Props {
  itemId: string;
  existingNote?: string;
}

export const NoteEntry = ({ itemId, existingNote }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(existingNote ?? '');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/feed/${itemId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ narrative: text }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      setIsEditing(false);
    },
  });

  if (!isEditing && !note) {
    return (
      <button 
        onClick={() => setIsEditing(true)}
        className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-tight"
      >
        <MessageSquare size={12} />
        Add Adjuster Narrative
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2 border-t pt-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-gray-400 uppercase">Adjuster Notes</label>
        {isEditing && (
           <button 
             onClick={() => mutate(note)}
             disabled={isPending}
             className="flex items-center gap-1 text-[10px] font-bold text-green-600 hover:text-green-700"
           >
             {isPending ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
             COMMIT TO LEDGER
           </button>
        )}
      </div>
      
      {isEditing ? (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
          className="w-full rounded border bg-white p-2 text-xs font-medium focus:ring-1 focus:ring-primary min-h-[80px] shadow-inner"
          placeholder="Enter peril context, depreciation logic, or site observations..."
        />
      ) : (
        <p 
          onClick={() => setIsEditing(true)}
          className="cursor-pointer text-xs italic text-gray-700 hover:bg-gray-50 p-1 rounded transition"
        >
          "{note}"
        </p>
      )}
    </div>
  );
};