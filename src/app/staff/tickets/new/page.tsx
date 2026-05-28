'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Button } from '@/components/ui';
import { FieldLabel, TextInput, Textarea, Select } from '@/components/Form';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import type { TicketType, StaffDepartment } from '@/lib/types';
import {
  Wrench,
  MessageSquareWarning,
  Lightbulb,
  AlertOctagon,
  Send,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

export default function StaffCreateTicketPage() {
  const router = useRouter();
  const property = useCurrentProperty();
  const createTicket = useAppStore((s) => s.createTicket);
  const residents = useAppStore(
    useShallow((s) => s.users.filter((u) => u.role === 'resident' && u.propertyId === property?.id))
  );

  const [residentId, setResidentId] = useState(residents[0]?.id ?? '');
  const [requestType, setRequestType] = useState<TicketType>('repair');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<StaffDepartment>('Maintenance');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedResident = residents.find((r) => r.id === residentId);
  const canSubmit = title.trim() && description.trim() && selectedResident;

  const handleSubmit = () => {
    if (!canSubmit || !selectedResident || !property) return;
    setSubmitting(true);

    const newTicket = createTicket({
      propertyId: property.id,
      type: requestType,
      title: title.trim(),
      description: description.trim(),
      status: priority === 'urgent' ? 'urgent' : 'pending',
      priority,
      resident: {
        id: selectedResident.id,
        name: selectedResident.fullName,
        unitNumber: selectedResident.unitNumber!,
        tower: selectedResident.tower!,
      },
      department,
      photos: [],
      slaDeadline: priority === 'urgent'
        ? new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString()
        : new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });

    setShowSuccess(true);
    setTimeout(() => router.push(`/staff/tickets/${newTicket.id}`), 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[680px] md:mx-auto md:px-8 md:py-8">
        <PageHeader title="New Ticket" backHref="/staff/tickets" description="Create a ticket on behalf of a resident or for internal work." />

        <FieldLabel>Resident / Unit</FieldLabel>
        <Select
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          options={residents.map((r) => ({ value: r.id, label: `Unit ${r.unitNumber} — ${r.fullName}` }))}
        />

        <FieldLabel>Type</FieldLabel>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <TypeChip active={requestType === 'repair'} onClick={() => setRequestType('repair')} icon={Wrench} label="Repair" />
          <TypeChip active={requestType === 'complaint'} onClick={() => setRequestType('complaint')} icon={MessageSquareWarning} label="Complaint" />
          <TypeChip active={requestType === 'suggestion'} onClick={() => setRequestType('suggestion')} icon={Lightbulb} label="Suggestion" />
          <TypeChip active={requestType === 'incident'} onClick={() => setRequestType('incident')} icon={AlertOctagon} label="Incident" />
        </div>

        <FieldLabel>Title</FieldLabel>
        <TextInput placeholder="Brief summary" value={title} onChange={(e) => setTitle(e.target.value)} />

        <FieldLabel>Department</FieldLabel>
        <Select
          value={department}
          onChange={(e) => setDepartment(e.target.value as StaffDepartment)}
          options={[
            { value: 'Maintenance', label: 'Maintenance' },
            { value: 'Engineering', label: 'Engineering' },
            { value: 'Accounting', label: 'Accounting' },
            { value: 'Security', label: 'Security' },
            { value: 'Utility', label: 'Utility' },
            { value: 'Other', label: 'Other' },
          ]}
        />

        <FieldLabel>Priority</FieldLabel>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={cn(
                'px-2 py-2.5 rounded-xl text-[10.5px] md:text-[12px] font-medium border transition-all capitalize',
                priority === p
                  ? p === 'urgent'
                    ? 'bg-danger-bg border-danger/40 text-danger font-semibold'
                    : 'bg-charcoal text-ivory border-charcoal'
                  : 'bg-white border-line text-slate hover:bg-ivory-deep'
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <FieldLabel>Description</FieldLabel>
        <Textarea rows={4} placeholder="Issue details..." value={description} onChange={(e) => setDescription(e.target.value)} />

        {priority === 'urgent' && (
          <div className="flex items-start gap-2.5 p-3 bg-danger-bg/60 border border-danger/20 rounded-xl mb-4 text-[11px] md:text-[12.5px] text-danger">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span><strong>Urgent priority</strong> sets a 4-hour SLA and prioritizes in the queue.</span>
          </div>
        )}

        <div className="flex gap-2 pt-2 pb-4">
          <Button variant="secondary" fullWidth onClick={() => router.back()}>Cancel</Button>
          <Button fullWidth disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm grid place-items-center p-6">
          <div className="bg-white rounded-3xl shadow-soft-lg p-6 md:p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-success-bg text-success grid place-items-center mx-auto mb-4">
              <Send size={22} />
            </div>
            <div className="font-display text-[18px] md:text-[20px] font-medium mb-1.5">Ticket Created</div>
            <div className="text-[12px] md:text-[13.5px] text-mist">Resident notified via Home AI.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function TypeChip({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: LucideIcon; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all',
        active ? 'bg-charcoal text-ivory border-charcoal' : 'bg-white border-line text-slate hover:border-line-strong'
      )}
    >
      <Icon size={18} />
      <span className="text-[10.5px] md:text-[11.5px] font-medium">{label}</span>
    </button>
  );
}
