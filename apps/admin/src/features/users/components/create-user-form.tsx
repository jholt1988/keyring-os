'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { RoleDescription } from '@/components/ui/role-description';
import { assessPasswordStrength } from '@/lib/validation/password-strength';
import { Lock,Mail,User,UserPlus,X,CheckCircle2,XCircle,Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface CreateUserFormData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'TENANT' | 'PROPERTY_MANAGER' | 'OWNER' | 'ADMIN';
}

interface CreateUserFormProps {
  onSave: (data: CreateUserFormData) => void;
  onCancel: () => void;
}

export function CreateUserForm({ onSave, onCancel }: CreateUserFormProps) {
  const [form, setForm] = useState<CreateUserFormData>({
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'TENANT',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = assessPasswordStrength(form.password);

  useEffect(() => {
    setPasswordMatch(form.password === confirmPassword || confirmPassword === '');
  }, [form.password, confirmPassword]);

  const handleChange = (field: keyof CreateUserFormData, value: string | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setTouchedFields(prev => new Set([...prev, field]));
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setTouchedFields(prev => new Set([...prev, 'confirmPassword']));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    // Username validation
    if (!form.username.trim()) {
      errors.username = 'Username is required';
    } else if (form.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Name validation
    if (!form.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!form.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    // Password validation
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (!passwordStrength.meetsRequirements) {
      errors.password = 'Password does not meet security requirements';
    }

    // Password confirmation
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Mark all fields as touched to show all errors
      setTouchedFields(new Set([...touchedFields, 'username', 'email', 'firstName', 'lastName', 'password', 'confirmPassword']));
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave(form);
    setIsSubmitting(false);
  };

  const showError = (field: string) => {
    return touchedFields.has(field) && formErrors[field];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#F8FAFC]">Create User</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Username</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input 
              value={form.username} 
              onChange={(e) => handleChange('username', e.target.value)}
              onBlur={() => setTouchedFields(prev => new Set([...prev, 'username']))}
              placeholder="Username" 
              className={`pl-10 ${showError('username') ? 'border-[#F43F5E] focus:border-[#F43F5E] focus:ring-[#F43F5E]' : ''}`}
              required 
            />
          </div>
          {showError('username') && (
            <p className="text-xs text-[#F43F5E] flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {formErrors.username}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input 
              type="email" 
              value={form.email} 
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => setTouchedFields(prev => new Set([...prev, 'email']))}
              placeholder="email@example.com" 
              className={`pl-10 ${showError('email') ? 'border-[#F43F5E] focus:border-[#F43F5E] focus:ring-[#F43F5E]' : ''}`}
              required 
            />
          </div>
          {showError('email') && (
            <p className="text-xs text-[#F43F5E] flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {formErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">First Name</label>
          <Input 
            value={form.firstName} 
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => setTouchedFields(prev => new Set([...prev, 'firstName']))}
            placeholder="First name" 
            className={`${showError('firstName') ? 'border-[#F43F5E] focus:border-[#F43F5E] focus:ring-[#F43F5E]' : ''}`}
            required 
          />
          {showError('firstName') && (
            <p className="text-xs text-[#F43F5E] flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {formErrors.firstName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Last Name</label>
          <Input 
            value={form.lastName} 
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => setTouchedFields(prev => new Set([...prev, 'lastName']))}
            placeholder="Last name" 
            className={`${showError('lastName') ? 'border-[#F43F5E] focus:border-[#F43F5E] focus:ring-[#F43F5E]' : ''}`}
            required 
          />
          {showError('lastName') && (
            <p className="text-xs text-[#F43F5E] flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {formErrors.lastName}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Password</label>
            {form.password && (
              <span className={`text-xs font-medium ${passwordStrength.meetsRequirements ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                {passwordStrength.meetsRequirements ? '✓ Requirements met' : '✗ Requirements not met'}
              </span>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input 
              type="password" 
              value={form.password} 
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => setTouchedFields(prev => new Set([...prev, 'password']))}
              placeholder="Create a strong password" 
              className={`pl-10 ${showError('password') ? 'border-[#F43F5E] focus:border-[#F43F5E] focus:ring-[#F43F5E]' : ''}`}
              required 
            />
          </div>
          {showError('password') && (
            <p className="text-xs text-[#F43F5E] flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {formErrors.password}
            </p>
          )}
          {form.password && (
            <div className="mt-3">
              <PasswordStrengthIndicator strength={passwordStrength} />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <Input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              onBlur={() => setTouchedFields(prev => new Set([...prev, 'confirmPassword']))}
              placeholder="Confirm your password" 
              className={`pl-10 ${showError('confirmPassword') || (!passwordMatch && confirmPassword) ? 'border-[#F43F5E] focus:border-[#F43F5E] focus:ring-[#F43F5E]' : ''}`}
              required 
            />
          </div>
          {showError('confirmPassword') && (
            <p className="text-xs text-[#F43F5E] flex items-center gap-1">
              <XCircle className="h-3 w-3" /> {formErrors.confirmPassword}
            </p>
          )}
          {!passwordMatch && confirmPassword && (
            <p className="text-xs text-[#F43F5E] flex items-center gap-1">
              <XCircle className="h-3 w-3" /> Passwords do not match
            </p>
          )}
          {passwordMatch && confirmPassword && (
            <p className="text-xs text-[#10B981] flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Passwords match
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Role</label>
          <select 
            value={form.role || 'TENANT'} 
            onChange={(e) => handleChange('role', e.target.value as any)}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC] mb-3"
          >
            <option value="TENANT">Tenant</option>
            <option value="PROPERTY_MANAGER">Property Manager</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
          </select>
          <RoleDescription role={form.role || 'TENANT'} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          type="submit" 
          disabled={!passwordStrength.meetsRequirements || !passwordMatch || Object.keys(formErrors).length > 0 || isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus size={14} /> Create User
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}