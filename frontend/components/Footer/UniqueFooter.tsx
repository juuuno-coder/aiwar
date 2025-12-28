import { InventoryCard } from '@/lib/inventory-system';
import { Card } from '@/lib/types';
import { cn } from '@/lib/utils';
import FooterSlot from './FooterSlot';
import { Sparkles } from 'lucide-react';

interface UniqueFooterProps {
    materialSlots: (Card | InventoryCard | null)[];
    onMaterialDrop: (card: Card | InventoryCard, index: number) => void;
    onMaterialRemove: (index: number) => void;
    onClear: () => void;
    onAutoSelect: () => void;
    onSubmit: () => void;
    canSubmit: boolean;
}

export default function UniqueFooter({
    materialSlots,
    onMaterialDrop,
    onMaterialRemove,
    onClear,
    onAutoSelect,
    onSubmit,
    canSubmit,
}: UniqueFooterProps) {
    const filledCount = materialSlots.filter(c => c !== null).length;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            {/* 카드 슬롯 영역 - 카드가 튀어나온 듯한 효과 */}
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex items-end justify-center gap-4 -mb-2">
                    {materialSlots.map((card, index) => (
                        <div
                            key={index}
                            className={cn(
                                "transition-all duration-300",
                                card ? "transform -translate-y-4 scale-105" : ""
                            )}
                        >
                            <FooterSlot
                                card={card}
                                index={index}
                                size="medium"
                                onDrop={(droppedCard) => onMaterialDrop(droppedCard, index)}
                                onRemove={card ? () => onMaterialRemove(index) : undefined}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* 하단 배경 영역만 */}
            <div className="bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-sm border-t border-white/10 py-3">
                <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-red-400 uppercase">
                            Legendary ({filledCount}/5)
                        </span>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onClear}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded transition-colors text-xs"
                        >
                            초기화
                        </button>

                        <button
                            onClick={onAutoSelect}
                            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all text-xs border border-cyan-500/30"
                        >
                            자동선택
                        </button>

                        <button
                            onClick={onSubmit}
                            disabled={!canSubmit}
                            className={cn(
                                "px-6 py-2.5 font-bold rounded-xl transition-all text-sm flex items-center gap-2",
                                canSubmit
                                    ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white shadow-lg shadow-red-500/30 hover:scale-105"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            <Sparkles size={16} />
                            신청 제출
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
