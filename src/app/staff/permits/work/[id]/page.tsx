'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentUser } from '@/lib/store';
import { Badge, Button, IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { Sheet } from '@/components/Sheet';
import { Textarea } from '@/components/Form';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import type { PermitStatus, WorkPermit } from '@/lib/types';
import {
  Calendar,
  Users,
  FileText,
  Building2,
  Paperclip,
  Check,
  X,
  ShieldCheck,
  HardHat,
  Briefcase,
  Clock,
  type LucideIcon,
} from 'lucide-react';

export default function WorkPermitDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const user = useCurrentUser();
  const permit = useAppStore(useShallow((s) => s.workPermits.find((p) => p.id === params.id)));
  const approveWorkPermit = useAppStore((s) => s.approveWorkPermit);

  const [sheetStage, setSheetStage] = useState<'engineer' | 'manager' | 'security' | null>(null);
  const [sheetApproved, setSheetApproved] = useState(true);
  const [note, setNote] = useState('');

  if (!permit) {
    return (
      <div className="flex-1 grid place-items-center p-8 text-center">
        <div>
          <div className="font-display text-[18px] font-medium mb-2">Permit not found</div>
          <Button onClick={() => router.push('/staff/permits/work')}>Back to permits</Button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(permit.status);

  const userCanApprove = (stage: 'engineer' | 'manager' | 'security') => {
    if (!user) return false;
    const role = user.role;
    // Property managers and super admins can approve any stage
    if (role === 'property_manager' || role === 'super_admin') return true;
    // Engineers can approve the engineering stage (only — manager stage is for property_manager above)
    if (stage === 'engineer' && role === 'engineer') return true;
    if (stage === 'security' && role === 'security') return true;
    return false;
  };

  const stageCanRun = (stage: 'engineer' | 'manager' | 'security') => {
    // Engineer first, then Manager, then Security
    if (stage === 'engineer') return !permit.approvals.engineer;
    if (stage === 'manager')
      return Boolean(permit.approvals.engineer?.approved) && !permit.approvals.manager;
    if (stage === 'security')
      return (
        Boolean(permit.approvals.engineer?.approved) &&
        Boolean(permit.approvals.manager?.approved) &&
        !permit.approvals.security
      );
    return false;
  };

  const openSheet = (stage: 'engineer' | 'manager' | 'security', approved: boolean) => {
    setSheetStage(stage);
    setSheetApproved(approved);
    setNote('');
  };

  const confirmAction = () => {
    if (!sheetStage || !user) return;
    approveWorkPermit(permit.id, sheetStage, user.fullName, sheetApproved);
    setSheetStage(null);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[800px] md:mx-auto md:px-8 md:py-8">
        <PageHeader title="Work Permit" backHref="/staff/permits/work" />

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            <span className="text-[10.5px] md:text-[12px] text-mist font-mono">{permit.reference}</span>
          </div>
          <h2 className="font-display text-[20px] md:text-[26px] font-medium leading-tight capitalize mb-1">
            {permit.scope.replace(/_/g, ' ')} — Unit {permit.unitNumber}
          </h2>
          <p className="text-[11px] md:text-[13px] text-slate">{permit.resident.name}</p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
          <InfoTile icon={Building2} label="Contractor" value={permit.contractor} />
          <InfoTile icon={Users} label="Workers" value={`${permit.workers.length}`} />
          <InfoTile icon={Calendar} label="Start" value={formatDate(permit.startDate)} />
          <InfoTile icon={Calendar} label="End" value={formatDate(permit.endDate)} />
        </div>

        {/* Description */}
        <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">
          Scope of Work
        </div>
        <div className="bg-white border border-line rounded-2xl p-3 md:p-4 mb-4 text-[12px] md:text-[13.5px] text-slate leading-relaxed">
          {permit.workDescription}
        </div>

        {/* Workers list */}
        <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">
          Worker List
        </div>
        <div className="bg-white border border-line rounded-2xl divide-y divide-line mb-4">
          {permit.workers.map((w, i) => (
            <div key={i} className="flex items-center gap-3 px-3 md:px-4 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-ivory-deep grid place-items-center text-[10px] font-semibold text-slate shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] md:text-[13px] font-medium">{w.name}</div>
                <div className="text-[10px] md:text-[11px] text-mist font-mono">{w.idNumber}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Documents */}
        {permit.documents.length > 0 && (
          <>
            <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">
              Supporting Documents
            </div>
            <div className="space-y-1.5 mb-4">
              {permit.documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2.5 bg-white border border-line rounded-xl">
                  <Paperclip size={12} className="text-mist shrink-0" />
                  <span className="flex-1 text-[12px] md:text-[13px] truncate">{doc}</span>
                  <span className="text-[10px] text-mist">View</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* APPROVAL CHAIN */}
        <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">
          Approval Chain
        </div>
        <div className="space-y-2 mb-5">
          <ApprovalRow
            stage="engineer"
            label="Engineering Review"
            icon={HardHat}
            permit={permit}
            canApprove={userCanApprove('engineer')}
            stageActive={stageCanRun('engineer')}
            onApprove={() => openSheet('engineer', true)}
            onReject={() => openSheet('engineer', false)}
          />
          <ApprovalRow
            stage="manager"
            label="Manager Approval"
            icon={Briefcase}
            permit={permit}
            canApprove={userCanApprove('manager')}
            stageActive={stageCanRun('manager')}
            onApprove={() => openSheet('manager', true)}
            onReject={() => openSheet('manager', false)}
          />
          <ApprovalRow
            stage="security"
            label="Security Clearance"
            icon={ShieldCheck}
            permit={permit}
            canApprove={userCanApprove('security')}
            stageActive={stageCanRun('security')}
            onApprove={() => openSheet('security', true)}
            onReject={() => openSheet('security', false)}
          />
        </div>

        {/* Footer meta */}
        <div className="text-[10px] md:text-[11px] text-mist flex items-center gap-1.5 pb-6">
          <Clock size={10} />
          Submitted {formatRelativeTime(permit.createdAt)}
        </div>
      </div>

      {/* APPROVAL CONFIRM SHEET */}
      {sheetStage && (
        <Sheet
          onClose={() => setSheetStage(null)}
          title={`${sheetApproved ? 'Approve' : 'Reject'} ${
            { engineer: 'Engineering Review', manager: 'Manager Approval', security: 'Security Clearance' }[sheetStage]
          }`}
          description={`Permit ${permit.reference} — ${permit.resident.name}, Unit ${permit.unitNumber}`}
        >
          <div
            className={cn(
              'rounded-xl p-3 mb-4 text-[11.5px] md:text-[13px]',
              sheetApproved ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'
            )}
          >
            {sheetApproved
              ? 'Approving this stage advances the permit to the next stage in the chain. The resident will be notified.'
              : 'Rejecting this permit will notify the resident and set the status to Rejected.'}
          </div>

          <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-1.5">Note (optional)</div>
          <Textarea
            rows={3}
            placeholder={sheetApproved ? 'Conditions or remarks…' : 'Reason for rejection…'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className="flex gap-2 mt-3">
            <Button variant="secondary" fullWidth onClick={() => setSheetStage(null)}>
              Cancel
            </Button>
            <Button fullWidth onClick={confirmAction}>
              {sheetApproved ? (
                <>
                  <Check size={14} className="inline-block mr-1" /> Approve
                </>
              ) : (
                <>
                  <X size={14} className="inline-block mr-1" /> Reject
                </>
              )}
            </Button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function InfoTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-3">
      <div className="flex items-center gap-1.5 mb-1 text-mist">
        <Icon size={11} />
        <div className="text-[9.5px] md:text-[10.5px] uppercase tracking-wider font-semibold">{label}</div>
      </div>
      <div className="text-[12px] md:text-[14px] font-semibold truncate">{value}</div>
    </div>
  );
}

function ApprovalRow({
  stage,
  label,
  icon: Icon,
  permit,
  canApprove,
  stageActive,
  onApprove,
  onReject,
}: {
  stage: 'engineer' | 'manager' | 'security';
  label: string;
  icon: LucideIcon;
  permit: WorkPermit;
  canApprove: boolean;
  stageActive: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const approval = permit.approvals[stage];
  const done = !!approval;
  const approved = !!approval?.approved;

  return (
    <div
      className={cn(
        'bg-white border rounded-2xl p-3 md:p-4',
        done && approved && 'border-success/30 bg-success-bg/30',
        done && !approved && 'border-danger/30 bg-danger-bg/30',
        !done && stageActive && 'border-champagne/40',
        !done && !stageActive && 'border-line opacity-60'
      )}
    >
      <div className="flex items-center gap-2.5 mb-2">
        <IconBox
          color={done ? (approved ? 'green' : 'red') : stageActive ? 'gold' : 'blue'}
          size="sm"
        >
          <Icon size={12} />
        </IconBox>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] md:text-[13.5px] font-semibold">{label}</div>
          {done && (
            <div className="text-[10px] md:text-[11px] text-mist">
              {approved ? 'Approved' : 'Rejected'} by {approval!.by} · {formatRelativeTime(approval!.at)}
            </div>
          )}
          {!done && !stageActive && (
            <div className="text-[10px] md:text-[11px] text-mist">Awaiting earlier stages</div>
          )}
          {!done && stageActive && (
            <div className="text-[10px] md:text-[11px] text-champagne-deep">Ready for review</div>
          )}
        </div>
      </div>

      {!done && stageActive && canApprove && (
        <div className="flex gap-2 mt-2">
          <Button variant="secondary" fullWidth onClick={onReject}>
            <X size={13} className="inline-block mr-1" /> Reject
          </Button>
          <Button fullWidth onClick={onApprove}>
            <Check size={13} className="inline-block mr-1" /> Approve
          </Button>
        </div>
      )}

      {!done && stageActive && !canApprove && (
        <div className="flex items-start gap-1.5 px-2.5 py-2 bg-warning-bg/40 rounded-lg text-[10.5px] md:text-[11.5px] text-warning">
          <FileText size={11} className="shrink-0 mt-0.5" />
          You don&apos;t have permission to approve this stage. Switch to the appropriate role via the dev switcher.
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status: PermitStatus): {
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
    default:
      return { variant: 'pending', label: status };
  }
}
