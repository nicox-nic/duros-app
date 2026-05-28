'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentUser } from '@/lib/store';
import { Badge, IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { cn, formatRelativeTime, getSLATime } from '@/lib/utils';
import { Plus, Inbox, Clock, FileText, Search } from 'lucide-react';

const TABS = [
  { id: 'open', label: 'Active' },
  { id: 'completed', label: 'Completed' },
] as const;

export default function MyRequestsPage() {
  const user = useCurrentUser();
  useAppStore((s) => s.realtimeTick); // re-render for SLA ticking

  const myTickets = useAppStore(
    useShallow((s) => s.tickets.filter((t) => t.resident.id === user?.id))
  );

  const [tab, setTab] = useState<'open' | 'completed'>('open');

  const filtered = myTickets
    .filter((t) => (tab === 'open' ? t.status !== 'completed' : t.status === 'completed'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!user || user.role !== 'resident') {
    return (
      <div className="flex-1 grid place-items-center text-center p-8">
        <div className="font-display text-[18px] font-medium mb-1">Resident view required</div>
        <div className="text-mist text-[12px]">Use the dev switcher to view as a resident.</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[900px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="My Requests"
          backHref="/home"
          rightActionIcon={Search}
          description="Track repair, complaint, and service requests."
          rightActions={
            <Link
              href="/home/requests/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne flex items-center gap-2"
            >
              <Plus size={14} /> New Request
            </Link>
          }
        />

        {/* TABS */}
        <div className="bg-charcoal/5 rounded-xl p-1 flex gap-1 mb-3 md:mb-4">
          {TABS.map((t) => {
            const count = myTickets.filter((tk) =>
              t.id === 'open' ? tk.status !== 'completed' : tk.status === 'completed'
            ).length;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 py-2 px-3 rounded-lg text-[11.5px] md:text-[13px] font-medium transition-all',
                  tab === t.id ? 'bg-white text-charcoal shadow-soft-sm font-semibold' : 'text-slate hover:text-charcoal'
                )}
              >
                {t.label} {count > 0 && <span className="text-mist ml-1">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* LIST */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-line rounded-2xl p-8 text-center mt-4">
            <IconBox color="gold" size="lg" className="mx-auto mb-3">
              <Inbox size={20} />
            </IconBox>
            <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">
              {tab === 'open' ? 'No active requests' : 'No completed requests yet'}
            </div>
            <div className="text-[11px] md:text-[13px] text-mist mb-4">
              {tab === 'open' ? 'Need something fixed? File a new request.' : 'Your finished requests will show up here.'}
            </div>
            {tab === 'open' && (
              <Link
                href="/home/requests/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne"
              >
                <Plus size={14} /> New Request
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 pb-6">
            {filtered.map((ticket) => {
              const sla = getSLATime(ticket.slaDeadline);
              return (
                <Link
                  key={ticket.id}
                  href={`/home/requests/${ticket.id}`}
                  className="block bg-white border border-line rounded-2xl p-3 md:p-4 hover:shadow-soft-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] md:text-[14px] font-semibold leading-tight">{ticket.title}</div>
                      <div className="text-[10px] md:text-[11.5px] text-mist mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <FileText size={10} />
                        <span className="font-mono">{ticket.reference}</span>
                        <span className="text-mist">·</span>
                        <span>{ticket.department}</span>
                      </div>
                    </div>
                    <StatusBadge status={ticket.status} />
                  </div>

                  <div className="text-[10.5px] md:text-[12px] text-slate line-clamp-2 mb-2">{ticket.description}</div>

                  {ticket.assignedTo && (
                    <div className="text-[10px] md:text-[11.5px] text-slate mb-2 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-champagne" />
                      Assigned to {ticket.assignedTo.name}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[9.5px] md:text-[11px] text-mist">
                    <span>{formatRelativeTime(ticket.createdAt)}</span>
                    {sla && !sla.expired && ticket.status !== 'completed' && (
                      <span className={cn('flex items-center gap-1 font-semibold',
                        sla.severity === 'danger' && 'text-danger',
                        sla.severity === 'warning' && 'text-warning',
                        sla.severity === 'safe' && 'text-success'
                      )}>
                        <Clock size={10} />
                        {sla.display}
                      </span>
                    )}
                    {ticket.status === 'completed' && (
                      <span className="text-success font-semibold">Resolved</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'urgent' | 'pending' | 'progress' | 'complete'; label: string }> = {
    urgent: { variant: 'urgent', label: 'Urgent' },
    pending: { variant: 'pending', label: 'Pending' },
    in_progress: { variant: 'progress', label: 'In Progress' },
    completed: { variant: 'complete', label: 'Resolved' },
    for_approval: { variant: 'pending', label: 'For Approval' },
    approved: { variant: 'complete', label: 'Approved' },
    rejected: { variant: 'urgent', label: 'Rejected' },
    reopened: { variant: 'urgent', label: 'Reopened' },
  };
  const config = map[status] ?? { variant: 'pending' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
