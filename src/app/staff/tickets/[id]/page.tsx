'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentUser } from '@/lib/store';
import { Badge, IconBox, Button } from '@/components/ui';
import { cn, formatRelativeTime, formatTimeOfDay, getSLATime } from '@/lib/utils';
import type { TicketStatus, TicketUpdate } from '@/lib/types';
import {
  ChevronLeft,
  MoreVertical,
  Home,
  Wrench,
  Clock,
  Check,
  CircleDot,
  X,
  AlertTriangle,
  UserPlus,
  Activity,
  ImageIcon,
  Send,
  MessageSquare,
  StickyNote,
} from 'lucide-react';

// =============================================================================
// PAGE
// =============================================================================

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const ticketId = params.id;

  // Subscribe to the realtime tick so the SLA countdown updates
  useAppStore((s) => s.realtimeTick);

  const ticket = useAppStore((s) => s.tickets.find((t) => t.id === ticketId));
  const staff = useAppStore(
    useShallow((s) =>
      s.users.filter(
        (u) =>
          u.propertyId === ticket?.propertyId &&
          u.role !== 'resident' &&
          u.role !== 'property_manager' &&
          u.role !== 'super_admin'
      )
    )
  );

  const assignTicket = useAppStore((s) => s.assignTicket);
  const updateTicketStatus = useAppStore((s) => s.updateTicketStatus);
  const addTicketUpdate = useAppStore((s) => s.addTicketUpdate);
  const me = useCurrentUser();

  const [activeSubTab, setActiveSubTab] = useState<'updates' | 'notes' | 'chat'>('updates');
  const [noteInput, setNoteInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  if (!ticket) {
    return (
      <div className="flex-1 grid place-items-center text-center p-8">
        <div>
          <div className="font-display text-[20px] font-medium mb-1">Ticket not found</div>
          <div className="text-mist text-[12px] mb-4">It may have been deleted or moved.</div>
          <Link href="/staff/tickets" className="text-champagne-deep text-[12px] font-medium">
            ← Back to tickets
          </Link>
        </div>
      </div>
    );
  }

  const sla = getSLATime(ticket.slaDeadline);

  const statusBadge: {
    variant: 'urgent' | 'pending' | 'progress' | 'complete' | 'approval' | 'reject';
    label: string;
  } = (() => {
    switch (ticket.status) {
      case 'urgent': return { variant: 'urgent', label: 'Urgent' };
      case 'pending': return { variant: 'pending', label: 'Pending' };
      case 'in_progress': return { variant: 'progress', label: 'In Progress' };
      case 'for_approval': return { variant: 'approval', label: 'For Approval' };
      case 'approved': return { variant: 'complete', label: 'Approved' };
      case 'rejected': return { variant: 'reject', label: 'Rejected' };
      case 'completed': return { variant: 'complete', label: 'Completed' };
      case 'reopened': return { variant: 'urgent', label: 'Reopened' };
      default: return { variant: 'pending', label: ticket.status };
    }
  })();

  return (
    <div className="flex-1 flex flex-col overflow-hidden md:block md:overflow-visible">
      <div className="md:max-w-[1100px] md:mx-auto md:px-8 md:py-8 flex-1 flex flex-col md:block overflow-hidden md:overflow-visible">

        {/* ========================================================== */}
        {/* TOP BAR                                                     */}
        {/* ========================================================== */}
        <div className="flex items-center justify-between pt-1.5 pb-3 md:pb-4 shrink-0">
          <Link href="/staff/tickets" className="w-8 h-8 md:w-9 md:h-9 bg-charcoal/5 rounded-lg grid place-items-center hover:bg-charcoal/10">
            <ChevronLeft size={16} />
          </Link>
          <div className="font-display text-[16px] md:text-[18px] font-medium">Ticket Details</div>
          <button className="w-8 h-8 md:w-9 md:h-9 grid place-items-center text-slate hover:bg-charcoal/5 rounded-lg">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* ========================================================== */}
        {/* SCROLLABLE BODY (mobile) / FULL LAYOUT (desktop)            */}
        {/* ========================================================== */}
        <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible md:grid md:grid-cols-3 md:gap-6">

          {/* ====== LEFT COLUMN ON DESKTOP / FULL ON MOBILE ===== */}
          <div className="md:col-span-2 space-y-0 md:space-y-4">

            {/* HEADER BLOCK */}
            <div className="md:bg-white md:border md:border-line md:rounded-2xl md:p-6 md:shadow-soft-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                <span className="text-[10px] md:text-[11px] text-mist font-mono">#{ticket.reference}</span>
              </div>
              <h1 className="font-display text-[20px] md:text-[28px] font-medium tracking-tight mt-1 mb-3 md:mb-4">
                {ticket.title}
              </h1>

              <div className="space-y-1 text-[11px] md:text-[13px] text-slate">
                <div className="flex items-center gap-2">
                  <Home size={12} className="text-mist md:hidden" />
                  <Home size={14} className="text-mist hidden md:block" />
                  <span>
                    Unit {ticket.resident.unitNumber} · {ticket.resident.name} · {ticket.resident.tower}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench size={12} className="text-mist md:hidden" />
                  <Wrench size={14} className="text-mist hidden md:block" />
                  <span>
                    {ticket.department} · {formatRelativeTime(ticket.createdAt)}
                  </span>
                </div>
                {ticket.assignedTo && (
                  <div className="flex items-center gap-2">
                    <UserPlus size={12} className="text-mist md:hidden" />
                    <UserPlus size={14} className="text-mist hidden md:block" />
                    <span>Assigned to {ticket.assignedTo.name}</span>
                  </div>
                )}
              </div>

              {/* SLA BANNER — only show for open tickets */}
              {ticket.status !== 'completed' && ticket.status !== 'rejected' && (
                <>
                  {sla && !sla.expired && sla.severity === 'danger' && (
                    <div className="mt-3 md:mt-4 flex items-center gap-2 px-3 py-2.5 bg-danger-bg rounded-xl text-[10.5px] md:text-[13px] text-danger font-semibold">
                      <Clock size={14} />
                      SLA Breach in {sla.display} — High Priority
                    </div>
                  )}
                  {sla && !sla.expired && sla.severity === 'warning' && (
                    <div className="mt-3 md:mt-4 flex items-center gap-2 px-3 py-2.5 bg-warning-bg rounded-xl text-[10.5px] md:text-[13px] text-warning font-semibold">
                      <Clock size={14} />
                      SLA: {sla.display} remaining
                    </div>
                  )}
                  {sla?.expired && (
                    <div className="mt-3 md:mt-4 flex items-center gap-2 px-3 py-2.5 bg-danger-bg rounded-xl text-[10.5px] md:text-[13px] text-danger font-semibold">
                      <AlertTriangle size={14} />
                      SLA breached — escalate immediately
                    </div>
                  )}
                </>
              )}
            </div>

            {/* DESCRIPTION + PHOTOS */}
            <div className="mt-4 md:mt-0 md:bg-white md:border md:border-line md:rounded-2xl md:p-6 md:shadow-soft-sm">
              <SectionLabel>Description</SectionLabel>
              <p className="text-[12px] md:text-[14px] text-charcoal leading-relaxed">
                {ticket.description}
              </p>

              {ticket.photos.length > 0 && (
                <>
                  <SectionLabel className="mt-4 md:mt-5">
                    Photos Attached · {ticket.photos.length}
                  </SectionLabel>
                  <div className="grid grid-cols-4 gap-1.5 md:gap-2">
                    {ticket.photos.slice(0, 4).map((url, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg md:rounded-xl bg-cover bg-center bg-ivory-deep"
                        style={{ backgroundImage: `url('${url}')` }}
                      />
                    ))}
                    {ticket.photos.length > 4 && (
                      <div className="aspect-square rounded-lg md:rounded-xl bg-charcoal/5 grid place-items-center text-[10px] md:text-[12px] font-semibold text-slate">
                        +{ticket.photos.length - 4}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* SUB-TABS */}
            <div className="mt-4 md:mt-0 md:bg-white md:border md:border-line md:rounded-2xl md:p-6 md:shadow-soft-sm">
              <div className="flex gap-4 md:gap-6 border-b border-line mb-3 md:mb-4">
                {(['updates', 'notes', 'chat'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSubTab(tab)}
                    className={cn(
                      'pb-2 md:pb-3 text-[11px] md:text-[13px] font-medium relative transition-colors',
                      activeSubTab === tab ? 'text-charcoal font-semibold' : 'text-mist hover:text-slate'
                    )}
                  >
                    {tab === 'updates' && 'Updates'}
                    {tab === 'notes' && 'Internal Notes'}
                    {tab === 'chat' && 'Chat'}
                    {activeSubTab === tab && (
                      <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-champagne rounded-t" />
                    )}
                  </button>
                ))}
              </div>

              {activeSubTab === 'updates' && (
                <Timeline updates={ticket.updates} ticketStatus={ticket.status} />
              )}
              {activeSubTab === 'notes' && (
                <NotesTab
                  notes={ticket.updates.filter((u) => u.type === 'note')}
                  input={noteInput}
                  onInputChange={setNoteInput}
                  onSubmit={() => {
                    if (!noteInput.trim() || !me) return;
                    addTicketUpdate(ticket.id, {
                      type: 'note',
                      authorId: me.id,
                      authorName: me.fullName,
                      content: noteInput.trim(),
                    });
                    setNoteInput('');
                  }}
                  meName={me?.fullName ?? 'You'}
                />
              )}
              {activeSubTab === 'chat' && (
                <ChatTab
                  messages={ticket.updates.filter((u) => u.type === 'message')}
                  input={chatInput}
                  onInputChange={setChatInput}
                  onSubmit={() => {
                    if (!chatInput.trim() || !me) return;
                    addTicketUpdate(ticket.id, {
                      type: 'message',
                      authorId: me.id,
                      authorName: me.fullName,
                      content: chatInput.trim(),
                    });
                    setChatInput('');
                  }}
                  meName={me?.fullName ?? 'You'}
                  residentName={ticket.resident.name}
                />
              )}
            </div>

            {/* ACTION ROW — mobile (sticky at bottom) */}
            <div className="md:hidden pt-3 pb-2 flex gap-2 sticky bottom-0 bg-ivory">
              <button
                onClick={() => setStatusOpen(true)}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne"
              >
                Update Status
              </button>
              <button
                onClick={() => setAssignOpen(true)}
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-line-strong text-charcoal text-[12px] font-medium"
              >
                Assign Staff
              </button>
            </div>
          </div>

          {/* ====== RIGHT COLUMN (DESKTOP ONLY) — Actions ===== */}
          <div className="hidden md:block space-y-4">
            <div className="bg-white border border-line rounded-2xl p-5 shadow-soft-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-mist font-semibold mb-3">
                Actions
              </div>
              <div className="space-y-2">
                <Button fullWidth onClick={() => setStatusOpen(true)}>
                  Update Status
                </Button>
                <Button fullWidth variant="secondary" onClick={() => setAssignOpen(true)}>
                  Assign Staff
                </Button>
              </div>
            </div>

            {/* Quick info card */}
            <div className="bg-white border border-line rounded-2xl p-5 shadow-soft-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-mist font-semibold mb-3">
                Quick Info
              </div>
              <dl className="space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <dt className="text-mist">Priority</dt>
                  <dd className="font-semibold capitalize">{ticket.priority}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Department</dt>
                  <dd className="font-semibold">{ticket.department}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Type</dt>
                  <dd className="font-semibold capitalize">{ticket.type}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-mist">Created</dt>
                  <dd className="font-semibold">{formatRelativeTime(ticket.createdAt)}</dd>
                </div>
                {ticket.completedAt && (
                  <div className="flex justify-between">
                    <dt className="text-mist">Completed</dt>
                    <dd className="font-semibold">{formatRelativeTime(ticket.completedAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* SHEETS / MODALS                                             */}
      {/* ========================================================== */}
      {assignOpen && (
        <AssignSheet
          ticket={ticket}
          staff={staff}
          onClose={() => setAssignOpen(false)}
          onAssign={(staffId) => {
            assignTicket(ticket.id, staffId);
            setAssignOpen(false);
          }}
        />
      )}
      {statusOpen && (
        <StatusSheet
          currentStatus={ticket.status}
          onClose={() => setStatusOpen(false)}
          onUpdate={(status, note) => {
            updateTicketStatus(ticket.id, status, note);
            setStatusOpen(false);
          }}
        />
      )}
    </div>
  );
}

// =============================================================================
// SECTION LABEL
// =============================================================================

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:mb-3 md:text-[11px]',
        className
      )}
    >
      {children}
    </div>
  );
}

// =============================================================================
// TIMELINE
// =============================================================================

function Timeline({ updates, ticketStatus }: { updates: TicketUpdate[]; ticketStatus: TicketStatus }) {
  if (updates.length === 0) {
    return (
      <div className="text-center py-6 md:py-10 text-mist text-[11px] md:text-[13px]">
        No updates yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {updates.map((update) => (
        <TimelineItem key={update.id} update={update} />
      ))}

      {/* Pending state if not completed */}
      {ticketStatus !== 'completed' && ticketStatus !== 'rejected' && (
        <div className="flex gap-2.5 md:gap-3 items-start pl-1">
          <div className="w-5 h-5 md:w-6 md:h-6 bg-warning-bg text-warning rounded-md grid place-items-center shrink-0">
            <CircleDot size={11} />
          </div>
          <div className="flex-1">
            <div className="text-[11px] md:text-[13px] font-semibold text-charcoal">
              Waiting for resident confirmation
            </div>
            <div className="text-[10px] md:text-[11px] text-mist mt-0.5">Pending</div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ update }: { update: TicketUpdate }) {
  const config = (() => {
    switch (update.type) {
      case 'assigned':
        return { Icon: UserPlus, bg: 'bg-info-bg', color: 'text-info' };
      case 'status_change':
        return { Icon: Check, bg: 'bg-success-bg', color: 'text-success' };
      case 'note':
        return { Icon: Activity, bg: 'bg-charcoal/5', color: 'text-slate' };
      case 'photo':
        return { Icon: ImageIcon, bg: 'bg-champagne/15', color: 'text-champagne-deep' };
      case 'message':
        return { Icon: Activity, bg: 'bg-info-bg', color: 'text-info' };
    }
  })();
  const Icon = config.Icon;

  return (
    <div className="flex gap-2.5 md:gap-3 items-start pl-1">
      <div className={cn('w-5 h-5 md:w-6 md:h-6 rounded-md grid place-items-center shrink-0', config.bg, config.color)}>
        <Icon size={11} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] md:text-[13px] font-semibold text-charcoal">{update.content}</div>
        <div className="text-[10px] md:text-[11px] text-mist mt-0.5">
          {update.authorName} · {formatTimeOfDay(update.timestamp)} · {formatRelativeTime(update.timestamp)}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// INTERNAL NOTES TAB
// =============================================================================

function NotesTab({
  notes,
  input,
  onInputChange,
  onSubmit,
  meName,
}: {
  notes: TicketUpdate[];
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  meName: string;
}) {
  return (
    <div>
      <div className="flex items-start gap-2 px-3 py-2.5 bg-warning-bg/40 border border-warning/15 rounded-xl text-[10.5px] md:text-[11.5px] text-warning mb-3">
        <StickyNote size={11} className="shrink-0 mt-0.5" />
        <span>Internal notes are visible only to staff — never shown to the resident.</span>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-4 md:py-6 text-mist text-[11px] md:text-[12.5px]">
          No internal notes yet.
        </div>
      ) : (
        <div className="space-y-2 mb-3">
          {notes.map((n) => (
            <div key={n.id} className="bg-warning-bg/30 border border-warning/15 rounded-xl px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <div className="text-[11px] md:text-[12px] font-semibold text-charcoal">{n.authorName}</div>
                <div className="text-[9.5px] md:text-[10.5px] text-mist shrink-0">{formatRelativeTime(n.timestamp)}</div>
              </div>
              <div className="text-[11px] md:text-[12.5px] text-slate whitespace-pre-wrap leading-snug">{n.content}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          placeholder={`Add a note as ${meName}…`}
          className="flex-1 px-3 py-2 bg-ivory-deep/60 border border-line rounded-xl text-[12px] focus:outline-none focus:border-line-strong"
        />
        <button
          onClick={onSubmit}
          disabled={!input.trim()}
          className="w-10 grid place-items-center rounded-xl bg-charcoal text-ivory disabled:opacity-40 shrink-0"
          aria-label="Add note"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// CHAT TAB
// =============================================================================

function ChatTab({
  messages,
  input,
  onInputChange,
  onSubmit,
  meName,
  residentName,
}: {
  messages: TicketUpdate[];
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: () => void;
  meName: string;
  residentName: string;
}) {
  return (
    <div>
      <div className="flex items-start gap-2 px-3 py-2.5 bg-info-bg/40 border border-info/15 rounded-xl text-[10.5px] md:text-[11.5px] text-info mb-3">
        <MessageSquare size={11} className="shrink-0 mt-0.5" />
        <span>Messages here are sent to <strong>{residentName}</strong> via the Home AI app.</span>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-4 md:py-6 text-mist text-[11px] md:text-[12.5px]">
          No messages yet — start the conversation below.
        </div>
      ) : (
        <div className="space-y-2 mb-3">
          {messages.map((m) => {
            const isMe = m.authorName === meName;
            return (
              <div key={m.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%]', isMe ? 'items-end' : 'items-start')}>
                  <div
                    className={cn(
                      'px-3 py-2 text-[11.5px] md:text-[12.5px] leading-snug',
                      isMe
                        ? 'bg-gradient-to-br from-charcoal to-charcoal-soft text-ivory rounded-2xl rounded-tr-md'
                        : 'bg-ivory-deep/80 text-charcoal rounded-2xl rounded-tl-md border border-line'
                    )}
                  >
                    {m.content}
                  </div>
                  <div className={cn('text-[9.5px] text-mist mt-0.5 px-1', isMe ? 'text-right' : 'text-left')}>
                    {m.authorName} · {formatRelativeTime(m.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          placeholder={`Reply to ${residentName}…`}
          className="flex-1 px-3 py-2 bg-ivory-deep/60 border border-line rounded-xl text-[12px] focus:outline-none focus:border-line-strong"
        />
        <button
          onClick={onSubmit}
          disabled={!input.trim()}
          className="w-10 grid place-items-center rounded-xl bg-charcoal text-ivory disabled:opacity-40 shrink-0"
          aria-label="Send message"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// ASSIGN SHEET
// =============================================================================

function AssignSheet({
  ticket,
  staff,
  onClose,
  onAssign,
}: {
  ticket: { assignedTo?: { id: string; name: string } };
  staff: ReturnType<typeof useAppStore.getState>['users'];
  onClose: () => void;
  onAssign: (staffId: string) => void;
}) {
  return (
    <SheetBackdrop onClose={onClose}>
      <div className="font-display text-[18px] md:text-[20px] font-medium mb-1">Assign Staff</div>
      <div className="text-[11px] md:text-[13px] text-mist mb-4 md:mb-5">
        Select a team member to take ownership of this ticket.
      </div>

      <div className="space-y-1.5 max-h-[60vh] overflow-y-auto scrollbar-none">
        {staff.map((s) => {
          const isCurrent = ticket.assignedTo?.id === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onAssign(s.id)}
              disabled={isCurrent}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                isCurrent ? 'bg-success-bg' : 'hover:bg-ivory-deep'
              )}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep grid place-items-center text-white font-semibold text-[11px] shrink-0">
                {s.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] md:text-[13.5px] font-semibold">{s.fullName}</div>
                <div className="text-[10px] md:text-[11px] text-mist uppercase tracking-wider">
                  {s.department} · {s.isOnline ? 'Online' : 'Offline'}
                  {s.workloadPct !== undefined && s.workloadPct > 0 && (
                    <span className="ml-1.5">· {s.workloadPct}% load</span>
                  )}
                </div>
              </div>
              {isCurrent && <Check size={16} className="text-success shrink-0" />}
            </button>
          );
        })}
      </div>
    </SheetBackdrop>
  );
}

// =============================================================================
// STATUS SHEET
// =============================================================================

function StatusSheet({
  currentStatus,
  onClose,
  onUpdate,
}: {
  currentStatus: TicketStatus;
  onClose: () => void;
  onUpdate: (status: TicketStatus, note?: string) => void;
}) {
  const [note, setNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus | null>(null);

  const statuses: { id: TicketStatus; label: string; description: string; color: string }[] = [
    { id: 'pending', label: 'Pending', description: 'Awaiting assignment or review.', color: 'bg-warning-bg text-warning' },
    { id: 'in_progress', label: 'In Progress', description: 'Work has started on-site.', color: 'bg-info-bg text-info' },
    { id: 'completed', label: 'Completed', description: 'Work finished and verified.', color: 'bg-success-bg text-success' },
    { id: 'reopened', label: 'Reopened', description: 'Issue persists — needs another look.', color: 'bg-danger-bg text-danger' },
  ];

  return (
    <SheetBackdrop onClose={onClose}>
      <div className="font-display text-[18px] md:text-[20px] font-medium mb-1">Update Status</div>
      <div className="text-[11px] md:text-[13px] text-mist mb-4 md:mb-5">
        Pick the new status. The resident will be notified via Home AI.
      </div>

      <div className="space-y-1.5 mb-4">
        {statuses.map((s) => {
          const isCurrent = currentStatus === s.id;
          const isSelected = selectedStatus === s.id;
          return (
            <button
              key={s.id}
              onClick={() => !isCurrent && setSelectedStatus(s.id)}
              disabled={isCurrent}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all border',
                isCurrent && 'opacity-50 cursor-not-allowed border-line',
                isSelected && 'border-champagne bg-champagne/5',
                !isCurrent && !isSelected && 'border-line hover:bg-ivory-deep'
              )}
            >
              <div className={cn('w-9 h-9 rounded-xl grid place-items-center shrink-0', s.color)}>
                <Check size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] md:text-[14px] font-semibold flex items-center gap-2">
                  {s.label}
                  {isCurrent && (
                    <span className="text-[9px] text-mist font-medium uppercase tracking-wider">Current</span>
                  )}
                </div>
                <div className="text-[10px] md:text-[11.5px] text-mist mt-0.5">{s.description}</div>
              </div>
              {isSelected && <Check size={16} className="text-champagne-deep shrink-0" />}
            </button>
          );
        })}
      </div>

      {selectedStatus && (
        <>
          <SectionLabel>Note (optional)</SectionLabel>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for the resident or your team…"
            className="w-full px-3 py-2.5 rounded-xl border border-line bg-ivory-deep/30 text-[12px] md:text-[13px] focus:outline-none focus:border-champagne resize-none"
            rows={2}
          />
          <div className="mt-4 flex gap-2">
            <Button fullWidth variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button fullWidth onClick={() => onUpdate(selectedStatus, note.trim() || undefined)}>
              Confirm Update
            </Button>
          </div>
        </>
      )}
    </SheetBackdrop>
  );
}

// =============================================================================
// SHEET BACKDROP (bottom sheet on mobile, centered modal on desktop)
// =============================================================================

function SheetBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[150] bg-charcoal/30 backdrop-blur-sm flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl border border-line shadow-soft-lg',
          'p-5 md:p-6 max-h-[85vh] overflow-y-auto scrollbar-none',
          'animate-in slide-in-from-bottom duration-300'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-8 h-1 bg-charcoal/15 rounded-full md:hidden mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div className="flex-1" />
          <button onClick={onClose} className="w-8 h-8 grid place-items-center text-mist hover:text-charcoal -mr-2 -mt-1">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
