import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Providers from '../components/common/Providers';
import LayoutWrapper from '../components/layout/LayoutWrapper';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BrickPro | Premium Brick Trading & Distribution',
  description: 'BrickPro is your trusted partner for high-quality bricks. Sourced from kilns and delivered directly to your site. Wholesale & retail.',
  keywords: ['bricks', 'wire cut bricks', 'fly ash bricks', 'brick delivery', 'wholesale bricks', 'builders', 'contractors'],
};

// Without this, mobile browsers assume a ~980px desktop viewport and
// scale the whole page down to fit the screen — that's the "everything
// is tiny and I have to pinch-zoom" symptom. This tells the browser to
// render at the device's actual width instead of faking a desktop one.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col" style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
