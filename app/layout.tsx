import './global.css';
import './styles/sub.css';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { baseUrl } from './sitemap';

const sfPro = localFont({
  src: './fonts/SF-Pro-Text-Medium.otf',
  variable: '--font-sf-pro',
  display: 'swap',
});

const sf2 = localFont({
  src: './fonts/SF-Pro-Display-Semibold.otf',
  variable: '--font-sf2',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'GS',
    template: '%s | Grayden Scovil',
  },
  description:
    'Grayden Scovil — Colorado. Projects spanning home servers, operating systems, simulators, and hardware.',
  keywords:
    'Grayden Scovil, Colorado, Home Server, Operating System, Portfolio, Engineering, Projects',
  authors: [{ name: 'Grayden Scovil' }],
  openGraph: {
    title: 'Grayden Scovil',
    description:
      'Grayden Scovil — Colorado. Projects spanning home servers, operating systems, simulators, and hardware.',
    url: baseUrl,
    siteName: 'Grayden Scovil',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Grayden Scovil' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grayden Scovil',
    description: 'Grayden Scovil — Colorado. Projects and experiments.',
    images: ['/og'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0c' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sfPro.variable} ${sf2.variable}`}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
