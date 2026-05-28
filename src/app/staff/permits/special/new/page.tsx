'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Button } from '@/components/ui';
import { FieldLabel, TextInput, Textarea, Select } from '@/components/Form';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import type { SpecialPermitType } from '@/lib/types';
import {
  Building2,
  Calendar,
  Waves,
  Boxes,
  PawPrint,
  ParkingCircle,
  Moon,
  Briefcase,
  Camera,
  Plane,
  Clock,
  Send,
  type LucideIcon,
} from 'lucide-react';

const TYPES: { value: SpecialPermitType; label: string; icon: LucideIcon }[] = [
  { value: 'amenity', label: 'Amenity Reservation', icon: Building2 },
  { value: 'function_room', label: 'Function Room', icon: Calendar },
  { value: 'pool_party', label: 'Pool Party', icon: Waves },
  { value: 'moving', label: 'Moving Items', icon: Boxes },
  { value: 'pet', label: 'Pet Registration', icon: PawPrint },
  { value: 'temp_parking', label: 'Temp Parking', icon: ParkingCircle },
  { value: 'overnight_guest', label: 'Overnight Guest', icon: Moon },
  { value: 'commercial', label: 'Commercial', icon: Briefcase },
  { value: 'photoshoot', label: 'Photoshoot', icon: Camera },
  { value: 'drone', label: 'Drone Use', icon: Plane },
  { value: 'extended_hours', label: 'Extended Hours', icon: Clock },
];

export default function NewSpecialPermitPage() {
  return (
    <Suspense fallback={<div className="flex-1 p-6 text-mist text-sm">Loading…</div>}>
      <NewSpecialPermitForm />
    </Suspense>
  );
}

function NewSpecialPermitForm() {
  const router = useRouter();
  const params = useSearchParams();
  const property = useCurrentProperty();
  const createSpecialPermit = useAppStore((s) => s.createSpecialPermit);
  const residents = useAppStore(
    useShallow((s) =>
      s.users.filter((u) => u.role === 'resident' && u.propertyId === property?.id)
    )
  );

  const initialType = (params.get('type') as SpecialPermitType) ?? 'amenity';
  const [residentId, setResidentId] = useState(residents[0]?.id ?? '');
  const [type, setType] = useState<SpecialPermitType>(initialType);
  const [details, setDetails] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // If type came from query string, validate
  useEffect(() => {
    const t = params.get('type') as SpecialPermitType | null;
    if (t && TYPES.some((opt) => opt.value === t)) setType(t);
  }, [params]);

  const selectedResident = residents.find((r) => r.id === residentId);
  const canSubmit =
    details.trim() && startAt && endAt && selectedResident && new Date(endAt) >= new Date(startAt);

  const handleSubmit = () => {
    if (!canSubmit || !selectedResident || !property) return;
    setSubmitting(true);

    createSpecialPermit({
      propertyId: property.id,
      type,
      unitNumber: selectedResident.unitNumber!,
      resident: { id: selectedResident.id, name: selectedResident.fullName },
      details: details.trim(),
      startAt: new Date(startAt).toISOString(),
      endAt: new Date(endAt).toISOString(),
      status: 'pending',
    });

    setShowSuccess(true);
    setTimeout(() => router.push('/staff/permits/special'), 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[680px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="New Special Permit"
          backHref="/staff/permits/special"
          description="Submit a special permit application."
        />

        <FieldLabel>Permit Type</FieldLabel>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-1.5 py-3 rounded-xl border transition-all',
                type === t.value
                  ? 'bg-charcoal text-ivory border-charcoal'
                  : 'bg-white border-line text-slate hover:border-line-strong'
              )}
            >
              <t.icon size={16} />
              <span className="text-[9.5px] md:text-[10.5px] font-medium leading-tight text-center">
                {t.label}
              </span>
            </button>
          ))}
        </div>

        <FieldLabel>Resident / Unit</FieldLabel>
        <Select
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          options={residents.map((r) => ({
            value: r.id,
            label: `Unit ${r.unitNumber} — ${r.fullName}`,
          }))}
        />

        <FieldLabel>Details</FieldLabel>
        <Textarea
          rows={3}
          placeholder={
            type === 'pet'
              ? 'Pet breed, weight, vaccination details…'
              : type === 'pool_party'
              ? 'Number of guests, special requests…'
              : 'Describe the request…'
          }
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Start</FieldLabel>
            <TextInput
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>End</FieldLabel>
            <TextInput
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-3 pb-4">
          <Button variant="secondary" fullWidth onClick={() => router.back()}>
            Cancel
          </Button>
          <Button fullWidth disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? 'Submitting…' : 'Submit Application'}
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
              Permit Submitted
            </div>
            <div className="text-[12px] md:text-[13.5px] text-mist">
              Pending review. Resident notified via Home AI.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
