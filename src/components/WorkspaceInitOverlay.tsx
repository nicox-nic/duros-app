'use client';

import { motion } from 'framer-motion';

const easeOut = [0.22, 1, 0.36, 1] as const;

interface WorkspaceInitOverlayProps {
  durationMs: number;
}

export function WorkspaceInitOverlay({ durationMs }: WorkspaceInitOverlayProps) {
  const fadeInS = 0.35;
  const progressDurationS = Math.max((durationMs - fadeInS * 1000) / 1000, 0.5);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ivory/45 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeInS, ease: easeOut }}
    >
      <motion.div
        className="flex flex-col items-center gap-4 px-6 text-center"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: fadeInS, ease: easeOut, delay: 0.08 }}
      >
        <p className="font-display text-[20px] tracking-tight text-charcoal md:text-[22px]">
          Initializing your workspace...
        </p>
        <div className="h-[3px] w-44 overflow-hidden rounded-full bg-line/80">
          <motion.div
            className="h-full origin-left rounded-full bg-gradient-to-r from-champagne-soft to-champagne-deep"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: progressDurationS, ease: 'easeInOut', delay: fadeInS }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
