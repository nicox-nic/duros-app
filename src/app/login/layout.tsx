import { ReactNode } from 'react';
import { PhoneShell } from '@/components/PhoneShell';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <PhoneShell hideNav>{children}</PhoneShell>;
}
