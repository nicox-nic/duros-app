'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, useCurrentUser } from '@/lib/store';
import { Button } from '@/components/ui';
import { FieldLabel, TextInput } from '@/components/Form';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import type { GatePassType } from '@/lib/types';
import {
  User,
  Package,
  Wrench,
  LogIn,
  LogOut,
  Sofa,
  Car,
  ParkingCircle,
  Send,
  type LucideIcon,
} from 'lucide-react';

const TYPES: { value: GatePassType; label: string; icon: LucideIcon }[] = [
  { value: 'visitor', label: 'Visitor', icon: User },
  { value: 'delivery', label: 'Delivery', icon: Package },
  { value: 'contractor', label: 'Contractor', icon: Wrench },
  { value: 'move_in', label: 'Move-in', icon: LogIn },
  { value: 'move_out', label: 'Move-out', icon: LogOut },
  { value: 'furniture', label: 'Furniture', icon: Sofa },
  { value: 'vehicle', label: 'Vehicle', icon: Car },
  { value: 'guest_parking', label: 'Parking', icon: ParkingCircle },
];

const EXPIRY_OPTIONS = [
  { value: 4, label: '4 hours' },
  { value: 8, label: '8 hours' },
  { value: 24, label: '24 hours' },
  { value: 72, label: '3 days' },
];

export default function ResidentNewGatePassPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const createGatePass = useAppStore((s) => s.createGatePass);

  const [type, setType] = useState<GatePassType>('visitor');
  const [visitorName, setVisitorName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [expiresInHours, setExpiresInHours] = useState(8);
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

  const requiresPlate = ['delivery', 'contractor', 'move_in', 'move_out', 'furniture', 'vehicle'].includes(type);
  const canSubmit = visitorName.trim() && (!requiresPlate || plateNumber.trim());

  const handleSubmit = () => {
    if (!canSubmit || !user.unitNumber) return;
    setSubmitting(true);

    createGatePass({
      propertyId: user.propertyId,
      type,
      visitorName: visitorName.trim(),
      plateNumber: plateNumber.trim() || undefined,
      idNumber: idNumber.trim() || undefined,
      hostUnit: user.unitNumber,
      hostName: user.fullName,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * expiresInHours).toISOString(),
      status: 'approved',
    });

    setShowSuccess(true);
    setTimeout(() => router.push('/home/permits'), 1400);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[680px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="Request Gate Pass"
          backHref="/home/permits"
          description="Pre-clear a visitor, delivery, or contractor at the gate."
        />

        <div className="bg-info-bg/40 border border-info/15 rounded-xl px-3 py-2.5 mb-4 text-[11px] md:text-[12.5px] text-info">
          Hosting from <strong>Unit {user.unitNumber}</strong>. Security will be notified to expect your guest.
        </div>

        <FieldLabel>Pass Type</FieldLabel>
        <div className="grid grid-cols-4 gap-2 mb-4">
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
              <span className="text-[9.5px] md:text-[11px] font-medium">{t.label}</span>
            </button>
          ))}
        </div>

        <FieldLabel>Visitor Name</FieldLabel>
        <TextInput
          placeholder={type === 'delivery' ? 'e.g., Lazada Delivery' : 'Full name'}
          value={visitorName}
          onChange={(e) => setVisitorName(e.target.value)}
        />

        {requiresPlate && (
          <>
            <FieldLabel>Plate Number</FieldLabel>
            <TextInput
              placeholder="e.g., ABC 1234"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
            />
          </>
        )}

        <FieldLabel>Visitor ID (optional)</FieldLabel>
        <TextInput
          placeholder="Driver's license or government ID"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
        />

        <FieldLabel>Expires In</FieldLabel>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {EXPIRY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setExpiresInHours(opt.value)}
              className={cn(
                'px-2 py-2.5 rounded-xl text-[10.5px] md:text-[12px] font-medium border transition-all',
                expiresInHours === opt.value
                  ? 'bg-charcoal text-ivory border-charcoal'
                  : 'bg-white border-line text-slate hover:bg-ivory-deep'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 pt-2 pb-4">
          <Button variant="secondary" fullWidth onClick={() => router.back()}>
            Cancel
          </Button>
          <Button fullWidth disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? 'Issuing…' : 'Request Pass'}
          </Button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm grid place-items-center p-6">
          <div className="bg-white rounded-3xl shadow-soft-lg p-6 md:p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-success-bg text-success grid place-items-center mx-auto mb-4">
              <Send size={22} />
            </div>
            <div className="font-display text-[18px] md:text-[20px] font-medium mb-1.5">Pass Approved</div>
            <div className="text-[12px] md:text-[13.5px] text-mist">QR code generated. Security has been notified.</div>
          </div>
        </div>
      )}
    </div>
  );
}
