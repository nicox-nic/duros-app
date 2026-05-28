'use client';

import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentUser } from '@/lib/store';
import { Badge, IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import {
  ClipboardCheck,
  QrCode,
  Star,
  Plus,
  ChevronRight,
  Calendar,
  type LucideIcon,
} from 'lucide-react';

const QUICK_ACTIONS: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  tone: 'gold' | 'blue' | 'green' | 'amber' | 'purple';
}[] = [
  {
    title: 'Work Permit',
    description: 'Renovation, aircon, plumbing',
    icon: ClipboardCheck,
    href: '/home/permits/work/new',
    tone: 'green',
  },
  {
    title: 'Gate Pass',
    description: 'Visitor, delivery, contractor',
    icon: QrCode,
    href: '/home/permits/gate/new',
    tone: 'amber',
  },
  {
    title: 'Special Permit',
    description: 'Amenity, pet, party, parking',
    icon: Star,
    href: '/home/permits/special/new',
    tone: 'purple',
  },
];

const TONE_CLASSES: Record<string, string> = {
  gold: 'bg-champagne/15 text-champagne-deep',
  blue: 'bg-info-bg text-info',
  green: 'bg-success-bg text-success',
  amber: 'bg-warning-bg text-warning',
  purple: 'bg-[#ece6f3] text-[#6b4f93]',
};

export default function ResidentPermitsPage() {
  const user = useCurrentUser();

  const workPermits = useAppStore(
    useShallow((s) => s.workPermits.filter((p) => p.resident.id === user?.id))
  );
  const gatePasses = useAppStore(
    useShallow((s) => s.gatePasses.filter((p) => p.hostUnit === user?.unitNumber && p.propertyId === user?.propertyId))
  );
  const specialPermits = useAppStore(
    useShallow((s) => s.specialPermits.filter((p) => p.resident.id === user?.id))
  );

  if (!user || user.role !== 'resident') {
    return (
      <div className="flex-1 grid place-items-center text-center p-8">
        <div>
          <div className="font-display text-[20px] font-medium mb-1">Resident login required</div>
          <div className="text-mist text-[12px]">Use the dev switcher to view as a resident.</div>
        </div>
      </div>
    );
  }

  const allActive = workPermits.length + gatePasses.length + specialPermits.length;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[700px] md:mx-auto md:px-8 md:py-8">
        <PageHeader title="My Permits" backHref="/home" description="Track and submit permits for your unit." />

        {/* Quick actions */}
        <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">
          Request New
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-5">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-line hover:border-line-strong active:scale-[0.99] transition-all"
              >
                <div className={cn('w-10 h-10 rounded-xl grid place-items-center shrink-0', TONE_CLASSES[action.tone])}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] md:text-[13.5px] font-semibold leading-tight">{action.title}</div>
                  <div className="text-[10px] md:text-[11px] text-mist mt-0.5">{action.description}</div>
                </div>
                <div className="w-7 h-7 grid place-items-center rounded-lg bg-charcoal text-ivory shrink-0">
                  <Plus size={13} strokeWidth={2.5} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* My permits */}
        <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">
          Active & Recent
        </div>

        {allActive === 0 ? (
          <div className="bg-white border border-line rounded-2xl p-8 text-center">
            <IconBox color="gold" size="lg" className="mx-auto mb-3">
              <ClipboardCheck size={20} />
            </IconBox>
            <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">No active permits</div>
            <div className="text-[11px] md:text-[13px] text-mist">Tap one of the cards above to request a permit.</div>
          </div>
        ) : (
          <div className="space-y-2 pb-6">
            {workPermits.map((p) => (
              <PermitRow
                key={p.id}
                icon={ClipboardCheck}
                tone="green"
                title={`${p.scope.replace(/_/g, ' ')} permit`}
                reference={p.reference}
                meta={`${formatDate(p.startDate)} – ${formatDate(p.endDate)}`}
                status={p.status}
                href={`/home/permits/work/${p.id}`}
                createdAt={p.createdAt}
              />
            ))}
            {gatePasses.map((p) => (
              <PermitRow
                key={p.id}
                icon={QrCode}
                tone="amber"
                title={`${p.type.replace(/_/g, ' ')} — ${p.visitorName}`}
                reference={p.reference}
                meta={`Expires ${formatDate(p.expiresAt)}`}
                status={p.status}
              />
            ))}
            {specialPermits.map((p) => (
              <PermitRow
                key={p.id}
                icon={Star}
                tone="purple"
                title={p.type.replace(/_/g, ' ')}
                reference={p.reference}
                meta={`${formatDate(p.startAt)} – ${formatDate(p.endAt)}`}
                status={p.status}
                createdAt={p.createdAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PermitRow({
  icon: Icon,
  tone,
  title,
  reference,
  meta,
  status,
  href,
  createdAt,
}: {
  icon: LucideIcon;
  tone: 'green' | 'amber' | 'purple';
  title: string;
  reference: string;
  meta: string;
  status: string;
  href?: string;
  createdAt?: string;
}) {
  const badge = getStatusBadge(status);
  const content = (
    <div className="bg-white border border-line rounded-2xl p-3 md:p-4 hover:border-line-strong transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl grid place-items-center shrink-0', TONE_CLASSES[tone])}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <div className="text-[12.5px] md:text-[13.5px] font-semibold capitalize truncate">{title}</div>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          <div className="text-[10px] md:text-[11.5px] text-mist flex items-center gap-1.5">
            <Calendar size={10} />
            <span>{meta}</span>
          </div>
          <div className="text-[9.5px] md:text-[10.5px] text-mist mt-0.5 font-mono">
            {reference}
            {createdAt && <span> · {formatRelativeTime(createdAt)}</span>}
          </div>
        </div>
        {href && <ChevronRight size={14} className="text-mist shrink-0" />}
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function getStatusBadge(status: string): {
  variant: 'urgent' | 'pending' | 'progress' | 'complete' | 'approval' | 'reject';
  label: string;
} {
  switch (status) {
    case 'pending':
      return { variant: 'pending', label: 'Pending' };
    case 'for_engineer_review':
      return { variant: 'approval', label: 'For Engineer' };
    case 'for_manager_approval':
      return { variant: 'approval', label: 'For Manager' };
    case 'approved':
      return { variant: 'complete', label: 'Approved' };
    case 'rejected':
      return { variant: 'reject', label: 'Rejected' };
    case 'expired':
      return { variant: 'reject', label: 'Expired' };
    case 'completed':
      return { variant: 'complete', label: 'Completed' };
    case 'in':
      return { variant: 'progress', label: 'Checked In' };
    case 'out':
      return { variant: 'complete', label: 'Checked Out' };
    default:
      return { variant: 'pending', label: status };
  }
}
