'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty, useCurrentUser } from '@/lib/store';
import { Badge } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { Sheet } from '@/components/Sheet';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { MessageCategory } from '@/lib/types';
import { Search, SlidersHorizontal, Inbox, X } from 'lucide-react';

const TABS: { id: 'all' | MessageCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ticket_comment', label: 'Tickets' },
  { id: 'billing', label: 'Billing' },
  { id: 'urgent_alert', label: 'Alerts' },
  { id: 'home_ai', label: 'Home AI' },
];

export default function StaffInboxPage() {
  const property = useCurrentProperty();
  const me = useCurrentUser();
  const messages = useAppStore(
    useShallow((s) =>
      s.messages.filter(
        (m) => m.propertyId === property?.id && (m.toId === me?.id || m.toId === 'user-alex')
      )
    )
  );
  const [tab, setTab] = useState<'all' | MessageCategory>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');

  const filtered = messages
    .filter((m) => (tab === 'all' ? true : m.category === tab))
    .filter((m) => filterRole === 'all' || m.fromRole === filterRole)
    .filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        m.fromName.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[900px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="Inbox"
          backHref="/staff/dashboard"
          rightActionIcon={Search}
          description="Messages from residents, staff, and system alerts."
          rightActions={
            <>
              <button
                onClick={() => setSearchOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white border border-line text-[12px] text-slate hover:bg-ivory-deep flex items-center gap-2"
              >
                <Search size={14} /> {searchQuery ? `"${searchQuery.slice(0, 16)}"` : 'Search'}
              </button>
              <button
                onClick={() => setFilterOpen(true)}
                className={cn(
                  'px-4 py-2.5 rounded-xl border text-[12px] flex items-center gap-2 transition-colors',
                  filterRole !== 'all'
                    ? 'bg-charcoal text-ivory border-charcoal'
                    : 'bg-white border-line text-slate hover:bg-ivory-deep'
                )}
              >
                <SlidersHorizontal size={14} /> Filter{filterRole !== 'all' ? ' · 1' : ''}
              </button>
            </>
          }
        />

        {/* TABS */}
        <div className="bg-charcoal/5 rounded-xl p-1 flex gap-1 mb-3 md:mb-4 overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 min-w-[80px] py-2 px-3 rounded-lg text-[10.5px] md:text-[12px] font-medium transition-all whitespace-nowrap',
                tab === t.id ? 'bg-white text-charcoal shadow-soft-sm font-semibold' : 'text-slate'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* LIST */}
        {filtered.length === 0 ? (
          <EmptyInbox />
        ) : (
          <div className="md:bg-white md:border md:border-line md:rounded-2xl md:overflow-hidden md:shadow-soft-sm">
            {filtered.map((m, idx) => (
              <Link
                key={m.id}
                href={`/staff/inbox/${m.id}`}
                className={cn(
                  'flex gap-3 px-3 md:px-5 py-3 md:py-4 border-b border-line last:border-b-0 hover:bg-ivory-deep/40 transition-colors',
                  m.unread && 'bg-champagne/[0.04]'
                )}
              >
                <Avatar message={m} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <div className={cn('text-[12px] md:text-[13.5px] truncate', m.unread ? 'font-semibold' : 'font-medium')}>{m.fromName}</div>
                    <div className="text-[9.5px] md:text-[11px] text-mist shrink-0">{formatRelativeTime(m.timestamp)}</div>
                  </div>
                  <div className={cn('text-[11px] md:text-[12.5px] truncate', m.unread ? 'text-charcoal font-medium' : 'text-slate')}>{m.subject}</div>
                  <div className="text-[10.5px] md:text-[12px] text-mist line-clamp-1 mt-0.5">{m.preview}</div>
                </div>
                {m.unread && (
                  <div className={cn(
                    'shrink-0 self-center text-[9px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                    m.category === 'urgent_alert' ? 'bg-danger text-white' : 'bg-champagne-deep text-white'
                  )}>•</div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <Sheet
          onClose={() => setSearchOpen(false)}
          title="Search Inbox"
          description="Search by sender, subject, or message content."
        >
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mist" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., billing or Maria"
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
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
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
          title="Filter by Department"
          description="Show only messages from a specific role."
        >
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {(['all', 'resident', 'maintenance', 'engineer', 'accounting', 'security', 'property_manager', 'system'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={cn(
                  'px-2.5 py-2 rounded-lg text-[11px] font-medium border transition-colors text-left capitalize',
                  filterRole === r
                    ? 'bg-charcoal text-ivory border-charcoal'
                    : 'bg-white text-slate border-line hover:bg-ivory-deep'
                )}
              >
                {r === 'all' ? 'All' : r.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterRole('all')}
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

function Avatar({ message }: { message: { fromInitials: string; fromRole: string; category: string } }) {
  const styles: Record<string, string> = {
    resident: 'from-blue-gray to-info',
    maintenance: 'from-champagne-soft to-champagne-deep',
    accounting: 'from-success to-success/70',
    security: 'from-danger to-danger/70',
    engineer: 'from-info to-info/70',
    property_manager: 'from-charcoal to-charcoal-soft',
  };
  const cat: Record<string, string> = {
    home_ai: 'from-charcoal to-charcoal-soft',
    urgent_alert: 'from-warning to-warning/70',
    announcement: 'from-info to-blue-gray',
  };
  const cls = cat[message.category] ?? styles[message.fromRole] ?? 'from-charcoal-soft to-slate';
  return (
    <div className={cn('w-9 h-9 md:w-10 md:h-10 rounded-xl grid place-items-center text-white font-semibold text-[11px] md:text-[12px] shrink-0 bg-gradient-to-br', cls)}>
      {message.fromInitials}
    </div>
  );
}

function EmptyInbox() {
  return (
    <div className="bg-white border border-line rounded-2xl p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-champagne/15 grid place-items-center text-champagne-deep mx-auto mb-3">
        <Inbox size={20} />
      </div>
      <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">Inbox zero</div>
      <div className="text-[11px] md:text-[13px] text-mist">No messages here right now.</div>
    </div>
  );
}
