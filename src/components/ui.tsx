import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// CARD
// =============================================================================

interface CardProps {
  children: ReactNode;
  className?: string;
}
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-line p-3.5 shadow-soft-sm', className)}>
      {children}
    </div>
  );
}

// =============================================================================
// BADGE
// =============================================================================

type BadgeVariant =
  | 'urgent'
  | 'pending'
  | 'progress'
  | 'complete'
  | 'approval'
  | 'reject'
  | 'neutral';

const badgeStyles: Record<BadgeVariant, string> = {
  urgent: 'bg-danger-bg text-danger',
  pending: 'bg-warning-bg text-warning',
  progress: 'bg-info-bg text-info',
  complete: 'bg-success-bg text-success',
  approval: 'bg-champagne/20 text-champagne-deep',
  reject: 'bg-danger-bg text-danger',
  neutral: 'bg-charcoal/5 text-slate',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}
export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-[9px] font-semibold px-2 py-[3px] rounded-full tracking-wider uppercase',
        badgeStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// =============================================================================
// STATUS DOT
// =============================================================================

interface StatusDotProps {
  online?: boolean;
  pulsing?: boolean;
  className?: string;
}
export function StatusDot({ online = true, pulsing = false, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block w-1.5 h-1.5 rounded-full shrink-0',
        online ? 'bg-success' : 'bg-mist',
        pulsing && online && 'animate-pulse',
        className
      )}
    />
  );
}

// =============================================================================
// BUTTONS
// =============================================================================

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth,
  disabled,
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-xl font-semibold text-center transition-all',
        size === 'sm' ? 'px-4 py-2.5 text-[12px]' : 'px-5 py-3.5 text-[13.5px]',
        variant === 'primary' &&
          'bg-gradient-to-br from-champagne-soft to-champagne-deep text-white shadow-champagne hover:brightness-105',
        variant === 'secondary' &&
          'bg-white border border-line-strong text-charcoal hover:bg-ivory-deep',
        fullWidth && 'w-full',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

// =============================================================================
// ICON BOX — colored square icon container used across screens
// =============================================================================

type IconBoxColor = 'blue' | 'gold' | 'red' | 'green' | 'amber' | 'purple';

const iconBoxStyles: Record<IconBoxColor, string> = {
  blue: 'bg-info-bg text-info',
  gold: 'bg-champagne/15 text-champagne-deep',
  red: 'bg-danger-bg text-danger',
  green: 'bg-success-bg text-success',
  amber: 'bg-warning-bg text-warning',
  purple: 'bg-[#ece6f3] text-[#6b4f93]',
};

interface IconBoxProps {
  color: IconBoxColor;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
export function IconBox({ color, children, size = 'md', className }: IconBoxProps) {
  return (
    <div
      className={cn(
        'grid place-items-center shrink-0 rounded-lg',
        size === 'sm' && 'w-7 h-7 rounded-md',
        size === 'md' && 'w-9 h-9',
        size === 'lg' && 'w-12 h-12 rounded-xl',
        iconBoxStyles[color],
        className
      )}
    >
      {children}
    </div>
  );
}
