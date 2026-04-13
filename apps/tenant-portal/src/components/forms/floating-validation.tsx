'use client';

interface FloatingValidationProps {
  message?: string;
}

export function FloatingValidation({ message }: FloatingValidationProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="inline-flex items-center rounded-full border border-[#F43F5E]/20 bg-[#F43F5E]/10 px-2.5 py-1 text-xs font-medium text-[#FDA4AF]">
      {message}
    </div>
  );
}

export default FloatingValidation;
