'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full m-4 rounded-[24px]',
};

export function Drawer({ open, onClose, title, subtitle, children, footer, size = 'md' }: DrawerProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isFull = size === 'full';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#07111F]/60 backdrop-blur-sm">
      <div 
        className={`flex flex-col bg-[#0F1B31] shadow-2xl transition-transform duration-300 transform ${open ? 'translate-x-0' : 'translate-x-full'} ${sizeClasses[size]} w-full ${!isFull && 'border-l border-[#1E3350]'}`}
      >
        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between border-b border-[#1E3350] p-6">
            <div>
              {title && <h2 className="font-[family-name:var(--font-space)] text-xl font-semibold text-[#F8FAFC]">{title}</h2>}
              {subtitle && <p className="mt-1 text-sm text-[#94A3B8]">{subtitle}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-[#94A3B8] hover:text-[#F8FAFC]">
              <X size={20} />
            </Button>
          </div>
        )}
        {!title && !subtitle && (
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4 z-10 text-[#94A3B8] hover:text-[#F8FAFC]">
            <X size={20} />
          </Button>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-[#1E3350] bg-[#0A1324] p-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
