import { ReactNode } from 'react';
import { PhoneShell } from '@/components/PhoneShell';

export default function SignupLayout({ children }: { children: ReactNode }) {
  return <PhoneShell hideNav>{children}</PhoneShell>;
}
