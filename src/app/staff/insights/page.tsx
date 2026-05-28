'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import type { AIInsight, InsightType } from '@/lib/types';
import {
  Sparkles,
  Activity,
  Clock,
  TrendingUp,
  AlertOctagon,
  ChevronRight,
} from 'lucide-react';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'danger', label: 'Critical' },
  { id: 'warning', label: 'Warnings' },
  { id: 'info', label: 'Info' },
  { id: 'success', label: 'Recommendations' },
] as const;

const ICON_MAP: Record<InsightType, any> = {
  recurring_issue: Activity,
  sla_alert: Clock,
  usage_anomaly: TrendingUp,
  recommendation: Sparkles,
  delinquency: AlertOctagon,
};

const TYPE_LABEL: Record<InsightType, string> = {
  recurring_issue: 'RECURRING ISSUE',
  sla_alert: 'SLA ALERT',
  usage_anomaly: 'USAGE ANOMALY',
  recommendation: 'RECOMMENDATION',
  delinquency: 'DELINQUENCY',
};

export default function StaffInsightsPage() {
  const property = useCurrentProperty();
  const insights = useAppStore(
    useShallow((s) => s.insights.filter((i) => i.propertyId === property?.id))
  );
  const [filter, setFilter] = useState<typeof FILTERS[number]['id']>('all');

  const filtered = filter === 'all' ? insights : insights.filter((i) => i.severity === filter);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[900px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="AI Insights"
          backHref="/staff/dashboard"
          description="Predictive intelligence from your property data, updated every 15 minutes."
        />

        {/* FILTERS */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none mb-4 md:mb-5 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[10.5px] md:text-[12px] whitespace-nowrap shrink-0 transition-all',
                filter === f.id ? 'bg-charcoal text-ivory' : 'bg-white text-slate border border-line'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* GRID */}
        <div className="grid gap-3 md:grid-cols-2 pb-6">
          {filtered.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightCard({ insight }: { insight: AIInsight }) {
  const severityStyles = {
    info: 'bg-gradient-to-br from-info-bg to-info-bg/60 border-info/15',
    danger: 'bg-gradient-to-br from-danger-bg to-danger-bg/60 border-danger/15',
    warning: 'bg-gradient-to-br from-warning-bg to-warning-bg/60 border-warning/15',
    success: 'bg-gradient-to-br from-success-bg to-success-bg/60 border-success/15',
  };
  const tagStyles = {
    info: 'text-info',
    danger: 'text-danger',
    warning: 'text-warning',
    success: 'text-success',
  };
  const Icon = ICON_MAP[insight.type];

  return (
    <Link
      href={insight.actionHref ?? '#'}
      className={cn(
        'flex flex-col p-4 md:p-5 rounded-2xl border transition-all hover:shadow-soft-md',
        severityStyles[insight.severity]
      )}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className={cn('w-9 h-9 rounded-xl grid place-items-center bg-white/60 shrink-0', tagStyles[insight.severity])}>
          <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn('text-[10px] md:text-[11px] font-semibold tracking-wider', tagStyles[insight.severity])}>
            {TYPE_LABEL[insight.type]}
          </div>
          <div className="text-[12.5px] md:text-[14.5px] font-semibold text-charcoal leading-snug mt-1">{insight.title}</div>
        </div>
      </div>
      <div className="text-[11px] md:text-[12.5px] text-slate leading-relaxed mb-3">{insight.description}</div>
      {insight.actionLabel && (
        <div className={cn('flex items-center gap-1.5 text-[11px] md:text-[12.5px] font-medium mt-auto', tagStyles[insight.severity])}>
          {insight.actionLabel}
          <ChevronRight size={13} />
        </div>
      )}
    </Link>
  );
}
