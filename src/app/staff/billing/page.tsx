'use client';

import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Badge, IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { cn, formatRelativeTime, formatPeso, formatDate } from '@/lib/utils';
import { Plus, CreditCard, FileText, Download } from 'lucide-react';
import { generateSOAPdf } from '@/lib/pdf';

export default function StaffBillingPage() {
  const property = useCurrentProperty();
  const statements = useAppStore(
    useShallow((s) => s.billingStatements.filter((b) => b.propertyId === property?.id))
  );

  const collected = statements.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.totalDue, 0);
  const outstanding = statements.filter((s) => s.status !== 'paid' && s.status !== 'draft').reduce((sum, s) => sum + s.totalDue, 0);
  const drafts = statements.filter((s) => s.status === 'draft').length;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[1000px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="Billing & SOA"
          backHref="/staff/dashboard"
          description="Statements of account, collection status, and AI billing insights."
          rightActions={
            <Link
              href="/staff/billing/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne flex items-center gap-2"
            >
              <Plus size={14} /> Generate SOA
            </Link>
          }
        />

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
          <SummaryCard label="Collected" value={formatPeso(collected, { compact: true })} variant="green" />
          <SummaryCard label="Outstanding" value={formatPeso(outstanding, { compact: true })} variant="amber" />
          <SummaryCard label="Drafts" value={`${drafts}`} variant="gold" />
        </div>

        <Link
          href="/staff/billing/new"
          className="md:hidden flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne mb-4 justify-center"
        >
          <Plus size={14} /> Generate SOA
        </Link>

        <div className="space-y-2 pb-6">
          {statements.length === 0 ? (
            <div className="bg-white border border-line rounded-2xl p-8 text-center">
              <IconBox color="gold" size="lg" className="mx-auto mb-3">
                <CreditCard size={20} />
              </IconBox>
              <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">No statements yet</div>
              <div className="text-[11px] md:text-[13px] text-mist">Generate your first SOA to get started.</div>
            </div>
          ) : (
            statements.map((s) => (
              <div key={s.id} className="bg-white border border-line rounded-2xl p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <IconBox color={s.status === 'paid' ? 'green' : s.status === 'overdue' ? 'red' : 'gold'} size="md">
                    <FileText size={16} />
                  </IconBox>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <div className="text-[12.5px] md:text-[14px] font-semibold">Unit {s.unitNumber} · {s.resident.name}</div>
                      <SOABadge status={s.status} />
                    </div>
                    <div className="text-[10px] md:text-[12px] text-mist">
                      <span className="font-mono">{s.reference}</span>
                      <span> · Due {formatDate(s.dueDate)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-[14px] md:text-[18px] font-medium">{formatPeso(s.totalDue, { compact: true })}</div>
                  </div>
                  <button
                    onClick={() => property && generateSOAPdf(s, property.name)}
                    className="w-9 h-9 grid place-items-center rounded-lg text-mist hover:text-charcoal hover:bg-charcoal/[0.04] shrink-0 transition-colors"
                    aria-label="Download PDF"
                    title="Download PDF"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, variant }: { label: string; value: string; variant: 'green' | 'amber' | 'gold' }) {
  const cls = {
    green: 'bg-success-bg text-success',
    amber: 'bg-warning-bg text-warning',
    gold: 'bg-champagne/15 text-champagne-deep',
  }[variant];
  return (
    <div className="bg-white border border-line rounded-2xl p-3 md:p-4">
      <div className={cn('text-[9.5px] md:text-[10.5px] uppercase tracking-wider font-semibold mb-1', cls.split(' ')[1])}>{label}</div>
      <div className="font-display text-[16px] md:text-[22px] font-medium">{value}</div>
    </div>
  );
}

function SOABadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'urgent' | 'pending' | 'progress' | 'complete'; label: string }> = {
    draft: { variant: 'pending', label: 'Draft' },
    sent: { variant: 'progress', label: 'Sent' },
    paid: { variant: 'complete', label: 'Paid' },
    overdue: { variant: 'urgent', label: 'Overdue' },
  };
  const config = map[status] ?? { variant: 'pending' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
