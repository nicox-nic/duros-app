'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Button } from '@/components/ui';
import { FieldLabel, TextInput, Select } from '@/components/Form';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import type { UserRole, StaffDepartment } from '@/lib/types';
import { Send, ShieldCheck } from 'lucide-react';

const ROLES: { value: UserRole; label: string; department: StaffDepartment }[] = [
  { value: 'property_manager', label: 'Property Manager', department: 'Management' },
  { value: 'maintenance', label: 'Maintenance', department: 'Maintenance' },
  { value: 'accounting', label: 'Accounting', department: 'Accounting' },
  { value: 'engineer', label: 'Engineer', department: 'Engineering' },
  { value: 'security', label: 'Security', department: 'Security' },
  { value: 'utility', label: 'Utility', department: 'Utility' },
  { value: 'other_staff', label: 'Other Staff', department: 'Other' },
];

const APPROVAL_OPTIONS: { value: 'approved' | 'pending'; label: string; description: string }[] = [
  {
    value: 'approved',
    label: 'Approve Now',
    description: 'Account active immediately',
  },
  {
    value: 'pending',
    label: 'Pending Review',
    description: 'Requires admin approval',
  },
];

export default function NewStaffMemberPage() {
  const router = useRouter();
  const property = useCurrentProperty();
  const createStaffMember = useAppStore((s) => s.createStaffMember);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState<UserRole>('maintenance');
  const [approvalStatus, setApprovalStatus] = useState<'approved' | 'pending'>('approved');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedRole = ROLES.find((r) => r.value === role)!;
  const canSubmit = fullName.trim() && email.trim() && mobile.trim() && employeeId.trim();

  const handleSubmit = () => {
    if (!canSubmit || !property) return;
    setSubmitting(true);

    createStaffMember({
      propertyId: property.id,
      fullName: fullName.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      role,
      employeeId: employeeId.trim(),
      department: selectedRole.department,
      approvalStatus,
      workloadPct: 0,
    });

    setShowSuccess(true);
    setTimeout(() => router.push('/staff/team'), 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[680px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="Add Staff Member"
          backHref="/staff/team"
          description="Onboard a new team member and assign their role."
        />

        <FieldLabel>Full Name</FieldLabel>
        <TextInput
          placeholder="e.g., Maria Cruz"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <FieldLabel>Email</FieldLabel>
        <TextInput
          type="email"
          placeholder="name@property.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FieldLabel>Mobile Number</FieldLabel>
        <TextInput
          type="tel"
          placeholder="+63 917 123 4567"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <FieldLabel>Employee ID</FieldLabel>
        <TextInput
          placeholder="EMP-001"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        />

        <FieldLabel>Role</FieldLabel>
        <Select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
        />
        <div className="text-[11px] text-mist -mt-2 mb-4 px-3">
          Department: <span className="font-semibold text-charcoal">{selectedRole.department}</span>
        </div>

        <FieldLabel>Approval Status</FieldLabel>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {APPROVAL_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setApprovalStatus(opt.value)}
              className={cn(
                'flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left',
                approvalStatus === opt.value
                  ? 'bg-charcoal text-ivory border-charcoal'
                  : 'bg-white border-line text-slate hover:border-line-strong'
              )}
            >
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={13} />
                <span className="text-[12px] font-semibold">{opt.label}</span>
              </div>
              <span
                className={cn(
                  'text-[10px]',
                  approvalStatus === opt.value ? 'text-ivory/70' : 'text-mist'
                )}
              >
                {opt.description}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2 pb-4">
          <Button variant="secondary" fullWidth onClick={() => router.back()}>
            Cancel
          </Button>
          <Button fullWidth disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? 'Adding…' : 'Add Staff Member'}
          </Button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm grid place-items-center p-6">
          <div className="bg-white rounded-3xl shadow-soft-lg p-6 md:p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-success-bg text-success grid place-items-center mx-auto mb-4">
              <Send size={22} />
            </div>
            <div className="font-display text-[18px] md:text-[20px] font-medium mb-1.5">
              Staff Member Added
            </div>
            <div className="text-[12px] md:text-[13.5px] text-mist">
              {approvalStatus === 'approved'
                ? 'Account active. Invitation email sent.'
                : 'Pending admin approval.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
