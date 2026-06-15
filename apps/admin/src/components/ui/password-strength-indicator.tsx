'use client';

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getPasswordStrengthColor, getPasswordStrengthLabel } from '@/lib/validation/password-strength';
import type { PasswordStrength } from '@/lib/validation/password-strength';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  showDetails?: boolean;
}

export function PasswordStrengthIndicator({ 
  strength, 
  showDetails = true 
}: PasswordStrengthIndicatorProps) {
  const { score, level, feedback, suggestions } = strength;
  const color = getPasswordStrengthColor(level);
  const label = getPasswordStrengthLabel(level);

  // Calculate percentage for visual bar
  const percentage = Math.min(100, Math.max(0, score));

  return (
    <div className="space-y-3">
      {/* Strength bar and label */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#F8FAFC]">Password strength</span>
          <span className="text-sm font-semibold" style={{ color }}>
            {label}
          </span>
        </div>
        
        {/* Visual strength bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#0F1B31]">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: color
            }}
          />
        </div>
        
        {/* Score indicator */}
        <div className="text-xs text-[#94A3B8]">
          Score: {score}/100
        </div>
      </div>

      {/* Requirements checklist */}
      {showDetails && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-[#F8FAFC]">Requirements</div>
          <div className="grid gap-2">
            {Object.entries(feedback).map(([key, met]) => {
              let label = '';
              let icon = met ? (
                <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
              ) : (
                <XCircle className="h-4 w-4 text-[#F43F5E]" />
              );

              switch (key) {
                case 'length':
                  label = 'At least 8 characters';
                  break;
                case 'uppercase':
                  label = 'Contains uppercase letters';
                  break;
                case 'lowercase':
                  label = 'Contains lowercase letters';
                  break;
                case 'numbers':
                  label = 'Contains numbers';
                  break;
                case 'symbols':
                  label = 'Contains symbols';
                  break;
                case 'commonPatterns':
                  label = 'Avoids common passwords';
                  break;
                default:
                  label = key;
              }

              return (
                <div key={key} className="flex items-center gap-2">
                  {icon}
                  <span className={`text-sm ${met ? 'text-[#CBD5E1]' : 'text-[#94A3B8]'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && showDetails && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
            <span className="text-sm font-medium text-[#F8FAFC]">Suggestions</span>
          </div>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-[#94A3B8]">
                • {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Security tip */}
      <div className="rounded-lg border border-[#1E3350] bg-[#0B1628] p-3">
        <p className="text-xs text-[#94A3B8]">
          <span className="font-medium text-[#38BDF8]">Tip:</span> For maximum security, use a 
          combination of letters, numbers, and symbols that doesn't contain personal information.
        </p>
      </div>
    </div>
  );
}