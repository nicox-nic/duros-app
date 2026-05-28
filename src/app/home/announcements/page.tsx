'use client';

import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty, useCurrentUser } from '@/lib/store';
import { IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { formatRelativeTime } from '@/lib/utils';
import type { AnnouncementType } from '@/lib/types';
import {
  Droplets,
  Zap,
  Bug,
  Trash2,
  CalendarDays,
  Wallet,
  Shield,
  Flame,
  ArrowUpDown,
  Info,
  Megaphone,
} from 'lucide-react';

const TYPE_META: Record<AnnouncementType, { icon: any; color: 'blue' | 'amber' | 'gold' | 'red' | 'green' }> = {
  water: { icon: Droplets, color: 'blue' },
  power: { icon: Zap, color: 'amber' },
  elevator: { icon: ArrowUpDown, color: 'blue' },
  fire_drill: { icon: Flame, color: 'red' },
  pest_control: { icon: Bug, color: 'green' },
  garbage: { icon: Trash2, color: 'amber' },
  event: { icon: CalendarDays, color: 'gold' },
  payment: { icon: Wallet, color: 'green' },
  security: { icon: Shield, color: 'red' },
  general: { icon: Info, color: 'blue' },
};

export default function ResidentAnnouncementsPage() {
  const property = useCurrentProperty();
  const user = useCurrentUser();
  const announcements = useAppStore(
    useShallow((s) =>
      s.announcements.filter((a) => a.propertyId === property?.id && a.publishedAt)
    )
  );

  const sorted = [...announcements].sort((a, b) => {
    const aT = a.publishedAt ?? '';
    const bT = b.publishedAt ?? '';
    return new Date(bT).getTime() - new Date(aT).getTime();
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[700px] md:mx-auto md:px-8 md:py-8">
        <PageHeader title="Announcements" backHref="/home" description="Updates from property management." />

        {sorted.length === 0 ? (
          <div className="bg-white border border-line rounded-2xl p-8 text-center">
            <IconBox color="gold" size="lg" className="mx-auto mb-3">
              <Megaphone size={20} />
            </IconBox>
            <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">No announcements yet</div>
            <div className="text-[11px] md:text-[13px] text-mist">You&apos;ll see updates from your property here.</div>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4 pb-6">
            {sorted.map((a) => {
              const meta = TYPE_META[a.type] ?? TYPE_META.general;
              const Icon = meta.icon;
              return (
                <div key={a.id} className="bg-white border border-line rounded-2xl p-4 md:p-5 shadow-soft-sm">
                  <div className="flex items-start gap-3">
                    <IconBox color={meta.color} size="md">
                      <Icon size={16} />
                    </IconBox>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-[14px] md:text-[17px] font-medium mb-1.5">{a.title}</div>
                      <div className="text-[11.5px] md:text-[13.5px] text-slate leading-relaxed whitespace-pre-wrap">{a.message}</div>
                      <div className="flex items-center gap-2 text-[10px] md:text-[11.5px] text-mist mt-3 flex-wrap">
                        <span>From {a.authorName}</span>
                        <span>·</span>
                        <span>{a.publishedAt && formatRelativeTime(a.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
