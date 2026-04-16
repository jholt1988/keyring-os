'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Lock, Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RegisterResponse {
  user?: { id: string; username: string; roles: string[] };
  statusMessage?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'PROPERTY_MANAGER' as const,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          password: form.password,
          role: form.role,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.statusMessage || 'Registration failed');
      }

      router.push('/login?registered=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-[#07111F] p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#17304E] via-[#07111F] to-[#07111F] opacity-50" />
      
      <Card className="relative w-full max-w-md border-white/10 bg-[#13233C]/95 shadow-[0_18px_60px_rgba(2,8,23,0.28)] backdrop-blur-xl">
        <CardHeader className="space-y-1 border-b border-white/8 pb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0F1B31]">
            <UserPlus className="h-6 w-6 text-[#38BDF8]" />
          </div>
          <CardTitle className="text-2xl font-semibold text-[#F8FAFC]">
            Create Account
          </CardTitle>
          <CardDescription className="text-[#94A3B8]">
            Register to access Keyring OS
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">First Name</label>
                <Input
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">Last Name</label>
                <Input
                  value={form.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">Username</label>
              <div className="relative">
                <Input
                  value={form.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="john.doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">Role</label>
              <select
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6]"
              >
                <option value="PROPERTY_MANAGER">Property Manager</option>
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight size={16} />
                </span>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-[#94A3B8]">
            Already have an account?{' '}
            <a href="/login" className="text-[#38BDF8] hover:underline">Sign in</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}