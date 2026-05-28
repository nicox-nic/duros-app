'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui';
import { FieldLabel, TextInput } from '@/components/Form';
import { LoginSplash, SPLASH_SEEN_SESSION_KEY } from '@/components/LoginSplash';
import { WorkspaceInitOverlay } from '@/components/WorkspaceInitOverlay';
import Image from 'next/image';
import { BRAND_ALT, LOGO_HEADER, LOGO_HEADER_HEIGHT, LOGO_HEADER_WIDTH, PRODUCT_NAME } from '@/lib/brand';
import { User, Lock, Eye, EyeOff, Scan, Lock as LockIcon, Wifi, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);

  const [splashDone, setSplashDone] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem(SPLASH_SEEN_SESSION_KEY) === '1') {
      setSplashDone(true);
    }
  }, []);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const INIT_MS = 2800;

  const handleSignIn = () => {
    setSubmitting(true);
    setInitializing(true);
    setTimeout(() => {
      setCurrentUser('user-alex');
      router.push('/staff/dashboard');
    }, INIT_MS);
  };

  const handleFaceID = () => {
    setSubmitting(true);
    setTimeout(() => {
      setCurrentUser('user-john');
      router.push('/home');
    }, 800);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!splashDone && (
          <LoginSplash key="login-splash" onComplete={() => setSplashDone(true)} />
        )}
      </AnimatePresence>

      <motion.div
        className="min-h-screen bg-ivory flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: splashDone ? 1 : 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        {/* Top header strip */}
        <div className="md:hidden flex items-center justify-center pt-12 pb-6">
          <div className="w-fit max-w-full">
            <Image
              src={LOGO_HEADER}
              alt={BRAND_ALT}
              width={LOGO_HEADER_WIDTH}
              height={LOGO_HEADER_HEIGHT}
              className="block h-[40px] w-auto max-w-full object-contain"
            />
            <div className="text-[9px] text-champagne-deep tracking-[0.06em] font-semibold mt-1 text-left">
              {PRODUCT_NAME}
            </div>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-between px-12 py-8">
          <div className="flex items-center gap-2.5">
            <div>
              <Image
                src={LOGO_HEADER}
                alt={BRAND_ALT}
                width={LOGO_HEADER_WIDTH}
                height={LOGO_HEADER_HEIGHT}
                className="h-[48px] w-auto object-contain"
              />
              <div className="mt-3 font-sans text-[11px] font-semibold tracking-[1px] text-[#9b7a45]">
                {PRODUCT_NAME}
              </div>
            </div>
          </div>
          <Link href="/signup" className="text-[12px] text-mist hover:text-charcoal">
            Don&apos;t have an account? <span className="text-champagne-deep font-semibold">Sign up</span>
          </Link>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 md:px-12">
          <div className="w-full max-w-md md:max-w-sm">
            <div className="font-display text-[28px] md:text-[34px] font-normal tracking-tight mb-1">Welcome Back</div>
            <div className="text-[12px] md:text-[13.5px] text-mist mb-6 md:mb-8">Sign in to manage your property.</div>

            <FieldLabel>Username or Email</FieldLabel>
            <TextInput
              icon={User}
              placeholder="alex.mendoza or alex@duros.ph"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <FieldLabel>Password</FieldLabel>
            <div className="relative mb-3">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-charcoal/[0.03] border border-line rounded-xl pl-10 pr-10 py-3 text-[13px] focus:outline-none focus:border-champagne placeholder:text-mist"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mist hover:text-charcoal"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-between mb-5 text-[11px] md:text-[12px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate">
                <input type="checkbox" className="w-3.5 h-3.5 rounded border-line accent-champagne-deep" />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-champagne-deep font-medium hover:underline">Forgot password?</Link>
            </div>

            <Button fullWidth onClick={handleSignIn} disabled={submitting}>
              Sign In
            </Button>

            <div className="my-5 flex items-center gap-3">
              <div className="flex-1 h-px bg-line" />
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-mist font-semibold">or</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            <button
              onClick={handleFaceID}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-white border border-line text-[13px] font-medium hover:border-line-strong transition-colors"
            >
              <Scan size={16} className="text-champagne-deep" />
              Sign in with Face ID
            </button>

            <div className="md:hidden text-center mt-6 text-[11px] text-mist">
              Don&apos;t have an account? <Link href="/signup" className="text-champagne-deep font-semibold">Sign up</Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-5 md:py-8 px-6 md:px-12 border-t border-line/50 bg-white/40">
          <div className="max-w-md md:max-w-none mx-auto flex items-center justify-center gap-6 text-[10px] md:text-[11px] text-mist">
            <span className="flex items-center gap-1.5"><LockIcon size={11} /> Secure</span>
            <span className="flex items-center gap-1.5"><Shield size={11} /> Smart</span>
            <span className="flex items-center gap-1.5"><Wifi size={11} /> Connected</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {initializing && <WorkspaceInitOverlay key="workspace-init" durationMs={INIT_MS} />}
      </AnimatePresence>
    </>
  );
}
