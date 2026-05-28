'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Badge, IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { cn, formatDate } from '@/lib/utils';
import type { PermitStatus, WorkPermit } from '@/lib/types';
import { Plus, ClipboardCheck, Users, Calendar } from 'lucide-react';

const TABS: { id: 'all' | PermitStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'for_engineer_review', label: 'For Engineer' },
  { id: 'for_manager_approval', label: 'For Manager' },
  { id: 'approved', label: 'Approved' },
  { id: 'completed', label: 'Completed' },
];

export default function WorkPermitsPage() {
  const property = useCurrentProperty();
  const permits = useAppStore(
    useShallow((s) => s.workPermits.filter((p) => p.propertyId === property?.id))
  );
  const [tab, setTab] = useState<'all' | PermitStatus>('all');

  const filtered = (tab === 'all' ? permits : permits.filter((p) => p.status === tab))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[1000px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="Work Permits"
          backHref="/staff/dashboard"
          description="Renovation, aircon, plumbing, and other work permits."
          rightActions={
            <Link
              href="/staff/permits/work/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne flex items-center gap-2"
            >
              <Plus size={14} /> New Permit
            </Link>
          }
        />

        {/* TABS */}
        <div className="bg-charcoal/5 rounded-xl p-1 flex gap-1 mb-3 md:mb-4 overflow-x-auto scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'min-w-fit py-2 px-3 rounded-lg text-[10.5px] md:text-[12px] font-medium transition-all whitespace-nowrap',
                tab === t.id ? 'bg-white text-charcoal shadow-soft-sm font-semibold' : 'text-slate'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-2.5 pb-6">
          {filtered.length === 0 ? (
            <div className="bg-white border border-line rounded-2xl p-8 text-center">
              <IconBox color="green" size="lg" className="mx-auto mb-3">
                <ClipboardCheck size={20} />
              </IconBox>
              <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">No permits in this view</div>
              <div className="text-[11px] md:text-[13px] text-mist">Try a different tab.</div>
            </div>
          ) : (
            filtered.map((p) => <PermitCard key={p.id} permit={p} />)
          )}
        </div>
      </div>
    </div>
  );
}

function PermitCard({ permit }: { permit: WorkPermit }) {
  const statusBadge = getStatusBadge(permit.status);

  return (
    <Link
      href={`/staff/permits/work/${permit.id}`}
      className="block bg-white border border-line rounded-2xl p-3 md:p-4 hover:border-line-strong transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] md:text-[14px] font-semibold leading-tight capitalize">
            {permit.scope.replace(/_/g, ' ')} — Unit {permit.unitNumber}
          </div>
          <div className="text-[10px] md:text-[11.5px] text-mist mt-0.5 font-mono">{permit.reference}</div>
        </div>
        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
      </div>

      <div className="text-[10.5px] md:text-[12px] text-slate line-clamp-2 mb-2">{permit.workDescription}</div>

      <div className="space-y-1 text-[10px] md:text-[11.5px] text-slate">
        <div className="flex items-center gap-2"><Users size={11} /> {permit.contractor} · {permit.workers.length} workers</div>
        <div className="flex items-center gap-2"><Calendar size={11} /> {formatDate(permit.startDate)} – {formatDate(permit.endDate)}</div>
      </div>

      {/* Approval chain */}
      <div className="flex gap-1.5 mt-3 pt-3 border-t border-line text-[9.5px] md:text-[10.5px]">
        <ApprovalChip label="Engineer" done={!!permit.approvals.engineer?.approved} />
        <ApprovalChip label="Manager" done={!!permit.approvals.manager?.approved} />
        <ApprovalChip label="Security" done={!!permit.approvals.security?.approved} />
      </div>
    </Link>
  );
}

function ApprovalChip({ label, done }: { label: string; done: boolean }) {
  return (
    <div className={cn(
      'flex-1 px-2 py-1.5 rounded-lg text-center font-medium',
      done ? 'bg-success-bg text-success' : 'bg-charcoal/5 text-mist'
    )}>
      {done ? '✓' : '○'} {label}
    </div>
  );
}

function getStatusBadge(status: PermitStatus): { variant: 'urgent' | 'pending' | 'progress' | 'complete' | 'approval' | 'reject'; label: string } {
  switch (status) {
    case 'pending': return { variant: 'pending', label: 'Pending' };
    case 'for_engineer_review': return { variant: 'approval', label: 'For Engineer' };
    case 'for_manager_approval': return { variant: 'approval', label: 'For Manager' };
    case 'approved': return { variant: 'complete', label: 'Approved' };
    case 'rejected': return { variant: 'reject', label: 'Rejected' };
    case 'expired': return { variant: 'reject', label: 'Expired' };
    case 'completed': return { variant: 'complete', label: 'Completed' };
    default: return { variant: 'pending', label: status };
  }
}
