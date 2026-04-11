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
        className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-[#3B82F6] hover:text-[#60A5FA]"
      >
        <MessageSquare size={12} />
        Add Adjuster Narrative
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2 border-t border-[#1E3350] pt-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold uppercase text-[#94A3B8]">Adjuster Notes</label>
        {isEditing && (
           <button 
             onClick={() => mutate(note)}
             disabled={isPending}
             className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] hover:text-[#10B981]/80"
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
          className="min-h-[80px] w-full rounded-[10px] border border-[#1E3350] bg-[#0F1B31] p-3 text-xs font-medium text-[#F8FAFC] shadow-inner focus:border-[#60A5FA] focus:outline-none focus:ring-1 focus:ring-[#60A5FA]/30"
          placeholder="Enter peril context, depreciation logic, or site observations..."
        />
      ) : (
        <p 
          onClick={() => setIsEditing(true)}
          className="cursor-pointer rounded-[10px] p-2 text-xs italic text-[#CBD5E1] transition-colors hover:bg-[#17304E]"
        >
          &ldquo;{note}&rdquo;
        </p>
      )}
    </div>
  );
};
