'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { FieldLabel, TextInput } from '@/components/Form';
import { cn } from '@/lib/utils';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, KeyRound, Check, Wifi, Shield, Lock as LockIcon } from 'lucide-react';

type Step = 'email' | 'code' | 'new-password' | 'success';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRequestCode = () => {
    setError('');
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep('code');
    }, 800);
  };

  const handleCodeChange = (idx: number, value: string) => {
    // Single character per box; allow paste of full code
    if (value.length > 1) {
      const chars = value.replace(/\D/g, '').slice(0, 6).split('');
      const next = ['', '', '', '', '', ''];
      chars.forEach((c, i) => (next[i] = c));
      setCode(next);
      // Focus last filled
      const lastIdx = Math.min(chars.length, 5);
      const el = document.getElementById(`code-${lastIdx}`);
      el?.focus();
      return;
    }
    const next = [...code];
    next[idx] = value.replace(/\D/g, '');
    setCode(next);
    if (value && idx < 5) {
      const el = document.getElementById(`code-${idx + 1}`);
      el?.focus();
    }
  };

  const handleCodeKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      const el = document.getElementById(`code-${idx - 1}`);
      el?.focus();
    }
  };

  const handleVerifyCode = () => {
    setError('');
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep('new-password');
    }, 700);
  };

  const handleSetPassword = () => {
    setError('');
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep('success');
      setTimeout(() => router.push('/login'), 2200);
    }, 800);
  };

  const stepNum = step === 'email' ? 1 : step === 'code' ? 2 : 3;

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Top header strip */}
      <div className="md:hidden flex items-center justify-center pt-12 pb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-charcoal grid place-items-center">
            <div className="w-3 h-3 rounded-sm border-[2.5px] border-champagne" />
          </div>
          <div>
            <div className="font-display text-[15px] font-medium">Duros</div>
            <div className="text-[9px] text-champagne-deep tracking-[0.06em] font-semibold">Property Concierge+</div>
          </div>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between px-12 py-8">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-charcoal grid place-items-center">
            <div className="w-3.5 h-3.5 rounded-sm border-[2.5px] border-champagne" />
          </div>
          <div>
            <div className="font-display text-[17px] font-semibold tracking-tight">Duros</div>
            <div className="text-[10px] text-champagne-deep tracking-[0.06em] font-semibold mt-0.5">Property Concierge+</div>
          </div>
        </div>
        <Link href="/login" className="text-[12px] text-mist hover:text-charcoal">
          Remembered? <span className="text-champagne-deep font-semibold">Sign in</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 md:px-12">
        <div className="w-full max-w-md md:max-w-sm">
          {step !== 'success' && (
            <Link href="/login" className="inline-flex items-center gap-1 text-[11px] md:text-[12px] text-mist hover:text-charcoal mb-3">
              <ChevronLeft size={12} /> Back to sign in
            </Link>
          )}

          {/* Step indicator */}
          {step !== 'success' && (
            <div className="flex items-center gap-1.5 mb-5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all',
                    s <= stepNum ? 'bg-champagne-deep' : 'bg-charcoal/[0.08]'
                  )}
                />
              ))}
            </div>
          )}

          {/* STEP 1: Email */}
          {step === 'email' && (
            <>
              <div className="font-display text-[28px] md:text-[34px] font-normal tracking-tight mb-1">Reset Password</div>
              <div className="text-[12px] md:text-[13.5px] text-mist mb-6 md:mb-8">
                Enter your email and we&apos;ll send you a verification code.
              </div>

              <FieldLabel>Email</FieldLabel>
              <TextInput
                icon={Mail}
                type="email"
                placeholder="name@property.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {error && (
                <div className="text-[11px] text-danger mb-3">{error}</div>
              )}

              <Button fullWidth onClick={handleRequestCode} disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Verification Code'}
              </Button>

              <div className="text-center mt-4 text-[11px] text-mist">
                Need a new account? <Link href="/signup" className="text-champagne-deep font-semibold">Sign up</Link>
              </div>
            </>
          )}

          {/* STEP 2: Verification code */}
          {step === 'code' && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-info-bg text-info grid place-items-center mb-4">
                <KeyRound size={20} />
              </div>
              <div className="font-display text-[28px] md:text-[34px] font-normal tracking-tight mb-1">Check Your Email</div>
              <div className="text-[12px] md:text-[13.5px] text-mist mb-6 md:mb-8">
                We sent a 6-digit code to <strong className="text-charcoal">{email}</strong>. Enter it below.
              </div>

              <FieldLabel>Verification Code</FieldLabel>
              <div className="flex gap-1.5 md:gap-2 mb-3">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    id={`code-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKey(i, e)}
                    autoFocus={i === 0}
                    className="flex-1 aspect-square bg-charcoal/[0.03] border border-line rounded-xl text-center font-display text-[20px] md:text-[24px] font-medium focus:outline-none focus:border-champagne"
                  />
                ))}
              </div>

              {error && (
                <div className="text-[11px] text-danger mb-3">{error}</div>
              )}

              <Button fullWidth onClick={handleVerifyCode} disabled={submitting}>
                {submitting ? 'Verifying…' : 'Verify Code'}
              </Button>

              <button
                onClick={handleRequestCode}
                className="block w-full text-center mt-4 text-[11px] md:text-[12px] text-mist hover:text-charcoal"
              >
                Didn&apos;t get a code? <span className="text-champagne-deep font-semibold">Resend</span>
              </button>

              <div className="bg-info-bg/40 border border-info/15 rounded-xl px-3 py-2 mt-4 text-[10.5px] md:text-[11.5px] text-info">
                <strong>Demo tip:</strong> any 6-digit code works.
              </div>
            </>
          )}

          {/* STEP 3: New password */}
          {step === 'new-password' && (
            <>
              <div className="w-12 h-12 rounded-2xl bg-success-bg text-success grid place-items-center mb-4">
                <Check size={20} strokeWidth={2.5} />
              </div>
              <div className="font-display text-[28px] md:text-[34px] font-normal tracking-tight mb-1">New Password</div>
              <div className="text-[12px] md:text-[13.5px] text-mist mb-6 md:mb-8">
                Choose a new password. Use at least 8 characters.
              </div>

              <FieldLabel>New Password</FieldLabel>
              <div className="relative mb-4">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-charcoal/[0.03] border border-line rounded-xl pl-10 pr-10 py-3 text-[13px] focus:outline-none focus:border-champagne placeholder:text-mist"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mist hover:text-charcoal"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <FieldLabel>Confirm Password</FieldLabel>
              <div className="relative mb-3">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-charcoal/[0.03] border border-line rounded-xl pl-10 pr-3.5 py-3 text-[13px] focus:outline-none focus:border-champagne placeholder:text-mist"
                />
              </div>

              {error && (
                <div className="text-[11px] text-danger mb-3">{error}</div>
              )}

              <Button fullWidth onClick={handleSetPassword} disabled={submitting}>
                {submitting ? 'Saving…' : 'Set New Password'}
              </Button>
            </>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-success-bg text-success grid place-items-center mx-auto mb-5">
                <Check size={28} strokeWidth={2.5} />
              </div>
              <div className="font-display text-[24px] md:text-[28px] font-normal tracking-tight mb-2">
                Password Updated
              </div>
              <div className="text-[12px] md:text-[13.5px] text-mist mb-6">
                You can now sign in with your new password.
              </div>
              <Link href="/login">
                <Button fullWidth>Continue to Sign In</Button>
              </Link>
            </div>
          )}
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
    </div>
  );
}
