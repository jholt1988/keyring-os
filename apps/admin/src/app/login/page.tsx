'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LoginResponse {
  access_token?: string;
  accessToken?: string;
  statusMessage?: string;
  user?: {
    id: string;
    username: string;
    roles: string[];
  };
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1/api';
      
      const response = await fetch(apiUrl + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.statusMessage || 'Login failed');
      }

      // Store token in localStorage
      const token = data.access_token || data.accessToken;
      if (token) {
        localStorage.setItem('auth_token', token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-[#07111F] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#17304E] via-[#07111F] to-[#07111F] opacity-50" />
      
      <Card className="relative w-full max-w-md border-white/10 bg-[#13233C]/95 shadow-[0_18px_60px_rgba(2,8,23,0.28)] backdrop-blur-xl">
        <CardHeader className="space-y-1 border-b border-white/8 pb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0F1B31]">
            <Key className="h-6 w-6 text-[#38BDF8]" />
          </div>
          <CardTitle className="text-2xl font-semibold text-[#F8FAFC]">
            Keyring OS
          </CardTitle>
          <CardDescription className="text-[#94A3B8]">
            Sign in to access your property operations
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#F43F5E]/30 bg-[#F43F5E]/8 px-3 py-2.5 text-sm text-[#FCA5A5]">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                Username
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-11 border-white/10 bg-[#0F1B31] pl-10 text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                  autoComplete="username"
                />
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-[#64748B]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-white/10 bg-[#0F1B31] pl-10 text-[#F8FAFC] placeholder:text-[#64748B] focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                  autoComplete="current-password"
                />
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-[#94A3B8]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-[#0F1B31] text-[#3B82F6] focus:ring-[#3B82F6]"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm text-[#38BDF8] hover:text-[#7DD3FC] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white hover:from-[#2563EB] hover:to-[#1D4ED8]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Protected by enterprise-grade security
          </div>
        </CardContent>
      </Card>
    </div>
  );
}