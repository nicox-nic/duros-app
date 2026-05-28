'use client';

import { useState, type ReactNode } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '@/lib/store';
import { Sheet } from './Sheet';
import { cn } from '@/lib/utils';
import { Building2, Check, ChevronDown } from 'lucide-react';

/**
 * Wraps any element with a click target that opens the property switcher.
 * Reads available properties from the store and updates `currentPropertyId`.
 */
export function PropertySwitcher({ children, className }: { children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn('text-left w-full', className)}
      >
        {children}
      </button>
      {open && <PropertySwitcherModal onClose={() => setOpen(false)} />}
    </>
  );
}

function PropertySwitcherModal({ onClose }: { onClose: () => void }) {
  const properties = useAppStore(useShallow((s) => s.properties));
  const currentId = useAppStore((s) => s.currentPropertyId);
  const switchProperty = (id: string) => {
    useAppStore.setState({ currentPropertyId: id });
    onClose();
  };

  return (
    <Sheet
      onClose={onClose}
      title="Switch Property"
      description="Choose a property to manage. Tickets, billing, and permits will update to match."
    >
      <div className="space-y-2">
        {properties.map((p) => {
          const active = p.id === currentId;
          return (
            <button
              key={p.id}
              onClick={() => switchProperty(p.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left',
                active
                  ? 'border-charcoal bg-charcoal text-ivory'
                  : 'border-line bg-white hover:border-line-strong'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl grid place-items-center shrink-0',
                  active ? 'bg-champagne/20 text-champagne-soft' : 'bg-champagne/15 text-champagne-deep'
                )}
              >
                <Building2 size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] md:text-[13.5px] font-semibold truncate">{p.name}</div>
                <div className={cn('text-[10.5px] md:text-[11.5px] mt-0.5 truncate', active ? 'text-ivory/70' : 'text-mist')}>
                  {p.address}
                </div>
                <div className={cn('text-[10px] md:text-[11px] mt-0.5', active ? 'text-ivory/60' : 'text-mist')}>
                  {p.towers} towers · {p.totalUnits} units
                </div>
              </div>
              {active && (
                <div className="w-6 h-6 rounded-lg bg-champagne/20 grid place-items-center shrink-0">
                  <Check size={13} strokeWidth={2.5} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/** Re-export for icon usage */
export { ChevronDown };
