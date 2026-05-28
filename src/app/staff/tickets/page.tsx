'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Badge, IconBox } from '@/components/ui';
import { cn, formatRelativeTime, getSLATime } from '@/lib/utils';
import type { Ticket, TicketType, TicketStatus, StaffDepartment } from '@/lib/types';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  Image as ImageIcon,
  Clock,
  User,
  X,
} from 'lucide-react';
import { Sheet } from '@/components/Sheet';

// =============================================================================
// CONSTANTS
// =============================================================================

const TICKET_TYPES: { id: TicketType; label: string }[] = [
  { id: 'repair', label: 'Repair' },
  { id: 'complaint', label: 'Complaints' },
  { id: 'suggestion', label: 'Suggestions' },
  { id: 'incident', label: 'Incidents' },
];

const STATUS_FILTERS: { id: TicketStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'urgent', label: 'Urgent' },
  { id: 'pending', label: 'Pending' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'reopened', label: 'Reopened' },
];

// =============================================================================
// PAGE
// =============================================================================

export default function TicketsPage() {
  const property = useCurrentProperty();
  const allTickets = useAppStore(
    useShallow((s) => s.tickets.filter((t) => t.propertyId === property?.id))
  );
  // Realtime tick — re-render every second so SLA countdowns update
  useAppStore((s) => s.realtimeTick);

  const [activeType, setActiveType] = useState<TicketType>('repair');
  const [activeStatus, setActiveStatus] = useState<TicketStatus | 'all'>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<'all' | StaffDepartment>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allTickets
      .filter((t) => t.type === activeType)
      .filter((t) => activeStatus === 'all' || t.status === activeStatus)
      .filter((t) => filterDepartment === 'all' || t.department === filterDepartment)
      .filter((t) => filterPriority === 'all' || t.priority === filterPriority)
      .filter((t) =>
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.resident.name.toLowerCase().includes(q) ||
        t.resident.unitNumber.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        // Urgent first, then by createdAt desc
        if (a.status === 'urgent' && b.status !== 'urgent') return -1;
        if (b.status === 'urgent' && a.status !== 'urgent') return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allTickets, activeType, activeStatus, searchQuery, filterDepartment, filterPriority]);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[1100px] md:mx-auto md:px-8 md:py-8">

        {/* ========================================================== */}
        {/* TOP BAR                                                      */}
        {/* ========================================================== */}
        <div className="flex items-center justify-between pt-1.5 pb-3 md:hidden">
          <Link href="/staff/dashboard" className="w-8 h-8 bg-charcoal/5 rounded-lg grid place-items-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="font-display text-[16px] font-medium">Tickets</div>
          <button
            onClick={() => setSearchOpen(true)}
            className="w-8 h-8 grid place-items-center text-slate"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </div>

        <div className="hidden md:flex items-center justify-between mb-6">
          <div>
            <div className="font-display text-[32px] font-normal tracking-tight">Tickets</div>
            <div className="text-[13px] text-mist mt-1">
              Repair, complaints, suggestions, and incidents — managed in one queue.
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white border border-line text-[12px] text-slate hover:bg-ivory-deep flex items-center gap-2"
            >
              <Search size={14} />
              <span>{searchQuery ? `"${searchQuery.slice(0, 20)}"` : 'Search'}</span>
            </button>
            <button
              onClick={() => setFilterOpen(true)}
              className={cn(
                'px-4 py-2.5 rounded-xl border text-[12px] flex items-center gap-2 transition-colors',
                filterDepartment !== 'all' || filterPriority !== 'all'
                  ? 'bg-charcoal text-ivory border-charcoal'
                  : 'bg-white border-line text-slate hover:bg-ivory-deep'
              )}
            >
              <SlidersHorizontal size={14} />
              <span>
                Filter
                {(filterDepartment !== 'all' ? 1 : 0) + (filterPriority !== 'all' ? 1 : 0) > 0 &&
                  ` · ${(filterDepartment !== 'all' ? 1 : 0) + (filterPriority !== 'all' ? 1 : 0)}`}
              </span>
            </button>
            <Link
              href="/staff/tickets/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne"
            >
              New Ticket
            </Link>
          </div>
        </div>

        {/* ========================================================== */}
        {/* TYPE TABS                                                    */}
        {/* ========================================================== */}
        <div className="bg-charcoal/5 rounded-xl p-1 flex gap-1 mb-3 md:mb-4">
          {TICKET_TYPES.map((t) => {
            const count = allTickets.filter((tk) => tk.type === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => setActiveType(t.id)}
                className={cn(
                  'flex-1 text-center py-2 px-2 rounded-lg text-[10.5px] md:text-[12px] font-medium transition-all',
                  activeType === t.id
                    ? 'bg-white text-charcoal shadow-soft-sm font-semibold'
                    : 'text-slate hover:text-charcoal'
                )}
              >
                {t.label}
                {count > 0 && (
                  <span className={cn(
                    'ml-1.5 text-[9px] md:text-[10px] font-semibold',
                    activeType === t.id ? 'text-champagne-deep' : 'text-mist'
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================== */}
        {/* STATUS FILTER CHIPS                                          */}
        {/* ========================================================== */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none mb-3 md:mb-5 pb-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStatus(s.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[10.5px] md:text-[12px] whitespace-nowrap shrink-0 transition-all',
                activeStatus === s.id
                  ? 'bg-charcoal text-ivory border border-charcoal'
                  : 'bg-white text-slate border border-line hover:border-line-strong'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ========================================================== */}
        {/* TICKETS LIST                                                 */}
        {/* ========================================================== */}
        <div className="space-y-2.5 md:space-y-3 pb-6">
          {filteredTickets.length === 0 ? (
            <EmptyState />
          ) : (
            filteredTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
          )}
        </div>
      </div>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <Sheet
          onClose={() => setSearchOpen(false)}
          title="Search Tickets"
          description="Search by reference, title, description, resident name, or unit."
        >
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Unit 1803 or leaking faucet"
              className="w-full pl-9 pr-9 py-2.5 bg-ivory-deep/60 border border-line rounded-xl text-[13px] focus:outline-none focus:border-line-strong"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 grid place-items-center text-mist hover:text-charcoal"
                aria-label="Clear"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div className="text-[11px] text-mist mb-3">
            {filteredTickets.length} {filteredTickets.length === 1 ? 'result' : 'results'}
          </div>
          <button
            onClick={() => setSearchOpen(false)}
            className="w-full py-2.5 rounded-xl bg-charcoal text-ivory text-[12px] font-semibold"
          >
            Apply
          </button>
        </Sheet>
      )}

      {/* FILTER MODAL */}
      {filterOpen && (
        <Sheet
          onClose={() => setFilterOpen(false)}
          title="Filter Tickets"
          description="Narrow the list by department and priority."
        >
          <div className="text-[10px] uppercase tracking-wider text-mist font-semibold mb-2">Department</div>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {(['all', 'Maintenance', 'Engineering', 'Accounting', 'Security', 'Utility', 'Management', 'Other'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setFilterDepartment(d)}
                className={cn(
                  'px-2 py-2 rounded-lg text-[10.5px] font-medium border transition-colors',
                  filterDepartment === d
                    ? 'bg-charcoal text-ivory border-charcoal'
                    : 'bg-white text-slate border-line hover:bg-ivory-deep'
                )}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>

          <div className="text-[10px] uppercase tracking-wider text-mist font-semibold mb-2">Priority</div>
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {(['all', 'low', 'medium', 'high', 'urgent'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={cn(
                  'px-2 py-2 rounded-lg text-[10.5px] font-medium border transition-colors capitalize',
                  filterPriority === p
                    ? 'bg-charcoal text-ivory border-charcoal'
                    : 'bg-white text-slate border-line hover:bg-ivory-deep'
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilterDepartment('all');
                setFilterPriority('all');
              }}
              className="flex-1 py-2.5 rounded-xl bg-white border border-line text-[12px] font-semibold text-slate"
            >
              Reset
            </button>
            <button
              onClick={() => setFilterOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-charcoal text-ivory text-[12px] font-semibold"
            >
              Apply
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

// =============================================================================
// TICKET CARD
// =============================================================================

function TicketCard({ ticket }: { ticket: Ticket }) {
  const sla = getSLATime(ticket.slaDeadline);

  const statusBadge: { variant: 'urgent' | 'pending' | 'progress' | 'complete' | 'approval' | 'reject'; label: string } = (() => {
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
    <Link
      href={`/staff/tickets/${ticket.id}`}
      className="block bg-white border border-line rounded-2xl p-3 md:p-4 hover:shadow-soft-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] md:text-[14px] font-semibold leading-tight mb-1 truncate">
            {ticket.title}
          </div>
          <div className="text-[10px] md:text-[11.5px] text-mist flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <User size={10} />
              Unit {ticket.resident.unitNumber} · {ticket.resident.name}
            </span>
          </div>
        </div>
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
      </div>

      <div className="text-[10px] md:text-[11px] text-slate flex items-center gap-1.5 mb-2.5">
        <span className="w-1 h-1 rounded-full bg-champagne shrink-0" />
        <span>{ticket.department}</span>
        <span className="text-mist">·</span>
        <span>{ticket.resident.tower}</span>
        {ticket.assignedTo && (
          <>
            <span className="text-mist">·</span>
            <span>Assigned to {ticket.assignedTo.name.split(' ')[0]}</span>
          </>
        )}
      </div>

      {/* Photo strip */}
      {ticket.photos.length > 0 && (
        <div className="flex gap-1 mb-2.5">
          {ticket.photos.slice(0, 3).map((url, i) => (
            <div
              key={i}
              className="flex-1 aspect-square rounded-lg bg-ivory-deep bg-cover bg-center max-h-[52px] md:max-h-[60px]"
              style={{ backgroundImage: `url('${url}')` }}
            />
          ))}
          {ticket.photos.length > 3 && (
            <div className="flex-1 aspect-square rounded-lg bg-charcoal/5 grid place-items-center text-[10px] font-semibold text-slate max-h-[52px] md:max-h-[60px]">
              +{ticket.photos.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Foot row */}
      <div className="flex items-center justify-between text-[9.5px] md:text-[11px] text-mist">
        <span>{formatRelativeTime(ticket.createdAt)}</span>

        {sla && !sla.expired && (
          <span
            className={cn(
              'flex items-center gap-1 font-semibold',
              sla.severity === 'danger' && 'text-danger',
              sla.severity === 'warning' && 'text-warning',
              sla.severity === 'safe' && 'text-success'
            )}
          >
            <Clock size={10} />
            SLA: {sla.display}
          </span>
        )}
        {sla?.expired && (
          <span className="flex items-center gap-1 font-semibold text-danger">
            <Clock size={10} />
            SLA breached
          </span>
        )}
        {!sla && ticket.status === 'completed' && (
          <span className="text-success font-semibold">Resolved</span>
        )}
      </div>
    </Link>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState() {
  return (
    <div className="text-center py-12 md:py-20">
      <IconBox color="gold" size="lg" className="mx-auto mb-3">
        <ImageIcon size={20} />
      </IconBox>
      <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">No tickets here</div>
      <div className="text-[11px] md:text-[13px] text-mist">Try a different tab or filter.</div>
    </div>
  );
}
