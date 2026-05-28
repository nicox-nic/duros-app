'use client';

import { useEffect, useState } from 'react';

/**
 * Returns true after the component has mounted on the client.
 * Use to gate rendering of time-dependent or randomized values
 * that would otherwise cause hydration mismatches.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
