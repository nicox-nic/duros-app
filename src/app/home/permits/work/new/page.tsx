'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, useCurrentUser } from '@/lib/store';
import { Button } from '@/components/ui';
import { FieldLabel, TextInput, Textarea } from '@/components/Form';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import type { WorkPermitScope } from '@/lib/types';
import {
  Hammer,
  Wind,
  Archive,
  Droplets,
  Zap,
  Square,
  PaintBucket,
  HelpCircle,
  Send,
  Plus,
  X,
  Paperclip,
  type LucideIcon,
} from 'lucide-react';

const SCOPES: { value: WorkPermitScope; label: string; icon: LucideIcon }[] = [
  { value: 'renovation', label: 'Renovation', icon: Hammer },
  { value: 'aircon', label: 'Aircon', icon: Wind },
  { value: 'cabinet', label: 'Cabinet', icon: Archive },
  { value: 'plumbing', label: 'Plumbing', icon: Droplets },
  { value: 'electrical', label: 'Electrical', icon: Zap },
  { value: 'tile', label: 'Tile', icon: Square },
  { value: 'painting', label: 'Painting', icon: PaintBucket },
  { value: 'other', label: 'Other', icon: HelpCircle },
];

export default function ResidentNewWorkPermitPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const createWorkPermit = useAppStore((s) => s.createWorkPermit);

  const [scope, setScope] = useState<WorkPermitScope>('renovation');
  const [workDescription, setWorkDescription] = useState('');
  const [contractor, setContractor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workers, setWorkers] = useState<{ name: string; idNumber: string }[]>([
    { name: '', idNumber: '' },
  ]);
  const [documents, setDocuments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const validWorkers = workers.filter((w) => w.name.trim());
  const canSubmit =
    workDescription.trim() && contractor.trim() && startDate && endDate && validWorkers.length > 0;

  const addWorker = () => setWorkers([...workers, { name: '', idNumber: '' }]);
  const removeWorker = (i: number) => setWorkers(workers.filter((_, idx) => idx !== i));
  const updateWorker = (i: number, key: 'name' | 'idNumber', val: string) => {
    setWorkers(workers.map((w, idx) => (idx === i ? { ...w, [key]: val } : w)));
  };

  const addDocument = () => {
    const name = prompt('Document name (e.g., contractor-license.pdf)');
    if (name?.trim()) setDocuments([...documents, name.trim()]);
  };
  const removeDocument = (i: number) =>
    setDocuments(documents.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (!canSubmit || !user.unitNumber) return;
    setSubmitting(true);

    createWorkPermit({
      propertyId: user.propertyId,
      unitNumber: user.unitNumber,
      resident: { id: user.id, name: user.fullName },
      workDescription: workDescription.trim(),
      scope,
      contractor: contractor.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      workers: validWorkers,
      documents,
      status: 'for_engineer_review',
    });

    setShowSuccess(true);
    setTimeout(() => router.push('/home/permits'), 1400);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[680px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="Request Work Permit"
          backHref="/home/permits"
          description="For renovations, aircon, plumbing, and other major work."
        />

        <div className="bg-info-bg/40 border border-info/15 rounded-xl px-3 py-2.5 mb-4 text-[11px] md:text-[12.5px] text-info">
          Submitting from <strong>Unit {user.unitNumber}</strong>. Your permit will be reviewed by Engineering, then the Property Manager.
        </div>

        <FieldLabel>Scope of Work</FieldLabel>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {SCOPES.map((s) => (
            <button
              key={s.value}
              onClick={() => setScope(s.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-1.5 py-3 rounded-xl border transition-all',
                scope === s.value
                  ? 'bg-charcoal text-ivory border-charcoal'
                  : 'bg-white border-line text-slate hover:border-line-strong'
              )}
            >
              <s.icon size={16} />
              <span className="text-[9.5px] md:text-[11px] font-medium">{s.label}</span>
            </button>
          ))}
        </div>

        <FieldLabel>Work Description</FieldLabel>
        <Textarea
          rows={3}
          placeholder="Describe the work to be done…"
          value={workDescription}
          onChange={(e) => setWorkDescription(e.target.value)}
        />

        <FieldLabel>Contractor</FieldLabel>
        <TextInput
          placeholder="Contractor company name"
          value={contractor}
          onChange={(e) => setContractor(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Start Date</FieldLabel>
            <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <FieldLabel>End Date</FieldLabel>
            <TextInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 mb-2">
          <FieldLabel className="!mt-0 !mb-0">Workers</FieldLabel>
          <button
            onClick={addWorker}
            className="text-[11px] font-semibold text-champagne-deep hover:underline flex items-center gap-1"
          >
            <Plus size={12} strokeWidth={2.5} />
            Add Worker
          </button>
        </div>
        <div className="space-y-2 mb-4">
          {workers.map((w, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <TextInput
                  placeholder="Full name"
                  value={w.name}
                  onChange={(e) => updateWorker(i, 'name', e.target.value)}
                  className="!mb-0"
                />
                <TextInput
                  placeholder="ID number"
                  value={w.idNumber}
                  onChange={(e) => updateWorker(i, 'idNumber', e.target.value)}
                  className="!mb-0"
                />
              </div>
              {workers.length > 1 && (
                <button
                  onClick={() => removeWorker(i)}
                  className="w-9 h-9 grid place-items-center rounded-lg text-mist hover:text-danger hover:bg-danger-bg/40 transition-colors shrink-0"
                  aria-label="Remove worker"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-2">
          <FieldLabel className="!mt-0 !mb-0">Supporting Documents</FieldLabel>
          <button
            onClick={addDocument}
            className="text-[11px] font-semibold text-champagne-deep hover:underline flex items-center gap-1"
          >
            <Paperclip size={12} strokeWidth={2.5} />
            Attach
          </button>
        </div>
        <div className="space-y-1.5 mb-5">
          {documents.length === 0 && (
            <div className="text-[11px] text-mist italic px-3 py-2.5 bg-charcoal/[0.02] rounded-xl border border-line">
              No documents attached (e.g., contractor license, scope plan).
            </div>
          )}
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white border border-line rounded-xl">
              <Paperclip size={12} className="text-mist shrink-0" />
              <span className="flex-1 text-[12px] truncate">{doc}</span>
              <button onClick={() => removeDocument(i)} className="text-mist hover:text-danger" aria-label="Remove document">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2 pb-4">
          <Button variant="secondary" fullWidth onClick={() => router.back()}>
            Cancel
          </Button>
          <Button fullWidth disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? 'Submitting…' : 'Submit Request'}
          </Button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm grid place-items-center p-6">
          <div className="bg-white rounded-3xl shadow-soft-lg p-6 md:p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-success-bg text-success grid place-items-center mx-auto mb-4">
              <Send size={22} />
            </div>
            <div className="font-display text-[18px] md:text-[20px] font-medium mb-1.5">Permit Requested</div>
            <div className="text-[12px] md:text-[13.5px] text-mist">
              Sent to Engineering for review. You&apos;ll be notified once it&apos;s approved.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
