'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Badge, Button, IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { Sheet } from '@/components/Sheet';
import { cn } from '@/lib/utils';
import type { User, StaffDepartment } from '@/lib/types';
import { Plus, Users, MoreVertical, Check, X, ShieldCheck, Mail, Phone } from 'lucide-react';

const DEPT_TABS: { id: 'all' | StaffDepartment; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Maintenance', label: 'Maintenance' },
  { id: 'Engineering', label: 'Engineering' },
  { id: 'Accounting', label: 'Accounting' },
  { id: 'Security', label: 'Security' },
  { id: 'Utility', label: 'Utility' },
];

// Permission keys grouped logically
const PERMISSIONS = [
  { key: 'view_tickets', label: 'View Tickets', group: 'Tickets' },
  { key: 'edit_tickets', label: 'Edit Tickets', group: 'Tickets' },
  { key: 'assign_tickets', label: 'Assign Tickets', group: 'Tickets' },
  { key: 'view_billing', label: 'View Billing', group: 'Billing' },
  { key: 'create_soa', label: 'Create SOA', group: 'Billing' },
  { key: 'approve_permits', label: 'Approve Permits', group: 'Permits' },
  { key: 'manage_staff', label: 'Manage Staff', group: 'Admin' },
  { key: 'view_reports', label: 'View Reports', group: 'Admin' },
];

// Default permissions per role
const DEFAULT_PERMS_BY_ROLE: Record<string, string[]> = {
  property_manager: PERMISSIONS.map((p) => p.key),
  super_admin: PERMISSIONS.map((p) => p.key),
  engineer: ['view_tickets', 'edit_tickets', 'approve_permits'],
  maintenance: ['view_tickets', 'edit_tickets'],
  accounting: ['view_tickets', 'view_billing', 'create_soa'],
  security: ['view_tickets', 'approve_permits'],
  utility: ['view_tickets'],
  other_staff: ['view_tickets'],
};

export default function TeamPage() {
  const property = useCurrentProperty();
  const allStaff = useAppStore(
    useShallow((s) =>
      s.users.filter(
        (u) =>
          u.propertyId === property?.id &&
          u.role !== 'resident' &&
          u.role !== 'super_admin'
      )
    )
  );
  const approveStaffMember = useAppStore((s) => s.approveStaffMember);
  const rejectStaffMember = useAppStore((s) => s.rejectStaffMember);

  const [tab, setTab] = useState<'all' | StaffDepartment>('all');
  const [permsUserId, setPermsUserId] = useState<string | null>(null);
  const [perms, setPerms] = useState<Record<string, string[]>>({});

  const pending = allStaff.filter((u) => u.approvalStatus === 'pending');
  const approved = allStaff.filter((u) => u.approvalStatus === 'approved');

  const filtered = tab === 'all' ? approved : approved.filter((u) => u.department === tab);

  const permsUser = allStaff.find((u) => u.id === permsUserId);
  const userPerms = permsUserId
    ? perms[permsUserId] ?? DEFAULT_PERMS_BY_ROLE[permsUser?.role ?? ''] ?? []
    : [];

  const togglePerm = (key: string) => {
    if (!permsUserId) return;
    const current = perms[permsUserId] ?? DEFAULT_PERMS_BY_ROLE[permsUser?.role ?? ''] ?? [];
    const next = current.includes(key) ? current.filter((p) => p !== key) : [...current, key];
    setPerms({ ...perms, [permsUserId]: next });
  };

  // Stats
  const onlineCount = approved.filter((u) => u.isOnline).length;
  const avgLoad = approved.reduce((sum, u) => sum + (u.workloadPct ?? 0), 0) / (approved.length || 1);

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[1000px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="Staff & Roles"
          backHref="/staff/dashboard"
          description="Property team members, departments, and current workload."
          rightActions={
            <Link
              href="/staff/team/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne flex items-center gap-2"
            >
              <Plus size={14} /> Add Staff
            </Link>
          }
        />

        {/* SUMMARY */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
          <SummaryCard label="Total Staff" value={`${approved.length}`} />
          <SummaryCard label="Online Now" value={`${onlineCount}`} accent="green" />
          <SummaryCard label="Avg Workload" value={`${Math.round(avgLoad)}%`} accent="gold" />
        </div>

        {/* PENDING APPROVALS */}
        {pending.length > 0 && (
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold md:text-[11px]">Pending Approvals</div>
              <Badge variant="approval">{pending.length}</Badge>
            </div>
            <div className="space-y-2">
              {pending.map((u) => (
                <div key={u.id} className="bg-warning-bg/30 border border-warning/15 rounded-2xl p-3 md:p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-warning to-warning/70 grid place-items-center text-white font-semibold text-[12px] md:text-[14px] shrink-0">
                      {u.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] md:text-[14px] font-semibold">{u.fullName}</div>
                      <div className="text-[10.5px] md:text-[11.5px] text-mist capitalize mb-1.5">
                        {u.role.replace(/_/g, ' ')} · {u.department} · {u.employeeId}
                      </div>
                      <div className="text-[10px] md:text-[11px] text-slate space-y-0.5 mb-3">
                        <div className="flex items-center gap-1.5"><Mail size={10} /> {u.email}</div>
                        <div className="flex items-center gap-1.5"><Phone size={10} /> {u.mobile}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" fullWidth onClick={() => rejectStaffMember(u.id)}>
                          <X size={13} className="mr-1 inline-block" /> Reject
                        </Button>
                        <Button fullWidth onClick={() => approveStaffMember(u.id)}>
                          <Check size={13} className="mr-1 inline-block" /> Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DEPT TABS */}
        <div className="bg-charcoal/5 rounded-xl p-1 flex gap-1 mb-3 md:mb-4 overflow-x-auto scrollbar-none">
          {DEPT_TABS.map((t) => {
            const count = t.id === 'all' ? approved.length : approved.filter((u) => u.department === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'min-w-fit py-2 px-3 rounded-lg text-[10.5px] md:text-[12px] font-medium transition-all whitespace-nowrap',
                  tab === t.id ? 'bg-white text-charcoal shadow-soft-sm font-semibold' : 'text-slate'
                )}
              >
                {t.label} {count > 0 && <span className="text-mist ml-1">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* GRID */}
        <div className="grid gap-2.5 md:gap-3 md:grid-cols-2 pb-6">
          {filtered.length === 0 ? (
            <div className="md:col-span-2 bg-white border border-line rounded-2xl p-8 text-center">
              <IconBox color="gold" size="lg" className="mx-auto mb-3">
                <Users size={20} />
              </IconBox>
              <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">No staff in this view</div>
              <div className="text-[11px] md:text-[13px] text-mist">Try a different department.</div>
            </div>
          ) : (
            filtered.map((u) => (
              <StaffCard
                key={u.id}
                user={u}
                onPermissions={() => setPermsUserId(u.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* PERMISSIONS MODAL */}
      {permsUserId && permsUser && (
        <Sheet
          onClose={() => setPermsUserId(null)}
          title={`Permissions — ${permsUser.fullName}`}
          description={`${permsUser.role.replace(/_/g, ' ')} · ${permsUser.department}`}
        >
          <div className="bg-info-bg/40 border border-info/15 rounded-xl px-3 py-2.5 mb-3 text-[11px] md:text-[12.5px] text-info">
            <ShieldCheck size={11} className="inline-block mr-1.5 -mt-0.5" />
            Toggle individual permissions for this team member.
          </div>

          {(['Tickets', 'Billing', 'Permits', 'Admin'] as const).map((group) => (
            <div key={group} className="mb-3">
              <div className="text-[10px] uppercase tracking-wider text-mist font-semibold mb-1.5">{group}</div>
              <div className="space-y-1.5">
                {PERMISSIONS.filter((p) => p.group === group).map((p) => {
                  const enabled = userPerms.includes(p.key);
                  return (
                    <button
                      key={p.key}
                      onClick={() => togglePerm(p.key)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left',
                        enabled
                          ? 'bg-charcoal text-ivory border-charcoal'
                          : 'bg-white text-slate border-line hover:border-line-strong'
                      )}
                    >
                      <span className="text-[12px] md:text-[12.5px] font-medium">{p.label}</span>
                      <div
                        className={cn(
                          'w-9 h-5 rounded-full relative transition-colors',
                          enabled ? 'bg-champagne' : 'bg-charcoal/15'
                        )}
                      >
                        <div
                          className={cn(
                            'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
                            enabled ? 'right-0.5' : 'left-0.5'
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <Button fullWidth onClick={() => setPermsUserId(null)}>
            Save Permissions
          </Button>
        </Sheet>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'gold' }) {
  const accentCls = accent === 'green' ? 'text-success' : accent === 'gold' ? 'text-champagne-deep' : 'text-charcoal';
  return (
    <div className="bg-white border border-line rounded-2xl p-3 md:p-4">
      <div className="text-[9.5px] md:text-[10.5px] uppercase tracking-wider text-mist font-semibold mb-1">{label}</div>
      <div className={cn('font-display text-[18px] md:text-[24px] font-medium', accentCls)}>{value}</div>
    </div>
  );
}

function StaffCard({ user, onPermissions }: { user: User; onPermissions: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const roleLabel = user.role.replace(/_/g, ' ');
  const workload = user.workloadPct ?? 0;

  return (
    <div className="bg-white border border-line rounded-2xl p-3 md:p-4 relative">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep grid place-items-center text-white font-semibold text-[12px] md:text-[14px]">
            {user.initials}
          </div>
          <span className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white',
            user.isOnline ? 'bg-success' : 'bg-mist/60'
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="text-[12.5px] md:text-[14px] font-semibold leading-tight">{user.fullName}</div>
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="text-mist hover:text-charcoal -mt-1 w-6 h-6 grid place-items-center"
                aria-label="More options"
              >
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border border-line rounded-xl shadow-soft-md py-1 z-[70] w-[160px]">
                    <button
                      onClick={() => { setMenuOpen(false); onPermissions(); }}
                      className="w-full text-left px-3 py-2 text-[12px] hover:bg-ivory-deep/60 flex items-center gap-2"
                    >
                      <ShieldCheck size={12} /> Set Permissions
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-[10px] md:text-[11.5px] text-mist uppercase tracking-wider capitalize">
            {roleLabel} · {user.department}
          </div>

          {/* Workload */}
          <div className="mt-2.5">
            <div className="flex justify-between text-[9.5px] md:text-[11px] mb-1">
              <span className="text-slate">Workload</span>
              <span className={cn(
                'font-semibold',
                workload > 80 ? 'text-danger' : workload > 60 ? 'text-warning' : 'text-success'
              )}>{workload}%</span>
            </div>
            <div className="h-1.5 bg-charcoal/[0.06] rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  workload > 80 ? 'bg-danger' : workload > 60 ? 'bg-warning' : 'bg-success'
                )}
                style={{ width: `${Math.min(workload, 100)}%` }}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mt-2 text-[10px] md:text-[11.5px]">
            <span className={cn(
              'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium',
              user.isOnline ? 'bg-success-bg text-success' : 'bg-charcoal/[0.05] text-mist'
            )}>
              <span className={cn('w-1 h-1 rounded-full', user.isOnline ? 'bg-success' : 'bg-mist')} />
              {user.isOnline ? 'Online' : 'Offline'}
            </span>
            {user.email && (
              <span className="text-mist truncate">{user.email}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
