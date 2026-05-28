'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, useCurrentUser } from '@/lib/store';
import { Button, IconBox } from '@/components/ui';
import { FieldLabel, TextInput, Textarea, Select } from '@/components/Form';
import { PageHeader } from '@/components/PageHeader';
import { TicketChatbot } from '@/components/TicketChatbot';
import { cn } from '@/lib/utils';
import type { TicketType, StaffDepartment } from '@/lib/types';
import {
  Sparkles,
  Wrench,
  MessageSquareWarning,
  Lightbulb,
  AlertOctagon,
  Camera,
  Send,
  X,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';

// =============================================================================
// PAGE
// =============================================================================

export default function NewRequestPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const createTicket = useAppStore((s) => s.createTicket);

  const [requestType, setRequestType] = useState<TicketType>('repair');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState<StaffDepartment>('Maintenance');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [mockPhotos, setMockPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);

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

  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit || !user) return;
    setSubmitting(true);

    // Mock photo URLs (UI-only — no actual upload)
    const photos = mockPhotos;

    const newTicket = createTicket({
      propertyId: user.propertyId,
      type: requestType,
      title: title.trim(),
      description: description.trim(),
      status: priority === 'urgent' ? 'urgent' : 'pending',
      priority,
      resident: {
        id: user.id,
        name: user.fullName,
        unitNumber: user.unitNumber!,
        tower: user.tower!,
      },
      department,
      photos,
      // 4-hour SLA for urgent, 24h otherwise
      slaDeadline: priority === 'urgent'
        ? new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString()
        : new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });

    setShowSuccess(true);
    setTimeout(() => {
      router.push(`/home/requests/${newTicket.id}`);
    }, 1200);
  };

  const handleChatbotSubmit = (draft: {
    type: TicketType;
    title: string;
    description: string;
    department: StaffDepartment;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }) => {
    if (!user) return;
    setChatbotOpen(false);
    setSubmitting(true);

    const newTicket = createTicket({
      propertyId: user.propertyId,
      type: draft.type,
      title: draft.title,
      description: draft.description,
      status: draft.priority === 'urgent' ? 'urgent' : 'pending',
      priority: draft.priority,
      resident: {
        id: user.id,
        name: user.fullName,
        unitNumber: user.unitNumber!,
        tower: user.tower!,
      },
      department: draft.department,
      photos: [],
      slaDeadline: draft.priority === 'urgent'
        ? new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString()
        : new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    });

    setShowSuccess(true);
    setTimeout(() => {
      router.push(`/home/requests/${newTicket.id}`);
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[680px] md:mx-auto md:px-8 md:py-8">

        <PageHeader title="New Request" backHref="/home" />

        {/* ===== AI CHATBOT ===== */}
        <button
          onClick={() => setChatbotOpen(true)}
          className="block w-full text-left bg-gradient-to-br from-charcoal to-charcoal-soft text-ivory rounded-2xl p-4 md:p-5 mb-5 md:mb-6 shadow-soft-md hover:shadow-soft-lg active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-champagne/20 grid place-items-center text-champagne-soft">
              <Sparkles size={18} />
            </div>
            <div className="flex-1">
              <div className="text-[13px] md:text-[15px] font-semibold">Describe your issue with AI</div>
              <div className="text-[10.5px] md:text-[12px] text-ivory/60 mt-0.5">
                Let our assistant draft the ticket for you — chat in your own words.
              </div>
            </div>
            <div className="text-[10px] md:text-[11px] text-champagne-soft uppercase tracking-wider font-semibold">Beta</div>
          </div>
        </button>

        <div className="text-[11.5px] md:text-[13px] text-mist mb-4 md:mb-5">Or fill out the form below.</div>

        {/* REQUEST TYPE */}
        <FieldLabel>Request Type</FieldLabel>
        <div className="grid grid-cols-4 gap-2 mb-4 md:mb-5">
          <RequestTypeChip type="repair" active={requestType === 'repair'} onClick={() => setRequestType('repair')} icon={Wrench} label="Repair" />
          <RequestTypeChip type="complaint" active={requestType === 'complaint'} onClick={() => setRequestType('complaint')} icon={MessageSquareWarning} label="Complaint" />
          <RequestTypeChip type="suggestion" active={requestType === 'suggestion'} onClick={() => setRequestType('suggestion')} icon={Lightbulb} label="Suggestion" />
          <RequestTypeChip type="incident" active={requestType === 'incident'} onClick={() => setRequestType('incident')} icon={AlertOctagon} label="Incident" />
        </div>

        {/* TITLE */}
        <FieldLabel>Title</FieldLabel>
        <TextInput
          placeholder="Brief summary of the issue"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* DEPARTMENT */}
        <FieldLabel>Department</FieldLabel>
        <Select
          value={department}
          onChange={(e) => setDepartment(e.target.value as StaffDepartment)}
          options={[
            { value: 'Maintenance', label: 'Maintenance (plumbing, repairs, paint)' },
            { value: 'Engineering', label: 'Engineering (aircon, electrical, elevator)' },
            { value: 'Accounting', label: 'Accounting (billing, payments)' },
            { value: 'Security', label: 'Security (access, incidents)' },
            { value: 'Utility', label: 'Utility (water, garbage, pest)' },
            { value: 'Other', label: 'Other' },
          ]}
        />

        {/* PRIORITY */}
        <FieldLabel>Priority</FieldLabel>
        <div className="grid grid-cols-4 gap-2 mb-4 md:mb-5">
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

        {/* DESCRIPTION */}
        <FieldLabel>Description</FieldLabel>
        <Textarea
          rows={4}
          placeholder="Describe what's happening, when it started, and any details that might help."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* PHOTOS (UI ONLY) */}
        <FieldLabel>Photos (optional)</FieldLabel>
        <div className="grid grid-cols-4 gap-2 mb-4 md:mb-5">
          {mockPhotos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl bg-cover bg-center bg-ivory-deep" style={{ backgroundImage: `url('${url}')` }}>
              <button
                onClick={() => setMockPhotos(mockPhotos.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-charcoal/80 text-white grid place-items-center"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {mockPhotos.length < 4 && (
            <button
              onClick={() => {
                // Add a mock photo (UI-only)
                const samples = [
                  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1631545308456-c4b8be1b6e10?auto=format&fit=crop&w=400&q=80',
                ];
                setMockPhotos([...mockPhotos, samples[mockPhotos.length]]);
              }}
              className="aspect-square rounded-xl border-2 border-dashed border-line-strong grid place-items-center text-mist hover:border-champagne hover:text-champagne-deep transition-colors"
            >
              <Camera size={20} />
            </button>
          )}
        </div>

        {/* PRIORITY NOTICE */}
        {priority === 'urgent' && (
          <div className="flex items-start gap-2.5 p-3 bg-danger-bg/60 border border-danger/20 rounded-xl mb-4 text-[11px] md:text-[12.5px] text-danger">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span><strong>Urgent priority</strong> alerts staff immediately with a 4-hour SLA. Use only for safety hazards, leaks, or other time-critical issues.</span>
          </div>
        )}

        {/* SUBMIT */}
        <div className="flex gap-2 pt-2 pb-4">
          <Button variant="secondary" fullWidth onClick={() => router.back()}>Cancel</Button>
          <Button fullWidth disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? 'Sending...' : 'Submit Request'}
          </Button>
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm grid place-items-center p-6">
          <div className="bg-white rounded-3xl shadow-soft-lg p-6 md:p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-success-bg text-success grid place-items-center mx-auto mb-4">
              <Send size={22} />
            </div>
            <div className="font-display text-[18px] md:text-[20px] font-medium mb-1.5">Request Submitted</div>
            <div className="text-[12px] md:text-[13.5px] text-mist leading-relaxed">
              Property management has been notified. We&apos;ll get back to you shortly.
            </div>
          </div>
        </div>
      )}

      {/* AI CHATBOT */}
      <TicketChatbot
        open={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
        onSubmit={handleChatbotSubmit}
      />
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function RequestTypeChip({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  type: TicketType;
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border transition-all',
        active
          ? 'bg-charcoal text-ivory border-charcoal'
          : 'bg-white border-line text-slate hover:border-line-strong'
      )}
    >
      <Icon size={18} />
      <span className="text-[10.5px] md:text-[11.5px] font-medium">{label}</span>
    </button>
  );
}
