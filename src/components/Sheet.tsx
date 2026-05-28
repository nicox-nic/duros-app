'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function Sheet({ children, onClose, title, description }: SheetProps) {
  return (
    <div
      className="fixed inset-0 z-[150] bg-charcoal/30 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl border border-line shadow-soft-lg',
          'p-5 md:p-6 max-h-[85vh] overflow-y-auto scrollbar-none relative'
        )}
      >
        <div className="w-8 h-1 bg-charcoal/15 rounded-full md:hidden absolute left-1/2 -translate-x-1/2 top-2.5" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 grid place-items-center text-mist hover:text-charcoal"
        >
          <X size={18} />
        </button>
        {title && (
          <>
            <div className="font-display text-[18px] md:text-[20px] font-medium mb-1 pr-8">{title}</div>
            {description && (
              <div className="text-[11px] md:text-[13px] text-mist mb-4 md:mb-5">{description}</div>
            )}
          </>
        )}
        {children}
      </div>
    </div>
  );
}
