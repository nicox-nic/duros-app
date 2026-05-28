'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { FieldLabel, TextInput, Select } from '@/components/Form';
import { cn } from '@/lib/utils';
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Building,
  Key,
  IdCard,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Check,
  ClipboardCheck,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [approvalCode, setApprovalCode] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isResident = role === 'resident';
  const passwordMatch = password === confirmPassword;

  const canSubmit =
    fullName.trim() &&
    email.trim() &&
    mobile.trim() &&
    role &&
    propertyId &&
    password.length >= 8 &&
    passwordMatch &&
    acceptTerms;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      setShowSuccess(true);
    }, 800);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-soft-lg p-8 md:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-success-bg text-success grid place-items-center mx-auto mb-4">
            <ClipboardCheck size={28} />
          </div>
          <div className="font-display text-[22px] md:text-[26px] font-medium tracking-tight mb-2">Account Pending Approval</div>
          <div className="text-[12.5px] md:text-[14px] text-slate leading-relaxed mb-6">
            Thanks for signing up. Property administrators will review your registration and verify your details.
            You&apos;ll receive an email at <strong>{email}</strong> once your account is approved.
          </div>
          <div className="bg-ivory-deep rounded-2xl p-4 mb-6 text-left">
            <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2">What happens next?</div>
            <ul className="text-[11.5px] md:text-[13px] text-slate space-y-2">
              <li className="flex gap-2"><Check size={13} className="text-success shrink-0 mt-0.5" /> Admin verifies your identity and role.</li>
              <li className="flex gap-2"><Check size={13} className="text-success shrink-0 mt-0.5" /> You receive an email confirmation.</li>
              <li className="flex gap-2"><Check size={13} className="text-success shrink-0 mt-0.5" /> You can sign in once approved.</li>
            </ul>
          </div>
          <Button fullWidth onClick={() => router.push('/login')}>Back to Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      {/* Header */}
      <div className="px-6 md:px-12 pt-10 md:pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-charcoal grid place-items-center">
            <div className="w-3 h-3 md:w-3.5 md:h-3.5 rounded-sm border-[2.5px] border-champagne" />
          </div>
          <div>
            <div className="font-display text-[15px] md:text-[17px] font-semibold tracking-tight">Duros</div>
            <div className="text-[9px] md:text-[10px] text-champagne-deep tracking-[0.06em] font-semibold">Property Concierge+</div>
          </div>
        </div>
        <Link href="/login" className="text-[11px] md:text-[12px] text-mist hover:text-charcoal">
          Have an account? <span className="text-champagne-deep font-semibold">Sign in</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 md:px-12 py-4 md:py-6">
        <div className="max-w-md md:max-w-lg mx-auto">
          <div className="font-display text-[26px] md:text-[32px] font-normal tracking-tight mb-1">Create Account</div>
          <div className="text-[12px] md:text-[13.5px] text-mist mb-6">Join your property&apos;s management system.</div>

          <FieldLabel>Full Name</FieldLabel>
          <TextInput icon={UserIcon} placeholder="Alex Mendoza" value={fullName} onChange={(e) => setFullName(e.target.value)} />

          <FieldLabel>Email Address</FieldLabel>
          <TextInput icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />

          <FieldLabel>Mobile Number</FieldLabel>
          <TextInput icon={Phone} type="tel" placeholder="+63 917 123 4567" value={mobile} onChange={(e) => setMobile(e.target.value)} />

          <FieldLabel>Role</FieldLabel>
          <Select
            icon={Briefcase}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Select your role"
            options={[
              { value: 'resident', label: 'Resident' },
              { value: 'property_manager', label: 'Property Manager' },
              { value: 'maintenance', label: 'Maintenance Staff' },
              { value: 'engineer', label: 'Engineer' },
              { value: 'accounting', label: 'Accounting Staff' },
              { value: 'security', label: 'Security Staff' },
              { value: 'utility', label: 'Utility Staff' },
            ]}
          />

          <FieldLabel>Property</FieldLabel>
          <Select
            icon={Building}
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder="Select your property"
            options={[
              { value: 'prop-001', label: 'Duros Prime Residences (BGC)' },
              { value: 'prop-002', label: 'Skyview Ortigas' },
            ]}
          />

          {!isResident && role && (
            <>
              <FieldLabel>Employee ID</FieldLabel>
              <TextInput icon={IdCard} placeholder="DR-2024-001" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
            </>
          )}

          <FieldLabel>Approval Code <span className="text-mist normal-case">(provided by your administrator)</span></FieldLabel>
          <TextInput icon={Key} placeholder="••••••" value={approvalCode} onChange={(e) => setApprovalCode(e.target.value)} />

          <FieldLabel>Password</FieldLabel>
          <div className="relative mb-3">
            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mist pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
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

          <FieldLabel>Confirm Password</FieldLabel>
          <TextInput
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword && !passwordMatch && (
            <div className="-mt-2 mb-3 text-[10.5px] text-danger">Passwords don&apos;t match.</div>
          )}

          <label className="flex items-start gap-2 mb-5 cursor-pointer text-[11.5px] md:text-[13px] text-slate">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-line accent-champagne-deep shrink-0"
            />
            <span>I accept the <Link href="#" className="text-champagne-deep font-medium">Terms of Service</Link> and <Link href="#" className="text-champagne-deep font-medium">Privacy Policy</Link>.</span>
          </label>

          <div className="flex items-start gap-2.5 p-3 bg-info-bg/60 border border-info/20 rounded-xl mb-5 text-[11px] md:text-[12.5px] text-info">
            <Shield size={14} className="shrink-0 mt-0.5" />
            <span>Your account requires admin approval before you can sign in.</span>
          </div>

          <Button fullWidth onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="text-center mt-4 text-[11px] md:text-[12px] text-mist">
            Already have an account? <Link href="/login" className="text-champagne-deep font-semibold">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
