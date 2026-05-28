'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  FileText,
  ClipboardCheck,
  MessageSquare,
  Home,
  CreditCard,
  Bell,
  Sparkles,
  Megaphone,
  KeyRound,
  Star,
  Users,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser, useUnreadCount } from '@/lib/store';
import { BrandMark } from './BrandMark';
import { FabTrigger } from './FabQuickActions';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: boolean;
};
type NavGroup = { section: string; items: NavItem[] };

const STAFF_NAV: NavGroup[] = [
  { section: 'Operations', items: [
    { href: '/staff/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { href: '/staff/insights', label: 'AI Insights', icon: Sparkles },
    { href: '/staff/tickets', label: 'Tickets', icon: FileText },
    { href: '/staff/inbox', label: 'Inbox', icon: MessageSquare, badge: true },
  ]},
  { section: 'Property', items: [
    { href: '/staff/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/staff/billing', label: 'Billing & SOA', icon: CreditCard },
    { href: '/staff/permits/work', label: 'Work Permits', icon: ClipboardCheck },
    { href: '/staff/permits/gate', label: 'Gate Pass', icon: KeyRound },
    { href: '/staff/permits/special', label: 'Special Permits', icon: Star },
  ]},
  { section: 'Admin', items: [
    { href: '/staff/team', label: 'Staff & Roles', icon: Users },
    { href: '/staff/reports', label: 'AI Reports', icon: BarChart3 },
  ]},
];

const RESIDENT_NAV: NavGroup[] = [
  { section: 'Home', items: [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/home/requests', label: 'My Requests', icon: FileText },
    { href: '/home/permits', label: 'My Permits', icon: ClipboardCheck },
    { href: '/home/billing', label: 'My Billing', icon: CreditCard },
    { href: '/home/announcements', label: 'Announcements', icon: Bell },
    { href: '/home/messages', label: 'Messages', icon: MessageSquare, badge: true },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const unread = useUnreadCount();
  const isResident = user?.role === 'resident';
  const nav = isResident ? RESIDENT_NAV : STAFF_NAV;

  return (
    <aside className="hidden md:flex flex-col w-[260px] h-screen sticky top-0 bg-white/60 backdrop-blur-xl border-r border-line">
      <div className="p-6 border-b border-line">
        <BrandMark size="md" />
        <div className="mt-4">
          <FabTrigger />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 scrollbar-none">
        {nav.map((group) => (
          <div key={group.section} className="mb-6">
            <div className="text-[10px] uppercase tracking-[0.18em] text-mist font-semibold px-3 mb-2">
              {group.section}
            </div>
            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon, badge }) => {
                const active = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-charcoal text-ivory shadow-soft-sm'
                        : 'text-slate hover:bg-charcoal/5 hover:text-charcoal'
                    )}
                  >
                    <Icon size={16} />
                    <span className="flex-1">{label}</span>
                    {badge && unread > 0 && (
                      <span className={cn(
                        'text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                        active ? 'bg-champagne text-charcoal' : 'bg-danger text-white'
                      )}>
                        {unread}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-line">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-champagne-soft to-champagne-deep grid place-items-center text-white font-semibold text-xs">
            {user?.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold truncate">{user?.fullName}</div>
            <div className="text-[10px] text-mist uppercase tracking-wider truncate">
              {user?.role.replace(/_/g, ' ')}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
