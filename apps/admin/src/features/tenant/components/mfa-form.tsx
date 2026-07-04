'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeDisplay } from '@/components/ui/qr-code-display';
import { RecoveryCodesDisplay } from '@/components/ui/recovery-codes-display';
import { generateMFASetupData, validateMFACode } from '@/lib/mfa/mfa-utils';
import { Key,Save,Shield,ShieldOff,X,AlertTriangle,CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export interface MFAFormData {
  action: 'activate' | 'disable';
  code?: string;
  confirmCode?: string;
}

interface MFAFormProps {
  currentMfaEnabled?: boolean;
  accountName?: string;
  onSave: (data: MFAFormData) => void | Promise<void>;
  onCancel: () => void;
}

export function MFAForm({ 
  currentMfaEnabled = false, 
  accountName = 'User Account',
  onSave, 
  onCancel 
}: MFAFormProps) {
  const [form, setForm] = useState<MFAFormData>({
    action: currentMfaEnabled ? 'disable' : 'activate',
    code: '',
    confirmCode: '',
  });
  const [mfaSetupData, setMfaSetupData] = useState(() => 
    generateMFASetupData(accountName)
  );
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const [step, setStep] = useState<'setup' | 'verify' | 'recovery'>('setup');
  const [loading, setLoading] = useState(false);

  const isActivating = form.action === 'activate';

  useEffect(() => {
    if (isActivating && !currentMfaEnabled) {
      setMfaSetupData(generateMFASetupData(accountName));
    }
  }, [isActivating, currentMfaEnabled, accountName]);

  const handleChange = (field: keyof MFAFormData, value: string) => {
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

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (isActivating) {
      if (!form.code) {
        errors.code = 'Verification code is required';
      } else if (!validateMFACode(form.code)) {
        errors.code = 'Please enter a valid 6-digit code';
      }
      
      if (step === 'recovery' && !form.confirmCode) {
        errors.confirmCode = 'Please enter a recovery code to confirm';
      }
    } else {
      if (!form.code) {
        errors.code = 'Confirmation code is required to disable 2FA';
      } else if (!validateMFACode(form.code)) {
        errors.code = 'Please enter a valid 6-digit code';
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      // Persist the MFA change (activate/disable). onSave may be async.
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = async () => {
    if (step === 'setup') {
      // Confirm the generated MFA setup data before moving to verification.
      setLoading(true);
      try {
        const data = generateMFASetupData(accountName);
        setMfaSetupData(data);
        setStep('verify');
      } finally {
        setLoading(false);
      }
    } else if (step === 'verify') {
      // Validate the entered code against the authenticator setup.
      setLoading(true);
      try {
        if (form.code && validateMFACode(form.code)) {
          setStep('recovery');
        } else {
          setFormErrors((prev) => ({
            ...prev,
            code: 'Please enter a valid 6-digit code',
          }));
          setTouchedFields((prev) => new Set([...prev, 'code']));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBackStep = () => {
    if (step === 'verify') {
      setStep('setup');
    } else if (step === 'recovery') {
      setStep('verify');
    }
  };

  const showError = (field: string) => {
    return touchedFields.has(field) && formErrors[field];
  };

  const renderSetupStep = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 p-4 mb-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-[#10B981] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">
              Set up Two-Factor Authentication
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Follow these steps to secure your account with 2FA
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] text-sm font-semibold text-white">
            1
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F8FAFC]">Install Authenticator App</h4>
            <p className="text-xs text-[#94A3B8]">
              Install Google Authenticator, Authy, or a similar app on your phone
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#10B981] text-sm font-semibold text-white">
            2
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#F8FAFC]">Scan QR Code</h4>
            <p className="text-xs text-[#94A3B8]">
              Use your authenticator app to scan the QR code below
            </p>
          </div>
        </div>
      </div>

      <QRCodeDisplay
        qrCodeDataUrl={mfaSetupData.qrCodeDataUrl}
        secret={mfaSetupData.secret}
        issuer={mfaSetupData.issuer}
        accountName={mfaSetupData.accountName}
      />

      <div className="flex justify-end">
        <Button type="button" onClick={handleNextStep} disabled={loading}>
          {loading ? 'Generating...' : 'Next: Verify Code'}
        </Button>
      </div>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 p-4 mb-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-[#10B981] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">
              Verify Setup
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Enter the 6-digit code from your authenticator app to verify setup
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Verification Code</label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A99AD]" />
          <Input
            value={form.code || ''}
            onChange={(e) => handleChange('code', e.target.value)}
            onBlur={() => setTouchedFields(prev => new Set([...prev, 'code']))}
            className="pl-10"
            placeholder="Enter 6-digit code"
            maxLength={6}
            minLength={6}
            required
            autoFocus
          />
        </div>
        {showError('code') && (
          <p className="text-xs text-[#F43F5E] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {formErrors.code}
          </p>
        )}
        <p className="text-[11px] text-[#8A99AD]">
          Open your authenticator app and enter the current 6-digit code
        </p>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBackStep}>
          Back to Setup
        </Button>
        <Button type="button" onClick={handleNextStep} disabled={!form.code || !validateMFACode(form.code) || loading}>
          {loading ? 'Verifying...' : 'Next: Save Recovery Codes'}
        </Button>
      </div>
    </div>
  );

  const renderRecoveryStep = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 p-4 mb-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-[#10B981] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">
              Save Recovery Codes
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Store these codes securely. You'll need them if you lose access to your authenticator app.
            </p>
          </div>
        </div>
      </div>

      <RecoveryCodesDisplay
        codes={mfaSetupData.recoveryCodes}
      />

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Confirm with Recovery Code (Optional)</label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A99AD]" />
          <Input
            value={form.confirmCode || ''}
            onChange={(e) => handleChange('confirmCode', e.target.value)}
            onBlur={() => setTouchedFields(prev => new Set([...prev, 'confirmCode']))}
            className="pl-10"
            placeholder="Enter a recovery code to confirm"
            maxLength={11}
          />
        </div>
        {showError('confirmCode') && (
          <p className="text-xs text-[#F43F5E] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {formErrors.confirmCode}
          </p>
        )}
        <p className="text-[11px] text-[#8A99AD]">
          Enter one of your recovery codes to confirm you've saved them
        </p>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={handleBackStep}>
          Back to Verification
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save size={14} /> Complete 2FA Setup
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  const renderDisableFlow = () => (
    <div className="space-y-4">
      <div className={`rounded-lg bg-[#F43F5E]/10 border border-[#F43F5E]/30 p-4 mb-4`}>
        <div className="flex items-start gap-3">
          <ShieldOff className="h-5 w-5 text-[#F43F5E] mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#F8FAFC]">
              Disable Two-Factor Authentication
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              Warning: Disabling 2FA will make your account less secure.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Confirmation Code</label>
        <div className="relative">
          <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A99AD]" />
          <Input
            value={form.code || ''}
            onChange={(e) => handleChange('code', e.target.value)}
            onBlur={() => setTouchedFields(prev => new Set([...prev, 'code']))}
            className="pl-10"
            placeholder="Enter 6-digit code from authenticator"
            maxLength={6}
            minLength={6}
            required
          />
        </div>
        {showError('code') && (
          <p className="text-xs text-[#F43F5E] flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> {formErrors.code}
          </p>
        )}
        <p className="text-[11px] text-[#8A99AD]">
          Enter the current 6-digit code from your authenticator app to confirm
        </p>
      </div>

      <div className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-[#F59E0B] mt-0.5" />
          <div className="text-xs text-[#CBD5E1]">
            <span className="font-medium">Security Notice:</span> Disabling 2FA removes an important
            security layer from your account. Consider keeping it enabled for better protection.
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive" disabled={!form.code || !validateMFACode(form.code) || loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Disabling...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save size={14} /> Disable 2FA
            </span>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#F8FAFC]">
            {isActivating ? 'Enable' : 'Disable'} Two-Factor Authentication
          </h3>
          {isActivating && !currentMfaEnabled && (
            <div className="flex items-center gap-2 mt-1">
              {['setup', 'verify', 'recovery'].map((s, index) => (
                <div key={s} className="flex items-center gap-2">
                  <div 
                    className={`h-2 w-2 rounded-full ${step === s ? 'bg-[#10B981]' : 'bg-[#1E3350]'}`}
                  />
                  {index < 2 && (
                    <div className="h-px w-4 bg-[#1E3350]"></div>
                  )}
                </div>
              ))}
              <span className="text-xs text-[#94A3B8] ml-2">
                Step {['setup', 'verify', 'recovery'].indexOf(step) + 1} of 3
              </span>
            </div>
          )}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X size={16} />
        </Button>
      </div>



      {isActivating && !currentMfaEnabled ? (
        <>
          {step === 'setup' && renderSetupStep()}
          {step === 'verify' && renderVerifyStep()}
          {step === 'recovery' && renderRecoveryStep()}
        </>
      ) : (
        renderDisableFlow()
      )}

      {/* Action selector only shown when no active flow */}
      {currentMfaEnabled === false && (
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Action</label>
          <select
            value={form.action}
            onChange={(e) => handleChange('action', e.target.value)}
            className="flex h-11 w-full rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]"
          >
            <option value="activate">Enable 2FA</option>
            <option value="disable">Disable 2FA</option>
          </select>
        </div>
      )}



    </form>
  );
}