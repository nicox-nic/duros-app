'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentUser, useCurrentProperty } from '@/lib/store';
import { Card, Badge, StatusDot, IconBox } from '@/components/ui';
import { PropertySwitcher } from '@/components/PropertySwitcher';
import { cn, getGreeting, formatDate } from '@/lib/utils';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Users,
  FileText,
  AlertTriangle,
  CheckSquare,
  CreditCard,
  ClipboardCheck,
  ScanLine,
  MessageSquare,
  AlertOctagon,
  Check,
  Wrench,
  DollarSign,
  Settings,
  Shield,
  Zap,
  Sparkles,
  Clock,
  Activity,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

// =============================================================================
// DASHBOARD PAGE
// =============================================================================

export default function DashboardPage() {
  const user = useCurrentUser();
  const property = useCurrentProperty();
  const [today, setToday] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Hello');
  useEffect(() => {
    setToday(formatDate(new Date().toISOString()));
    setGreeting(getGreeting());
  }, []);
  const tickets = useAppStore(useShallow((s) => s.tickets.filter((t) => t.propertyId === property?.id)));
  const messages = useAppStore(useShallow((s) => s.messages.filter((m) => m.propertyId === property?.id)));
  const insights = useAppStore(useShallow((s) => s.insights.filter((i) => i.propertyId === property?.id)));
  const staff = useAppStore(useShallow((s) =>
    s.users.filter((u) => u.propertyId === property?.id && u.role !== 'resident')
  ));
  const workPermits = useAppStore(useShallow((s) => s.workPermits.filter((p) => p.propertyId === property?.id)));
  const gatePasses = useAppStore(useShallow((s) => s.gatePasses.filter((g) => g.propertyId === property?.id)));

  // Derived stats
  const activeWorkers = staff.filter((s) => s.isOnline).length + 26; // padded for realism
  const openTickets = tickets.filter((t) => t.status !== 'completed').length + 124;
  const urgentTickets = tickets.filter((t) => t.status === 'urgent').length + 15;
  const pendingApprovals = workPermits.filter((p) => p.status !== 'approved' && p.status !== 'completed').length + 22;
  const billingTasks = 18;
  const workPermitsCount = workPermits.length + 9;
  const gatePassesToday = gatePasses.length + 31;
  const unreadMessages = messages.filter((m) => m.unread).length;
  const complaintsThisWeek = 19;
  const completedToday = 56;

  // Staff by department for the live status section
  const staffByDept = [
    { dept: 'Maintenance' as const, users: staff.filter((s) => s.department === 'Maintenance'), icon: Wrench, color: 'gold' as const },
    { dept: 'Accounting' as const, users: staff.filter((s) => s.department === 'Accounting'), icon: DollarSign, color: 'green' as const },
    { dept: 'Engineering' as const, users: staff.filter((s) => s.department === 'Engineering'), icon: Settings, color: 'blue' as const },
    { dept: 'Security' as const, users: staff.filter((s) => s.department === 'Security'), icon: Shield, color: 'red' as const },
    { dept: 'Utility' as const, users: staff.filter((s) => s.department === 'Utility'), icon: Zap, color: 'amber' as const },
  ];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[1100px] md:mx-auto md:px-8 md:py-8">

        {/* ========================================================== */}
        {/* HEADER                                                       */}
        {/* ========================================================== */}
        <div className="flex items-center justify-between pt-1 pb-4 md:pb-6">
          <div className="flex items-center gap-2.5">
            {/* On mobile, show avatar. On desktop, the sidebar already shows it */}
            <div className="md:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep grid place-items-center text-white font-semibold text-[13px]">
              {user?.initials}
            </div>
            <div className="leading-none">
              <div className="text-[10.5px] text-mist mb-0.5 md:text-[11px]">{greeting},</div>
              <div className="font-display text-[14.5px] font-medium md:text-[26px] md:font-normal md:tracking-tight">
                {user?.fullName.split(' ')[0]}
                <span className="md:hidden"> {user?.fullName.split(' ').slice(1).join(' ')}</span>
              </div>
              <div className="text-[9.5px] text-champagne-deep font-medium tracking-wider uppercase mt-0.5 md:text-[11px]">
                {user?.role.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          <button className="w-9 h-9 bg-white border border-line rounded-xl grid place-items-center relative md:hidden">
            <Bell size={16} />
            <span className="absolute top-2 right-2 w-[7px] h-[7px] bg-danger border-[1.5px] border-white rounded-full" />
          </button>

          <div className="hidden md:flex items-center gap-3">
            <button className="px-4 py-2.5 rounded-xl bg-white border border-line text-[12px] text-slate hover:bg-ivory-deep flex items-center gap-2">
              <Bell size={14} />
              <span>Notifications</span>
              {unreadMessages > 0 && (
                <span className="bg-danger text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadMessages}</span>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* ACTIVE PROPERTY PILL                                          */}
        {/* ========================================================== */}
        <PropertySwitcher className="bg-white border border-line rounded-2xl px-3.5 py-2.5 md:px-5 md:py-4 flex items-center justify-between mb-3.5 md:mb-6 shadow-soft-sm hover:border-line-strong transition-colors">
          <div>
            <div className="text-[9.5px] text-mist uppercase tracking-[0.08em] md:text-[10.5px]">
              Active Property
            </div>
            <div className="font-display text-[13.5px] font-medium mt-0.5 md:text-[18px]">
              {property?.name}
            </div>
            <div className="hidden md:block text-[11px] text-mist mt-0.5">
              {property?.address} · {property?.towers} towers · {property?.totalUnits} units
            </div>
          </div>
          <ChevronDown size={16} className="text-mist" />
        </PropertySwitcher>

        {/* ========================================================== */}
        {/* DESKTOP TWO-COLUMN | MOBILE STACKED                           */}
        {/* ========================================================== */}
        <div className="md:grid md:grid-cols-3 md:gap-6">

          {/* LEFT COLUMN: Overview stats + Staff */}
          <div className="md:col-span-2 space-y-4">

            {/* Overview section */}
            <div>
              <SectionHeader title="Overview" subtitle={today ? `Today · ${today}` : 'Today'} action="View All" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-2.5">
                <StatCard color="blue" icon={Users} label="Active Workers" value={activeWorkers} />
                <StatCard color="gold" icon={FileText} label="Open Tickets" value={openTickets} />
                <StatCard color="red" icon={AlertTriangle} label="Urgent" value={urgentTickets} />
                <StatCard color="amber" icon={CheckSquare} label="Pending Approvals" value={pendingApprovals} />
                <StatCard color="purple" icon={CreditCard} label="Billing Tasks" value={billingTasks} />
                <StatCard color="green" icon={ClipboardCheck} label="Work Permits" value={workPermitsCount} />
                <StatCard color="blue" icon={ScanLine} label="Gate Passes Today" value={gatePassesToday} />
                <StatCard color="gold" icon={MessageSquare} label="Unread Messages" value={unreadMessages > 0 ? unreadMessages : 27} />
                <StatCard color="red" icon={AlertOctagon} label="Complaints / Wk" value={complaintsThisWeek} />
                <StatCard color="green" icon={Check} label="Completed Today" value={completedToday} />
              </div>
            </div>

            {/* Live Staff Status */}
            <div>
              <SectionHeader title="Live Staff Status" action="View All" />
              <div className="space-y-2">
                {staffByDept.map((group) => (
                  <StaffDeptCard key={group.dept} group={group} />
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (desktop): AI insights */}
          <div className="hidden md:block space-y-4 mt-0">
            <SectionHeader
              title={<span className="flex items-center gap-2"><Sparkles size={16} className="text-champagne-deep" /> AI Insights</span>}
              action="View All"
            />
            <div className="space-y-2">
              {insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </div>

        {/* MOBILE: AI insights at bottom */}
        <div className="md:hidden mt-2 pb-4">
          <SectionHeader
            title={<span className="flex items-center gap-1.5"><Sparkles size={14} className="text-champagne-deep" /> AI Insights</span>}
            action="View All"
          />
          <div className="space-y-2">
            {insights.slice(0, 3).map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
            <Link href="/staff/insights" className="block text-center text-[12px] text-champagne-deep font-medium py-2">
              See all {insights.length} insights →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: string;
  action?: string;
}) {
  return (
    <div className="flex items-baseline justify-between mb-2.5 md:mb-3">
      <div>
        <div className="font-display text-[13.5px] font-medium md:text-[17px]">{title}</div>
        {subtitle && <div className="text-[10px] text-mist mt-0.5 md:text-[12px]">{subtitle}</div>}
      </div>
      {action && (
        <button className="text-[10.5px] text-champagne-deep font-medium md:text-[12px]">{action}</button>
      )}
    </div>
  );
}

function StatCard({
  color,
  icon: Icon,
  label,
  value,
}: {
  color: 'blue' | 'gold' | 'red' | 'green' | 'amber' | 'purple';
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-white border border-line rounded-2xl p-2.5 md:p-3 flex items-center gap-2.5 md:flex-col md:items-start md:gap-1.5">
      <IconBox color={color} size="sm" className="md:w-8 md:h-8 md:rounded-lg shrink-0">
        <Icon size={13} />
      </IconBox>
      <div className="min-w-0 md:w-full">
        <div className="text-[9.5px] text-mist md:text-[10px] truncate md:whitespace-normal md:leading-tight md:min-h-[24px]">{label}</div>
        <div className="font-display text-[16px] font-medium leading-none mt-0.5 md:text-[22px] md:mt-1">
          {value}
        </div>
      </div>
    </div>
  );
}

function StaffDeptCard({
  group,
}: {
  group: {
    dept: string;
    users: ReturnType<typeof useAppStore.getState>['users'];
    icon: LucideIcon;
    color: 'blue' | 'gold' | 'red' | 'green' | 'amber' | 'purple';
  };
}) {
  const onlineCount = group.users.filter((u) => u.isOnline).length;
  const avgWorkload = group.users.length
    ? Math.round(group.users.reduce((sum, u) => sum + (u.workloadPct ?? 0), 0) / group.users.length)
    : 0;
  const Icon = group.icon;

  // Mock ticket and response counts (would be derived from real data in production)
  const ticketsByDept: Record<string, number> = {
    Maintenance: 18,
    Accounting: 9,
    Engineering: 14,
    Security: 5,
    Utility: 3,
  };
  const responseByDept: Record<string, string> = {
    Maintenance: '1h 25m',
    Accounting: '42m',
    Engineering: '55m',
    Security: '12m',
    Utility: '—',
  };

  return (
    <div className="bg-white border border-line rounded-2xl p-3 md:p-4 flex items-center gap-3">
      <IconBox color={group.color} size="md">
        <Icon size={16} />
      </IconBox>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] md:text-[13.5px] font-semibold mb-0.5 flex items-center gap-1.5">
          <StatusDot online={onlineCount > 0} pulsing={onlineCount > 0} />
          {group.dept}
        </div>
        <div className="text-[9.5px] text-mist md:text-[11px]">
          {onlineCount > 0 ? `Online · ${onlineCount} Active` : 'Offline · Shift 6PM'}
        </div>
      </div>
      <div className="flex gap-2.5 md:gap-4">
        <StatPill label="Workload" value={avgWorkload > 0 ? `${avgWorkload}%` : '—'} />
        <StatPill label="Tickets" value={ticketsByDept[group.dept] ?? 0} />
        <StatPill label="Response" value={responseByDept[group.dept] ?? '—'} hideOnMobile />
      </div>
    </div>
  );
}

function StatPill({ label, value, hideOnMobile }: { label: string; value: string | number; hideOnMobile?: boolean }) {
  return (
    <div className={cn('text-right', hideOnMobile && 'hidden md:block')}>
      <div className="font-display text-[12px] font-medium md:text-[14px]">{value}</div>
      <div className="text-[8.5px] text-mist md:text-[10px]">{label}</div>
    </div>
  );
}

function InsightCard({ insight }: { insight: ReturnType<typeof useAppStore.getState>['insights'][number] }) {
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
  const icons = {
    recurring_issue: Activity,
    sla_alert: Clock,
    usage_anomaly: TrendingUp,
    recommendation: Sparkles,
    delinquency: AlertOctagon,
  };
  const Icon = icons[insight.type];

  const typeLabels: Record<string, string> = {
    recurring_issue: 'RECURRING ISSUE',
    sla_alert: 'SLA ALERT',
    usage_anomaly: 'USAGE ANOMALY',
    recommendation: 'RECOMMENDATION',
    delinquency: 'DELINQUENCY',
  };

  return (
    <Link
      href={insight.actionHref ?? '#'}
      className={cn(
        'flex gap-2.5 items-start p-3 rounded-2xl border transition-all hover:shadow-soft-sm',
        severityStyles[insight.severity]
      )}
    >
      <div className={cn('w-7 h-7 rounded-lg grid place-items-center shrink-0 bg-white/60', tagStyles[insight.severity])}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn('text-[9.5px] font-semibold tracking-wider mb-1', tagStyles[insight.severity])}>
          {typeLabels[insight.type]}
        </div>
        <div className="text-[11px] md:text-[12.5px] text-charcoal leading-snug">{insight.title}</div>
        {insight.actionLabel && (
          <div className="text-[10px] md:text-[11.5px] text-champagne-deep font-medium mt-1.5 flex items-center gap-1">
            {insight.actionLabel}
            <ChevronRight size={11} />
          </div>
        )}
      </div>
    </Link>
  );
}
