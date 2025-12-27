import { useFooter } from '@/context/FooterContext';
import { cn } from '@/lib/utils';
import FooterSlot from '../Footer/FooterSlot'; // Modified import path
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'; // Added icons
import { useState } from 'react';

interface DynamicFooterProps {
    // Legacy props kept for compatibility, but state drives behavior now
    onCardClick?: (card: any) => void;
    onCardDragStart?: (card: any) => void;
}

export default function DynamicFooter({ }: DynamicFooterProps) {
    const {
        state,
        removeFromSelection,
        clearSelection,
        setMinimized, // Context method
        // We'll add drop handlers later if needed via context
    } = useFooter();

    const {
        selectionSlots,
        maxSelectionSlots,
        action,
        secondaryAction,
        visible,
        selectionLabel,
        mode,
        isMinimized // Context state
    } = state;

    if (!visible) return null;

    // Only render the Slot Bar in 'selection' mode (or default if we decide)
    // For PVP (selection mode), we definitely want this.
    if (mode === 'default' && state.deck.length === 0) {
        // If default mode and no deck, maybe don't show specific slots or show empty?
        // Let's stick to showing if visible.
    }

    const filledCount = selectionSlots.length;

    return (
        <div className={cn(
            "fixed bottom-0 left-0 right-0 h-[180px] z-50 transition-transform duration-300 ease-out",
            isMinimized ? "translate-y-[100%]" : "translate-y-0"
        )}>
            {/* Toggle Handle */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-8 z-50">
                <button
                    onClick={() => setMinimized(!isMinimized)}
                    className="flex items-center justify-center w-12 h-8 bg-black/80 border-t border-x border-white/20 rounded-t-lg text-white/60 hover:text-white hover:bg-black transition-colors"
                >
                    {isMinimized ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {/* Top Gradient Blur */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent to-black/50 backdrop-blur-sm" />

            {/* Main Footer Body */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900/95 to-transparent backdrop-blur-md border-t border-white/10">
                <div className="h-full max-w-[95%] xl:max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">

                    {/* Left: Slots Area */}
                    <div className="flex-1 flex items-center gap-6 overflow-x-auto custom-scrollbar pb-2">
                        {selectionLabel && (
                            <div className="flex flex-col justify-center min-w-max">
                                <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider mb-1">
                                    {selectionLabel}
                                </p>
                                <p className="text-xl font-black text-white/90 font-orbitron">
                                    {filledCount}<span className="text-white/30 text-base">/{maxSelectionSlots}</span>
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            {Array.from({ length: maxSelectionSlots }).map((_, index) => {
                                const card = selectionSlots[index] || null;
                                return (
                                    <FooterSlot
                                        key={index}
                                        card={card}
                                        index={index}
                                        size="large"
                                        onRemove={card ? () => removeFromSelection(card.id) : undefined}
                                    // Drag & Drop logic can be connected here if needed
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent flex-shrink-0" />

                    {/* Right: Actions Area */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        {/* Clear Button */}
                        <button
                            onClick={clearSelection}
                            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-colors text-xs font-mono tracking-wider"
                        >
                            RESET
                        </button>

                        {/* Secondary Action (e.g., Auto Select) */}
                        {secondaryAction && (
                            <button
                                onClick={secondaryAction.onClick}
                                disabled={secondaryAction.isDisabled}
                                className={cn(
                                    "px-5 py-3 rounded-xl transition-all text-xs font-bold font-mono uppercase tracking-wider border",
                                    secondaryAction.isDisabled
                                        ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed"
                                        : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50"
                                )}
                            >
                                {secondaryAction.label}
                            </button>
                        )}

                        {/* Primary Action (e.g., Deploy, Fuse) */}
                        {action && (
                            <button
                                onClick={action.onClick}
                                disabled={action.isDisabled}
                                className={cn(
                                    "px-8 py-3.5 font-black rounded-xl transition-all text-base flex items-center gap-2 shadow-lg uppercase tracking-wider min-w-[140px] justify-center",
                                    action.isDisabled
                                        ? "bg-gray-800 text-gray-500 cursor-not-allowed shadow-none border border-white/5"
                                        : action.color === 'success'
                                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-0.5"
                                            : action.color === 'primary' // Default to primary/purple style
                                                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-purple-500/30 hover:shadow-purple-500/50"
                                                : "bg-white/10 hover:bg-white/20 text-white"
                                )}
                            >
                                {action.label === '출전' && <Sparkles size={18} className="animate-pulse" />}
                                {action.label}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
