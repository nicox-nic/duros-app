import { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { PhoneShell } from '@/components/PhoneShell';

export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <div className="md:flex">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <PhoneShell>{children}</PhoneShell>
      </main>
    </div>
  );
}
