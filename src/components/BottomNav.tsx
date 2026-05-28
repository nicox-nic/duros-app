'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, FileText, ClipboardCheck, MessageSquare, Plus, Home, CreditCard, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/lib/store';
import { FabQuickActions } from './FabQuickActions';

const STAFF_NAV = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/staff/tickets', label: 'Tickets', icon: FileText },
  { href: '/staff/permits/work', label: 'Permits', icon: ClipboardCheck },
  { href: '/staff/inbox', label: 'Inbox', icon: MessageSquare },
];

const RESIDENT_NAV = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/home/requests', label: 'Requests', icon: FileText },
  { href: '/home/billing', label: 'Billing', icon: CreditCard },
  { href: '/home/announcements', label: 'Updates', icon: Bell },
];

export function BottomNav() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const isResident = user?.role === 'resident';
  const nav = isResident ? RESIDENT_NAV : STAFF_NAV;
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      <div className="glass-strong relative flex shrink-0 justify-around items-center border-t border-line py-3 px-3.5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {nav.slice(0, 2).map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 flex-1 text-[9.5px] font-medium',
                active ? 'text-champagne-deep' : 'text-mist'
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}

        <div className="flex-1" />

        {nav.slice(2).map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 flex-1 text-[9.5px] font-medium',
                active ? 'text-champagne-deep' : 'text-mist'
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}

        {/* FAB — opens Quick Actions popover */}
        <button
          onClick={() => setFabOpen(true)}
          aria-label="Quick actions"
          className={cn(
            'absolute left-1/2 -translate-x-1/2 -top-[22px]',
            'w-[50px] h-[50px] rounded-2xl grid place-items-center',
            'bg-gradient-to-br from-champagne-soft to-champagne-deep',
            'text-white shadow-fab',
            'border-[3px] border-ivory',
            'active:scale-95 transition-transform'
          )}
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      <FabQuickActions open={fabOpen} onClose={() => setFabOpen(false)} />
    </>
  );
}
