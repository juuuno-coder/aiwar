import { Card } from '@/lib/types';
import { InventoryCard } from '@/lib/inventory-system';
import { cn } from '@/lib/utils';
import FooterSlot from './FooterSlot';
import { Sparkles } from 'lucide-react';

interface EnhanceFooterProps {
    targetCard: InventoryCard | null;
    materialSlots: (InventoryCard | null)[];
    onTargetDrop: (card: InventoryCard) => void;
    onMaterialDrop: (card: InventoryCard, index: number) => void;
    onTargetRemove: () => void;
    onMaterialRemove: (index: number) => void;
    onClear: () => void;
    onAutoSelect: () => void;
    onEnhance: () => void;
    canEnhance: boolean;
}

export default function EnhanceFooter({
    targetCard,
    materialSlots,
    onTargetDrop,
    onMaterialDrop,
    onTargetRemove,
    onMaterialRemove,
    onClear,
    onAutoSelect,
    onEnhance,
    canEnhance,
}: EnhanceFooterProps) {
    const filledCount = materialSlots.filter(c => c !== null).length;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[120px] z-50">
            {/* 상단 그라데이션 블러 */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent to-black/50 backdrop-blur-sm" />

            {/* 메인 푸터 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900/95 to-transparent backdrop-blur-md">
                {/* 중앙 컨테이너 (80-90% 너비) */}
                <div className="h-full max-w-[80%] mx-auto px-6 py-3 flex items-center gap-4">
                    {/* 타겟 슬롯 */}
                    <div className="flex flex-col items-center gap-1">
                        <p className="text-[10px] font-mono text-cyan-400 uppercase">Target</p>
                        <FooterSlot
                            card={targetCard}
                            index={0}
                            type="target"
                            size="medium"
                            onDrop={onTargetDrop}
                            onRemove={targetCard ? onTargetRemove : undefined}
                        />
                    </div>

                    {/* 구분선 */}
                    <div className="h-20 w-px bg-white/20" />

                    {/* 재료 슬롯 (1줄로 나열) */}
                    <div className="flex-1 flex items-center gap-2">
                        <p className="text-[10px] font-mono text-amber-400 uppercase whitespace-nowrap">
                            Materials ({filledCount}/10)
                        </p>
                        <div className="flex gap-2 flex-1">
                            {materialSlots.map((card, index) => (
                                <FooterSlot
                                    key={index}
                                    card={card}
                                    index={index}
                                    size="small"
                                    onDrop={(droppedCard) => onMaterialDrop(droppedCard, index)}
                                    onRemove={card ? () => onMaterialRemove(index) : undefined}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 구분선 */}
                    <div className="h-20 w-px bg-white/20" />

                    {/* 버튼 영역 */}
                    <div className="flex items-center gap-3">
                        {/* 초기화 버튼 - 작게 */}
                        <button
                            onClick={onClear}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors text-xs font-mono"
                        >
                            초기화
                        </button>

                        {/* 자동선택 버튼 - 중간 크기 */}
                        <button
                            onClick={onAutoSelect}
                            disabled={!targetCard}
                            className={cn(
                                "px-4 py-2.5 rounded-lg transition-all text-xs font-medium font-mono uppercase tracking-wider",
                                targetCard
                                    ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600"
                            )}
                        >
                            자동선택
                        </button>

                        {/* 강화 버튼 - 크고 시원하게 */}
                        <button
                            onClick={onEnhance}
                            disabled={!canEnhance}
                            className={cn(
                                "px-8 py-3.5 font-black rounded-xl transition-all text-base flex items-center gap-2 shadow-lg uppercase tracking-wider",
                                canEnhance
                                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black shadow-green-500/50 hover:shadow-green-500/70 hover:scale-105"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            <Sparkles size={18} />
                            강화
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
