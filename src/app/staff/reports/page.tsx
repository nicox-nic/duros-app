'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Button, IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { Sheet } from '@/components/Sheet';
import { FieldLabel, TextInput, Select } from '@/components/Form';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { AIReport, ReportType } from '@/lib/types';
import {
  Sparkles,
  Activity,
  Wrench,
  Wallet,
  Shield,
  Smile,
  TrendingUp,
  CalendarCheck,
  CalendarDays,
  Download,
  ChevronRight,
  Loader2,
  type LucideIcon,
} from 'lucide-react';

const REPORT_META: Record<ReportType, { icon: LucideIcon; color: 'gold' | 'blue' | 'green' | 'amber' | 'red'; cadence: string; label: string }> = {
  daily_ops: { icon: Activity, color: 'blue', cadence: 'Daily', label: 'Daily Operations' },
  weekly_health: { icon: CalendarDays, color: 'gold', cadence: 'Weekly', label: 'Weekly Health' },
  monthly_complaint: { icon: CalendarCheck, color: 'amber', cadence: 'Monthly', label: 'Monthly Complaints' },
  maintenance_perf: { icon: Wrench, color: 'gold', cadence: 'Weekly', label: 'Maintenance Performance' },
  billing_collection: { icon: Wallet, color: 'green', cadence: 'Monthly', label: 'Billing Collection' },
  security_incidents: { icon: Shield, color: 'red', cadence: 'Weekly', label: 'Security Incidents' },
  satisfaction: { icon: Smile, color: 'green', cadence: 'Monthly', label: 'Resident Satisfaction' },
  recurring_issues: { icon: TrendingUp, color: 'amber', cadence: 'Monthly', label: 'Recurring Issues' },
};

const SECTION_OPTIONS = [
  { key: 'tickets', label: 'Ticket Volume' },
  { key: 'sla', label: 'SLA Performance' },
  { key: 'departments', label: 'Department Workload' },
  { key: 'complaints', label: 'Complaint Trends' },
  { key: 'billing', label: 'Billing & Collections' },
  { key: 'incidents', label: 'Security Incidents' },
  { key: 'satisfaction', label: 'Satisfaction Pulse' },
  { key: 'recurring', label: 'Recurring Issues' },
];

export default function ReportsPage() {
  const property = useCurrentProperty();
  const reports = useAppStore(
    useShallow((s) => s.reports.filter((r) => r.propertyId === property?.id))
  );
  const generateCustomReport = useAppStore((s) => s.generateCustomReport);

  const [generateOpen, setGenerateOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('weekly_health');
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [periodEnd, setPeriodEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedSections, setSelectedSections] = useState<string[]>(['tickets', 'sla', 'departments']);
  const [customTitle, setCustomTitle] = useState('');
  const [generating, setGenerating] = useState(false);

  const toggleSection = (key: string) =>
    setSelectedSections((s) => (s.includes(key) ? s.filter((x) => x !== key) : [...s, key]));

  const handleGenerate = () => {
    if (!property || generating) return;
    setGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const meta = REPORT_META[reportType];
      const title = customTitle.trim() || `${meta.label} — ${new Date(periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${new Date(periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      // Pull realistic data from store
      const state = useAppStore.getState();
      const tickets = state.tickets.filter((t) => t.propertyId === property.id);
      const completedTickets = tickets.filter((t) => t.status === 'completed').length;
      const urgentTickets = tickets.filter((t) => t.status === 'urgent').length;
      const statements = state.billingStatements.filter((s) => s.propertyId === property.id);
      const paidCount = statements.filter((s) => s.status === 'paid').length;
      const collected = statements.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.totalDue, 0);

      const stats: AIReport['stats'] = [];
      if (selectedSections.includes('tickets')) {
        stats.push({ label: 'Total Tickets', value: `${tickets.length}` });
        stats.push({ label: 'Completed', value: `${completedTickets}` });
      }
      if (selectedSections.includes('sla')) {
        const slaRate = tickets.length > 0 ? Math.round((completedTickets / tickets.length) * 100) : 0;
        stats.push({ label: 'SLA Rate', value: `${slaRate}%` });
      }
      if (selectedSections.includes('incidents')) {
        stats.push({ label: 'Urgent', value: `${urgentTickets}` });
      }
      if (selectedSections.includes('billing')) {
        stats.push({ label: 'Collected', value: `₱${(collected / 1000).toFixed(0)}k` });
        stats.push({ label: 'Paid', value: `${paidCount}` });
      }

      const summaryParts = [
        `Generated for ${property.name} from ${periodStart} to ${periodEnd}.`,
        selectedSections.includes('tickets') && `${tickets.length} tickets recorded with ${completedTickets} resolved.`,
        selectedSections.includes('sla') && `SLA performance trending above target.`,
        selectedSections.includes('billing') && `Collection rate stable; ${paidCount} statements settled in period.`,
        selectedSections.includes('complaints') && `Most common complaint category: water pressure (Tower 1).`,
        selectedSections.includes('recurring') && `Floors 12–16 continue to surface elevator and HVAC issues.`,
        selectedSections.includes('satisfaction') && `Resident satisfaction pulse remains positive with no major regressions.`,
      ].filter(Boolean).join(' ');

      generateCustomReport({
        propertyId: property.id,
        type: reportType,
        title,
        subtitle: `Custom report · ${selectedSections.length} section${selectedSections.length !== 1 ? 's' : ''}`,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
        stats,
        summary: summaryParts,
      });

      setGenerating(false);
      setGenerateOpen(false);
      setCustomTitle('');
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[1000px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="AI Reports"
          backHref="/staff/dashboard"
          description="Automated daily, weekly, and monthly intelligence from your property data."
          rightActions={
            <button
              onClick={() => setGenerateOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne flex items-center gap-2"
            >
              <Sparkles size={14} /> Generate Custom Report
            </button>
          }
        />

        {/* Mobile generate button */}
        <button
          onClick={() => setGenerateOpen(true)}
          className="md:hidden flex items-center justify-center gap-2 w-full mb-3 px-4 py-3 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne"
        >
          <Sparkles size={14} /> Generate Custom Report
        </button>

        {/* TYPE OVERVIEW */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
          <TypeCard
            label="Daily"
            count={reports.filter((r) => REPORT_META[r.type].cadence === 'Daily').length}
            color="blue"
          />
          <TypeCard
            label="Weekly"
            count={reports.filter((r) => REPORT_META[r.type].cadence === 'Weekly').length}
            color="gold"
          />
          <TypeCard
            label="Monthly"
            count={reports.filter((r) => REPORT_META[r.type].cadence === 'Monthly').length}
            color="green"
          />
        </div>

        {/* REPORTS */}
        <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">All Reports</div>
        <div className="space-y-3 md:space-y-4 pb-6">
          {reports.length === 0 ? (
            <div className="bg-white border border-line rounded-2xl p-8 text-center">
              <IconBox color="gold" size="lg" className="mx-auto mb-3">
                <Sparkles size={20} />
              </IconBox>
              <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">No reports yet</div>
              <div className="text-[11px] md:text-[13px] text-mist">Generate one above to get started.</div>
            </div>
          ) : (
            reports.map((r) => <ReportCard key={r.id} report={r} />)
          )}
        </div>
      </div>

      {/* GENERATE CUSTOM REPORT MODAL */}
      {generateOpen && (
        <Sheet
          onClose={() => !generating && setGenerateOpen(false)}
          title="Generate Custom Report"
          description="Pick a report type, period, and sections to include. AI will summarize the relevant data."
        >
          <FieldLabel>Report Type</FieldLabel>
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            options={Object.entries(REPORT_META).map(([key, meta]) => ({
              value: key,
              label: `${meta.label} (${meta.cadence})`,
            }))}
          />

          <FieldLabel>Custom Title (optional)</FieldLabel>
          <TextInput
            placeholder="e.g., Q3 Maintenance Review"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>From</FieldLabel>
              <TextInput type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
            </div>
            <div>
              <FieldLabel>To</FieldLabel>
              <TextInput type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>
          </div>

          <FieldLabel>Include Sections</FieldLabel>
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {SECTION_OPTIONS.map((opt) => {
              const active = selectedSections.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  onClick={() => toggleSection(opt.key)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-xl border text-left text-[11.5px] font-medium transition-all',
                    active
                      ? 'bg-charcoal text-ivory border-charcoal'
                      : 'bg-white text-slate border-line hover:border-line-strong'
                  )}
                >
                  <span>{opt.label}</span>
                  <span
                    className={cn(
                      'w-4 h-4 rounded grid place-items-center text-[10px] font-bold shrink-0',
                      active ? 'bg-champagne text-charcoal' : 'border border-line'
                    )}
                  >
                    {active ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={() => setGenerateOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleGenerate} disabled={selectedSections.length === 0 || generating}>
              {generating ? (
                <>
                  <Loader2 size={13} className="inline-block mr-1 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Sparkles size={13} className="inline-block mr-1" /> Generate
                </>
              )}
            </Button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function TypeCard({ label, count, color }: { label: string; count: number; color: 'blue' | 'gold' | 'green' }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-3 md:p-4 flex items-center gap-3">
      <IconBox color={color} size="md">
        <CalendarDays size={15} />
      </IconBox>
      <div>
        <div className="text-[9.5px] md:text-[10.5px] uppercase tracking-wider text-mist font-semibold">{label}</div>
        <div className="font-display text-[16px] md:text-[20px] font-medium">{count}</div>
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: AIReport }) {
  const meta = REPORT_META[report.type];
  const Icon = meta.icon;

  return (
    <div className="bg-white border border-line rounded-2xl p-4 md:p-5 shadow-soft-sm">
      <div className="flex items-start gap-3 mb-3">
        <IconBox color={meta.color} size="md">
          <Icon size={16} />
        </IconBox>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <div className="text-[13px] md:text-[15px] font-semibold leading-tight">{report.title}</div>
            <button className="text-mist hover:text-charcoal shrink-0" aria-label="Download report">
              <Download size={14} />
            </button>
          </div>
          <div className="text-[10px] md:text-[11.5px] text-mist uppercase tracking-wider">
            {meta.cadence} · Generated {formatRelativeTime(report.generatedAt)}
          </div>
          <div className="text-[10.5px] md:text-[12px] text-slate mt-0.5">{report.subtitle}</div>
        </div>
      </div>

      <div className="text-[11.5px] md:text-[13px] text-slate leading-relaxed mb-3">{report.summary}</div>

      {/* Stats */}
      {report.stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 pt-3 border-t border-line">
          {report.stats.map((stat, i) => (
            <div key={i}>
              <div className="text-[9.5px] md:text-[10.5px] uppercase tracking-wider text-mist font-semibold">{stat.label}</div>
              <div className="font-display text-[14px] md:text-[17px] font-medium mt-0.5">{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      <button className="flex items-center gap-1.5 text-[11px] md:text-[12.5px] text-champagne-deep font-medium hover:underline">
        View full report <ChevronRight size={13} />
      </button>
    </div>
  );
}
