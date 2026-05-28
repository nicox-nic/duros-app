import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { RealtimeProvider } from '@/components/RealtimeProvider';
import { DevSwitcher } from '@/components/DevSwitcher';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Duros Property Concierge+ — Smarter Property Management',
  description: 'AI-powered property management for condominiums and mixed-use developments.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Duros Property Concierge+ — Smarter Property Management',
    description: 'AI-powered property management for condominiums and mixed-use developments.',
    images: [
      {
        url: '/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'Duros Property Concierge+',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-preview.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <RealtimeProvider>
          {children}
          <DevSwitcher />
        </RealtimeProvider>
      </body>
    </html>
  );
}
