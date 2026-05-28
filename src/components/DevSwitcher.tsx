'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Settings2, ChevronDown, Check, LogOut } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export function DevSwitcher() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginScreen = pathname === '/login';

  const users = useAppStore((s) => s.users);
  const properties = useAppStore((s) => s.properties);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const currentPropertyId = useAppStore((s) => s.currentPropertyId);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const setCurrentProperty = useAppStore((s) => s.setCurrentProperty);

  const currentUser = users.find((u) => u.id === currentUserId);
  const currentProperty = properties.find((p) => p.id === currentPropertyId);

  const handleUserSwitch = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setCurrentUser(userId);
    setCurrentProperty(user.propertyId);
    setOpen(false);
    router.push(user.role === 'resident' ? '/home' : '/staff/dashboard');
  };

  const handleLogout = () => {
    setOpen(false);
    router.replace('/login');
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close dev switcher"
          className="fixed inset-0 z-[199] cursor-default bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed right-4 z-[200]',
          'bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:bottom-4'
        )}
      >
      {open && (
        <div className="mb-2 w-[300px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-line shadow-soft-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-line bg-ivory-deep">
            <div className="text-[10px] uppercase tracking-[0.18em] text-champagne-deep font-semibold">
              Dev Switcher
            </div>
            <div className="text-[11px] text-mist mt-0.5">Prototype mode · prod auth replaces this</div>
          </div>

          <div className="p-3">
            <div className="text-[10px] uppercase tracking-wider text-mist font-semibold mb-1.5 px-2">
              Switch user
            </div>
            <div className="max-h-[260px] overflow-y-auto scrollbar-none">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleUserSwitch(u.id)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left text-[12px] hover:bg-ivory-deep transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-champagne-soft to-champagne-deep grid place-items-center text-white font-semibold text-[10px] shrink-0">
                    {u.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{u.fullName}</div>
                    <div className="text-[10px] text-mist uppercase tracking-wider truncate">
                      {u.role.replace(/_/g, ' ')}
                      {u.unitNumber && ` · Unit ${u.unitNumber}`}
                    </div>
                  </div>
                  {u.id === currentUserId && (
                    <Check size={14} className="text-success shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 border-t border-line">
            <div className="text-[10px] uppercase tracking-wider text-mist font-semibold mb-1.5 px-2">
              Property
            </div>
            {properties.map((p) => (
              <button
                key={p.id}
                onClick={() => setCurrentProperty(p.id)}
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-left text-[12px] hover:bg-ivory-deep transition-colors"
              >
                <span className="truncate">{p.name}</span>
                {p.id === currentPropertyId && <Check size={14} className="text-success" />}
              </button>
            ))}
          </div>

          {!isLoginScreen && (
            <div className="p-3 border-t border-line">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-danger border border-danger/20 hover:bg-danger/5 transition-colors"
              >
                <LogOut size={14} />
                Log out
              </button>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close dev switcher' : 'Open dev switcher'}
        aria-expanded={open}
        className={cn(
          'ml-auto flex items-center rounded-full bg-charcoal text-ivory shadow-soft-lg',
          'hover:bg-charcoal-soft transition-all duration-200 ease-out',
          open
            ? 'gap-2 px-4 py-2.5 text-[12px] font-medium'
            : 'h-11 w-11 justify-center'
        )}
      >
        {open ? (
          <>
            <Settings2 size={14} className="shrink-0" />
            <span className="font-semibold">{currentUser?.initials}</span>
            <span className="text-mist">·</span>
            <span className="truncate max-w-[140px]">{currentUser?.fullName}</span>
            <ChevronDown size={14} className="shrink-0 rotate-180 transition-transform" />
          </>
        ) : (
          <span className="font-semibold text-[11px]">{currentUser?.initials ?? '?'}</span>
        )}
      </button>
      </div>
    </>
  );
}
