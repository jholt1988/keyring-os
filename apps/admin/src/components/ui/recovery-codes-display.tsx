'use client';

import { Download, Copy, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';
import { exportRecoveryCodes } from '@/lib/mfa/mfa-utils';

interface RecoveryCodesDisplayProps {
  codes: string[];
  onDownload?: () => void;
  className?: string;
}

export function RecoveryCodesDisplay({
  codes,
  onDownload,
  className = ''
}: RecoveryCodesDisplayProps) {
  const [showCodes, setShowCodes] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    exportRecoveryCodes(codes);
    if (onDownload) onDownload();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-lg border border-white/10 bg-[#0B1628] p-4">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h4 className="text-sm font-semibold text-[#F8FAFC]">Recovery Codes</h4>
            <p className="text-xs text-[#94A3B8] mt-1">
              Save these codes in a secure location. Each code can be used only once.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setShowCodes(!showCodes)}
          >
            {showCodes ? 'Hide Codes' : 'Show Codes'}
          </Button>
        </div>

        {showCodes ? (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {codes.map((code, index) => (
                <div
                  key={index}
                  className="relative rounded-lg border border-white/10 bg-[#0F1B31] p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm text-[#F8FAFC]">
                      {code}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(code, index)}
                      className="h-6 px-2"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="mt-1 text-[11px] text-[#94A3B8]">
                    Code {index + 1} of {codes.length}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-3 w-3" />
                Download All Codes
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-[#F59E0B]/20 bg-[#F59E0B]/10 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-[#F59E0B] mt-0.5" />
              <div className="text-xs text-[#CBD5E1]">
                <span className="font-medium">Codes are hidden:</span> Click "Show Codes" to view your recovery codes. 
                Make sure to save them before closing this window.
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-[#10B981]/20 bg-[#10B981]/10 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#10B981] mt-0.5" />
            <div>
              <div className="text-xs font-medium text-[#F8FAFC]">How to use recovery codes</div>
              <ul className="mt-1 space-y-1 text-xs text-[#CBD5E1]">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  Use when you can't access your authenticator app
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  Each code works only once
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  Generate new codes if you run out
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-[#F43F5E]/20 bg-[#F43F5E]/10 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[#F43F5E] mt-0.5" />
            <div className="text-xs text-[#CBD5E1]">
              <span className="font-medium">Security Warning:</span> Store recovery codes securely. 
              Don't save them in easily accessible places like email or notes apps.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}