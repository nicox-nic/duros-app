'use client';

import { Construction } from 'lucide-react';

interface PlaceholderScreenProps {
  title: string;
  description?: string;
}

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
      <div className="w-14 h-14 rounded-2xl bg-champagne/15 grid place-items-center text-champagne-deep mb-4">
        <Construction size={24} />
      </div>
      <div className="font-display text-[18px] md:text-[24px] font-medium mb-1.5">{title}</div>
      <div className="text-[12px] md:text-[14px] text-mist max-w-md">
        {description ?? 'This screen is scaffolded but not yet built. The route works — content comes next.'}
      </div>
    </div>
  );
}
