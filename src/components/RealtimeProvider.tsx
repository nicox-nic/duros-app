'use client';

import { ReactNode } from 'react';
import { useRealtimeSimulation } from '@/lib/useRealtimeSimulation';
import { InboxBeep } from './InboxBeep';
import { InboxToast } from './InboxToast';

export function RealtimeProvider({ children }: { children: ReactNode }) {
  useRealtimeSimulation();
  return (
    <>
      {children}
      <InboxBeep />
      <InboxToast />
    </>
  );
}
