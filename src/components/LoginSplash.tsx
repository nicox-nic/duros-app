'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BRAND_ALT, LOGO_SPLASH, SPLASH_BG } from '@/lib/brand';

const LOGO_ENTRY_MS = 700;
const HEADLINE1_FADE_IN_MS = 1200;
const DELAY_BEFORE_HEADLINE2_MS = 700;
const HEADLINE2_FADE_IN_MS = 600;
const BOTH_HOLD_MS = 1800;
const HEADLINE1_OUT_MS = 400;
const PAUSE_BEFORE_HEADLINE2_OUT_MS = 0;
const HEADLINE2_OUT_MS = 0;

const HEADLINE1_AT = LOGO_ENTRY_MS;
const HEADLINE2_AT = HEADLINE1_AT + HEADLINE1_FADE_IN_MS + DELAY_BEFORE_HEADLINE2_MS;
const DISMISS_HEADLINE1_AT = HEADLINE2_AT + HEADLINE2_FADE_IN_MS + BOTH_HOLD_MS;
const HEADLINE2_EXIT_AT = DISMISS_HEADLINE1_AT + HEADLINE1_OUT_MS + PAUSE_BEFORE_HEADLINE2_OUT_MS;
const COMPLETE_AT = HEADLINE2_EXIT_AT + HEADLINE2_OUT_MS;

const PROGRESS_DURATION_MS = DISMISS_HEADLINE1_AT - HEADLINE1_AT;

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Set when `/` splash finishes so `/login` does not replay it */
export const SPLASH_SEEN_SESSION_KEY = 'duros-splash-seen';

/** Splash logo width (280px base × 0.8) */
const LOGO_WIDTH = 224;

interface LoginSplashProps {
  onComplete: () => void;
}

export function LoginSplash({ onComplete }: LoginSplashProps) {
  const [showHeadline1, setShowHeadline1] = useState(false);
  const [showHeadline2, setShowHeadline2] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [dismissHeadline1, setDismissHeadline1] = useState(false);
  const [exitHeadline2, setExitHeadline2] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setShowHeadline1(true);
      setShowProgress(true);
    }, HEADLINE1_AT);
    const t2 = setTimeout(() => setShowHeadline2(true), HEADLINE2_AT);
    const t3 = setTimeout(() => setDismissHeadline1(true), DISMISS_HEADLINE1_AT);
    const t4 = setTimeout(() => setExitHeadline2(true), HEADLINE2_EXIT_AT);
    const t5 = setTimeout(() => onComplete(), COMPLETE_AT);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const headline1Visible = showHeadline1 && !dismissHeadline1;
  const progressVisible = showProgress && !dismissHeadline1;
  const headline2Visible = showHeadline2 && !exitHeadline2;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: SPLASH_BG }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Background gradients */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          background:
            'radial-gradient(900px 500px at 50% 40%, rgba(201, 169, 120, 0.14), transparent 65%), radial-gradient(600px 400px at 20% 90%, rgba(107, 122, 140, 0.06), transparent 60%)',
        }}
      />

      {/* Fixed stack: logo slot + headlines (reserved heights prevent layout shift) */}
      <div className="relative flex w-full max-w-[520px] flex-col items-center gap-10 px-6 text-center">
        <div className="relative flex w-full shrink-0 flex-col items-center">
          <motion.div
            className="pointer-events-none absolute top-1/2 left-1/2 h-[224px] w-[224px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/25 blur-3xl"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.9, 1.12, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="relative z-10 flex min-h-[140px] w-full items-center justify-center py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: LOGO_ENTRY_MS / 1000, ease: easeOut, delay: 0.12 }}
          >
            <motion.div
              className="pointer-events-none absolute inset-0 -m-4 rounded-[28px] border-2 border-champagne/40"
              initial={{ opacity: 0.55, scale: 0.88 }}
              animate={{ opacity: 0, scale: 1.35 }}
              transition={{ duration: 1.1, delay: 0.25, ease: 'easeOut' }}
            />
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0 rgba(201,169,120,0)',
                  '0 0 32px rgba(201,169,120,0.35)',
                  '0 0 0 rgba(201,169,120,0)',
                ],
              }}
              transition={{ duration: 1.4, delay: 0.2, ease: 'easeOut' }}
            >
              <Image
                src={LOGO_SPLASH}
                alt={BRAND_ALT}
                width={LOGO_WIDTH}
                height={LOGO_WIDTH}
                priority
                unoptimized
                className="relative z-10 h-auto max-h-[min(32vh,224px)] w-[224px] max-w-[40vw] object-contain"
              />
            </motion.div>
          </motion.div>
        </div>

        <div className="flex w-full flex-col items-center gap-5">
          {/* Headline 1 — reserved slot */}
          <div className="flex h-[88px] w-full items-start justify-center">
            <motion.p
              className="font-display text-[26px] leading-snug tracking-tight text-charcoal md:text-[30px]"
              initial={false}
              animate={{ opacity: headline1Visible ? 1 : 0 }}
              transition={{
                duration: dismissHeadline1
                  ? HEADLINE1_OUT_MS / 1000
                  : HEADLINE1_FADE_IN_MS / 1000,
                ease: dismissHeadline1 ? 'easeIn' : easeOut,
              }}
              aria-hidden={!headline1Visible}
            >
              Smarter Property Management. Better Resident Living.
            </motion.p>
          </div>

          {/* Progress bar — reserved slot */}
          <div className="flex h-[3px] w-44 items-center justify-center">
            <motion.div
              className="h-full w-full overflow-hidden rounded-full bg-line"
              initial={false}
              animate={{ opacity: progressVisible ? 1 : 0 }}
              transition={{
                duration: dismissHeadline1 ? HEADLINE1_OUT_MS / 1000 : 0.25,
                ease: 'easeInOut',
              }}
              aria-hidden={!progressVisible}
            >
              {showProgress && (
                <motion.div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-champagne-soft to-champagne-deep"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: PROGRESS_DURATION_MS / 1000, ease: 'easeInOut' }}
                />
              )}
            </motion.div>
          </div>

          {/* Headline 2 — reserved slot */}
          <div className="flex h-[96px] w-full items-start justify-center">
            <motion.p
              className="max-w-[440px] text-[14px] leading-relaxed text-mist md:text-[15px]"
              initial={false}
              animate={{ opacity: headline2Visible ? 1 : 0 }}
              transition={{
                duration: exitHeadline2 ? HEADLINE2_OUT_MS / 1000 : HEADLINE2_FADE_IN_MS / 1000,
                ease: exitHeadline2 ? 'easeInOut' : easeOut,
              }}
              aria-hidden={!headline2Visible}
            >
              AI-powered property management system that connects property teams with residents in
              real time.
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
