'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ArrowRight } from 'lucide-react';

const LANDING_REDIRECT_MS = 3000; // 3 seconds
const RETURN_USER_COOKIE = 'keyring_return_visit';

export default function LandingPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [isReturnUser, setIsReturnUser] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const cookies = document.cookie.split(';');
    const hasVisited = cookies.some(c => c.trim().startsWith(`${RETURN_USER_COOKIE}=`));
    setIsReturnUser(hasVisited);

    // If return user, skip landing page
    if (hasVisited) {
      router.push('/login');
      return;
    }

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Set return user cookie
          document.cookie = `${RETURN_USER_COOKIE}=true; path=/; max-age=${365 * 24 * 60 * 60}`;
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  const skipToLogin = () => {
    document.cookie = `${RETURN_USER_COOKIE}=true; path=/; max-age=${365 * 24 * 60 * 60}`;
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#07111F] overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.15),transparent_50%),linear-gradient(180deg,#07111F_0%,#0a1628_100%)]" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8 px-4">
        {/* Logo */}
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute -inset-4 rounded-full bg-[#3B82F6]/20 blur-2xl" />
          
          {/* Logo container */}
          <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-[#1e3a5f] to-[#0f2744] shadow-[0_0_60px_rgba(59,130,246,0.3)]">
            <Zap className="h-16 w-16 text-[#38BDF8]" />
          </div>

          {/* Animated ring */}
          <div className="absolute -inset-2 animate-ping rounded-full border border-[#3B82F6]/30" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">
            <span className="bg-gradient-to-r from-[#38BDF8] to-[#3B82F6] bg-clip-text text-transparent">
              Keyring
            </span>
            <span className="text-white">OS</span>
          </h1>
          <p className="mt-3 text-lg text-[#94A3B8]">
            Decision Operating System for Property Management
          </p>
        </div>

        {/* Auto-redirect countdown */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span>Redirecting to login in</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3B82F6]/20 text-[#38BDF8]">
              {countdown}
            </span>
            <span>seconds</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
            <div 
              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#38BDF8] transition-all duration-1000 ease-linear"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>

          {/* Skip button */}
          <button
            onClick={skipToLogin}
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#94A3B8] transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <span>Skip</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Version footer */}
      <div className="absolute bottom-6 text-xs text-[#475569]">
        Version 1.0.0 • Enterprise Edition
      </div>
    </div>
  );
}