import { Card } from '@/lib/types';
import { InventoryCard } from '@/lib/inventory-system';
import { cn } from '@/lib/utils';
import FooterSlot from './FooterSlot';
import { FlaskConical } from 'lucide-react';

interface FusionFooterProps {
    materialSlots: (InventoryCard | null)[];
    onMaterialDrop: (card: InventoryCard, index: number) => void;
    onMaterialRemove: (index: number) => void;
    onClear: () => void;
    onAutoSelect: () => void;
    onFuse: () => void;
    canFuse: boolean;
}

export default function FusionFooter({
    materialSlots,
    onMaterialDrop,
    onMaterialRemove,
    onClear,
    onAutoSelect,
    onFuse,
    canFuse,
}: FusionFooterProps) {
    const filledCount = materialSlots.filter(c => c !== null).length;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[120px] z-50">
            {/* 상단 그라데이션 블러 */}
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent to-black/50 backdrop-blur-sm" />

            {/* 메인 푸터 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-purple-900/10 to-transparent backdrop-blur-md">
                {/* 중앙 컨테이너 (80-90% 너비) */}
                <div className="h-full max-w-[80%] mx-auto px-6 py-3 flex items-center gap-4">
                    {/* 재료 슬롯 (1줄로 나열) */}
                    <div className="flex-1 flex items-center gap-4">
                        <p className="text-[10px] font-mono text-purple-400 uppercase whitespace-nowrap">
                            Materials ({filledCount}/3)
                        </p>
                        <div className="flex gap-4">
                            {materialSlots.map((card, index) => (
                                <FooterSlot
                                    key={index}
                                    card={card}
                                    index={index}
                                    size="medium"
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
                            className="px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all text-xs font-medium font-mono uppercase tracking-wider border border-cyan-500/30"
                        >
                            자동선택
                        </button>

                        {/* 합성 버튼 - 크고 시원하게 */}
                        <button
                            onClick={onFuse}
                            disabled={!canFuse}
                            className={cn(
                                "px-8 py-3.5 font-black rounded-xl transition-all text-base flex items-center gap-2 shadow-lg uppercase tracking-wider",
                                canFuse
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
                                    : "bg-gray-700 text-gray-400 cursor-not-allowed shadow-none"
                            )}
                        >
                            <FlaskConical size={18} />
                            합성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
