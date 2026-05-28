'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, type LucideIcon } from 'lucide-react';

// =============================================================================
// LABEL
// =============================================================================

export function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]', className)}>
      {children}
    </div>
  );
}

// =============================================================================
// TEXT INPUT
// =============================================================================

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({ icon: Icon, className, ...props }, ref) => (
  <div className="relative mb-3">
    {Icon && (
      <Icon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist pointer-events-none"
      />
    )}
    <input
      ref={ref}
      {...props}
      className={cn(
        'w-full bg-charcoal/[0.03] border border-line rounded-xl py-3 text-[13px] text-charcoal',
        'focus:outline-none focus:border-champagne placeholder:text-mist',
        Icon ? 'pl-10 pr-3.5' : 'px-3.5',
        className
      )}
    />
  </div>
));
TextInput.displayName = 'TextInput';

// =============================================================================
// TEXTAREA
// =============================================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    {...props}
    className={cn(
      'w-full bg-charcoal/[0.03] border border-line rounded-xl px-3.5 py-3 text-[13px] text-charcoal',
      'focus:outline-none focus:border-champagne placeholder:text-mist resize-none mb-3',
      className
    )}
  />
));
Textarea.displayName = 'Textarea';

// =============================================================================
// SELECT
// =============================================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: LucideIcon;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ icon: Icon, options, placeholder, className, ...props }, ref) => (
  <div className="relative mb-3">
    {Icon && (
      <Icon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist pointer-events-none"
      />
    )}
    <select
      ref={ref}
      {...props}
      className={cn(
        'w-full appearance-none bg-charcoal/[0.03] border border-line rounded-xl py-3 text-[13px] text-charcoal',
        'focus:outline-none focus:border-champagne',
        Icon ? 'pl-10 pr-10' : 'px-3.5 pr-10',
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mist pointer-events-none" />
  </div>
));
Select.displayName = 'Select';
