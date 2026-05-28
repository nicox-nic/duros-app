'use client';

import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentUser } from '@/lib/store';
import { PageHeader } from '@/components/PageHeader';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Inbox } from 'lucide-react';

export default function ResidentMessagesPage() {
  const user = useCurrentUser();
  const messages = useAppStore(
    useShallow((s) =>
      s.messages.filter((m) => m.toId === user?.id)
    )
  );

  const sorted = [...messages].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[700px] md:mx-auto md:px-8 md:py-8">
        <PageHeader title="Messages" backHref="/home" description="From your property management team." />

        {sorted.length === 0 ? (
          <div className="bg-white border border-line rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-champagne/15 grid place-items-center text-champagne-deep mx-auto mb-3">
              <Inbox size={20} />
            </div>
            <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">No messages yet</div>
            <div className="text-[11px] md:text-[13px] text-mist">You&apos;ll see replies from staff here.</div>
          </div>
        ) : (
          <div className="md:bg-white md:border md:border-line md:rounded-2xl md:overflow-hidden md:shadow-soft-sm">
            {sorted.map((m) => (
              <Link
                key={m.id}
                href={m.relatedTicketId ? `/home/requests/${m.relatedTicketId}` : '#'}
                className={cn(
                  'flex gap-3 px-3 md:px-5 py-3 md:py-4 border-b border-line last:border-b-0 hover:bg-ivory-deep/40 transition-colors',
                  m.unread && 'bg-champagne/[0.04]'
                )}
              >
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-charcoal to-charcoal-soft grid place-items-center text-white font-semibold text-[11px] md:text-[12px] shrink-0">
                  {m.fromInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <div className={cn('text-[12px] md:text-[13.5px] truncate', m.unread ? 'font-semibold' : 'font-medium')}>{m.fromName}</div>
                    <div className="text-[9.5px] md:text-[11px] text-mist shrink-0">{formatRelativeTime(m.timestamp)}</div>
                  </div>
                  <div className={cn('text-[11px] md:text-[12.5px] truncate', m.unread ? 'text-charcoal font-medium' : 'text-slate')}>{m.subject}</div>
                  <div className="text-[10.5px] md:text-[12px] text-mist line-clamp-1 mt-0.5">{m.preview}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
