'use client';

import Link from 'next/link';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentProperty } from '@/lib/store';
import { Badge, IconBox } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { formatRelativeTime } from '@/lib/utils';
import type { AnnouncementType } from '@/lib/types';
import {
  Plus,
  Megaphone,
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

export default function StaffAnnouncementsPage() {
  const property = useCurrentProperty();
  const announcements = useAppStore(
    useShallow((s) => s.announcements.filter((a) => a.propertyId === property?.id))
  );

  const sorted = [...announcements].sort((a, b) => {
    const aT = a.publishedAt ?? a.scheduledAt ?? '';
    const bT = b.publishedAt ?? b.scheduledAt ?? '';
    return new Date(bT).getTime() - new Date(aT).getTime();
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[900px] md:mx-auto md:px-8 md:py-8">
        <PageHeader
          title="Announcements"
          backHref="/staff/dashboard"
          description="All published and scheduled announcements."
          rightActions={
            <Link
              href="/staff/announcements/new"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne flex items-center gap-2"
            >
              <Plus size={14} /> New Announcement
            </Link>
          }
        />

        {/* Mobile new button */}
        <Link
          href="/staff/announcements/new"
          className="md:hidden flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep text-white text-[12px] font-semibold shadow-champagne mb-4 justify-center"
        >
          <Plus size={14} /> New Announcement
        </Link>

        <div className="space-y-2.5 pb-6">
          {sorted.map((a) => {
            const meta = TYPE_META[a.type] ?? TYPE_META.general;
            const Icon = meta.icon;
            return (
              <div key={a.id} className="bg-white border border-line rounded-2xl p-3 md:p-4">
                <div className="flex items-start gap-3">
                  <IconBox color={meta.color} size="md">
                    <Icon size={16} />
                  </IconBox>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-[12.5px] md:text-[15px] font-semibold leading-tight">{a.title}</div>
                      {a.publishedAt ? (
                        <Badge variant="complete">Sent</Badge>
                      ) : (
                        <Badge variant="pending">Scheduled</Badge>
                      )}
                    </div>
                    <div className="text-[10.5px] md:text-[12.5px] text-slate line-clamp-2 mb-2">{a.message}</div>
                    <div className="flex items-center gap-2 text-[9.5px] md:text-[11px] text-mist flex-wrap">
                      <span>{a.authorName}</span>
                      <span>·</span>
                      <span>{a.publishedAt ? formatRelativeTime(a.publishedAt) : 'Scheduled'}</span>
                      <span>·</span>
                      <span className="capitalize">{a.audiences.join(', ').replace(/_/g, ' ')}</span>
                      {a.sendToHomeAI && (
                        <>
                          <span>·</span>
                          <span className="text-champagne-deep font-medium">Pushed to Home AI</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
