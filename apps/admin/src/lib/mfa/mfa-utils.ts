/**
 * MFA Utilities for Keyring-OS
 * Provides QR code generation, recovery code handling, and validation
 */

// Simulated MFA setup data (in real app, this would come from backend)
export interface MFASetupData {
  secret: string;
  qrCodeDataUrl: string;
  recoveryCodes: string[];
  issuer: string;
  accountName: string;
}

// Generate mock MFA setup data (in production, this would come from backend API)
export function generateMFASetupData(accountName: string, issuer = 'Keyring-OS'): MFASetupData {
  // Generate a random base32 secret (simplified - in real app use proper crypto)
  const secret = generateRandomBase32(32);
  
  // Generate QR code data URL (in real app, this would be generated server-side)
  const qrData = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
  const qrCodeDataUrl = generateMockQRCodeDataUrl(qrData);
  
  // Generate recovery codes
  const recoveryCodes = Array.from({ length: 8 }, () => 
    generateRecoveryCode()
  );

  return {
    secret,
    qrCodeDataUrl,
    recoveryCodes,
    issuer,
    accountName
  };
}

// Generate a recovery code
export function generateRecoveryCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code.match(/.{4}/g)?.join('-') || code;
}

// Validate MFA code
export function validateMFACode(code: string): boolean {
  // Basic validation: 6 digits
  return /^\d{6}$/.test(code);
}

// Format recovery codes for display
export function formatRecoveryCodes(codes: string[]): string {
  return codes.map((code, index) => `${index + 1}. ${code}`).join('\n');
}

// Generate random base32 string
function generateRandomBase32(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Mock QR code generation (in real app, use a proper QR library)
function generateMockQRCodeDataUrl(data: string): string {
  // Return a placeholder data URL
  // In production, use something like `qrcode.generate(data, { small: true })`
  return 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#0F1B31"/>
      <text x="100" y="100" text-anchor="middle" fill="#94A3B8" font-family="monospace" font-size="12">
        QR Code Placeholder
      </text>
      <text x="100" y="120" text-anchor="middle" fill="#8A99AD" font-family="monospace" font-size="10">
        (In production: actual QR)
      </text>
    </svg>
  `);
}

// Export recovery codes as text file
export function exportRecoveryCodes(codes: string[], filename = 'keyring-os-recovery-codes.txt'): void {
  const content = `Keyring-OS Recovery Codes\n\n` +
    `IMPORTANT: Save these codes in a secure location.\n` +
    `If you lose access to your authenticator app, use these codes to sign in.\n\n` +
    `Recovery Codes:\n${formatRecoveryCodes(codes)}\n\n` +
    `Generated: ${new Date().toISOString()}\n` +
    `Note: Each code can be used only once.`;
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}