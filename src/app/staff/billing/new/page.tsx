'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Button, IconBox } from '@/components/ui';
import { FieldLabel, Select } from '@/components/Form';
import { PageHeader } from '@/components/PageHeader';
import { Sheet } from '@/components/Sheet';
import { cn, formatPeso, formatDate } from '@/lib/utils';
import { generateSOAPdf } from '@/lib/pdf';
import type { BillingStatement } from '@/lib/types';
import {
  Droplets,
  Zap,
  AlertTriangle,
  Send,
  Camera,
  Sparkles,
  Check,
  Download,
  Loader2,
  type LucideIcon,
} from 'lucide-react';

const CHARGE_DEFAULTS = [
  { label: 'Water Usage', amount: 1450 },
  { label: 'Electricity Usage', amount: 2850 },
  { label: 'Association Dues', amount: 2000 },
  { label: 'CUSA Fees', amount: 350 },
  { label: 'Parking Fees', amount: 500 },
  { label: 'Penalties', amount: 300 },
];

export default function GenerateSOAPage() {
  const router = useRouter();
  const property = useCurrentProperty();
  const residents = useAppStore(
    useShallow((s) => s.users.filter((u) => u.role === 'resident' && u.propertyId === property?.id))
  );
  const pushSOA = useAppStore.setState;

  const [residentId, setResidentId] = useState(residents[0]?.id ?? '');
  const [waterCurrent, setWaterCurrent] = useState(1256);
  const [waterPrevious, setWaterPrevious] = useState(1186);
  const [electricCurrent, setElectricCurrent] = useState(4321);
  const [electricPrevious, setElectricPrevious] = useState(3987);
  const [waterPhoto, setWaterPhoto] = useState<string | null>(null);
  const [electricPhoto, setElectricPhoto] = useState<string | null>(null);
  const [charges, setCharges] = useState(CHARGE_DEFAULTS);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const selectedResident = residents.find((r) => r.id === residentId);
  const totalDue = useMemo(() => charges.reduce((sum, c) => sum + c.amount, 0), [charges]);

  const waterDelta = waterCurrent - waterPrevious;
  const waterAnomaly = waterDelta > 200;

  // Build a draft SOA object — used by preview and download
  const draftSOA: BillingStatement | null = selectedResident && property ? {
    id: `soa-preview`,
    reference: `SOA-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${selectedResident.unitNumber}`,
    propertyId: property.id,
    unitNumber: selectedResident.unitNumber!,
    resident: { id: selectedResident.id, name: selectedResident.fullName },
    periodStart: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    periodEnd: new Date().toISOString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    meters: [
      { type: 'water', current: waterCurrent, previous: waterPrevious, unit: 'm³' },
      { type: 'electric', current: electricCurrent, previous: electricPrevious, unit: 'kWh' },
    ],
    charges,
    previousBalance: 0,
    totalDue,
    status: 'draft',
  } : null;

  const handleSend = () => {
    if (!selectedResident || !property || !draftSOA) return;
    pushSOA((s) => ({
      billingStatements: [
        { ...draftSOA, id: `soa-${Date.now()}`, status: 'sent', sentAt: new Date().toISOString() },
        ...s.billingStatements,
      ],
    }));
    setShowSuccess(true);
    setTimeout(() => router.push('/staff/billing'), 1400);
  };

  const handleDownload = () => {
    if (!draftSOA || !property) return;
    generateSOAPdf(draftSOA, property.name);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[800px] md:mx-auto md:px-8 md:py-8">
        <PageHeader title="Generate SOA" backHref="/staff/billing" description="Capture meter readings and itemize charges for the period." />

        <FieldLabel>Resident / Unit</FieldLabel>
        <Select
          value={residentId}
          onChange={(e) => setResidentId(e.target.value)}
          options={residents.map((r) => ({ value: r.id, label: `Unit ${r.unitNumber} — ${r.fullName}` }))}
        />

        <FieldLabel>Meter Readings</FieldLabel>
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4">
          <MeterCard
            title="Water Meter"
            icon={Droplets}
            color="blue"
            current={waterCurrent}
            previous={waterPrevious}
            unit="m³"
            onCurrent={setWaterCurrent}
            onPrevious={setWaterPrevious}
            photo={waterPhoto}
            onPhoto={setWaterPhoto}
            extractionRange={[1200, 1280]}
          />
          <MeterCard
            title="Electric Meter"
            icon={Zap}
            color="amber"
            current={electricCurrent}
            previous={electricPrevious}
            unit="kWh"
            onCurrent={setElectricCurrent}
            onPrevious={setElectricPrevious}
            photo={electricPhoto}
            onPhoto={setElectricPhoto}
            extractionRange={[4280, 4400]}
          />
        </div>

        {waterAnomaly && (
          <div className="flex items-start gap-2.5 p-3 bg-warning-bg/60 border border-warning/20 rounded-xl mb-4 text-[11px] md:text-[12.5px] text-warning">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <div>
              <strong>AI Billing Alert:</strong> Water usage of {waterDelta} m³ is significantly higher than typical 6-month average (~30 m³/month). Verify reading or flag possible leak.
            </div>
          </div>
        )}

        <FieldLabel>Charges</FieldLabel>
        <div className="bg-white border border-line rounded-2xl divide-y divide-line mb-4">
          {charges.map((c, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-[11.5px] md:text-[13px] text-slate">{c.label}</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-mist">₱</span>
                <input
                  type="number"
                  value={c.amount}
                  onChange={(e) => {
                    const next = [...charges];
                    next[idx] = { ...c, amount: parseFloat(e.target.value) || 0 };
                    setCharges(next);
                  }}
                  className="w-20 md:w-24 text-right bg-transparent border-0 font-display text-[13px] md:text-[14px] font-medium focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-ivory-deep rounded-2xl p-4 md:p-5 flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] md:text-[12px] text-mist">Total Amount Due</div>
            <div className="text-[9.5px] md:text-[11px] text-mist">Due in 14 days</div>
          </div>
          <div className="font-display text-[20px] md:text-[26px] font-medium">{formatPeso(totalDue)}</div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 pb-4">
          <Button variant="secondary" onClick={() => setShowPreview(true)} disabled={!selectedResident}>
            Preview SOA
          </Button>
          <Button variant="secondary" onClick={handleDownload} disabled={!selectedResident}>
            <Download size={14} className="mr-1.5 inline-block" /> Download PDF
          </Button>
          <Button onClick={handleSend} disabled={!selectedResident} className="ml-auto">
            <Send size={14} className="mr-1.5 inline-block" /> Send to Resident
          </Button>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {showPreview && draftSOA && property && (
        <Sheet onClose={() => setShowPreview(false)} title="SOA Preview" description={`Reference ${draftSOA.reference}`}>
          <div className="bg-ivory-deep/50 rounded-2xl p-4 md:p-5 border border-line mb-4">
            <div className="flex items-baseline justify-between mb-3 pb-3 border-b border-line">
              <div>
                <div className="font-display text-[16px] md:text-[18px] font-medium">{selectedResident?.fullName}</div>
                <div className="text-[11px] text-mist">Unit {draftSOA.unitNumber} · {property.name}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-mist uppercase tracking-wider">Due</div>
                <div className="text-[12px] md:text-[13px] font-semibold">{formatDate(draftSOA.dueDate)}</div>
              </div>
            </div>

            <div className="text-[9px] text-mist uppercase tracking-wider mb-2">Meter Readings</div>
            <div className="space-y-1.5 mb-4">
              {draftSOA.meters.map((m, i) => (
                <div key={i} className="flex justify-between text-[11px] md:text-[12.5px]">
                  <span className="text-slate capitalize">{m.type}</span>
                  <span className="text-mist">
                    {m.previous} → {m.current} {m.unit}
                  </span>
                  <span className="font-semibold">{m.current - m.previous} {m.unit}</span>
                </div>
              ))}
            </div>

            <div className="text-[9px] text-mist uppercase tracking-wider mb-2">Charges</div>
            <div className="space-y-1.5 mb-3">
              {draftSOA.charges.map((c, i) => (
                <div key={i} className="flex justify-between text-[11px] md:text-[12.5px]">
                  <span className="text-slate">{c.label}</span>
                  <span className="font-display font-medium">{formatPeso(c.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 mt-2 border-t border-line">
              <span className="text-[12px] font-semibold text-slate">Total Due</span>
              <span className="font-display text-[18px] md:text-[20px] font-medium">{formatPeso(draftSOA.totalDue)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" fullWidth onClick={handleDownload}>
              <Download size={14} className="mr-1.5 inline-block" /> Download PDF
            </Button>
            <Button fullWidth onClick={() => { setShowPreview(false); handleSend(); }}>
              <Send size={14} className="mr-1.5 inline-block" /> Send
            </Button>
          </div>
        </Sheet>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm grid place-items-center p-6">
          <div className="bg-white rounded-3xl shadow-soft-lg p-6 md:p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-success-bg text-success grid place-items-center mx-auto mb-4">
              <Send size={22} />
            </div>
            <div className="font-display text-[18px] md:text-[20px] font-medium mb-1.5">SOA Sent</div>
            <div className="text-[12px] md:text-[13.5px] text-mist">Statement delivered to Home AI.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function MeterCard({
  title,
  icon: Icon,
  color,
  current,
  previous,
  unit,
  onCurrent,
  onPrevious,
  photo,
  onPhoto,
  extractionRange,
}: {
  title: string;
  icon: LucideIcon;
  color: 'blue' | 'amber';
  current: number;
  previous: number;
  unit: string;
  onCurrent: (v: number) => void;
  onPrevious: (v: number) => void;
  photo: string | null;
  onPhoto: (url: string | null) => void;
  extractionRange: [number, number];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [extracting, setExtracting] = useState(false);
  const [justExtracted, setJustExtracted] = useState(false);

  const bg = color === 'blue' ? 'from-[#1a3a52] to-[#2c5a7a]' : 'from-[#4a2a1a] to-[#6a4a2a]';

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      onPhoto(reader.result as string);
      // Simulate AI extraction
      setExtracting(true);
      setJustExtracted(false);
      setTimeout(() => {
        const [min, max] = extractionRange;
        const reading = Math.floor(min + Math.random() * (max - min));
        onCurrent(reading);
        setExtracting(false);
        setJustExtracted(true);
        setTimeout(() => setJustExtracted(false), 2200);
      }, 1400);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white border border-line rounded-2xl p-3 md:p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <IconBox color={color} size="sm">
            <Icon size={12} />
          </IconBox>
          <div className="text-[10.5px] md:text-[12px] text-mist font-medium">{title}</div>
        </div>
      </div>

      {/* Photo area / meter display */}
      <div className="relative mb-2">
        {photo ? (
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-charcoal/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Meter" className="w-full h-full object-cover" />
            {extracting && (
              <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm grid place-items-center text-ivory">
                <div className="flex flex-col items-center gap-1.5">
                  <Loader2 size={18} className="animate-spin" />
                  <span className="text-[9.5px] font-medium tracking-wide">AI READING…</span>
                </div>
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute top-1.5 right-1.5 w-6 h-6 grid place-items-center rounded-md bg-white/90 text-charcoal text-[9px] font-semibold hover:bg-white"
              aria-label="Replace photo"
            >
              <Camera size={11} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className={cn(
              'aspect-[16/9] rounded-lg flex flex-col items-center justify-center gap-1 transition-all w-full',
              'bg-gradient-to-br', bg
            )}
          >
            <Camera size={16} className="text-champagne-soft/80" />
            <span className="text-[9px] md:text-[10px] text-champagne-soft tracking-[0.18em] font-medium uppercase">
              Take Photo
            </span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
          className="hidden"
        />
      </div>

      {/* AI extraction success badge */}
      {justExtracted && (
        <div className="flex items-center gap-1.5 px-2 py-1 mb-1.5 bg-success-bg text-success rounded-md text-[9px] md:text-[10px] font-semibold">
          <Sparkles size={10} />
          AI extracted reading
          <Check size={10} className="ml-auto" />
        </div>
      )}

      <div className="space-y-1">
        <NumberRow label="Current" value={current} onChange={onCurrent} unit={unit} highlight={justExtracted} />
        <NumberRow label="Previous" value={previous} onChange={onPrevious} unit={unit} />
      </div>
    </div>
  );
}

function NumberRow({ label, value, onChange, unit, highlight }: { label: string; value: number; onChange: (v: number) => void; unit: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9.5px] md:text-[11px] text-mist">{label}</span>
      <div className={cn('flex items-center gap-1 transition-colors', highlight && 'text-success')}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={cn(
            'w-16 md:w-20 text-right bg-transparent border-0 text-[11px] md:text-[13px] font-medium focus:outline-none',
            highlight && 'font-semibold'
          )}
        />
        <span className="text-[9.5px] text-mist">{unit}</span>
      </div>
    </div>
  );
}
