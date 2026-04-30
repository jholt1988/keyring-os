'use client';

export interface PaymentDecisionCardProps {
  decisionId?: string;
}

export function PaymentDecisionCard({ decisionId }: PaymentDecisionCardProps) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm text-[#9AB1CF]">
      Payment decision card placeholder{decisionId ? `: ${decisionId}` : ''}
    </div>
  );
}
