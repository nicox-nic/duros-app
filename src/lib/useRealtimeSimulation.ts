'use client';

import { useEffect } from 'react';
import { useAppStore } from './store';

/**
 * Fake realtime engine for the prototype.
 *
 * - Ticks every second to update SLA countdowns (forces re-render via realtimeTick)
 * - Every 45s, randomly nudges staff workload percentages
 * - Every 60s, has a small chance to push a new message into the inbox
 *
 * Mount this once at the root layout. All screens read from the same store,
 * so changes propagate everywhere automatically.
 */
export function useRealtimeSimulation() {
  useEffect(() => {
    // 1-second tick for countdowns / "live" feel
    const tickInterval = setInterval(() => {
      useAppStore.getState().tickRealtime();
    }, 1000);

    // Random workload nudges for staff every 45s
    const workloadInterval = setInterval(() => {
      // We mutate the store directly via setState for non-action updates
      useAppStore.setState((state) => ({
        users: state.users.map((u) => {
          if (u.role === 'resident' || !u.isOnline || u.workloadPct === undefined) return u;
          const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
          const next = Math.max(20, Math.min(95, u.workloadPct + delta));
          return { ...u, workloadPct: next };
        }),
      }));
    }, 45000);

    // Occasional new message every 45s (30% chance for a demo-friendly cadence)
    const messageInterval = setInterval(() => {
      if (Math.random() > 0.3) return;
      const samplePings = [
        {
          fromName: 'Security',
          fromInitials: 'SC',
          fromRole: 'security' as const,
          category: 'announcement' as const,
          subject: 'Gate pass scanned',
          body: 'Visitor entry scanned at Lobby 2.',
        },
        {
          fromName: 'Maintenance',
          fromInitials: 'MT',
          fromRole: 'maintenance' as const,
          category: 'internal_staff' as const,
          subject: 'Job update',
          body: 'Light bulb replacement completed in Tower 1 hallway.',
        },
      ];
      const ping = samplePings[Math.floor(Math.random() * samplePings.length)];
      useAppStore.getState().pushMessage({
        propertyId: useAppStore.getState().currentPropertyId,
        fromId: 'system',
        toId: useAppStore.getState().currentUserId,
        preview: ping.body.slice(0, 80),
        unread: true,
        ...ping,
      });
    }, 45000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(workloadInterval);
      clearInterval(messageInterval);
    };
  }, []);
}
