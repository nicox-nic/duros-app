'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Megaphone,
  ClipboardCheck,
  QrCode,
  CreditCard,
  UserCog,
  AlertTriangle,
  MessageSquare,
  Star,
  Plus,
  type LucideIcon,
} from 'lucide-react';
import { Sheet } from './Sheet';
import { useCurrentUser } from '@/lib/store';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  tone: 'gold' | 'blue' | 'green' | 'red' | 'amber' | 'purple';
  /** Only show for staff (default true). When false, shown for residents instead. */
  staff?: boolean;
}

const ACTIONS: QuickAction[] = [
  {
    label: 'New Repair Ticket',
    description: 'Log a repair, complaint, or incident',
    icon: Wrench,
    href: '/staff/tickets/new',
    tone: 'gold',
    staff: true,
  },
  {
    label: 'New Announcement',
    description: 'Notify residents or staff',
    icon: Megaphone,
    href: '/staff/announcements/new',
    tone: 'blue',
    staff: true,
  },
  {
    label: 'New Work Permit',
    description: 'Renovation, aircon, plumbing, etc.',
    icon: ClipboardCheck,
    href: '/staff/permits/work/new',
    tone: 'green',
    staff: true,
  },
  {
    label: 'New Gate Pass',
    description: 'Visitor, delivery, contractor entry',
    icon: QrCode,
    href: '/staff/permits/gate/new',
    tone: 'amber',
    staff: true,
  },
  {
    label: 'New SOA Invoice',
    description: 'Generate statement of account',
    icon: CreditCard,
    href: '/staff/billing/new',
    tone: 'purple',
    staff: true,
  },
  {
    label: 'New Staff Member',
    description: 'Add staff and assign role',
    icon: UserCog,
    href: '/staff/team/new',
    tone: 'blue',
    staff: true,
  },
  {
    label: 'New Incident Report',
    description: 'Log a security incident',
    icon: AlertTriangle,
    href: '/staff/tickets/new?type=incident',
    tone: 'red',
    staff: true,
  },
  {
    label: 'New Message',
    description: 'Compose a message',
    icon: MessageSquare,
    href: '/staff/inbox',
    tone: 'gold',
    staff: true,
  },
  // Resident actions
  {
    label: 'New Request',
    description: 'Repair, complaint, or question',
    icon: Wrench,
    href: '/home/requests/new',
    tone: 'gold',
    staff: false,
  },
  {
    label: 'New Work Permit',
    description: 'Renovation, aircon, plumbing',
    icon: ClipboardCheck,
    href: '/home/permits/work/new',
    tone: 'green',
    staff: false,
  },
  {
    label: 'New Gate Pass',
    description: 'Visitor, delivery, contractor',
    icon: QrCode,
    href: '/home/permits/gate/new',
    tone: 'amber',
    staff: false,
  },
  {
    label: 'New Special Permit',
    description: 'Amenity, pet, party, parking',
    icon: Star,
    href: '/home/permits/special/new',
    tone: 'purple',
    staff: false,
  },
  {
    label: 'Message Management',
    description: 'Reach property staff',
    icon: MessageSquare,
    href: '/home/messages',
    tone: 'blue',
    staff: false,
  },
];

const TONE_CLASSES: Record<QuickAction['tone'], string> = {
  gold: 'bg-champagne/15 text-champagne-deep',
  blue: 'bg-info-bg text-info',
  green: 'bg-success-bg text-success',
  red: 'bg-danger-bg text-danger',
  amber: 'bg-warning-bg text-warning',
  purple: 'bg-[#ece6f3] text-[#6b4f93]',
};

export function FabQuickActions({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const user = useCurrentUser();
  const isResident = user?.role === 'resident';

  const actions = ACTIONS.filter((a) =>
    isResident ? a.staff === false : a.staff !== false
  );

  if (!open) return null;

  return (
    <Sheet
      onClose={onClose}
      title="Quick Actions"
      description="Create something new in one tap"
    >
      <div className="grid grid-cols-2 gap-2.5 mt-1">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.href}
              onClick={() => {
                onClose();
                router.push(action.href);
              }}
              className={cn(
                'flex flex-col items-start gap-2 p-3.5 rounded-2xl border border-line',
                'bg-white hover:bg-ivory-deep/40 active:scale-[0.98] transition-all',
                'text-left'
              )}
            >
              <div
                className={cn(
                  'w-9 h-9 rounded-xl grid place-items-center',
                  TONE_CLASSES[action.tone]
                )}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0 w-full">
                <div className="text-[12px] font-semibold text-charcoal leading-tight">
                  {action.label}
                </div>
                <div className="text-[10px] text-mist mt-0.5 leading-snug">
                  {action.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/** Trigger button that opens the popover — embeddable anywhere, e.g. sidebar. */
export function FabTrigger({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center justify-center gap-2 w-full',
          'bg-gradient-to-br from-champagne-soft to-champagne-deep',
          'text-white rounded-xl py-2.5 px-4 text-[13px] font-semibold',
          'shadow-fab hover:opacity-95 active:scale-[0.98] transition-all',
          className
        )}
      >
        <Plus size={16} strokeWidth={2.5} />
        New
      </button>
      <FabQuickActions open={open} onClose={() => setOpen(false)} />
    </>
  );
}
