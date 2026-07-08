'use client';

import { Download, Copy, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';

interface QRCodeDisplayProps {
  qrCodeDataUrl: string;
  secret: string;
  issuer: string;
  accountName: string;
  className?: string;
  onDownload?: () => void;
}

export function QRCodeDisplay({
  qrCodeDataUrl,
  secret,
  issuer,
  accountName,
  className = '',
  onDownload
}: QRCodeDisplayProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="rounded-lg border border-white/10 bg-[#0B1628] p-4">
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-[#F8FAFC]">Scan QR Code</h4>
          <p className="text-xs text-[#94A3B8] mt-1">
            Open your authenticator app and scan this QR code
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
          {/* QR Code Display */}
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={qrCodeDataUrl}
                alt="MFA Setup QR Code"
                className="h-48 w-48 rounded-lg border border-white/10 bg-white p-2"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={onDownload}
                  className="shadow-lg"
                >
                  <Download className="mr-2 h-3 w-3" />
                  Download
                </Button>
              </div>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="flex-1 space-y-3">
            <div>
              <h5 className="text-sm font-medium text-[#F8FAFC]">Manual Entry</h5>
              <p className="text-xs text-[#94A3B8]">
                If you can't scan the QR code, enter this code manually
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Secret Key</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecret(!showSecret)}
                  className="h-6 px-2"
                >
                  {showSecret ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </Button>
              </div>
              
              <div className="relative">
                <div className={`flex h-10 items-center rounded-lg border border-white/10 bg-[#0F1B31] px-3 font-mono text-sm ${showSecret ? 'text-[#F8FAFC]' : 'text-[#8A99AD]'}`}>
                  {showSecret ? secret : '•'.repeat(32)}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopySecret}
                  className="absolute right-1 top-1 h-8"
                >
                  {copied ? (
                    <span className="text-xs text-[#10B981]">Copied!</span>
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Issuer</label>
              <div className="rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
                {issuer}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#94A3B8]">Account</label>
              <div className="rounded-lg border border-white/10 bg-[#0F1B31] px-3 py-2 text-sm text-[#F8FAFC]">
                {accountName}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[#3B82F6]/20 bg-[#3B82F6]/10 p-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-4 w-4 rounded-full border border-[#3B82F6] bg-[#3B82F6]/20" />
          <div className="text-xs text-[#CBD5E1]">
            <span className="font-medium">Important:</span> Keep your secret key secure. 
            Anyone with this key can generate valid verification codes for your account.
          </div>
        </div>
      </div>
    </div>
  );
}