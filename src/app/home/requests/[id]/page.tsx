'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAppStore, useCurrentUser } from '@/lib/store';
import { Badge } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { cn, formatRelativeTime, formatTimeOfDay, getSLATime } from '@/lib/utils';
import type { TicketStatus, TicketUpdate } from '@/lib/types';
import {
  Wrench,
  Clock,
  Check,
  CircleDot,
  Send,
  Home as HomeIcon,
  UserPlus,
  Activity,
  ImageIcon,
} from 'lucide-react';

export default function ResidentRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useCurrentUser();
  useAppStore((s) => s.realtimeTick);

  const ticket = useAppStore((s) => s.tickets.find((t) => t.id === params.id));
  const addUpdate = useAppStore((s) => s.addTicketUpdate);
  const pushMessage = useAppStore((s) => s.pushMessage);

  const [reply, setReply] = useState('');

  if (!ticket || !user) {
    return (
      <div className="flex-1 grid place-items-center text-center p-8">
        <div className="font-display text-[20px] font-medium mb-1">Request not found</div>
        <Link href="/home/requests" className="text-champagne-deep text-[12px] font-medium">
          ← Back to my requests
        </Link>
      </div>
    );
  }

  // Security: only show if it belongs to this resident
  if (ticket.resident.id !== user.id) {
    return (
      <div className="flex-1 grid place-items-center text-center p-8">
        <div className="font-display text-[20px] font-medium mb-1">Not your request</div>
        <div className="text-mist text-[12px] mb-4">This request belongs to a different resident.</div>
        <Link href="/home/requests" className="text-champagne-deep text-[12px] font-medium">
          ← Back to my requests
        </Link>
      </div>
    );
  }

  const sla = getSLATime(ticket.slaDeadline);
  const statusBadge = getStatusBadge(ticket.status);

  const handleSendReply = () => {
    if (!reply.trim()) return;
    addUpdate(ticket.id, {
      type: 'message',
      authorId: user.id,
      authorName: user.fullName,
      content: reply.trim(),
    });
    // Notify staff inbox
    pushMessage({
      propertyId: ticket.propertyId,
      category: 'ticket_comment',
      fromId: user.id,
      fromName: user.fullName,
      fromInitials: user.initials,
      fromRole: 'resident',
      toId: ticket.assignedTo?.id ?? 'user-alex',
      subject: `${ticket.reference} — Resident reply`,
      preview: reply.trim().slice(0, 80),
      body: reply.trim(),
      unread: true,
      relatedTicketId: ticket.id,
    });
    setReply('');
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[700px] md:mx-auto md:px-8 md:py-8">

        <PageHeader title="Request Details" backHref="/home/requests" />

        {/* HEADER */}
        <div className="md:bg-white md:border md:border-line md:rounded-2xl md:p-6 md:shadow-soft-sm md:mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            <span className="text-[10px] md:text-[11px] text-mist font-mono">#{ticket.reference}</span>
          </div>
          <h1 className="font-display text-[20px] md:text-[26px] font-medium tracking-tight mt-1 mb-3">{ticket.title}</h1>

          <div className="space-y-1 text-[11px] md:text-[13px] text-slate">
            <div className="flex items-center gap-2"><Wrench size={12} /> {ticket.department}</div>
            <div className="flex items-center gap-2"><HomeIcon size={12} /> Unit {ticket.resident.unitNumber} · {ticket.resident.tower}</div>
            {ticket.assignedTo && (
              <div className="flex items-center gap-2"><UserPlus size={12} /> Assigned to {ticket.assignedTo.name}</div>
            )}
          </div>

          {/* SLA — friendlier wording for residents */}
          {sla && !sla.expired && ticket.status !== 'completed' && (
            <div className={cn(
              'mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10.5px] md:text-[13px] font-semibold',
              sla.severity === 'danger' && 'bg-warning-bg text-warning',
              sla.severity === 'warning' && 'bg-warning-bg text-warning',
              sla.severity === 'safe' && 'bg-success-bg text-success'
            )}>
              <Clock size={14} />
              Expected response: {sla.display}
            </div>
          )}
          {ticket.status === 'completed' && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10.5px] md:text-[13px] font-semibold bg-success-bg text-success">
              <Check size={14} />
              Resolved {ticket.completedAt && formatRelativeTime(ticket.completedAt)}
            </div>
          )}
        </div>

        {/* DESCRIPTION + PHOTOS */}
        <div className="mt-4 md:mt-0 md:bg-white md:border md:border-line md:rounded-2xl md:p-6 md:shadow-soft-sm md:mb-4">
          <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">Your Description</div>
          <p className="text-[12px] md:text-[14px] text-charcoal leading-relaxed">{ticket.description}</p>

          {ticket.photos.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mt-4 mb-2 md:text-[11px]">Photos</div>
              <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                {ticket.photos.slice(0, 4).map((url, i) => (
                  <div key={i} className="aspect-square rounded-lg md:rounded-xl bg-cover bg-center bg-ivory-deep" style={{ backgroundImage: `url('${url}')` }} />
                ))}
                {ticket.photos.length > 4 && (
                  <div className="aspect-square rounded-lg bg-charcoal/5 grid place-items-center text-[10px] font-semibold text-slate">+{ticket.photos.length - 4}</div>
                )}
              </div>
            </>
          )}
        </div>

        {/* TIMELINE */}
        <div className="mt-4 md:mt-0 md:bg-white md:border md:border-line md:rounded-2xl md:p-6 md:shadow-soft-sm md:mb-4">
          <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-3 md:text-[11px]">Activity</div>
          <Timeline updates={ticket.updates} ticketStatus={ticket.status} />
        </div>

        {/* REPLY BOX */}
        {ticket.status !== 'completed' && (
          <div className="mt-4 md:mt-0 md:bg-white md:border md:border-line md:rounded-2xl md:p-6 md:shadow-soft-sm">
            <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">Add a Reply</div>
            <textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Send a message to property management about this request..."
              className="w-full bg-charcoal/[0.03] border border-line rounded-xl px-3.5 py-3 text-[13px] focus:outline-none focus:border-champagne resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleSendReply}
                disabled={!reply.trim()}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all',
                  reply.trim()
                    ? 'bg-gradient-to-br from-champagne-soft to-champagne-deep text-white shadow-champagne'
                    : 'bg-charcoal/10 text-mist cursor-not-allowed'
                )}
              >
                <Send size={13} /> Send Reply
              </button>
            </div>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}

function Timeline({ updates, ticketStatus }: { updates: TicketUpdate[]; ticketStatus: TicketStatus }) {
  if (updates.length === 0) {
    return <div className="text-center py-4 text-mist text-[11px]">No updates yet.</div>;
  }
  return (
    <div className="space-y-3 md:space-y-4">
      {updates.map((u) => <TimelineItem key={u.id} update={u} />)}
      {ticketStatus !== 'completed' && ticketStatus !== 'rejected' && (
        <div className="flex gap-2.5 items-start pl-1">
          <div className="w-5 h-5 md:w-6 md:h-6 bg-warning-bg text-warning rounded-md grid place-items-center shrink-0">
            <CircleDot size={11} />
          </div>
          <div className="flex-1">
            <div className="text-[11px] md:text-[13px] font-semibold text-charcoal">In progress</div>
            <div className="text-[10px] md:text-[11px] text-mist mt-0.5">We&apos;ll update you as work continues.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ update }: { update: TicketUpdate }) {
  const config = (() => {
    switch (update.type) {
      case 'assigned': return { Icon: UserPlus, bg: 'bg-info-bg', color: 'text-info' };
      case 'status_change': return { Icon: Check, bg: 'bg-success-bg', color: 'text-success' };
      case 'note': return { Icon: Activity, bg: 'bg-charcoal/5', color: 'text-slate' };
      case 'photo': return { Icon: ImageIcon, bg: 'bg-champagne/15', color: 'text-champagne-deep' };
      case 'message': return { Icon: Activity, bg: 'bg-info-bg', color: 'text-info' };
    }
  })();
  const Icon = config.Icon;
  return (
    <div className="flex gap-2.5 items-start pl-1">
      <div className={cn('w-5 h-5 md:w-6 md:h-6 rounded-md grid place-items-center shrink-0', config.bg, config.color)}>
        <Icon size={11} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] md:text-[13px] font-semibold text-charcoal">{update.content}</div>
        <div className="text-[10px] md:text-[11px] text-mist mt-0.5">{update.authorName} · {formatTimeOfDay(update.timestamp)} · {formatRelativeTime(update.timestamp)}</div>
      </div>
    </div>
  );
}

function getStatusBadge(status: TicketStatus): { variant: 'urgent' | 'pending' | 'progress' | 'complete'; label: string } {
  switch (status) {
    case 'urgent': return { variant: 'urgent', label: 'Urgent' };
    case 'pending': return { variant: 'pending', label: 'Pending' };
    case 'in_progress': return { variant: 'progress', label: 'In Progress' };
    case 'completed': return { variant: 'complete', label: 'Resolved' };
    default: return { variant: 'pending', label: status };
  }
}
