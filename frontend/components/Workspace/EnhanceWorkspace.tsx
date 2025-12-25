import { Card } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';
import WorkspaceSlot from './WorkspaceSlot';
import GameCard from '@/components/GameCard';
import { Sparkles, Zap } from 'lucide-react';

interface EnhanceWorkspaceProps {
    targetCard: Card | null;
    materialCards: (Card | null)[];
    onTargetSelect: (card: Card) => void;
    onTargetRemove: () => void;
    onMaterialAdd: (card: Card, index: number) => void;
    onMaterialRemove: (index: number) => void;
    onAutoSelect: () => void;
    onEnhance: () => void;
    canEnhance: boolean;
    preview?: {
        currentLevel: number;
        nextLevel: number;
        currentPower: number;
        nextPower: number;
        cost: number;
    };
}

export default function EnhanceWorkspace({
    targetCard,
    materialCards,
    onTargetSelect,
    onTargetRemove,
    onMaterialAdd,
    onMaterialRemove,
    onAutoSelect,
    onEnhance,
    canEnhance,
    preview,
}: EnhanceWorkspaceProps) {
    const filledCount = materialCards.filter(c => c !== null).length;

    return (
        <div className="flex flex-col h-[calc(100vh-280px-80px)] p-6">
            {/* Target Card Section */}
            <div className="mb-6">
                <h2 className="text-sm font-mono text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles size={16} /> Target Unit
                </h2>
                <div className="flex gap-4">
                    <div className="w-40">
                        {targetCard ? (
                            <div className="relative">
                                <GameCard card={targetCard} />
                                <button
                                    onClick={onTargetRemove}
                                    className="absolute -top-2 -right-2 px-2 py-1 bg-red-500 rounded text-xs text-white hover:bg-red-400"
                                >
                                    변경
                                </button>
                            </div>
                        ) : (
                            <div className="aspect-[2/3] border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/40 text-xs">
                                타겟 선택
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {preview && targetCard && (
                        <div className="flex-1 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-2">Preview</p>
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-white">
                                    LV.{preview.currentLevel} → LV.{preview.nextLevel}
                                </p>
                                <p className="text-sm text-white/80">
                                    PWR: {preview.currentPower} → {preview.nextPower}
                                </p>
                                <p className="text-sm text-amber-400 mt-2">
                                    COST: {preview.cost}T
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Material Cards Section */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <h2 className="text-sm font-mono text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap size={16} /> Materials ({filledCount}/10)
                </h2>
                <div className="grid grid-cols-5 gap-3 mb-4">
                    {materialCards.map((card, index) => (
                        <WorkspaceSlot
                            key={index}
                            card={card}
                            index={index}
                            size="small"
                            onRemove={card ? () => onMaterialRemove(index) : undefined}
                            onDrop={(droppedCard) => onMaterialAdd(droppedCard, index)}
                        />
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 p-4 flex gap-3 justify-end -mx-6 -mb-6">
                <button
                    onClick={() => {
                        onTargetRemove();
                        materialCards.forEach((_, i) => onMaterialRemove(i));
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded transition-colors"
                >
                    초기화
                </button>
                <button
                    onClick={onAutoSelect}
                    disabled={!targetCard}
                    className={cn(
                        "px-6 py-2 rounded transition-colors",
                        targetCard
                            ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                >
                    자동 선택
                </button>
                <button
                    onClick={onEnhance}
                    disabled={!canEnhance}
                    className={cn(
                        "px-8 py-2 font-bold rounded transition-colors",
                        canEnhance
                            ? "bg-green-500 hover:bg-green-400 text-black"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    )}
                >
                    강화 ⚡
                </button>
            </div>
        </div>
    );
}
