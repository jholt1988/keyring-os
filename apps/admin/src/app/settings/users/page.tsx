'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Trash2, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { WorkspaceShell, SectionCard } from '@/components/copilot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserRecord {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  active: boolean;
  createdAt?: string;
}

interface UsersResponse {
  data: UserRecord[];
  total: number;
  skip: number;
  take: number;
}

const API_BASE = '/api/backend';

async function fetchUsers(): Promise<UserRecord[]> {
  const res = await fetch(`${API_BASE}/users?take=50`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load users');
  const json: UsersResponse = await res.json();
  return json.data ?? [];
}

async function createUser(data: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}): Promise<UserRecord> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to create user');
  }
  return res.json();
}

async function updateUser(id: string, data: Partial<UserRecord> & { password?: string }): Promise<UserRecord> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to update user');
  }
  return res.json();
}

async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to delete user');
}

const ROLE_OPTIONS = ['TENANT', 'PROPERTY_MANAGER', 'OWNER', 'ADMIN'];

export default function UsersSettingsPage() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'TENANT',
  });
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowForm(false);
      setForm({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'TENANT' });
      setError('');
    },
    onError: (err: Error) => setError(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; body: Partial<UserRecord> & { password?: string } }) =>
      updateUser(data.id, data.body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setEditingId(null);
      setForm({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'TENANT' });
      setError('');
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) {
      setError('Username and password are required');
      return;
    }
    if (editingId) {
      const body: Partial<UserRecord> & { password?: string } = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role as UserRecord['role'],
      };
      if (form.password) body.password = form.password;
      updateMutation.mutate({ id: editingId, body });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (user: UserRecord) => {
    setEditingId(user.id);
    setShowForm(true);
    setForm({
      username: user.username,
      email: user.email ?? '',
      password: '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      role: user.role,
    });
  };

  return (
    <WorkspaceShell title="User Management" icon={Users}>
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#F43F5E]/30 bg-[#F43F5E]/8 px-3 py-2.5 text-sm text-[#FCA5A5]">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-[#94A3B8]">{users.length} users</p>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'TENANT' });
          }}
        >
          <UserPlus size={15} />
          {showForm ? 'Cancel' : 'Add User'}
        </Button>
      </div>

      {showForm && (
        <SectionCard title={editingId ? 'Edit User' : 'Create New User'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">Username</label>
                <Input
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  disabled={!!editingId}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">First Name</label>
                <Input
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">Last Name</label>
                <Input
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">
                  Password {editingId && '(leave blank to keep)'}
                </label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  required={!editingId}
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-wider text-[#94A3B8]">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                  className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] focus:border-[#3B82F6] focus:outline-none"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={14} className="animate-spin" />}
              {editingId ? 'Save Changes' : 'Create User'}
            </Button>
          </form>
        </SectionCard>
      )}

      <SectionCard title="All Users">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6]" />
          </div>
        ) : users.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#94A3B8]">No users found.</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-[#1E3350] bg-[#0F1B31] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1E3350] bg-[#0C1625]">
                    <Shield size={15} className="text-[#7FA7D9]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#F8FAFC]">
                      {user.firstName || user.lastName
                        ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
                        : user.username}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {user.username} · {user.email ?? 'No email'} · {user.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(user)}
                    className="rounded-md border border-[#1E3350] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:border-[#2B4A73]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete user ${user.username}?`)) {
                        deleteMutation.mutate(user.id);
                      }
                    }}
                    className="rounded-md border border-[#F43F5E]/20 px-3 py-1.5 text-xs font-medium text-[#FCA5A5] hover:border-[#F43F5E]/40"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </WorkspaceShell>
  );
}
