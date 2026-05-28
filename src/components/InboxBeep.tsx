'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';

/**
 * Plays a soft two-tone beep whenever the inbox receives a new message
 * (i.e. when `newMessageFlash` increments in the store).
 *
 * Uses the Web Audio API so no audio asset is needed. The first interaction
 * on the page unlocks autoplay; before that, beeps are silent (per browser policy).
 */
export function InboxBeep() {
  const flashCount = useAppStore((s) => s.newMessageFlash);
  const lastFlashRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);

  // Lazy-init AudioContext on first interaction
  useEffect(() => {
    const unlock = () => {
      if (!ctxRef.current) {
        try {
          const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          ctxRef.current = new AudioCtx();
        } catch {
          // Audio not supported — silently skip
        }
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Initialize last flash count to current on mount so the seed messages
  // (which arrive during the initial state hydration) don't trigger a beep
  useEffect(() => {
    lastFlashRef.current = useAppStore.getState().newMessageFlash;
  }, []);

  useEffect(() => {
    if (flashCount === lastFlashRef.current) return;
    lastFlashRef.current = flashCount;
    playBeep(ctxRef.current);
  }, [flashCount]);

  return null;
}

function playBeep(ctx: AudioContext | null) {
  if (!ctx || ctx.state === 'suspended') {
    ctx?.resume().catch(() => {});
    if (!ctx || ctx.state === 'suspended') return;
  }

  const now = ctx.currentTime;

  // First tone: 880 Hz (A5), brief
  playTone(ctx, 880, now, 0.08, 0.06);
  // Second tone: 1175 Hz (D6), slightly louder, 80ms later
  playTone(ctx, 1175, now + 0.08, 0.12, 0.075);
}

function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, gain: number) {
  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  // Soft attack + release envelope so it doesn't click
  env.gain.setValueAtTime(0, startTime);
  env.gain.linearRampToValueAtTime(gain, startTime + 0.008);
  env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(env).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}
