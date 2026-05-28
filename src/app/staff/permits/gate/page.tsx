'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Badge, Button, IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { Sheet } from '@/components/Sheet';
import { cn, formatTimeOfDay } from '@/lib/utils';
import type { GatePassType, GatePass } from '@/lib/types';
import {
  Plus,
  Users,
  Truck,
  Wrench,
  Package,
  Car,
  ScanLine,
  ParkingSquare,
  Move,
  KeyRound,
  LogIn,
  LogOut,
  Check,
  type LucideIcon,
} from 'lucide-react';

const PASS_TYPES: { id: GatePassType; label: string; icon: LucideIcon }[] = [
  { id: 'visitor', label: 'Visitor', icon: Users },
  { id: 'delivery', label: 'Delivery', icon: Truck },
  { id: 'contractor', label: 'Contractor', icon: Wrench },
  { id: 'move_in', label: 'Move-in', icon: Move },
  { id: 'move_out', label: 'Move-out', icon: Move },
  { id: 'furniture', label: 'Furniture', icon: Package },
  { id: 'guest_parking', label: 'Parking', icon: ParkingSquare },
  { id: 'vehicle', label: 'Vehicle', icon: Car },
];

// Generate a stylized "QR" SVG pattern (visual only)
function QRPattern({ seed = 1 }: { seed?: number }) {
  // Deterministic pattern based on seed so it doesn't shift on re-render
  const cells: number[] = [];
  let h = seed;
  for (let i = 0; i < 100; i++) {
    h = (h * 9301 + 49297) % 233280;
    if (h / 233280 > 0.55) cells.push(i);
  }
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="0" y="0" width="100" height="100" fill="white" />
      <rect x="0" y="0" width="30" height="30" fill="#1f1d1a" />
      <rect x="5" y="5" width="20" height="20" fill="white" />
      <rect x="10" y="10" width="10" height="10" fill="#1f1d1a" />
      <rect x="70" y="0" width="30" height="30" fill="#1f1d1a" />
      <rect x="75" y="5" width="20" height="20" fill="white" />
      <rect x="80" y="10" width="10" height="10" fill="#1f1d1a" />
      <rect x="0" y="70" width="30" height="30" fill="#1f1d1a" />
      <rect x="5" y="75" width="20" height="20" fill="white" />
      <rect x="10" y="80" width="10" height="10" fill="#1f1d1a" />
      {cells.map((i) => {
        const x = (i % 10) * 10;
        const y = Math.floor(i / 10) * 10;
        if ((x < 30 && y < 30) || (x >= 70 && y < 30) || (x < 30 && y >= 70)) return null;
        return <rect key={i} x={x + 2} y={y + 2} width="6" height="6" fill="#1f1d1a" />;
      })}
    </svg>
  );
}

export default function GatePassPage() {
  const property = useCurrentProperty();
  const passes = useAppStore(
    useShallow((s) => s.gatePasses.filter((g) => g.propertyId === property?.id))
  );
  const checkInGatePass = useAppStore((s) => s.checkInGatePass);
  const checkOutGatePass = useAppStore((s) => s.checkOutGatePass);

  const [selectedType, setSelectedType] = useState<GatePassType>('visitor');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedPass, setScannedPass] = useState<GatePass | null>(null);
  const activePass = passes.find((p) => p.status === 'approved' || p.status === 'in') ?? passes[0];

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[1000px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="Gate Pass"
          backHref="/staff/dashboard"
          description="Visitor, delivery, contractor, and vehicle entries."
          rightActions={
            <>
              <button
                onClick={() => setScannerOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white border border-line text-[12px] text-slate hover:bg-ivory-deep flex items-center gap-2"
              >
                <ScanLine size={14} /> Scan QR
              </button>
              <Link
                href="/staff/permits/gate/new"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne flex items-center gap-2"
              >
                <Plus size={14} /> New Pass
              </Link>
            </>
          }
        />

        {/* Mobile-only scan button */}
        <button
          onClick={() => setScannerOpen(true)}
          className="md:hidden flex items-center justify-center gap-2 w-full mb-3 px-4 py-3 rounded-xl bg-white border border-line text-[12px] font-semibold text-slate"
        >
          <ScanLine size={14} /> Scan Visitor QR
        </button>

        <div className="md:grid md:grid-cols-3 md:gap-6">
          {/* LEFT: Active pass QR */}
          {activePass && (
            <div className="md:col-span-1 mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-charcoal to-charcoal-soft text-ivory rounded-3xl p-5 md:p-6 shadow-soft-md relative overflow-hidden">
                <div className="absolute -top-5 -right-5 w-32 h-32 rounded-full bg-champagne/15 blur-2xl" />
                <div className="relative">
                  <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-champagne-soft font-semibold mb-2">Active Pass</div>
                  <div className="font-display text-[15px] md:text-[18px] mb-3">{activePass.visitorName}</div>
                  <div className="bg-white rounded-2xl p-3 md:p-4 mb-3 aspect-square max-w-[200px] md:max-w-none mx-auto">
                    <QRPattern seed={activePass.id.length * 7} />
                  </div>
                  <div className="text-[10.5px] md:text-[12.5px] text-champagne-soft space-y-0.5">
                    <div>Host: Unit {activePass.hostUnit} — {activePass.hostName}</div>
                    <div className="capitalize">Type: {activePass.type.replace(/_/g, ' ')}</div>
                    <div>Expires: {formatTimeOfDay(activePass.expiresAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT: Pass types + entries */}
          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">Pass Type</div>
            <div className="grid grid-cols-4 gap-2 mb-4 md:mb-5">
              {PASS_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedType(t.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all',
                      selectedType === t.id ? 'bg-charcoal text-ivory border-charcoal' : 'bg-white border-line text-slate hover:border-line-strong'
                    )}
                  >
                    <Icon size={16} />
                    <span className="text-[9.5px] md:text-[11px] font-medium leading-tight text-center">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">Today&apos;s Entries</div>
            <div className="space-y-2 pb-6">
              {passes.map((p) => {
                const canCheckIn = p.status === 'approved' && !p.timeIn;
                const canCheckOut = p.status === 'in' && !p.timeOut;
                return (
                  <div key={p.id} className="bg-white border border-line rounded-2xl p-3 md:p-4">
                    <div className="flex items-center gap-3">
                      <IconBox color="blue" size="md">
                        <ScanLine size={15} />
                      </IconBox>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 mb-0.5">
                          <div className="text-[12.5px] md:text-[14px] font-semibold">{p.visitorName}</div>
                          <PassStatusBadge status={p.status} />
                        </div>
                        <div className="text-[10px] md:text-[11.5px] text-mist">
                          {p.plateNumber && <span>Plate: {p.plateNumber} · </span>}
                          Unit {p.hostUnit}
                        </div>
                        <div className="text-[9.5px] md:text-[11px] text-slate mt-0.5">
                          {p.timeOut
                            ? `In ${formatTimeOfDay(p.timeIn!)} · Out ${formatTimeOfDay(p.timeOut)}`
                            : p.timeIn
                            ? `In at ${formatTimeOfDay(p.timeIn)}`
                            : `Expires ${formatTimeOfDay(p.expiresAt)}`}
                        </div>
                      </div>
                    </div>

                    {(canCheckIn || canCheckOut) && (
                      <div className="flex gap-2 mt-3">
                        {canCheckIn && (
                          <Button fullWidth onClick={() => checkInGatePass(p.id)}>
                            <LogIn size={12} className="mr-1 inline-block" /> Check In
                          </Button>
                        )}
                        {canCheckOut && (
                          <Button variant="secondary" fullWidth onClick={() => checkOutGatePass(p.id)}>
                            <LogOut size={12} className="mr-1 inline-block" /> Check Out
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* QR SCANNER MODAL */}
      {scannerOpen && (
        <QRScannerModal
          passes={passes}
          onClose={() => { setScannerOpen(false); setScannedPass(null); }}
          onScan={(pass) => setScannedPass(pass)}
          scannedPass={scannedPass}
          onCheckIn={() => {
            if (scannedPass) {
              checkInGatePass(scannedPass.id);
              setScannerOpen(false);
              setScannedPass(null);
            }
          }}
          onCheckOut={() => {
            if (scannedPass) {
              checkOutGatePass(scannedPass.id);
              setScannerOpen(false);
              setScannedPass(null);
            }
          }}
        />
      )}
    </div>
  );
}

function QRScannerModal({
  passes,
  onClose,
  onScan,
  scannedPass,
  onCheckIn,
  onCheckOut,
}: {
  passes: GatePass[];
  onClose: () => void;
  onScan: (pass: GatePass) => void;
  scannedPass: GatePass | null;
  onCheckIn: () => void;
  onCheckOut: () => void;
}) {
  const [scanning, setScanning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate a scan after ~1.8s — pick a random approved or in pass
  useEffect(() => {
    if (scannedPass) return;
    setScanning(true);
    timerRef.current = setTimeout(() => {
      const eligible = passes.filter((p) => p.status === 'approved' || p.status === 'in');
      const pick = eligible[Math.floor(Math.random() * eligible.length)] ?? passes[0];
      if (pick) {
        onScan(pick);
        setScanning(false);
      } else {
        // Nothing scanned — just close
        onClose();
      }
    }, 1800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scannedPass, passes, onScan, onClose]);

  return (
    <Sheet
      onClose={onClose}
      title={scannedPass ? 'Pass Verified' : 'Scan QR Code'}
      description={scannedPass ? 'Confirm check-in or check-out below.' : 'Hold the visitor\'s QR code up to the camera.'}
    >
      {!scannedPass && scanning && (
        <div className="relative aspect-square max-w-[280px] mx-auto bg-charcoal rounded-2xl overflow-hidden mb-3">
          {/* Camera viewfinder simulation */}
          <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-slate to-charcoal-soft" />
          <div className="absolute inset-4 border-2 border-champagne-soft/60 rounded-xl" />
          <div className="absolute inset-x-4 top-4 h-0.5 bg-champagne animate-pulse" style={{
            animation: 'scan 1.8s ease-in-out infinite',
          }} />
          <style jsx>{`
            @keyframes scan {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(220px); }
            }
          `}</style>
          <div className="absolute inset-0 grid place-items-center text-champagne-soft text-[10.5px] uppercase tracking-[0.18em] font-semibold">
            <div className="flex flex-col items-center gap-1.5 mt-32">
              <ScanLine size={12} />
              <span>Scanning…</span>
            </div>
          </div>
        </div>
      )}

      {scannedPass && (
        <div className="bg-ivory-deep/60 border border-line rounded-2xl p-4 mb-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-success-bg text-success grid place-items-center">
              <Check size={14} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[12.5px] md:text-[13.5px] font-semibold">{scannedPass.visitorName}</div>
              <div className="text-[10px] md:text-[11px] text-mist font-mono">{scannedPass.reference}</div>
            </div>
          </div>
          <div className="space-y-1 text-[11px] md:text-[12px]">
            <Row label="Host" value={`Unit ${scannedPass.hostUnit} — ${scannedPass.hostName}`} />
            <Row label="Type" value={scannedPass.type.replace(/_/g, ' ')} capitalize />
            {scannedPass.plateNumber && <Row label="Plate" value={scannedPass.plateNumber} />}
            {scannedPass.idNumber && <Row label="ID" value={scannedPass.idNumber} />}
            <Row label="Expires" value={formatTimeOfDay(scannedPass.expiresAt)} />
            <Row label="Status" value={scannedPass.status} capitalize />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" fullWidth onClick={onClose}>
          Cancel
        </Button>
        {scannedPass?.status === 'approved' && (
          <Button fullWidth onClick={onCheckIn}>
            <LogIn size={12} className="mr-1 inline-block" /> Check In
          </Button>
        )}
        {scannedPass?.status === 'in' && (
          <Button fullWidth onClick={onCheckOut}>
            <LogOut size={12} className="mr-1 inline-block" /> Check Out
          </Button>
        )}
      </div>
    </Sheet>
  );
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-mist text-[10px] uppercase tracking-wider font-semibold pt-0.5">{label}</span>
      <span className={cn('text-charcoal font-medium text-right', capitalize && 'capitalize')}>{value}</span>
    </div>
  );
}

function PassStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'urgent' | 'pending' | 'progress' | 'complete' | 'reject' | 'approval'; label: string }> = {
    pending: { variant: 'pending', label: 'Pending' },
    approved: { variant: 'approval', label: 'Approved' },
    in: { variant: 'progress', label: 'Inside' },
    out: { variant: 'complete', label: 'Out' },
    expired: { variant: 'reject', label: 'Expired' },
    rejected: { variant: 'reject', label: 'Rejected' },
  };
  const config = map[status] ?? { variant: 'pending' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
