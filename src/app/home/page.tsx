'use client';

import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentUser, useCurrentProperty } from '@/lib/store';
import { Badge, IconBox } from '@/components/ui';
import { useMounted } from '@/lib/useMounted';
import { cn, getGreeting, formatRelativeTime } from '@/lib/utils';
import {
  Bell,
  ChevronRight,
  ChevronDown,
  Wrench,
  Sparkles,
  CreditCard,
  KeyRound,
  ScanLine,
  Megaphone,
  Plus,
  Home as HomeIcon,
  ClipboardCheck,
  MessageSquare,
  type LucideIcon,
} from 'lucide-react';

export default function ResidentHomePage() {
  const user = useCurrentUser();
  const property = useCurrentProperty();
  const mounted = useMounted();

  const myTickets = useAppStore(
    useShallow((s) =>
      s.tickets.filter((t) => t.resident.id === user?.id && t.status !== 'completed').slice(0, 3)
    )
  );
  const announcements = useAppStore(
    useShallow((s) =>
      s.announcements.filter((a) => a.propertyId === property?.id).slice(0, 2)
    )
  );
  const myBilling = useAppStore(
    useShallow((s) =>
      s.billingStatements.filter((b) => b.resident.id === user?.id)
    )
  );

  const unpaidBalance = myBilling
    .filter((b) => b.status === 'sent' || b.status === 'overdue')
    .reduce((sum, b) => sum + b.totalDue, 0);

  if (!user || user.role !== 'resident') {
    return (
      <div className="flex-1 grid place-items-center text-center p-8">
        <div>
          <div className="font-display text-[20px] font-medium mb-1">Switch to a resident</div>
          <div className="text-mist text-[12px]">Use the dev switcher to view as John Doe or another resident.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[900px] md:mx-auto md:px-8 md:py-8">

        {/* GREETING */}
        <div className="flex items-center justify-between pt-1 pb-4 md:pb-6">
          <div className="flex items-center gap-2.5">
            <div className="md:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-blue-gray to-info grid place-items-center text-white font-semibold text-[13px]">
              {user.initials}
            </div>
            <div>
              <div className="text-[10.5px] text-mist md:text-[12px]">{mounted ? `${getGreeting()},` : 'Hello,'}</div>
              <div className="font-display text-[16px] md:text-[28px] font-medium tracking-tight">
                {user.fullName}
              </div>
              <div className="text-[9.5px] md:text-[11px] text-champagne-deep font-medium tracking-wider uppercase mt-0.5">
                Unit {user.unitNumber} · {user.tower}
              </div>
            </div>
          </div>
          <Link href="/home/messages" className="w-9 h-9 bg-white border border-line rounded-xl grid place-items-center relative">
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-[7px] h-[7px] bg-danger border-[1.5px] border-white rounded-full" />
          </Link>
        </div>

        {/* PROPERTY PILL */}
        <div className="bg-white border border-line rounded-2xl px-3.5 py-2.5 md:px-5 md:py-4 flex items-center justify-between mb-3.5 md:mb-6 shadow-soft-sm">
          <div>
            <div className="text-[9.5px] text-mist uppercase tracking-[0.08em] md:text-[10.5px]">My Property</div>
            <div className="font-display text-[13.5px] font-medium mt-0.5 md:text-[16px]">
              {property?.name}
            </div>
          </div>
          <ChevronDown size={16} className="text-mist" />
        </div>

        {/* QUICK ACTIONS */}
        <SectionLabel>Quick Actions</SectionLabel>
        <div className="grid grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
          <QuickAction href="/home/requests/new" icon={Wrench} label="New Request" highlight />
          <QuickAction href="/home/permits" icon={ClipboardCheck} label="Permits" />
          <QuickAction href="/home/billing" icon={CreditCard} label="Billing" />
          <QuickAction href="/home/messages" icon={MessageSquare} label="Messages" />
        </div>

        {/* MY ACTIVE REQUESTS */}
        <div className="flex items-baseline justify-between mb-2.5 md:mb-3">
          <div className="font-display text-[13.5px] md:text-[17px] font-medium">My Active Requests</div>
          <Link href="/home/requests" className="text-[10.5px] md:text-[12px] text-champagne-deep font-medium">View All</Link>
        </div>
        {myTickets.length === 0 ? (
          <div className="bg-white border border-line rounded-2xl p-5 text-center text-[12px] text-mist mb-4">
            <IconBox color="green" size="md" className="mx-auto mb-2">
              <ClipboardCheck size={16} />
            </IconBox>
            No active requests. You're all set!
          </div>
        ) : (
          <div className="space-y-2 mb-4 md:mb-6">
            {myTickets.map((t) => (
              <Link
                key={t.id}
                href={`/home/requests/${t.id}`}
                className="block bg-white border border-line rounded-2xl p-3 md:p-4 hover:shadow-soft-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] md:text-[14px] font-semibold leading-tight">{t.title}</div>
                    <div className="text-[10px] md:text-[11.5px] text-mist mt-0.5">
                      {t.department} · {formatRelativeTime(t.createdAt)}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                {t.assignedTo && (
                  <div className="text-[10px] md:text-[11.5px] text-slate mt-2 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-champagne" />
                    Assigned to {t.assignedTo.name}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* BILLING SNAPSHOT */}
        {unpaidBalance > 0 && (
          <Link
            href="/home/billing"
            className="block bg-gradient-to-br from-champagne/15 to-champagne/5 border border-champagne/30 rounded-2xl p-4 md:p-5 mb-4 md:mb-6"
          >
            <div className="flex items-center gap-3">
              <IconBox color="gold" size="md">
                <CreditCard size={16} />
              </IconBox>
              <div className="flex-1">
                <div className="text-[10px] md:text-[11px] text-champagne-deep uppercase tracking-wider font-semibold">Outstanding Balance</div>
                <div className="font-display text-[18px] md:text-[24px] font-medium leading-tight mt-0.5">
                  ₱ {unpaidBalance.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <ChevronRight size={18} className="text-champagne-deep" />
            </div>
          </Link>
        )}

        {/* ANNOUNCEMENTS */}
        <div className="flex items-baseline justify-between mb-2.5 md:mb-3">
          <div className="font-display text-[13.5px] md:text-[17px] font-medium">Latest Announcements</div>
          <Link href="/home/announcements" className="text-[10.5px] md:text-[12px] text-champagne-deep font-medium">View All</Link>
        </div>
        <div className="space-y-2 pb-6">
          {announcements.map((a) => (
            <div key={a.id} className="bg-white border border-line rounded-2xl p-3 md:p-4">
              <div className="flex items-start gap-3">
                <IconBox color={a.type === 'water' ? 'blue' : a.type === 'event' ? 'gold' : 'amber'} size="md">
                  <Megaphone size={14} />
                </IconBox>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] md:text-[14px] font-semibold leading-tight">{a.title}</div>
                  <div className="text-[10.5px] md:text-[12px] text-slate mt-1 leading-snug line-clamp-2">{a.message}</div>
                  <div className="text-[9.5px] md:text-[11px] text-mist mt-1.5">
                    {a.publishedAt && formatRelativeTime(a.publishedAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">{children}</div>;
}

function QuickAction({
  href,
  icon: Icon,
  label,
  highlight,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border transition-all',
        highlight
          ? 'bg-gradient-to-br from-champagne-soft/30 to-champagne/15 border-champagne/30'
          : 'bg-white border-line hover:shadow-soft-sm'
      )}
    >
      <div
        className={cn(
          'w-9 h-9 md:w-11 md:h-11 rounded-xl grid place-items-center',
          highlight ? 'bg-gradient-to-br from-champagne-soft to-champagne-deep text-white' : 'bg-charcoal/[0.04] text-champagne-deep'
        )}
      >
        <Icon size={16} />
      </div>
      <span className="text-[10px] md:text-[11.5px] font-medium text-center leading-tight">{label}</span>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'urgent' | 'pending' | 'progress' | 'complete'; label: string }> = {
    urgent: { variant: 'urgent', label: 'Urgent' },
    pending: { variant: 'pending', label: 'Pending' },
    in_progress: { variant: 'progress', label: 'In Progress' },
    completed: { variant: 'complete', label: 'Completed' },
    for_approval: { variant: 'pending', label: 'For Approval' },
    approved: { variant: 'complete', label: 'Approved' },
    rejected: { variant: 'urgent', label: 'Rejected' },
    reopened: { variant: 'urgent', label: 'Reopened' },
  };
  const config = map[status] ?? { variant: 'pending' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
