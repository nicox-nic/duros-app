import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// =============================================================================
// CLASS NAME HELPER
// =============================================================================

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// =============================================================================
// TIME FORMATTING
// =============================================================================

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatTimeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric', year: 'numeric' });
}

// =============================================================================
// SLA COUNTDOWN
// =============================================================================

export interface SLATime {
  expired: boolean;
  hours: number;
  minutes: number;
  totalMinutes: number;
  display: string;
  severity: 'safe' | 'warning' | 'danger' | 'expired';
}

export function getSLATime(deadlineIso: string | undefined): SLATime | null {
  if (!deadlineIso) return null;
  const now = Date.now();
  const deadline = new Date(deadlineIso).getTime();
  const diffMs = deadline - now;

  if (diffMs <= 0) {
    return {
      expired: true,
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      display: 'SLA breached',
      severity: 'expired',
    };
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let severity: SLATime['severity'] = 'safe';
  if (totalMinutes < 30) severity = 'danger';
  else if (totalMinutes < 120) severity = 'warning';

  return {
    expired: false,
    hours,
    minutes,
    totalMinutes,
    display: `${hours}h ${String(minutes).padStart(2, '0')}m left`,
    severity,
  };
}

// =============================================================================
// CURRENCY (Philippine Peso)
// =============================================================================

export function formatPeso(amount: number, opts?: { compact?: boolean }): string {
  if (opts?.compact && Math.abs(amount) >= 1_000_000) {
    return `₱${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (opts?.compact && Math.abs(amount) >= 1_000) {
    return `₱${(amount / 1_000).toFixed(1)}K`;
  }
  return `₱ ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// =============================================================================
// GREETING
// =============================================================================

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
