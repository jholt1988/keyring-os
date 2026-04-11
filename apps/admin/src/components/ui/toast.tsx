'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

let _nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = ++_nextId;
    setToasts((prev) => [...prev, { id, message, variant }]);
    if (variant !== 'error') {
      setTimeout(() => dismiss(id), 4000);
    }
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Toast Item ────────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const variantStyles: Record<ToastVariant, string> = {
    success: 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]',
    error:   'border-[#F43F5E]/40 bg-[#F43F5E]/10 text-[#F43F5E]',
    info:    'border-[#3B82F6]/40 bg-[#3B82F6]/10 text-[#3B82F6]',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm min-w-[260px] max-w-[380px] ${variantStyles[toast.variant]}`}
    >
      {toast.variant === 'success' && <CheckCircle2 size={16} className="shrink-0" />}
      {toast.variant === 'error' && <XCircle size={16} className="shrink-0" />}
      <p className="flex-1 text-sm font-medium text-[#F8FAFC]">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}
