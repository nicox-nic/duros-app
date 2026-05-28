'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Bell, X } from 'lucide-react';

interface ToastItem {
  id: string;
  fromName: string;
  fromInitials: string;
  preview: string;
}

/**
 * Shows a slide-in toast in the top-right whenever a new inbox message arrives.
 * Listens to `newMessageFlash` and grabs the freshest message.
 * Auto-dismisses after 5 seconds.
 */
export function InboxToast() {
  const flashCount = useAppStore((s) => s.newMessageFlash);
  const messages = useAppStore((s) => s.messages);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const lastFlashRef = useRef(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Skip seed messages on mount
  useEffect(() => {
    lastFlashRef.current = useAppStore.getState().newMessageFlash;
  }, []);

  useEffect(() => {
    if (flashCount === lastFlashRef.current) return;
    lastFlashRef.current = flashCount;
    // Freshest message is at index 0 (pushMessage prepends)
    const newest = messages[0];
    if (!newest) return;
    // Don't toast messages we sent ourselves
    if (newest.fromId === currentUserId) return;

    const toast: ToastItem = {
      id: newest.id,
      fromName: newest.fromName,
      fromInitials: newest.fromInitials,
      preview: newest.preview,
    };
    setToasts((cur) => [...cur, toast]);

    // Auto-dismiss
    setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== toast.id));
    }, 5000);
  }, [flashCount, messages, currentUserId]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[180] flex flex-col gap-2 pointer-events-none max-w-[300px]">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => setToasts((cur) => cur.filter((x) => x.id !== t.id))} />
      ))}
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <Link
      href="/staff/inbox"
      onClick={onDismiss}
      className={`
        pointer-events-auto bg-white border border-line rounded-2xl shadow-soft-md
        p-3 flex items-start gap-2.5 transition-all duration-300
        ${visible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
      `}
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep grid place-items-center text-white text-[11px] font-semibold shrink-0">
        {toast.fromInitials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Bell size={10} className="text-champagne-deep shrink-0" />
          <div className="text-[11px] font-semibold truncate">{toast.fromName}</div>
        </div>
        <div className="text-[11px] text-slate line-clamp-2 leading-snug">{toast.preview}</div>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDismiss();
        }}
        className="text-mist hover:text-charcoal w-5 h-5 grid place-items-center shrink-0 -mr-0.5"
        aria-label="Dismiss"
      >
        <X size={12} />
      </button>
    </Link>
  );
}
