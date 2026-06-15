/**
 * Password strength validation utility for Keyring-OS
 * Provides real-time password strength assessment with visual feedback
 */

export interface PasswordStrength {
  score: number; // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent';
  meetsRequirements: boolean;
  feedback: {
    length: boolean;        // at least 8 characters
    uppercase: boolean;     // contains uppercase letters
    lowercase: boolean;     // contains lowercase letters
    numbers: boolean;       // contains numbers
    symbols: boolean;       // contains symbols
    commonPatterns: boolean; // doesn't contain common patterns (password, 123, etc.)
  };
  suggestions: string[];
}

export interface PasswordStrengthOptions {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSymbols?: boolean;
  rejectCommonPatterns?: boolean;
}

const COMMON_PATTERNS = [
  'password', '123456', 'qwerty', 'admin', 'welcome', 'letmein', 'monkey',
  'sunshine', 'password1', 'abc123', 'football', 'trustno1'
];

export function assessPasswordStrength(
  password: string,
  options: PasswordStrengthOptions = {}
): PasswordStrength {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSymbols = true,
    rejectCommonPatterns = true
  } = options;

  const feedback = {
    length: password.length >= minLength,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    commonPatterns: true // start true, will be set to false if pattern found
  };

  // Check for common patterns
  if (rejectCommonPatterns) {
    const lowerPassword = password.toLowerCase();
    feedback.commonPatterns = !COMMON_PATTERNS.some(pattern => 
      lowerPassword.includes(pattern)
    );
  }

  // Calculate score (0-100)
  let score = 0;
  const maxPossibleScore = 100;
  
  // Length contributes up to 30 points
  if (password.length >= minLength) {
    score += Math.min(30, (password.length - minLength) * 3);
  }
  
  // Character variety contributes up to 70 points
  const requirementsMet = [
    feedback.uppercase,
    feedback.lowercase,
    feedback.numbers,
    feedback.symbols
  ].filter(Boolean).length;
  
  score += requirementsMet * 15; // 15 points per requirement met
  
  // Bonus for meeting all requirements
  if (requirementsMet === 4) score += 10;
  
  // Penalty for common patterns
  if (!feedback.commonPatterns) score = Math.max(0, score - 30);
  
  // Cap at 100
  score = Math.min(maxPossibleScore, score);

  // Determine level
  let level: PasswordStrength['level'] = 'weak';
  if (score >= 80) level = 'excellent';
  else if (score >= 60) level = 'strong';
  else if (score >= 40) level = 'good';
  else if (score >= 20) level = 'fair';

  // Generate suggestions
  const suggestions: string[] = [];
  if (!feedback.length) {
    suggestions.push(`Use at least ${minLength} characters`);
  }
  if (requireUppercase && !feedback.uppercase) {
    suggestions.push('Add uppercase letters');
  }
  if (requireLowercase && !feedback.lowercase) {
    suggestions.push('Add lowercase letters');
  }
  if (requireNumbers && !feedback.numbers) {
    suggestions.push('Add numbers');
  }
  if (requireSymbols && !feedback.symbols) {
    suggestions.push('Add symbols (!@#$% etc.)');
  }
  if (rejectCommonPatterns && !feedback.commonPatterns) {
    suggestions.push('Avoid common passwords');
  }

  const meetsRequirements = 
    feedback.length &&
    (!requireUppercase || feedback.uppercase) &&
    (!requireLowercase || feedback.lowercase) &&
    (!requireNumbers || feedback.numbers) &&
    (!requireSymbols || feedback.symbols) &&
    (!rejectCommonPatterns || feedback.commonPatterns);

  return {
    score,
    level,
    meetsRequirements,
    feedback,
    suggestions
  };
}

export function getPasswordStrengthColor(level: PasswordStrength['level']): string {
  switch (level) {
    case 'excellent': return '#10B981'; // green
    case 'strong': return '#22C55E';   // light green
    case 'good': return '#F59E0B';     // amber
    case 'fair': return '#F97316';     // orange
    case 'weak': return '#F43F5E';      // red
    default: return '#94A3B8';         // gray
  }
}

export function getPasswordStrengthLabel(level: PasswordStrength['level']): string {
  switch (level) {
    case 'excellent': return 'Excellent';
    case 'strong': return 'Strong';
    case 'good': return 'Good';
    case 'fair': return 'Fair';
    case 'weak': return 'Weak';
    default: return 'Too Short';
  }
}