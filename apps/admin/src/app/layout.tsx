import type { Metadata } from 'next';
import { Inter, Space_Grotesk, Geist_Mono } from 'next/font/google';
import Providers from './providers';
import './globals.css';
import { AppShell } from '@/features/copilot/components/app-shell';
import { CommandSurfaceProvider } from '@/features/copilot/state/command-surface';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Keyring OS, Decision Operations',
  description: 'Decision-driven property operations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#07111F]">
        <Providers>
          <CommandSurfaceProvider>
            <AppShell>{children}</AppShell>
          </CommandSurfaceProvider>
        </Providers>
      </body>
    </html>
  );
}
