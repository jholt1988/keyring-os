import type { Metadata } from 'next';
import { Space_Grotesk, Geist_Mono } from 'next/font/google';
import Providers from './providers';
import './globals.css';
import { TenantControlOrb } from '@/components/ambient/tenant-control-orb';
import { AuthDecisionSurface } from '@/components/auth/auth-decision-surface';
import { TenantSidebar } from '@/components/shell/tenant-sidebar';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Keyring — Tenant Portal',
  description: 'Your home, your lease, your account.',
};

const authDecisionSurfaceEnabled =
  process.env.NEXT_PUBLIC_ENABLE_AUTH_DECISION_SURFACE === 'true';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full bg-[#07111F]">
        <Providers>
          <TenantSidebar />
          <main className="ml-[88px] flex-1 min-h-screen overflow-y-auto">
            {children}
          </main>
          {authDecisionSurfaceEnabled ? <AuthDecisionSurface /> : null}
          <TenantControlOrb state="healthy" label="Tenant control" />
        </Providers>
      </body>
    </html>
  );
}
