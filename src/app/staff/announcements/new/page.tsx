'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, useCurrentUser, useCurrentProperty } from '@/lib/store';
import { Button } from '@/components/ui';
import { FieldLabel, TextInput, Textarea } from '@/components/Form';
import { PageHeader } from '@/components/PageHeader';
import { cn } from '@/lib/utils';
import type { AnnouncementType, AnnouncementAudience } from '@/lib/types';
import { Check, Send } from 'lucide-react';

const TYPES: { id: AnnouncementType; label: string }[] = [
  { id: 'water', label: 'Water' },
  { id: 'power', label: 'Power' },
  { id: 'elevator', label: 'Elevator' },
  { id: 'fire_drill', label: 'Fire Drill' },
  { id: 'pest_control', label: 'Pest Control' },
  { id: 'garbage', label: 'Garbage' },
  { id: 'event', label: 'Event' },
  { id: 'payment', label: 'Payment' },
  { id: 'security', label: 'Security' },
  { id: 'general', label: 'General' },
];

const AUDIENCES: { id: AnnouncementAudience; label: string }[] = [
  { id: 'all_residents', label: 'All Residents' },
  { id: 'tower', label: 'Specific Tower' },
  { id: 'floor', label: 'Specific Floor' },
  { id: 'unit', label: 'Specific Unit' },
  { id: 'staff', label: 'Staff Only' },
  { id: 'security', label: 'Security' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'commercial', label: 'Commercial' },
];

export default function NewAnnouncementPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const property = useCurrentProperty();
  const pushAnnouncement = useAppStore.setState; // direct
  const allAnnouncements = useAppStore((s) => s.announcements);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AnnouncementType>('water');
  const [audiences, setAudiences] = useState<AnnouncementAudience[]>(['all_residents']);
  const [scheduled, setScheduled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [sendToHomeAI, setSendToHomeAI] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const toggleAudience = (id: AnnouncementAudience) => {
    if (audiences.includes(id)) setAudiences(audiences.filter((a) => a !== id));
    else setAudiences([...audiences, id]);
  };

  const canSend = title.trim() && message.trim() && audiences.length > 0;

  const handleSend = () => {
    if (!canSend || !user || !property) return;
    pushAnnouncement((s) => ({
      announcements: [
        {
          id: `ann-${Date.now()}`,
          propertyId: property.id,
          type,
          title: title.trim(),
          message: message.trim(),
          audiences,
          publishedAt: scheduled ? undefined : new Date().toISOString(),
          scheduledAt: scheduled ? new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() : undefined,
          pushEnabled,
          sendToHomeAI,
          authorId: user.id,
          authorName: user.fullName,
        },
        ...s.announcements,
      ],
    }));

    setShowSuccess(true);
    setTimeout(() => router.push('/staff/announcements'), 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[680px] md:mx-auto md:px-8 md:py-8">
        <PageHeader title="New Announcement" backHref="/staff/announcements" />

        <FieldLabel>Title</FieldLabel>
        <TextInput placeholder="e.g. Water Interruption — May 16" value={title} onChange={(e) => setTitle(e.target.value)} />

        <FieldLabel>Type</FieldLabel>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[10.5px] md:text-[12px] border',
                type === t.id
                  ? 'bg-champagne/15 text-champagne-deep border-champagne/40 font-semibold'
                  : 'bg-white text-slate border-line hover:bg-ivory-deep'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <FieldLabel>Audience</FieldLabel>
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {AUDIENCES.map((a) => {
            const active = audiences.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => toggleAudience(a.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10.5px] md:text-[12px] border transition-all',
                  active ? 'bg-charcoal text-ivory border-charcoal' : 'bg-white text-slate border-line'
                )}
              >
                <div className={cn(
                  'w-[14px] h-[14px] rounded-full border-[1.5px] shrink-0 grid place-items-center transition-colors',
                  active ? 'bg-champagne border-champagne' : 'border-line-strong'
                )}>
                  {active && <Check size={9} className="text-white" />}
                </div>
                {a.label}
              </button>
            );
          })}
        </div>

        <FieldLabel>Message</FieldLabel>
        <Textarea rows={5} placeholder="Type your announcement..." value={message} onChange={(e) => setMessage(e.target.value)} />

        {/* Toggles */}
        <div className="bg-white border border-line rounded-2xl divide-y divide-line mb-4">
          <ToggleRow label="Schedule for later" enabled={scheduled} onToggle={() => setScheduled(!scheduled)} />
          <ToggleRow label="Send push notification" enabled={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />
          <ToggleRow label="Send to Home AI app" enabled={sendToHomeAI} onToggle={() => setSendToHomeAI(!sendToHomeAI)} />
        </div>

        <div className="flex gap-2 pt-2 pb-4">
          <Button variant="secondary" fullWidth onClick={() => router.back()}>Save Draft</Button>
          <Button fullWidth disabled={!canSend} onClick={handleSend}>
            {scheduled ? 'Schedule' : 'Send Now'}
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
              {scheduled ? 'Announcement Scheduled' : 'Announcement Sent'}
            </div>
            <div className="text-[12px] md:text-[13.5px] text-mist">
              {sendToHomeAI && 'Residents notified via Home AI.'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3 text-[12px] md:text-[13.5px]">
      <span>{label}</span>
      <span className={cn(
        'w-8 h-[18px] rounded-full relative transition-colors',
        enabled ? 'bg-champagne' : 'bg-charcoal/15'
      )}>
        <span className={cn(
          'absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-soft-sm transition-all',
          enabled ? 'right-[2px]' : 'left-[2px]'
        )} />
      </span>
    </button>
  );
}
