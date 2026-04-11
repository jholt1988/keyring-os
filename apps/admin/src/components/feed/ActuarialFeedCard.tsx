// components/feed/ActuarialFeedCard.tsx
import React from 'react';
import { FeedItem, MutationAction } from '@keyring/types';
import { ShieldAlert, ArrowRight, Gauge, MessageSquare } from 'lucide-react';

// Locally defined to bridge the gap from the Python Ref Engine
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
    // Extracting metadata from the Materialized View
    const confidence = item.metadata?.confidence as InternalConfidenceV16 | undefined;
    const isCritical = item.kind === 'critical_signal';
    const pmNotes = (item.metadata as any)?.pmNotes;

    return (
        <div className={`relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md ${isCritical ? 'border-red-500/50 bg-red-50/10' : 'border-border'
            }`}>
            {/* Financial Impact Header */}
            <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${isCritical ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {isCritical ? <ShieldAlert size={18} /> : <Gauge size={18} />}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">
                        {item.domain} • {item.kind.replace('_', ' ')}
                    </span>
                </div>
                {item.financialImpact && (
                    <div className="text-right">
                        <span className="text-lg font-mono font-bold text-primary">
                            ${item.financialImpact.toLocaleString()}
                        </span>
                    </div>
                )}
            </div>

            <div className="px-4 py-2">
                <h3 className="text-sm font-semibold leading-none mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
            </div>

            {/* Actuarial Metadata Row */}
            {confidence && (
                <div className="mx-4 my-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-100/50 p-2 text-[10px] font-mono">
                    <div className="flex justify-between border-r pr-2">
                        <span className="text-gray-500">CONFIDENCE:</span>
                        <span className="font-bold">{(confidence.overall * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between pl-1">
                        <span className="text-gray-500">DISRUPTION:</span>
                        <span className="font-bold">{confidence.reversal_adjustment.disruption_score.toFixed(2)}</span>
                    </div>
                </div>
            )}

            {/* Dynamic Actions Mapper */}
            <div className="flex items-center gap-2 p-4 pt-2">
                {item.actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => action.type === 'mutation' && onAction(action.intent)}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-bold transition-colors ${action.variant === 'destructive'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                    >
                        {action.label}
                        {action.variant === 'primary' && <ArrowRight size={14} />}
                    </button>
                ))}
            </div>

            {/* Priority Progress Bar */}
            <div className="h-1 w-full bg-secondary">
                <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${item.priority}%` }}
                />
            </div>
            {pmNotes && (
                <div className="mt-2 border-t border-dashed pt-2">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                        <MessageSquare size={10} />
                        PM Notes — {new Date(pmNotes.lastUpdated).toLocaleDateString()}
                    </div>
                    <p className="mt-1 text-[11px] italic leading-relaxed text-gray-700">
                        "{pmNotes.narrative}"
                    </p>
                </div>
            )}


        </div>


    );
};