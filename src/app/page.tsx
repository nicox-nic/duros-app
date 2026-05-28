'use client';

import { useRouter } from 'next/navigation';
import { LoginSplash, SPLASH_SEEN_SESSION_KEY } from '@/components/LoginSplash';

export default function RootPage() {
  const router = useRouter();

  const handleSplashComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SPLASH_SEEN_SESSION_KEY, '1');
    }
    router.replace('/login');
  };

  return <LoginSplash onComplete={handleSplashComplete} />;
}
