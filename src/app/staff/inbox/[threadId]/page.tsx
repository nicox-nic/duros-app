'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppStore, useCurrentUser } from '@/lib/store';
import { PageHeader } from '@/components/PageHeader';
import { cn, formatRelativeTime, formatTimeOfDay } from '@/lib/utils';
import { Send, FileText, ExternalLink } from 'lucide-react';

export default function StaffMessageThreadPage() {
  const params = useParams<{ threadId: string }>();
  const me = useCurrentUser();
  const message = useAppStore((s) => s.messages.find((m) => m.id === params.threadId));
  const markRead = useAppStore((s) => s.markMessageRead);
  const pushMessage = useAppStore((s) => s.pushMessage);

  const [reply, setReply] = useState('');

  useEffect(() => {
    if (message?.unread) markRead(message.id);
  }, [message?.id, message?.unread, markRead]);

  if (!message) {
    return (
      <div className="flex-1 grid place-items-center text-center p-8">
        <div className="font-display text-[20px] font-medium mb-1">Message not found</div>
        <Link href="/staff/inbox" className="text-champagne-deep text-[12px] font-medium">← Back to inbox</Link>
      </div>
    );
  }

  const handleReply = () => {
    if (!reply.trim() || !me) return;
    pushMessage({
      propertyId: message.propertyId,
      category: message.category,
      fromId: me.id,
      fromName: me.fullName,
      fromInitials: me.initials,
      fromRole: me.role,
      toId: message.fromId,
      subject: `Re: ${message.subject}`,
      preview: reply.trim().slice(0, 80),
      body: reply.trim(),
      unread: true,
      relatedTicketId: message.relatedTicketId,
    });
    setReply('');
    alert('Reply sent.');
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[700px] md:mx-auto md:px-8 md:py-8">
        <PageHeader title="Conversation" backHref="/staff/inbox" />

        {/* THREAD HEADER */}
        <div className="md:bg-white md:border md:border-line md:rounded-2xl md:p-6 md:shadow-soft-sm md:mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-gray to-info grid place-items-center text-white font-semibold text-[12px] md:text-[14px] shrink-0">
              {message.fromInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[14px] md:text-[16px] font-medium">{message.fromName}</div>
              <div className="text-[10px] md:text-[11.5px] text-mist uppercase tracking-wider">{message.fromRole.replace(/_/g, ' ')} · {formatRelativeTime(message.timestamp)}</div>
            </div>
          </div>
          <div className="font-display text-[16px] md:text-[20px] font-medium tracking-tight mb-3">{message.subject}</div>
          <div className="text-[12px] md:text-[14px] text-charcoal leading-relaxed whitespace-pre-wrap">{message.body}</div>

          {message.relatedTicketId && (
            <Link
              href={`/staff/tickets/${message.relatedTicketId}`}
              className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-charcoal/5 hover:bg-charcoal/10 rounded-xl text-[11px] md:text-[12.5px] font-medium text-charcoal transition-colors"
            >
              <FileText size={14} />
              View related ticket
              <ExternalLink size={12} />
            </Link>
          )}
        </div>

        {/* REPLY BOX */}
        <div className="mt-4 md:mt-0 md:bg-white md:border md:border-line md:rounded-2xl md:p-6 md:shadow-soft-sm">
          <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">Reply</div>
          <textarea
            rows={4}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Type your reply..."
            className="w-full bg-charcoal/[0.03] border border-line rounded-xl px-3.5 py-3 text-[13px] focus:outline-none focus:border-champagne resize-none"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleReply}
              disabled={!reply.trim()}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all',
                reply.trim() ? 'bg-gradient-to-br from-champagne-soft to-champagne-deep text-white shadow-champagne' : 'bg-charcoal/10 text-mist cursor-not-allowed'
              )}
            >
              <Send size={13} /> Send Reply
            </button>
          </div>
        </div>
        <div className="h-6" />
      </div>
    </div>
  );
}
