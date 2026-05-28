'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BRAND_ALT, LOGO_LOCKUP, PRODUCT_NAME } from '@/lib/brand';
import { useCurrentUser } from '@/lib/store';
import { Button } from '@/components/ui';

export default function RootPage() {
  const router = useRouter();
  const user = useCurrentUser();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  // Auto-route if a user is already selected (via dev switcher or default seed)
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      if (user.role === 'resident') {
        router.replace('/home');
      } else {
        router.replace('/staff/dashboard');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-ivory to-ivory-deep flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-champagne/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-info/8 blur-3xl pointer-events-none" />

      <div
        className={`relative flex flex-col items-center transition-all duration-1000 ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <Image
          src={LOGO_LOCKUP}
          alt={BRAND_ALT}
          width={400}
          height={500}
          priority
          className="h-auto max-h-[200px] md:max-h-[240px] w-auto max-w-[min(260px,80vw)] object-contain mb-4"
        />
        <div className="text-[10px] md:text-[12px] text-champagne-deep tracking-[0.08em] font-semibold mb-2">
          {PRODUCT_NAME}
        </div>

        <div className="text-[12px] md:text-[14px] text-mist text-center max-w-xs mt-6 mb-10 leading-relaxed">
          AI-powered property management for modern condominiums and mixed-use developments.
        </div>

        {/* CTAs */}
        {!user && (
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <Link href="/login">
              <Button fullWidth>Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button fullWidth variant="secondary">Create Account</Button>
            </Link>
          </div>
        )}

        {user && (
          <div className="flex items-center gap-2 text-[12px] text-mist">
            <div className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
            <span>Loading your workspace…</span>
          </div>
        )}

        <div className="absolute bottom-[-120px] left-0 right-0 text-center text-[10.5px] text-mist">
          Secure · Smart · Connected
        </div>
      </div>
    </div>
  );
}
