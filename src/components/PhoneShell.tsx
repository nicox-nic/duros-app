'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { StatusBar } from './StatusBar';
import { BottomNav } from './BottomNav';

interface PhoneShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

const MOBILE_SHELL_STYLES = `
  @media (pointer: coarse) and (max-width: 767px) {
    .phone-shell-mobile {
      height: 100dvh !important;
      max-height: 100dvh !important;
      overflow: hidden !important;
    }

    .phone-shell-bezel {
      padding: 0 !important;
      height: 100% !important;
      min-height: 0 !important;
    }

    .phone-shell-bezel > div {
      max-width: none !important;
      border-radius: 0 !important;
      background: transparent !important;
      padding: 0 !important;
      box-shadow: none !important;
      height: 100% !important;
    }

    .phone-shell-bezel > div > div {
      border-radius: 0 !important;
      aspect-ratio: auto !important;
      height: 100% !important;
      min-height: 0 !important;
      max-height: 100% !important;
    }

    .phone-shell-notch,
    .phone-shell-status {
      display: none !important;
    }

    .phone-shell-nav {
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      z-index: 40 !important;
      margin: 0 !important;
    }

    .phone-shell-content {
      padding-bottom: calc(5.75rem + env(safe-area-inset-bottom, 0px)) !important;
    }
  }

  @media (pointer: fine) and (max-width: 767px) {
    .phone-shell-mobile {
      background: transparent !important;
    }
  }
`;

/**
 * Real mobile devices: full-screen native layout (no mockup frame).
 * Desktop at narrow width: iOS-style phone frame for prototype demos.
 * Desktop (>= md): full-width content (sidebar provides chrome).
 */
export function PhoneShell({ children, hideNav = false }: PhoneShellProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MOBILE_SHELL_STYLES }} />

      {/* MOBILE: one tree — CSS toggles native vs demo frame */}
      <div className="phone-shell-mobile md:hidden flex h-dvh max-h-dvh flex-col overflow-hidden bg-ivory">
        <div className="phone-shell-bezel flex min-h-0 flex-1 flex-col items-center justify-center px-2 py-4">
          <div
            className={cn(
              'flex h-full min-h-0 w-full max-w-[340px] flex-col rounded-phone-outer bg-[#0a0908] p-[10px]',
              'shadow-soft-lg'
            )}
          >
            <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-phone bg-ivory aspect-[9/19.5]">
              <div className="phone-shell-notch absolute top-3 left-1/2 z-50 h-[22px] w-[84px] -translate-x-1/2 rounded-2xl bg-[#0a0908]" />
              <div className="phone-shell-status">
                <StatusBar />
              </div>
              <div className="phone-shell-content flex min-h-0 flex-1 flex-col overflow-hidden px-4">
                {children}
              </div>
              {!hideNav && (
                <div className="phone-shell-nav mx-[-16px] shrink-0">
                  <BottomNav />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP: full content area */}
      <div className="hidden md:flex flex-1 flex-col min-h-screen">
        {children}
      </div>
    </>
  );
}
