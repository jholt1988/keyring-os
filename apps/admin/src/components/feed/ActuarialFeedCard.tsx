import { FeedItem } from '@keyring/types';
import { ArrowRight,Gauge,MessageSquare,ShieldAlert } from 'lucide-react';
import React from 'react';

interface InternalConfidenceV16 {
    overall: number;
    reversal_adjustment: {
        disruption_score: number;
        applied: boolean;
    };
}

interface Props {
    item: FeedItem;
    onAction: (intent: string) => void;
}

export const ActuarialFeedCard = ({ item, onAction }: Props) => {
    const confidence = item.metadata?.confidence as InternalConfidenceV16 | undefined;
    const isCritical = item.kind === 'critical_signal';
    const pmNotes = (item.metadata as any)?.pmNotes;

    return (
        <div className={`relative overflow-hidden rounded-[24px] border bg-[#13233C] text-[#F8FAFC] shadow-[0_8px_30px_rgba(2,6,23,0.20)] transition-all duration-[180ms] hover:border-[#2B4A73] ${isCritical ? 'border-[#F43F5E]/40' : 'border-[#1E3350]'
            }`}>
            <div className="flex items-center justify-between p-5 pb-2">
                <div className="flex items-center gap-2">
                    <div className={`rounded-[10px] p-1.5 ${isCritical ? 'bg-[#F43F5E]/10 text-[#F43F5E]' : 'bg-[#3B82F6]/10 text-[#3B82F6]'}`}>
                        {isCritical ? <ShieldAlert size={18} /> : <Gauge size={18} />}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                        {item.domain} &bull; {item.kind.replace('_', ' ')}
                    </span>
                </div>
                {item.financialImpact && (
                    <div className="text-right">
                        <span className="font-mono text-lg font-bold text-[#3B82F6]">
                            ${item.financialImpact.toLocaleString()}
                        </span>
                    </div>
                )}
            </div>

            <div className="px-5 py-2">
                <h3 className="mb-1 text-sm font-semibold leading-none text-[#F8FAFC]">{item.title}</h3>
                <p className="line-clamp-2 text-xs text-[#94A3B8]">{item.summary}</p>
            </div>

            {confidence && (
                <div className="mx-5 my-2 grid grid-cols-2 gap-2 rounded-[10px] bg-[#0F1B31] p-2 text-[10px] font-mono">
                    <div className="flex justify-between border-r border-[#1E3350] pr-2">
                        <span className="text-[#94A3B8]">CONFIDENCE:</span>
                        <span className="font-bold text-[#F8FAFC]">{(confidence.overall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between pl-1">
                        <span className="text-[#94A3B8]">DISRUPTION:</span>
                        <span className="font-bold text-[#F8FAFC]">{confidence.reversal_adjustment.disruption_score.toFixed(2)}</span>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 p-5 pt-2">
                {item.actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => action.type === 'mutation' && onAction(action.intent)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] px-3 py-2 text-xs font-bold transition-all duration-[180ms] ${action.variant === 'destructive'
                                ? 'bg-[#F43F5E] text-white hover:bg-[#F43F5E]/80'
                                : 'bg-[#0F1B31] text-[#CBD5E1] hover:bg-[#17304E]'
                            }`}
                    >
                        {action.label}
                        {action.variant === 'primary' && <ArrowRight size={14} />}
                    </button>
                ))}
            </div>

            <div className="h-1 w-full bg-[#1E3350]">
                <div
                    className="h-full bg-[#3B82F6] transition-all"
                    style={{ width: `${item.priority}%` }}
                />
            </div>
            {pmNotes && (
                <div className="mt-2 border-t border-dashed border-[#1E3350] p-5 pt-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-[#94A3B8]">
                        <MessageSquare size={10} />
                        PM Notes &mdash; {new Date(pmNotes.lastUpdated).toLocaleDateString()}
                    </div>
                    <p className="mt-1 text-[11px] italic leading-relaxed text-[#CBD5E1]">
                        &ldquo;{pmNotes.narrative}&rdquo;
                    </p>
                </div>
            )}
        </div>
    );
};
