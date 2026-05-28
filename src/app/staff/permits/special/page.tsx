'use client';

import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Badge, IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { formatDate } from '@/lib/utils';
import type { SpecialPermit, SpecialPermitType } from '@/lib/types';
import {
  Plus,
  Sparkles,
  Building2,
  Waves,
  Truck,
  Heart,
  ParkingSquare,
  Moon,
  Store,
  Camera,
  Plane,
  Clock,
  Star,
} from 'lucide-react';

const TYPE_META: Record<SpecialPermitType, { icon: any; label: string }> = {
  amenity: { icon: Sparkles, label: 'Amenity' },
  function_room: { icon: Building2, label: 'Function Room' },
  pool_party: { icon: Waves, label: 'Pool Party' },
  moving: { icon: Truck, label: 'Moving' },
  pet: { icon: Heart, label: 'Pet' },
  temp_parking: { icon: ParkingSquare, label: 'Temp Parking' },
  overnight_guest: { icon: Moon, label: 'Overnight Guest' },
  commercial: { icon: Store, label: 'Commercial' },
  photoshoot: { icon: Camera, label: 'Photoshoot' },
  drone: { icon: Plane, label: 'Drone' },
  extended_hours: { icon: Clock, label: 'Extended Hours' },
};

export default function SpecialPermitsPage() {
  const property = useCurrentProperty();
  const permits = useAppStore(
    useShallow((s) => s.specialPermits.filter((p) => p.propertyId === property?.id))
  );

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[1000px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="Special Permits"
          backHref="/staff/dashboard"
          description="Amenity reservations, pet registration, moving, and more."
          rightActions={
            <Link
              href="/staff/permits/special/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne flex items-center gap-2"
            >
              <Plus size={14} /> New Permit
            </Link>
          }
        />

        {/* PERMIT TYPES GRID */}
        <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">Permit Types</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-5">
          {(Object.keys(TYPE_META) as SpecialPermitType[]).map((type) => {
            const meta = TYPE_META[type];
            const Icon = meta.icon;
            return (
              <Link
                key={type}
                href={`/staff/permits/special/new?type=${type}`}
                className="flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl bg-white border border-line hover:border-line-strong transition-all"
              >
                <Icon size={18} className="text-champagne-deep" />
                <span className="text-[9.5px] md:text-[11px] font-medium text-center leading-tight">{meta.label}</span>
              </Link>
            );
          })}
        </div>

        {/* APPLICATIONS */}
        <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">Recent Applications</div>
        <div className="space-y-2 pb-6">
          {permits.length === 0 ? (
            <div className="bg-white border border-line rounded-2xl p-8 text-center">
              <IconBox color="gold" size="lg" className="mx-auto mb-3">
                <Star size={20} />
              </IconBox>
              <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">No applications yet</div>
              <div className="text-[11px] md:text-[13px] text-mist">Resident applications will appear here.</div>
            </div>
          ) : (
            permits.map((p) => <SpecialPermitCard key={p.id} permit={p} />)
          )}
        </div>
      </div>
    </div>
  );
}

function SpecialPermitCard({ permit }: { permit: SpecialPermit }) {
  const meta = TYPE_META[permit.type];
  const Icon = meta.icon;

  const statusBadge = (() => {
    switch (permit.status) {
      case 'approved': return { variant: 'complete' as const, label: 'Approved' };
      case 'rejected': return { variant: 'reject' as const, label: 'Rejected' };
      case 'pending': return { variant: 'pending' as const, label: 'Pending' };
      default: return { variant: 'pending' as const, label: permit.status };
    }
  })();

  return (
    <div className="bg-white border border-line rounded-2xl p-3 md:p-4">
      <div className="flex items-center gap-3">
        <IconBox color="gold" size="md">
          <Icon size={15} />
        </IconBox>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <div className="text-[12.5px] md:text-[14px] font-semibold">{meta.label} — Unit {permit.unitNumber}</div>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <div className="text-[10.5px] md:text-[12px] text-slate line-clamp-1">{permit.details}</div>
          <div className="text-[9.5px] md:text-[11px] text-mist mt-0.5">
            {formatDate(permit.startAt)} {permit.startAt !== permit.endAt && `– ${formatDate(permit.endAt)}`} · {permit.resident.name}
          </div>
        </div>
      </div>
    </div>
  );
}
