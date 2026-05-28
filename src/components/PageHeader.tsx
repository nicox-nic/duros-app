'use client';

import Link from 'next/link';
import { ChevronLeft, Search, SlidersHorizontal, type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  rightActionIcon?: LucideIcon;
  /** Desktop right-side action buttons */
  rightActions?: React.ReactNode;
}

export function PageHeader({ title, description, backHref, rightActionIcon: RightIcon, rightActions }: PageHeaderProps) {
  return (
    <>
      {/* MOBILE BAR */}
      <div className="flex items-center justify-between pt-1.5 pb-3 md:hidden">
        {backHref ? (
          <Link href={backHref} className="w-8 h-8 bg-charcoal/5 rounded-lg grid place-items-center">
            <ChevronLeft size={16} />
          </Link>
        ) : (
          <div className="w-8" />
        )}
        <div className="font-display text-[16px] font-medium">{title}</div>
        <button className="w-8 h-8 grid place-items-center text-slate">
          {RightIcon ? <RightIcon size={16} /> : null}
        </button>
      </div>

      {/* DESKTOP TITLE BLOCK */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <div>
          <div className="font-display text-[32px] font-normal tracking-tight">{title}</div>
          {description && <div className="text-[13px] text-mist mt-1">{description}</div>}
        </div>
        {rightActions && <div className="flex gap-2">{rightActions}</div>}
      </div>
    </>
  );
}
